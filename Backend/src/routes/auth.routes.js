"use strict";

const { Router } = require("express");
const router = Router();

const {
  signup,
  verifyOtp,
  resendOtp,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/auth.controller");

const { authenticateToken } = require("../middlewares/auth.middleware");
const { authLimiter, resendOtpLimiter } = require("../middlewares/rateLimiter.middleware");
const {
  validate,
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} = require("../middlewares/validate.middleware");

// ─── Public Routes ──────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Register new user — triggers email OTP via Cognito
 * @access  Public
 */
router.post(
  "/signup",
  authLimiter,
  validate(signupSchema),
  signup
);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Confirm email with OTP code received after signup
 * @access  Public
 */
router.post(
  "/verify-otp",
  authLimiter,
  validate(verifyOtpSchema),
  verifyOtp
);

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Resend OTP confirmation code to email
 * @access  Public
 */
router.post(
  "/resend-otp",
  resendOtpLimiter,
  validate(resendOtpSchema),
  resendOtp
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login with email + password — returns JWT tokens
 * @access  Public
 */
router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  login
);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token using a valid refresh token
 * @access  Public
 */
router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  refreshToken
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset OTP to email
 * @access  Public
 */
router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Confirm reset OTP and set new password
 * @access  Public
 */
router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  resetPassword
);

// ─── Protected Routes ────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Global sign-out — invalidates all Cognito sessions
 * @access  Private (requires Bearer token)
 */
router.post(
  "/logout",
  authenticateToken,
  logout
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user's profile from Firestore
 * @access  Private (requires Bearer token)
 */
router.get(
  "/me",
  authenticateToken,
  getMe
);

module.exports = router;
