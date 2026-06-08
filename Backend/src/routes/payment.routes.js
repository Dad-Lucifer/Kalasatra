"use strict";

const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Create Razorpay Order
router.post("/create-order", authenticateToken, paymentController.createOrder);

// Verify Razorpay Payment Signature
router.post("/verify", authenticateToken, paymentController.verifyPayment);

module.exports = router;
