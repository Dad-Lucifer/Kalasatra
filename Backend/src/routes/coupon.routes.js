"use strict";

const { Router } = require("express");
const router = Router();

const { createCoupon, getCoupons, deleteCoupon, redeemCoupon } = require("../controllers/coupon.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/rbac.middleware");

/**
 * @route   POST /api/v1/admin/coupons
 * @desc    Create a new coupon
 * @access  Admin+
 */
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  createCoupon
);

/**
 * @route   GET /api/v1/admin/coupons
 * @desc    Get all coupons
 * @access  Admin+
 */
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  getCoupons
);

/**
 * @route   DELETE /api/v1/admin/coupons/:id
 * @desc    Delete a coupon
 * @access  Admin+
 */
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  deleteCoupon
);

/**
 * @route   POST /api/v1/coupons/redeem
 * @desc    Redeem a coupon code (public auth)
 * @access  Authenticated user
 */
router.post(
  "/redeem",
  authenticateToken,
  redeemCoupon
);

module.exports = router;
