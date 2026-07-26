"use strict";

const { supabase } = require("../../database/supabase");

// ─── Helper ───────────────────────────────────────────────────────────────────
const handleError = (res, err, context = "") => {
  console.error(`[COUPON CONTROLLER] ${context}:`, err);
  return res.status(500).json({
    success: false,
    message: err.message || "An internal error occurred.",
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/admin/coupons
 * Create a new coupon (coins or discount type).
 */
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      type = "coins",
      description,
      // coins fields
      coins,
      // discount fields
      discount_type,
      discount_value,
      min_order_amount = 0,
      max_discount_amount,
      // shared
      usage_limit,
      start_date,
      end_date,
      is_active = true,
    } = req.body;

    // ── Required field validation ─────────────────────────────────────────────
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: "Coupon code is required." });
    }
    if (!start_date || !end_date) {
      return res.status(400).json({ success: false, message: "start_date and end_date are required." });
    }
    if (!["coins", "discount"].includes(type)) {
      return res.status(400).json({ success: false, message: "type must be 'coins' or 'discount'." });
    }

    const startDt = new Date(start_date);
    const endDt = new Date(end_date);
    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format." });
    }
    if (endDt <= startDt) {
      return res.status(400).json({ success: false, message: "end_date must be after start_date." });
    }

    // ── Type-specific validation ──────────────────────────────────────────────
    if (type === "coins") {
      const coinsNum = parseInt(coins, 10);
      if (!coins || isNaN(coinsNum) || coinsNum < 1) {
        return res.status(400).json({ success: false, message: "coins must be a positive integer for coins coupons." });
      }
    }

    if (type === "discount") {
      if (!discount_type || !["percentage", "flat"].includes(discount_type)) {
        return res.status(400).json({ success: false, message: "discount_type must be 'percentage' or 'flat'." });
      }
      const dvNum = parseFloat(discount_value);
      if (isNaN(dvNum) || dvNum <= 0) {
        return res.status(400).json({ success: false, message: "discount_value must be a positive number." });
      }
      if (discount_type === "percentage" && dvNum > 100) {
        return res.status(400).json({ success: false, message: "Percentage discount cannot exceed 100." });
      }
    }

    // ── Build payload ─────────────────────────────────────────────────────────
    const payload = {
      code: code.trim().toUpperCase(),
      name: name ? name.trim() : null,
      type,
      description: description ? description.trim() : null,
      coins: type === "coins" ? (parseInt(coins, 10) || 0) : 0,
      discount_type: type === "discount" ? discount_type : null,
      discount_value: type === "discount" ? (parseFloat(discount_value) || 0) : 0,
      min_order_amount: parseFloat(min_order_amount) || 0,
      max_discount_amount: max_discount_amount ? parseFloat(max_discount_amount) : null,
      usage_limit: usage_limit ? parseInt(usage_limit, 10) : null,
      usage_count: 0,
      start_date: startDt.toISOString(),
      end_date: endDt.toISOString(),
      is_active: Boolean(is_active),
      created_by: req.user?.sub || null,
    };

    const { data: coupon, error } = await supabase
      .from("coupons")
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({ success: false, message: "A coupon with this code already exists." });
      }
      throw error;
    }

    return res.status(201).json({ success: true, data: coupon, message: "Coupon created successfully." });
  } catch (err) {
    return handleError(res, err, "createCoupon");
  }
};

/**
 * GET /api/v1/admin/coupons
 * Get all coupons with optional filters: type, is_active, search.
 */
const getCoupons = async (req, res) => {
  try {
    const { type, is_active, search } = req.query;

    let query = supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (type && ["coins", "discount"].includes(type)) {
      query = query.eq("type", type);
    }
    if (is_active !== undefined && is_active !== "") {
      query = query.eq("is_active", is_active === "true");
    }
    if (search && search.trim()) {
      query = query.ilike("code", `%${search.trim()}%`);
    }

    const { data: coupons, error } = await query;
    if (error) throw error;

    return res.status(200).json({ success: true, data: coupons || [] });
  } catch (err) {
    return handleError(res, err, "getCoupons");
  }
};

/**
 * GET /api/v1/admin/coupons/:id
 * Get a single coupon by ID.
 */
const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found." });
    }

    return res.status(200).json({ success: true, data: coupon });
  } catch (err) {
    return handleError(res, err, "getCouponById");
  }
};

