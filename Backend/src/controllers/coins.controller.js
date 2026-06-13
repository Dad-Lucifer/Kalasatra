"use strict";

const { supabase } = require("../../database/supabase");

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeGetCoins(uid) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("kalastra_coins")
      .eq("uid", uid)
      .single();

    if (error && error.code !== "PGRST116") {
      console.warn("[coins] safeGetCoins:", error.message);
      return 0;
    }
    return data?.kalastra_coins ?? 0;
  } catch (err) {
    console.warn("[coins] safeGetCoins exception:", err.message);
    return 0;
  }
}

async function safeSetCoins(uid, newBalance) {
  try {
    const { error } = await supabase
      .from("users")
      .update({ kalastra_coins: newBalance, updated_at: new Date().toISOString() })
      .eq("uid", uid);
    if (error) { console.warn("[coins] safeSetCoins:", error.message); return false; }
    return true;
  } catch (err) {
    console.warn("[coins] safeSetCoins exception:", err.message);
    return false;
  }
}

// ─── GET /api/v1/coins ────────────────────────────────────────────────────────
// Returns current coin balance. Also ensures the column exists via upsert.
exports.getCoins = async (req, res) => {
  const uid = req.user.sub;

  // Try to ensure user row has kalastra_coins — upsert with conflict on uid
  try {
    await supabase
      .from("users")
      .upsert({ uid, kalastra_coins: 0 }, { onConflict: "uid", ignoreDuplicates: true });
  } catch (_) { /* column might not exist yet — handled below */ }

  const coins = await safeGetCoins(uid);
  return res.status(200).json({ success: true, data: { coins } });
};

// ─── POST /api/v1/coins/reward ────────────────────────────────────────────────
exports.grantReward = async (req, res) => {
  const uid = req.user.sub;
  const { order_id } = req.body;

  const earned = Math.floor(Math.random() * 16); // 0–15
  const current = await safeGetCoins(uid);
  const newBalance = current + earned;
  const saved = await safeSetCoins(uid, newBalance);

  if (saved) {
    try {
      await supabase.from("coin_transactions").insert({
        user_id: uid,
        order_id: order_id || null,
        type: "earned",
        coins: earned,
        balance_after: newBalance,
        description: "Order reward",
        created_at: new Date().toISOString(),
      });
    } catch (_) { /* non-fatal */ }
  }

  return res.status(200).json({ success: true, data: { earned, balance: newBalance } });
};

// ─── deductCoins (used internally by payment controller) ─────────────────────
exports.deductCoins = async (uid, coinsToDeduct, orderId) => {
  if (coinsToDeduct <= 0) return;
  const current = await safeGetCoins(uid);
  const newBalance = Math.max(0, current - coinsToDeduct);
  const saved = await safeSetCoins(uid, newBalance);
  if (saved) {
    try {
      await supabase.from("coin_transactions").insert({
        user_id: uid,
        order_id: orderId || null,
        type: "redeemed",
        coins: coinsToDeduct,
        balance_after: newBalance,
        description: "Redeemed on order",
        created_at: new Date().toISOString(),
      });
    } catch (_) { /* non-fatal */ }
  }
};
