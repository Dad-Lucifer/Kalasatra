"use strict";

const { supabase } = require("../../database/supabase");

// GET /api/v1/addresses
// Fetch all alternate addresses for the authenticated user
exports.getAddresses = async (req, res, next) => {
  try {
    const uid = req.user.sub;

    const { data, error } = await supabase
      .from("alter_address")
      .select("*")
      .eq("uid", uid)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    console.error("[getAddresses Error]:", error);
    next(error);
  }
};

// POST /api/v1/addresses
// Add a new alternate address for the authenticated user
exports.addAddress = async (req, res, next) => {
  try {
    const uid = req.user.sub;
    const { full_name, address_line1, address_line2, city, state, pincode, country } = req.body;

    if (!full_name || !address_line1 || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "full_name, address_line1, city, state, and pincode are required.",
      });
    }

    const { data, error } = await supabase
      .from("alter_address")
      .insert({
        uid,
        full_name,
        address_line1,
        address_line2: address_line2 || null,
        city,
        state,
        pincode,
        country: country || "India",
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Address saved successfully.",
      data,
    });
  } catch (error) {
    console.error("[addAddress Error]:", error);
    next(error);
  }
};

// DELETE /api/v1/addresses/:id
// Delete an alternate address (only if it belongs to the authenticated user)
exports.deleteAddress = async (req, res, next) => {
  try {
    const uid = req.user.sub;
    const { id } = req.params;

    const { error } = await supabase
      .from("alter_address")
      .delete()
      .eq("id", id)
      .eq("uid", uid); // ensures user can only delete their own

    if (error) throw error;

    return res.status(200).json({ success: true, message: "Address deleted." });
  } catch (error) {
    console.error("[deleteAddress Error]:", error);
    next(error);
  }
};