/**
 * PATCH /api/v1/admin/coupons/:id
 * Update an existing coupon.
 */
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      description,
      coins,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      usage_limit,
      start_date,
      end_date,
      is_active,
    } = req.body;

    // Fetch existing coupon first to know its type
    const { data: existing, error: fetchErr } = await supabase
      .from("coupons")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ success: false, message: "Coupon not found." });
    }

    // Build update payload from only provided fields
    const updates = { updated_at: new Date().toISOString() };

    if (code !== undefined) updates.code = code.trim().toUpperCase();
    if (name !== undefined) updates.name = name ? name.trim() : null;
    if (description !== undefined) updates.description = description ? description.trim() : null;
    if (is_active !== undefined) updates.is_active = Boolean(is_active);
    if (usage_limit !== undefined) updates.usage_limit = usage_limit ? parseInt(usage_limit, 10) : null;
    if (min_order_amount !== undefined) updates.min_order_amount = parseFloat(min_order_amount) || 0;
    if (max_discount_amount !== undefined) updates.max_discount_amount = max_discount_amount ? parseFloat(max_discount_amount) : null;

    if (start_date !== undefined) {
      const dt = new Date(start_date);
      if (isNaN(dt.getTime())) return res.status(400).json({ success: false, message: "Invalid start_date." });
      updates.start_date = dt.toISOString();
    }
    if (end_date !== undefined) {
      const dt = new Date(end_date);
      if (isNaN(dt.getTime())) return res.status(400).json({ success: false, message: "Invalid end_date." });
      updates.end_date = dt.toISOString();
    }

    // Validate date order using merged values
    const finalStart = new Date(updates.start_date || existing.start_date);
    const finalEnd = new Date(updates.end_date || existing.end_date);
    if (finalEnd <= finalStart) {
      return res.status(400).json({ success: false, message: "end_date must be after start_date." });
    }

    // Type-specific
    if (existing.type === "coins" && coins !== undefined) {
      const c = parseInt(coins, 10);
      if (isNaN(c) || c < 0) return res.status(400).json({ success: false, message: "coins must be a non-negative integer." });
      updates.coins = c;
    }
    if (existing.type === "discount") {
      if (discount_type !== undefined) {
        if (!["percentage", "flat"].includes(discount_type)) {
          return res.status(400).json({ success: false, message: "discount_type must be 'percentage' or 'flat'." });
        }
        updates.discount_type = discount_type;
      }
      if (discount_value !== undefined) {
        const dv = parseFloat(discount_value);
        if (isNaN(dv) || dv <= 0) return res.status(400).json({ success: false, message: "discount_value must be positive." });
        const effectiveType = updates.discount_type || existing.discount_type;
        if (effectiveType === "percentage" && dv > 100) {
          return res.status(400).json({ success: false, message: "Percentage discount cannot exceed 100." });
        }
        updates.discount_value = dv;
      }
    }

    const { data: updated, error } = await supabase
      .from("coupons")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return res.status(409).json({ success: false, message: "Coupon code already exists." });
      throw error;
    }

    return res.status(200).json({ success: true, data: updated, message: "Coupon updated successfully." });
  } catch (err) {
    return handleError(res, err, "updateCoupon");
  }
};

/**
 * PATCH /api/v1/admin/coupons/:id/toggle
 * Toggle is_active on/off.
 */
