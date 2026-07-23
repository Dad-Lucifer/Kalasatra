"use strict";

const { Router } = require("express");
const router = Router();

const { uploadImage, uploadImages } = require("../controllers/upload.controller");

const { authenticateToken } = require("../middlewares/auth.middleware");

const { requireAdmin } = require("../middlewares/rbac.middleware");
const { uploadSingle, uploadMultiple } = require("../middlewares/upload.middleware");

/**
 * @route   POST /api/v1/upload/image
 * @desc    Upload a single product image to AWS S3 + CloudFront (WebP + AVIF, blurDataURL)
 * @access  Admin
 */
router.post(
  "/image",
  authenticateToken,
  requireAdmin,
  uploadSingle,
  uploadImage
);

/**
 * @route   POST /api/v1/upload/images
 * @desc    Upload multiple product images to AWS S3 + CloudFront (WebP + AVIF, blurDataURL)
 * @access  Admin
 */
router.post(
  "/images",
  authenticateToken,
  requireAdmin,
  uploadMultiple,
  uploadImages
);

module.exports = router;
