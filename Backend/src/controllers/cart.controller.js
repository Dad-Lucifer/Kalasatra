"use strict";

const { supabase } = require("../../database/supabase");

const handleError = (res, err, context = "") => {
  console.error(`[CART CONTROLLER] ${context}:`, err);
  return res.status(500).json({
    success: false,
    message: err.message || "An internal error occurred.",
  });
};

/**
 * GET /api/v1/cart
 * Get all cart items for the authenticated user
 */
const getCart = async (req, res) => {
  try {
    const { sub } = req.user;
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_uid", sub)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    return handleError(res, err, "getCart");
  }
};

/**
 * POST /api/v1/cart
 * Add item to cart (or increment quantity if exists)
 */
const addToCart = async (req, res) => {
  try {
    const { sub } = req.user;
    const { productId, name, price, size, color, image, slug } = req.body;

    if (!productId || !name || price == null || !size || !color) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: productId, name, price, size, color",
      });
    }

    const { data: existing, error: findError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_uid", sub)
      .eq("product_id", productId)
      .eq("size", size)
      .eq("color", color)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + 1, updated_at: new Date().toISOString() })
        .eq("id", existing.id);

      if (updateError) throw updateError;

      return res.status(200).json({
        success: true,
        message: "Cart item quantity updated.",
      });
    }

    const { error: insertError } = await supabase.from("cart_items").insert({
      user_uid: sub,
      product_id: productId,
      name,
      price,
      size,
      color,
      quantity: 1,
      image: image || null,
      slug: slug || null,
    });

    if (insertError) throw insertError;

    return res.status(201).json({
      success: true,
      message: "Item added to cart.",
    });
  } catch (err) {
    return handleError(res, err, "addToCart");
  }
};

/**
 * PUT /api/v1/cart/:id
 * Update item quantity (delta: +1 or -1)
 */
const updateCartItem = async (req, res) => {
  try {
    const { sub } = req.user;
    const { id } = req.params;
    const { delta } = req.body;

    if (delta == null || ![1, -1].includes(delta)) {
      return res.status(400).json({
        success: false,
        message: "delta must be 1 or -1",
      });
    }

    const { data: item, error: findError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("id", id)
      .eq("user_uid", sub)
      .maybeSingle();

    if (findError) throw findError;
    if (!item) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      return res.status(200).json({
        success: true,
        message: "Cart item removed.",
      });
    }

    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      message: "Cart item quantity updated.",
    });
  } catch (err) {
    return handleError(res, err, "updateCartItem");
  }
};

/**
 * DELETE /api/v1/cart/:id
 * Remove specific item from cart
 */
const removeCartItem = async (req, res) => {
  try {
    const { sub } = req.user;
    const { id } = req.params;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", id)
      .eq("user_uid", sub);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Cart item removed.",
    });
  } catch (err) {
    return handleError(res, err, "removeCartItem");
  }
};

/**
 * DELETE /api/v1/cart
 * Clear entire cart for the authenticated user
 */
const clearCart = async (req, res) => {
  try {
    const { sub } = req.user;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_uid", sub);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Cart cleared.",
    });
  } catch (err) {
    return handleError(res, err, "clearCart");
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