const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing, error: fetchErr } = await supabase
      .from("coupons")
      .select("id, is_active, code")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ success: false, message: "Coupon not found." });
    }

    const { data: updated, error } = await supabase
      .from("coupons")
      .update({ is_active: !existing.is_active, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, is_active, code")
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Coupon "${updated.code}" ${updated.is_active ? "enabled" : "disabled"}.`,
    });
  } catch (err) {
    return handleError(res, err, "toggleCouponStatus");
  }
};

/**
 * DELETE /api/v1/admin/coupons/:id
 * Hard-delete a coupon (cascades to redemptions via FK).
 */
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) throw error;

    return res.status(200).json({ success: true, message: "Coupon deleted successfully." });
  } catch (err) {
    return handleError(res, err, "deleteCoupon");
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// USER / PUBLIC ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/coupons/redeem
 * Redeem a COINS coupon. Credits Kalasatra coins to the user's wallet.
 * Cannot be used for discount coupons (those go through checkout).
 */
const redeemCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userUid = req.user?.sub;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: "Coupon code is required." });
    }

    // ── 1. Look up coupon ─────────────────────────────────────────────────────
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .single();

    if (error || !coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code." });
    }

    // ── 2. Type guard ─────────────────────────────────────────────────────────
    if (coupon.type !== "coins") {
      return res.status(400).json({
        success: false,
        message: "This coupon is a discount coupon and can only be applied at checkout.",
      });
    }

    // ── 3. Active check ───────────────────────────────────────────────────────
    if (!coupon.is_active) {
      return res.status(400).json({ success: false, message: "This coupon is no longer active." });
    }

    // ── 4. Date window ────────────────────────────────────────────────────────
    const now = new Date();
    if (now < new Date(coupon.start_date)) {
      return res.status(400).json({ success: false, message: "This coupon is not yet active." });
    }
    if (now > new Date(coupon.end_date)) {
      return res.status(400).json({ success: false, message: "This coupon has expired." });
    }

    // ── 5. Global usage limit (non-atomic read — atomic commit below) ─────────
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: "This coupon has reached its usage limit." });
    }

    // ── 6. Per-user duplicate check ───────────────────────────────────────────
    const { data: existing, error: dupErr } = await supabase
      .from("coupon_redemptions")
      .select("id")
      .eq("coupon_id", coupon.id)
      .eq("user_uid", userUid)
      .maybeSingle();

    if (dupErr) throw dupErr;
    if (existing) {
      return res.status(409).json({ success: false, message: "You have already redeemed this coupon." });
    }

    // ── 7. Atomically increment usage_count via stored procedure ─────────────
    if (coupon.usage_limit !== null) {
      const { error: rpcErr } = await supabase.rpc("increment_coupon_usage", { p_coupon_id: coupon.id });
      if (rpcErr) {
        if (rpcErr.message && rpcErr.message.includes("USAGE_LIMIT_REACHED")) {
          return res.status(400).json({ success: false, message: "This coupon has reached its usage limit." });
        }
        throw rpcErr;
      }
    } else {
      // No limit — simple increment
      await supabase
        .from("coupons")
        .update({ usage_count: coupon.usage_count + 1, updated_at: new Date().toISOString() })
        .eq("id", coupon.id);
    }

    // ── 8. Credit coins to user ───────────────────────────────────────────────
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("kalasatra_credits")
      .eq("uid", userUid)
      .single();

    if (userError || !user) {
      return res.status(404).json({ success: false, message: "User profile not found." });
    }

    const currentCredits = user.kalasatra_credits || 0;
    const newCredits = currentCredits + coupon.coins;

    const { error: updateError } = await supabase
      .from("users")
      .update({ kalasatra_credits: newCredits, updated_at: new Date().toISOString() })
      .eq("uid", userUid);

    if (updateError) throw updateError;

    // ── 9. Record redemption (UNIQUE constraint is final race-condition guard) ─
    const { error: insertError } = await supabase.from("coupon_redemptions").insert({
      coupon_id: coupon.id,
      user_uid: userUid,
      coupon_type: "coins",
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return res.status(409).json({ success: false, message: "You have already redeemed this coupon." });
      }
      throw insertError;
    }

    return res.status(200).json({
      success: true,
      data: { coinsAwarded: coupon.coins, totalCredits: newCredits },
      message: `You earned ${coupon.coins} Kalasatra coins!`,
    });
  } catch (err) {
    return handleError(res, err, "redeemCoupon");
  }
};

/**
 * POST /api/v1/coupons/validate-discount
 * Validate a discount coupon at checkout WITHOUT committing usage.
 * Returns the computed discount amount for the given cart total.
 * Body: { code, order_amount }
 */
const validateDiscountCoupon = async (req, res) => {
  try {
    const { code, order_amount } = req.body;
    const userUid = req.user?.sub;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: "Coupon code is required." });
    }
    const orderAmt = parseFloat(order_amount) || 0;

    // ── 1. Look up coupon ─────────────────────────────────────────────────────
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .single();

    if (error || !coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code." });
    }

    // ── 2. Type guard ─────────────────────────────────────────────────────────
    if (coupon.type !== "discount") {
      return res.status(400).json({
        success: false,
        message: "This is a Kalasatra Coins coupon. Redeem it from the Rewards section.",
      });
    }

    // ── 3. Active + date ──────────────────────────────────────────────────────
    if (!coupon.is_active) {
      return res.status(400).json({ success: false, message: "This coupon is no longer active." });
    }
    const now = new Date();
    if (now < new Date(coupon.start_date)) {
      return res.status(400).json({ success: false, message: "This coupon is not yet active." });
    }
    if (now > new Date(coupon.end_date)) {
      return res.status(400).json({ success: false, message: "This coupon has expired." });
    }

    // ── 4. Min order amount ───────────────────────────────────────────────────
    if (orderAmt < (coupon.min_order_amount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon.`,
      });
    }

    // ── 5. Global usage limit ─────────────────────────────────────────────────
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: "This coupon has reached its usage limit." });
    }

    // ── 6. Per-user already used ──────────────────────────────────────────────
    const { data: existing, error: dupErr } = await supabase
      .from("coupon_redemptions")
      .select("id")
      .eq("coupon_id", coupon.id)
      .eq("user_uid", userUid)
      .maybeSingle();

    if (dupErr) throw dupErr;
    if (existing) {
      return res.status(409).json({ success: false, message: "You have already used this coupon." });
    }

    // ── 7. Compute discount ───────────────────────────────────────────────────
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (orderAmt * coupon.discount_value) / 100;
      if (coupon.max_discount_amount !== null) {
        discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
      }
    } else {
      // flat
      discountAmount = Math.min(coupon.discount_value, orderAmt);
    }
    discountAmount = Math.round(discountAmount * 100) / 100; // round to 2dp

    return res.status(200).json({
      success: true,
      data: {
        coupon_id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discountAmount,
        discounted_total: Math.max(0, orderAmt - discountAmount),
      },
      message: `Coupon applied! You save ₹${discountAmount.toFixed(2)}.`,
    });
  } catch (err) {
    return handleError(res, err, "validateDiscountCoupon");
  }
};

