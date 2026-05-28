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

// ──── Admin Schemas ────────────────────────────────────────────────────────

const adminLoginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const adminSignupSchema = Joi.object({
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

// ──── Product Schemas ──────────────────────────────────────────────────────

const createSubcategorySchema = Joi.object({
  category_id: Joi.string().uuid().required(),
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(500).optional(),
  display_order: Joi.number().integer().min(0).optional(),
});

const createProductSchema = Joi.object({
  category_id: Joi.string().uuid().required(),
  subcategory_id: Joi.string().uuid().optional().allow(null),
  subcategory_name: Joi.string().trim().min(1).max(100).optional().allow(null),
  name: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().max(2000).optional(),
  buying_price: Joi.number().min(0).required(),
  selling_price: Joi.number().min(0).required(),
  discount_percentage: Joi.number().min(0).max(100).optional(),
  gst_percentage: Joi.number().min(0).max(100).optional(),
  colors: Joi.array().items(Joi.string()).optional(),
  sizes: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      alt: Joi.string().optional(),
      order: Joi.number().integer().optional(),
    })
  ).optional(),
  thumbnail_url: Joi.string().uri().optional(),
  stock_quantity: Joi.number().integer().min(0).optional(),
  low_stock_threshold: Joi.number().integer().min(0).optional(),
  is_featured: Joi.boolean().optional(),
  meta_title: Joi.string().max(100).optional(),
  meta_description: Joi.string().max(200).optional(),
  meta_keywords: Joi.array().items(Joi.string()).optional(),
});

const updateProductSchema = Joi.object({
  category_id: Joi.string().uuid().optional(),
  subcategory_id: Joi.string().uuid().optional().allow(null),
  name: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().trim().max(2000).optional(),
  buying_price: Joi.number().min(0).optional(),
  selling_price: Joi.number().min(0).optional(),
  discount_percentage: Joi.number().min(0).max(100).optional(),
  gst_percentage: Joi.number().min(0).max(100).optional(),
  colors: Joi.array().items(Joi.string()).optional(),
  sizes: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      alt: Joi.string().optional(),
      order: Joi.number().integer().optional(),
    })
  ).optional(),
  thumbnail_url: Joi.string().uri().optional(),
  stock_quantity: Joi.number().integer().min(0).optional(),
  low_stock_threshold: Joi.number().integer().min(0).optional(),
  is_active: Joi.boolean().optional(),
  is_featured: Joi.boolean().optional(),
  meta_title: Joi.string().max(100).optional(),
  meta_description: Joi.string().max(200).optional(),
  meta_keywords: Joi.array().items(Joi.string()).optional(),
});

const createProductVariantSchema = Joi.object({
  size: Joi.string().trim().required(),
  color: Joi.string().trim().required(),
  sku: Joi.string().trim().optional(),
  price_adjustment: Joi.number().optional(),
  stock_quantity: Joi.number().integer().min(0).optional(),
  images: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      alt: Joi.string().optional(),
      order: Joi.number().integer().optional(),
    })
  ).optional(),
});


// ──── Exports ──────────────────────────────────────────────────────────────

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  adminLoginSchema,
  adminSignupSchema,
  createSubcategorySchema,
  createProductSchema,
  updateProductSchema,
  createProductVariantSchema,
};
