"use strict";

const { Router } = require("express");
const router = Router();

const {
  redeemCoupon,
  validateDiscountCoupon,
  applyDiscountCoupon,
  getAvailableCouponsCount,
} = require("../controllers/coupon.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

/**
 * @route   GET /api/v1/coupons/available
 * @desc    Get count of active & valid Kalasatra Coins coupons
 * @access  Authenticated user
 */
router.get("/available", authenticateToken, getAvailableCouponsCount);

/**
 * @route   POST /api/v1/coupons/redeem
 * @desc    Redeem a COINS coupon — credits Kalasatra coins to wallet
 * @access  Authenticated user
 */
router.post("/redeem", authenticateToken, redeemCoupon);

/**
 * @route   POST /api/v1/coupons/validate-discount
 * @desc    Validate a DISCOUNT coupon at checkout (read-only, no usage commit)
 * @body    { code, order_amount }
 * @access  Authenticated user
 */
router.post("/validate-discount", authenticateToken, validateDiscountCoupon);

/**
 * @route   POST /api/v1/coupons/apply-discount
 * @desc    Atomically commit a DISCOUNT coupon after successful payment
 * @body    { code, order_amount, order_id }
 * @access  Authenticated user
 */
router.post("/apply-discount", authenticateToken, applyDiscountCoupon);

module.exports = router;