/**
 * POST /api/v1/coupons/apply-discount
 * Atomically commit a discount coupon after successful payment.
 * Called internally by payment controller OR directly if COD.
 * Body: { code, order_amount, order_id }
 */
const applyDiscountCoupon = async (req, res) => {
  try {
    const { code, order_amount, order_id } = req.body;
    const userUid = req.user?.sub;

    if (!code || !order_id) {
      return res.status(400).json({ success: false, message: "code and order_id are required." });
    }

    const orderAmt = parseFloat(order_amount) || 0;

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .single();

    if (error || !coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code." });
    }
    if (coupon.type !== "discount") {
      return res.status(400).json({ success: false, message: "Not a discount coupon." });
    }
    if (!coupon.is_active) {
      return res.status(400).json({ success: false, message: "Coupon is inactive." });
    }

    // Per-user guard
    const { data: existing } = await supabase
      .from("coupon_redemptions")
      .select("id")
      .eq("coupon_id", coupon.id)
      .eq("user_uid", userUid)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ success: false, message: "Coupon already used." });
    }

    // Atomic usage increment
    if (coupon.usage_limit !== null) {
      const { error: rpcErr } = await supabase.rpc("increment_coupon_usage", { p_coupon_id: coupon.id });
      if (rpcErr) {
        if (rpcErr.message && rpcErr.message.includes("USAGE_LIMIT_REACHED")) {
          return res.status(400).json({ success: false, message: "Coupon usage limit reached." });
        }
        throw rpcErr;
      }
    } else {
      await supabase
        .from("coupons")
        .update({ usage_count: coupon.usage_count + 1, updated_at: new Date().toISOString() })
        .eq("id", coupon.id);
    }

    // Compute actual discount
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (orderAmt * coupon.discount_value) / 100;
      if (coupon.max_discount_amount !== null) {
        discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
      }
    } else {
      discountAmount = Math.min(coupon.discount_value, orderAmt);
    }
    discountAmount = Math.round(discountAmount * 100) / 100;

    // Record redemption
    const { error: insertErr } = await supabase.from("coupon_redemptions").insert({
      coupon_id: coupon.id,
      user_uid: userUid,
      coupon_type: "discount",
      discount_applied: discountAmount,
      order_id: order_id,
    });

    if (insertErr) {
      if (insertErr.code === "23505") {
        return res.status(409).json({ success: false, message: "Coupon already used." });
      }
      throw insertErr;
    }

    return res.status(200).json({
      success: true,
      data: { discount_applied: discountAmount },
      message: `Discount of ₹${discountAmount.toFixed(2)} applied.`,
    });
  } catch (err) {
    return handleError(res, err, "applyDiscountCoupon");
  }
};

/**
 * GET /api/v1/coupons/available
 * Returns count of currently active & valid COINS coupons for the user.
 */
const getAvailableCouponsCount = async (req, res) => {
  try {
    const now = new Date().toISOString();

    const { count, error } = await supabase
      .from("coupons")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("type", "coins")
      .lte("start_date", now)
      .gte("end_date", now);

    if (error) throw error;

    return res.status(200).json({ success: true, data: { availableCount: count ?? 0 } });
  } catch (err) {
    return handleError(res, err, "getAvailableCouponsCount");
  }
};

module.exports = {
  // Admin
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  // User / public
  redeemCoupon,
  validateDiscountCoupon,
  applyDiscountCoupon,
  getAvailableCouponsCount,
};
