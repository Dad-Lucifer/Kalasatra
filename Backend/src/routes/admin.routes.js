"use strict";

const { Router } = require("express");
const router = Router();

const {
  adminVerifyOtp,
  adminResendOtp,
  adminLogin,
  getAdminProfile,
} = require("../controllers/admin.controller");

const { authenticateToken } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/rbac.middleware");
const { authLimiter, resendOtpLimiter } = require("../middlewares/rateLimiter.middleware");
const {
  validate,
  adminLoginSchema,
  verifyOtpSchema,
  resendOtpSchema,
} = require("../middlewares/validate.middleware");

// ─── Public Routes ────────────────────────────────────────────────────────────

// Public admin registration is disabled. Admin/owner accounts must be provisioned internally.

/**
 * @route   POST /api/v1/admin/verify-otp
 * @desc    Confirm email with OTP code and activate admin account
 * @access  Public
 */
router.post(
  "/verify-otp",
  authLimiter,
  validate(verifyOtpSchema),
  adminVerifyOtp
);

/**
 * @route   POST /api/v1/admin/resend-otp
 * @desc    Resend OTP confirmation code to email
 * @access  Public
 */
router.post(
  "/resend-otp",
  resendOtpLimiter,
  validate(resendOtpSchema),
  adminResendOtp
);

/**
 * @route   POST /api/v1/admin/login
 * @desc    Admin login with email + password
 * @access  Public (but requires admin role in Cognito)
 */
router.post(
  "/login",
  authLimiter,
  validate(adminLoginSchema),
  adminLogin
);

// ─── Protected Admin Routes ───────────────────────────────────────────────────

/**
 * @route   GET /api/v1/admin/me
 * @desc    Get current admin profile
 * @access  Admin+
 */
router.get(
  "/me",
  authenticateToken,
  requireAdmin,
  getAdminProfile
);

module.exports = router;
