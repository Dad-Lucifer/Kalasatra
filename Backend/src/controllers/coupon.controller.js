"use strict";

const { supabase } = require("../../database/supabase");

const handleError = (res, err, context = "") => {
  console.error(`[COUPON CONTROLLER] ${context}:`, err);
  return res.status(500).json({
    success: false,
    message: err.message || "An internal error occurred.",
  });
};

/**
 * POST /api/v1/admin/coupons
 * Create a new coupon
 */
const createCoupon = async (req, res) => {
  try {
    const { code, coins, start_date, end_date } = req.body;

    if (!code || !coins || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: code, coins, start_date, end_date",
      });
    }

    const { data: coupon, error } = await supabase
      .from("coupons")
      .insert([
        {
          code: code.trim().toUpperCase(),
          coins: parseInt(coins) || 0,
          start_date: new Date(start_date).toISOString(),
          end_date: new Date(end_date).toISOString(),
          created_by: req.user?.sub || null,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "A coupon with this code already exists.",
        });
      }
      throw error;
    }

    return res.status(201).json({
      success: true,
      data: coupon,
      message: "Coupon created successfully.",
    });
  } catch (err) {
    return handleError(res, err, "createCoupon");
  }
};

/**
 * GET /api/v1/admin/coupons
 * Get all coupons
 */
const getCoupons = async (req, res) => {
  try {
    const { data: coupons, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: coupons || [],
    });
  } catch (err) {
    return handleError(res, err, "getCoupons");
  }
};

/**
 * DELETE /api/v1/admin/coupons/:id
 * Delete a coupon
 */
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("coupons")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (err) {
    return handleError(res, err, "deleteCoupon");
  }
};

/**
 * POST /api/v1/coupons/redeem
 * Redeem a coupon code and credit Kalasatra coins to user
 */
const redeemCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userUid = req.user?.sub;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    // Look up coupon
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .single();

    if (error || !coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code.",
      });
    }

    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);

    // Check dates
    if (now < startDate) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not yet active.",
      });
    }

    if (now > endDate) {
      return res.status(400).json({
        success: false,
        message: "This coupon has expired.",
      });
    }

    // Credit coins to user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("kalasatra_credits")
      .eq("uid", userUid)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    const currentCredits = user.kalasatra_credits || 0;
    const newCredits = currentCredits + coupon.coins;

    const { error: updateError } = await supabase
      .from("users")
      .update({ kalasatra_credits: newCredits })
      .eq("uid", userUid);

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      data: {
        coinsAwarded: coupon.coins,
        totalCredits: newCredits,
      },
      message: `You earned ${coupon.coins} Kalasatra coins!`,
    });
  } catch (err) {
    return handleError(res, err, "redeemCoupon");
  }
};

module.exports = { createCoupon, getCoupons, deleteCoupon, redeemCoupon };
