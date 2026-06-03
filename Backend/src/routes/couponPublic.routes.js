"use strict";

const { Router } = require("express");
const router = Router();

const { redeemCoupon } = require("../controllers/coupon.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

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
