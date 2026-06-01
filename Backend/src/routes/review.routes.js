"use strict";

const { Router } = require("express");
const router = Router();

const {
  getProductReviews,
  createReview,
  deleteReview,
} = require("../controllers/review.controller");

const { authenticateToken } = require("../middlewares/auth.middleware");

router.get("/:slug/reviews", getProductReviews);

router.post("/:slug/reviews", authenticateToken, createReview);

router.delete("/reviews/:reviewId", authenticateToken, deleteReview);

module.exports = router;
