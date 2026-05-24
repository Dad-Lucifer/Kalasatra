"use strict";

const Joi = require("joi");

/**
 * Generic validation factory.
 * Returns Express middleware that validates req.body against schema.
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,    // Return all errors, not just first
    stripUnknown: true,   // Remove extra fields
  });

  if (error) {
    const details = error.details.map((d) => d.message);
    return res.status(422).json({
      success: false,
      message: "Validation failed.",
      errors: details,
    });
  }

  req.body = value; // Use sanitized value
  next();
};

// ──── Schemas ──────────────────────────────────────────────────────────────

const signupSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_+=[\]{}|;:'",.<>/?\\`~])/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number, and special character.",
    }),
  name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string()
    .pattern(/^\+[1-9]\d{6,14}$/)
    .optional()
    .messages({
      "string.pattern.base": "Phone must be in E.164 format e.g. +911234567890",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  code: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.length": "OTP must be exactly 6 digits.",
    "string.pattern.base": "OTP must contain digits only.",
  }),
});

const resendOtpSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  code: Joi.string().length(6).pattern(/^\d+$/).required(),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_+=[\]{}|;:'",.<>/?\\`~])/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number, and special character.",
    }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
};
