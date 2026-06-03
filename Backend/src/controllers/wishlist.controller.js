"use strict";

const { supabase } = require("../../database/supabase");

const handleError = (res, err, context = "") => {
  console.error(`[WISHLIST CONTROLLER] ${context}:`, err);
  return res.status(500).json({
    success: false,
    message: err.message || "An internal error occurred.",
  });
};

const getWishlist = async (req, res) => {
  try {
    const userUid = req.user.sub;

    const { data, error } = await supabase
      .from("wishlist")
      .select("*")
      .eq("user_uid", userUid)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    return handleError(res, err, "getWishlist");
  }
};

const addToWishlist = async (req, res) => {
  try {
    const userUid = req.user.sub;
    const { product_id, product_name, product_price, product_image, product_slug } = req.body;

    if (!product_id || !product_name || product_price === undefined) {
      return res.status(400).json({
        success: false,
        message: "product_id, product_name, and product_price are required.",
      });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("name")
      .eq("uid", userUid)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const { data: existing } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_uid", userUid)
      .eq("product_id", product_id)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist.",
      });
    }

    const { data, error } = await supabase
      .from("wishlist")
      .insert([
        {
          user_uid: userUid,
          user_name: user.name,
          product_id,
          product_name,
          product_price: parseFloat(product_price),
          product_image: product_image || null,
          product_slug: product_slug || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      data,
      message: "Added to wishlist.",
    });
  } catch (err) {
    return handleError(res, err, "addToWishlist");
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const userUid = req.user.sub;
    const { product_id } = req.params;

    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_uid", userUid)
      .eq("product_id", product_id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist.",
    });
  } catch (err) {
    return handleError(res, err, "removeFromWishlist");
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
