"use strict";

const { uploadImageToS3 } = require("../services/s3.service");

// ── Single upload ───────────────────────────────────────────────────────────

/**
 * POST /api/v1/upload/image
 * Upload a single product image to AWS S3 + CloudFront.
 * Returns WebP URL, AVIF URL, and a blurDataURL placeholder for lazy loading.
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided." });
    }

    const result = await uploadImageToS3(req.file.buffer, req.file.originalname);

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully.",
      data: {
        url:         result.url,          // WebP — backward-compat primary URL
        webp_url:    result.webp_url,
        avif_url:    result.avif_url,
        webp_key:    result.webp_key,     // S3 key — store for deletion
        avif_key:    result.avif_key,
        blurDataURL: result.blurDataURL,  // tiny base64 for lazy-load placeholder
        width:       result.width,
        height:      result.height,
        size_bytes:  result.size_bytes,
        mimetype:    req.file.mimetype,
      },
    });
  } catch (err) {
    console.error("[UPLOAD CONTROLLER] uploadImage:", err.message);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Image upload failed." });
  }
};

// ── Multiple upload ─────────────────────────────────────────────────────────

/**
 * POST /api/v1/upload/images
 * Upload multiple product images to AWS S3 + CloudFront.
 * Each image is converted to WebP + AVIF and a blurDataURL placeholder is generated.
 */
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files provided." });
    }

    const results = await Promise.all(
      req.files.map(async (file, index) => {
        const result = await uploadImageToS3(file.buffer, file.originalname);
        return {
          order:       index,
          url:         result.url,
          webp_url:    result.webp_url,
          avif_url:    result.avif_url,
          webp_key:    result.webp_key,
          avif_key:    result.avif_key,
          blurDataURL: result.blurDataURL,
          width:       result.width,
          height:      result.height,
          size_bytes:  result.size_bytes,
          mimetype:    file.mimetype,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: `${results.length} image(s) uploaded successfully.`,
      data: results,
    });
  } catch (err) {
    console.error("[UPLOAD CONTROLLER] uploadImages:", err.message);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Image upload failed." });
  }
};

module.exports = { uploadImage, uploadImages };