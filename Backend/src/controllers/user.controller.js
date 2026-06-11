"use strict";

const { supabase } = require("../../database/supabase");

// GET /api/v1/user/profile
// Fetch the authenticated user's profile from the 'users' table (keyed by uid = Cognito sub)
exports.getProfile = async (req, res, next) => {
  try {
    const uid = req.user.sub; // Cognito sub

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", uid)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found, which is fine (new user)
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: data || null,
    });
  } catch (error) {
    console.error("[getProfile Error]:", error);
    next(error);
  }
};

// PUT /api/v1/user/profile
// Upsert address + name into the 'users' table for the authenticated user
exports.updateProfile = async (req, res, next) => {
  try {
    const uid = req.user.sub;
    const {
      first_name,
      address_line_1,
      address_line_2,
      city,
      state,
      pincode,
    } = req.body;

    // Build only the fields we want to update
    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (first_name)      updates.name          = first_name;
    if (address_line_1)  updates.address_line1 = address_line_1;
    if (address_line_2)  updates.address_line2 = address_line_2;
    if (city)            updates.city          = city;
    if (state)           updates.state         = state;
    if (pincode)         updates.pincode       = pincode;

    // Try to update first (user should already exist in 'users' from Cognito signup flow)
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("uid", uid)
      .select()
      .single();

    if (error) {
      // If no row exists yet (shouldn't happen normally), insert a minimal row
      if (error.code === "PGRST116") {
        const email = req.user.email || req.user["cognito:username"] || "";
        const { data: insertData, error: insertError } = await supabase
          .from("users")
          .insert({
            uid,
            email,
            name: first_name || "User",
            address_line1: address_line_1,
            address_line2: address_line_2,
            city,
            state,
            pincode,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        return res.status(200).json({
          success: true,
          message: "Profile created and address saved.",
          data: insertData,
        });
      }
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Address saved successfully.",
      data,
    });
  } catch (error) {
    console.error("[updateProfile Error]:", error);
    next(error);
  }
};

// GET /api/v1/user/orders
// Fetch orders for the authenticated user from order_confirmed
exports.getUserOrders = async (req, res, next) => {
  try {
    const uid = req.user.sub;

    const { data, error } = await supabase
      .from("order_confirmed")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const normalised = (data || []).map((order) => {
      let items = order.items;
      if (typeof items === "string") {
        try { items = JSON.parse(items); } catch { items = []; }
      }
      if (!Array.isArray(items)) items = [];

      return {
        ...order,
        items,
        shipping_address: {
          full_name: order.shipping_full_name || order.user_name || "—",
          line1:     order.address_line1 || "—",
          line2:     order.address_line2 || null,
          city:      order.city  || "—",
          state:     order.state || "—",
          pincode:   order.pincode || "—",
          country:   order.country || "India",
        },
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
  } catch (error) {
    console.error("[getUserOrders Error]:", error);
    next(error);
  }
};

