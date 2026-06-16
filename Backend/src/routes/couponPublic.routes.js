"use strict";

const { Router } = require("express");
const router = Router();

const { redeemCoupon, getAvailableCouponsCount } = require("../controllers/coupon.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

/**
 * @route   GET /api/v1/coupons/available
 * @desc    Get count of currently active & valid coupons
 * @access  Authenticated user
 */
router.get(
  "/available",
  authenticateToken,
  getAvailableCouponsCount
);

/**
 * @route   POST /api/v1/coupons/redeem
 * @desc    Redeem a coupon code
 * @access  Authenticated user
 */
router.post(
  "/redeem",
  authenticateToken,
  redeemCoupon
);

module.exports = router;
