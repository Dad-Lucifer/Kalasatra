"use strict";

const { supabase } = require("../../database/supabase");

const getProductReviews = async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[REVIEW CONTROLLER] getProductReviews:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch reviews.",
      });
    }

    return res.status(200).json({
      success: true,
      data: reviews || [],
    });
  } catch (err) {
    console.error("[REVIEW CONTROLLER] getProductReviews:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews.",
    });
  }
};

const createReview = async (req, res) => {
  try {
    const { slug } = req.params;
    const { sub } = req.user;
    const { rating, review } = req.body;

    if (!rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Rating and review text are required.",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const { data: user } = await supabase
      .from("users")
      .select("name")
      .eq("uid", sub)
      .single();

    const { error } = await supabase.from("reviews").insert({
      product_id: product.id,
      user_uid: sub,
      user_name: user?.name || "Anonymous",
      rating,
      review,
    });

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "You have already reviewed this product.",
        });
      }
      console.error("[REVIEW CONTROLLER] createReview:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create review.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
    });
  } catch (err) {
    console.error("[REVIEW CONTROLLER] createReview:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create review.",
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { sub } = req.user;

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_uid", sub);

    if (error) {
      console.error("[REVIEW CONTROLLER] deleteReview:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete review.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (err) {
    console.error("[REVIEW CONTROLLER] deleteReview:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review.",
    });
  }
};

module.exports = {
  getProductReviews,
  createReview,
  deleteReview,
};
