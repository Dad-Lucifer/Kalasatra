"use strict";

const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter — 100 req / 15 min per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

/**
 * Strict auth limiter — 10 attempts / 15 min per IP
 * Applies to /signup, /login, /verify-otp, /resend-otp
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: "Too many auth attempts from this IP, please try again after 15 minutes.",
  },
});

/**
 * Very strict OTP resend limiter — 3 attempts / 15 min per IP
 */
const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP resend attempts. Please wait 15 minutes.",
  },
});

module.exports = { apiLimiter, authLimiter, resendOtpLimiter };
