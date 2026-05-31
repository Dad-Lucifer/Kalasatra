"use strict";

const { Router } = require("express");
const router = Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cart.controller");

const { authenticateToken } = require("../middlewares/auth.middleware");

// All cart routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/cart
 * @desc    Get all cart items for the authenticated user
 * @access  Private
 */
router.get("/", getCart);

/**
 * @route   POST /api/v1/cart
 * @desc    Add item to cart (increments quantity if already exists)
 * @access  Private
 */
router.post("/", addToCart);

/**
 * @route   PUT /api/v1/cart/:id
 * @desc    Update item quantity by delta (+1 or -1)
 * @access  Private
 */
router.put("/:id", updateCartItem);

/**
 * @route   DELETE /api/v1/cart/:id
 * @desc    Remove a specific cart item
 * @access  Private
 */
router.delete("/:id", removeCartItem);

/**
 * @route   DELETE /api/v1/cart
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete("/", clearCart);

module.exports = router;
