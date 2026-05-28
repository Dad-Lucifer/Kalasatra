"use strict";

const { Router } = require("express");
const router = Router();

const {
  getCategories,
  getSubcategories,
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductVariant,
  createSubcategory,
} = require("../controllers/product.controller");

const { authenticateToken } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/rbac.middleware");
const {
  validate,
  createProductSchema,
  updateProductSchema,
  createProductVariantSchema,
  createSubcategorySchema,
} = require("../middlewares/validate.middleware");

// ─── Public Routes (No Authentication Required) ─────────────────────────────

/**
 * @route   GET /api/v1/products/categories
 * @desc    Get all active categories
 * @access  Public
 */
router.get("/categories", getCategories);

/**
 * @route   GET /api/v1/products/categories/:slug/subcategories
 * @desc    Get subcategories for a category
 * @access  Public
 */
router.get("/categories/:slug/subcategories", getSubcategories);

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with filters and pagination
 * @access  Public
 */
router.get("/", getProducts);

/**
 * @route   GET /api/v1/products/:slug
 * @desc    Get single product by slug
 * @access  Public
 */
router.get("/:slug", getProductBySlug);

// ─── Admin Routes ─────────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/products
 * @desc    Create new product
 * @access  Admin
 */
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  validate(createProductSchema),
  createProduct
);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product
 * @access  Admin
 */
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  validate(updateProductSchema),
  updateProduct
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product
 * @access  Admin
 */
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  deleteProduct
);

/**
 * @route   POST /api/v1/products/:productId/variants
 * @desc    Create product variant
 * @access  Admin
 */
router.post(
  "/:productId/variants",
  authenticateToken,
  requireAdmin,
  validate(createProductVariantSchema),
  createProductVariant
);

/**
 * @route   POST /api/v1/products/categories/subcategories
 * @desc    Create subcategory
 * @access  Admin
 */
router.post(
  "/categories/subcategories",
  authenticateToken,
  requireAdmin,
  validate(createSubcategorySchema),
  createSubcategory
);

module.exports = router;
