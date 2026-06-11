"use strict";

const Razorpay = require("razorpay");
const crypto = require("crypto");
const { supabase } = require("../../database/supabase");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Create Razorpay Order ────────────────────────────────────────────────────
// POST /api/v1/payment/create-order
// Body: { amount }
// ─────────────────────────────────────────────────────────────────────────────
exports.createOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("[Razorpay Create Order Error]:", error);
    next(error);
  }
};

// ─── Verify Payment + Save Order ──────────────────────────────────────────────
// POST /api/v1/payment/verify
//
// Body:
//   razorpay_order_id   – from Razorpay handler response
//   razorpay_payment_id – from Razorpay handler response
//   razorpay_signature  – from Razorpay handler response
//   amount              – final INR amount (not paise)
//   items               – [{product_id, product_name, slug, price, quantity, size, color, image}]
//   shipping_address    – {full_name, line1, line2, city, state, pincode, country}
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      items,
      shipping_address,
    } = req.body;

    // ── 1. Validate required payment fields ──────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required payment details" });
    }

    // ── 2. Cryptographic signature verification ──────────────────────────────
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature — payment verification failed",
      });
    }

    // ── 3. Build order record ────────────────────────────────────────────────
    const user = req.user; // set by authenticateToken middleware

    // Fetch Razorpay payment details to get the actual payment method
    let paymentMode = "online";
    try {
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      paymentMode = paymentDetails.method || "online"; // card | upi | netbanking | wallet | cod
    } catch (rzErr) {
      // Non-fatal — we still save the order, just default to "online"
      console.warn("[verifyPayment] Could not fetch Razorpay payment details:", rzErr.message);
    }

    const addr = shipping_address || {};
    const orderRecord = {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      payment_mode: paymentMode,
      payment_amount: amount ? parseFloat(amount) : 0,
      payment_status: "paid",
      payment_time: new Date().toISOString(),

      user_id:    user.sub,
      user_name:  user.name  || "—",
      user_email: user.email || "—",
      user_phone: user.phone || null,

      shipping_full_name: addr.full_name  || addr.full_name || user.name || "—",
      address_line1:      addr.line1      || addr.address_line1 || "—",
      address_line2:      addr.line2      || addr.address_line2 || null,
      city:               addr.city       || "—",
      state:              addr.state      || "—",
      pincode:            addr.pincode    || "—",
      country:            addr.country    || "India",

      items: Array.isArray(items) ? items : [],

      delivery_status: "order_confirmed",
    };

    // ── 4. Insert into order_confirmed ───────────────────────────────────────
    const { data: savedOrder, error: insertError } = await supabase
      .from("order_confirmed")
      .insert(orderRecord)
      .select()
      .single();

    if (insertError) {
      console.error("[verifyPayment] Failed to save order:", insertError);
      // Payment WAS verified — return success but flag the save failure
      return res.status(200).json({
        success: true,
        message: "Payment verified. Order save failed — please contact support.",
        data: { razorpay_payment_id, razorpay_order_id },
      });
    }

    console.log(`[verifyPayment] Order saved: ${savedOrder.id} | Payment: ${razorpay_payment_id}`);

    return res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed.",
      data: {
        order_id:           savedOrder.id,
        razorpay_payment_id,
        razorpay_order_id,
        delivery_status:    savedOrder.delivery_status,
      },
    });
  } catch (error) {
    console.error("[Razorpay Verify Payment Error]:", error);
    next(error);
  }
};
