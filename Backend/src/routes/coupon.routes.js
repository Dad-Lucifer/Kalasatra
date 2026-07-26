"use strict";

const { Router } = require("express");
const router = Router();

const {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
} = require("../controllers/coupon.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/rbac.middleware");

// All routes under /api/v1/admin/coupons require authentication + admin role

/**
 * @route   GET /api/v1/admin/coupons
 * @desc    Get all coupons (optional query: type, is_active, search)
 * @access  Admin+
 */
router.get("/", authenticateToken, requireAdmin, getCoupons);

/**
 * @route   POST /api/v1/admin/coupons
 * @desc    Create a new coupon (coins or discount)
 * @access  Admin+
 */
router.post("/", authenticateToken, requireAdmin, createCoupon);

/**
 * @route   GET /api/v1/admin/coupons/:id
 * @desc    Get a single coupon by ID
 * @access  Admin+
 */
router.get("/:id", authenticateToken, requireAdmin, getCouponById);

/**
 * @route   PATCH /api/v1/admin/coupons/:id
 * @desc    Update coupon fields
 * @access  Admin+
 */
router.patch("/:id", authenticateToken, requireAdmin, updateCoupon);

/**
 * @route   PATCH /api/v1/admin/coupons/:id/toggle
 * @desc    Toggle coupon active/inactive status
 * @access  Admin+
 */
router.patch("/:id/toggle", authenticateToken, requireAdmin, toggleCouponStatus);

/**
 * @route   DELETE /api/v1/admin/coupons/:id
 * @desc    Delete a coupon
 * @access  Admin+
 */
router.delete("/:id", authenticateToken, requireAdmin, deleteCoupon);

module.exports = router;
