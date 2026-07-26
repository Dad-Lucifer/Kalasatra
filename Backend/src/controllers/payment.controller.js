"use strict";

const Razorpay = require("razorpay");
const crypto = require("crypto");
const { supabase } = require("../../database/supabase");
const coinsCtrl = require("./coins.controller");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Safe coin helpers (graceful if kalastra_coins column missing)
async function safeGetCoins(uid) {
  try {
    const { data, error } = await supabase.from("users").select("kalastra_coins").eq("uid", uid).single();
    if (error && error.code !== "PGRST116") { console.warn("[payment] safeGetCoins:", error.message); return 0; }
    return data?.kalastra_coins ?? 0;
  } catch (e) { return 0; }
}
async function safeSetCoins(uid, balance) {
  try {
    await supabase.from("users").update({ kalastra_coins: balance, updated_at: new Date().toISOString() }).eq("uid", uid);
  } catch (e) { console.warn("[payment] safeSetCoins:", e.message); }
}

// ─── Create Razorpay Order ────────────────────────────────────────────────────
exports.createOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("[Razorpay Create Order Error]:", error);
    next(error);
  }
};

// ─── Verify Payment + Save Order ──────────────────────────────────────────────
// Body extras: coins_used, coins_discount, delivery_charge
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      items,
      shipping_address,
      coins_used = 0,
      coins_discount = 0,
      delivery_charge = 0,
      coupon_code = null,
      coupon_discount = 0,
    } = req.body;

    // ── 1. Validate required payment fields ──────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing required payment details" });
    }

    // ── 2. Signature verification ────────────────────────────────────────────
    const bodyStr = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(bodyStr)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature — payment verification failed",
      });
    }

    const user = req.user;

    // ── 3. Fetch payment method from Razorpay ────────────────────────────────
    let paymentMode = "online";
    try {
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      paymentMode = paymentDetails.method || "online";
    } catch (rzErr) {
      console.warn("[verifyPayment] Could not fetch payment details:", rzErr.message);
    }

    // ── 4. Deduct coins from user balance (if any redeemed) ──────────────────
    const coinsUsedNum = parseInt(coins_used, 10) || 0;
    const coinsDiscountNum = parseFloat(coins_discount) || 0;
    const deliveryChargeNum = parseFloat(delivery_charge) || 0;
    const couponDiscountNum = parseFloat(coupon_discount) || 0;
    const cleanCouponCode = coupon_code ? String(coupon_code).trim().toUpperCase() : null;

    // ── 4a. Deduct redeemed coins via safe helper ─────────────────────────────
    if (coinsUsedNum > 0) {
      await coinsCtrl.deductCoins(user.sub, coinsUsedNum, null); // order ID added below after insert
    }

    // ── 5. Build + save order record ─────────────────────────────────────────
    const addr = shipping_address || {};
    const orderRecord = {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      payment_mode: paymentMode,
      payment_amount: amount ? parseFloat(amount) : 0,
      payment_status: "paid",
      payment_time: new Date().toISOString(),

      user_id:    user.sub,
      user_name:  user.name  || "—",
      user_email: user.email || "—",
      user_phone: user.phone || null,

      shipping_full_name: addr.full_name  || user.name || "—",
      address_line1:      addr.line1      || addr.address_line1 || "—",
      address_line2:      addr.line2      || addr.address_line2 || null,
      city:               addr.city       || "—",
      state:              addr.state      || "—",
      pincode:            addr.pincode    || "—",
      country:            addr.country    || "India",

      items: Array.isArray(items) ? items : [],

      coins_used:      coinsUsedNum,
      coins_discount:  coinsDiscountNum,
      delivery_charge: deliveryChargeNum,
      coupon_code:     cleanCouponCode,
      coupon_discount: couponDiscountNum,

      delivery_status: "order_confirmed",
    };

    const { data: savedOrder, error: insertError } = await supabase
      .from("order_confirmed")
      .insert(orderRecord)
      .select()
      .single();

    if (insertError) {
      console.error("[verifyPayment] Failed to save order:", insertError);
      return res.status(200).json({
        success: true,
        message: "Payment verified. Order save failed — please contact support.",
        data: { razorpay_payment_id, razorpay_order_id },
      });
    }

    console.log(`[verifyPayment] Order saved: ${savedOrder.id} | Payment: ${razorpay_payment_id}`);

    // ── 5b. Record discount coupon redemption ───────────────────────────────────
    if (cleanCouponCode) {
      try {
        const { data: cData } = await supabase
          .from("coupons")
          .select("id, usage_limit, usage_count")
          .eq("code", cleanCouponCode)
          .single();

        if (cData) {
          if (cData.usage_limit !== null) {
            await supabase.rpc("increment_coupon_usage", { p_coupon_id: cData.id });
          } else {
            await supabase
              .from("coupons")
              .update({ usage_count: (cData.usage_count || 0) + 1, updated_at: new Date().toISOString() })
              .eq("id", cData.id);
          }

          await supabase.from("coupon_redemptions").insert({
            coupon_id: cData.id,
            user_uid: user.sub,
            coupon_type: "discount",
            discount_applied: couponDiscountNum,
            order_id: savedOrder.id,
          });
        }
      } catch (cErr) {
        console.warn("[verifyPayment] Coupon redemption log note:", cErr.message);
      }
    }

    // ── 6. Grant reward coins (0–15 random) ────────────────────────────────────
    const rewardCoins = Math.floor(Math.random() * 16); // 0–15
    const currentBalance = await safeGetCoins(user.sub);
    const newBalance = currentBalance + rewardCoins;
    await safeSetCoins(user.sub, newBalance);

    // Log reward transaction (non-fatal)
    try {
      await supabase.from("coin_transactions").insert({
        user_id: user.sub,
        order_id: savedOrder.id,
        type: "earned",
        coins: rewardCoins,
        balance_after: newBalance,
        description: "Order reward",
        created_at: new Date().toISOString(),
      });
    } catch (_) { /* non-fatal if table missing */ }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed.",
      data: {
        order_id:           savedOrder.id,
        razorpay_payment_id,
        razorpay_order_id,
        delivery_status:    savedOrder.delivery_status,
        earned_coins:       rewardCoins,
        coin_balance:       newBalance,
      },
    });
  } catch (error) {
    console.error("[Razorpay Verify Payment Error]:", error);
    next(error);
  }
};
