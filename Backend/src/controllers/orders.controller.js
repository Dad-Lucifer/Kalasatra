"use strict";

const { supabase } = require("../../database/supabase");

const handleError = (res, err, context = "") => {
  console.error(`[ORDERS CONTROLLER] ${context}:`, err);
  return res.status(500).json({
    success: false,
    message: err.message || "An internal error occurred.",
  });
};

const VALID_STATUSES = ["order_confirmed", "out_for_delivery", "delivered"];

// ─── GET /api/v1/admin/orders ─────────────────────────────────────────────────
// Returns all orders, newest first. Admin only.
exports.getAllOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("order_confirmed")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const normalised = (data || []).map((order) => {
      // items is stored as JSONB — Supabase returns it as a JS object already,
      // but guard against it coming back as a string just in case.
      let items = order.items;
      if (typeof items === "string") {
        try { items = JSON.parse(items); } catch { items = []; }
      }
      if (!Array.isArray(items)) items = [];

      return {
        // ── spread ALL raw columns first so the page can access anything ──
        ...order,

        // ── cleaned items array ─────────────────────────────────────────
        items,

        // ── constructed shipping_address object ─────────────────────────
        shipping_address: {
          full_name: order.shipping_full_name || order.user_name || "—",
          line1:     order.address_line1 || "—",
          line2:     order.address_line2 || null,
          city:      order.city  || "—",
          state:     order.state || "—",
          pincode:   order.pincode || "—",
          country:   order.country || "India",
        },

        // ── frontend-friendly aliases ────────────────────────────────────
        user_uid:       order.user_id,
        user_name:      order.user_name  || "—",
        user_email:     order.user_email || "—",
        user_phone:     order.user_phone || null,
        total_amount:   Number(order.payment_amount) || 0,
        payment_method: order.payment_mode || "online",
        payment_status: order.payment_status || "paid",
      };
    });

    return res.status(200).json({ success: true, data: normalised });
  } catch (err) {
    return handleError(res, err, "getAllOrders");
  }
};


// ─── PATCH /api/v1/admin/orders/:id/status ────────────────────────────────────
// Body: { delivery_status: 'order_confirmed' | 'out_for_delivery' | 'delivered' }
// Admin only.
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_status } = req.body;

    if (!delivery_status || !VALID_STATUSES.includes(delivery_status)) {
      return res.status(400).json({
        success: false,
        message: `delivery_status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const { data, error } = await supabase
      .from("order_confirmed")
      .update({ delivery_status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${delivery_status}".`,
      data: { id: data.id, delivery_status: data.delivery_status },
    });
  } catch (err) {
    return handleError(res, err, "updateOrderStatus");
  }
};
