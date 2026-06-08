"use strict";

const { supabase } = require("../../database/supabase");

// Get the user's profile information
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.sub; // Cognito user sub is the UUID

    const { data, error } = await supabase
      .from("user_info")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: data || null // null if no profile exists yet
    });

  } catch (error) {
    console.error("[getProfile Error]:", error);
    next(error);
  }
};

// Update or create the user's profile information
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const {
      first_name,
      last_name,
      email,
      phone_number,
      address_line_1,
      address_line_2,
      city,
      state,
      country,
      pincode
    } = req.body;

    const { data, error } = await supabase
      .from("user_info")
      .upsert({
        id: userId,
        first_name: first_name || "User",
        last_name,
        email: email || req.user.email || "no-email@placeholder.com",
        phone_number,
        address_line_1,
        address_line_2,
        city,
        state,
        country: country || "India",
        pincode,
        updated_at: new Date()
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data
    });

  } catch (error) {
    console.error("[updateProfile Error]:", error);
    next(error);
  }
};
