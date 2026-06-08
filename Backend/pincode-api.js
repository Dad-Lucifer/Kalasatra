"use strict";

const express = require("express");
const router = express.Router();

/**
 * Reusable function to fetch pincode details from the external API.
 * This can be imported and used anywhere in the backend (e.g. for address verification).
 * You can also add database logic here in the future to cache/store the data.
 * 
 * @param {string} pincode - The 6 digit pincode to look up
 * @returns {Promise<Object>} - Formatted pincode data
 */
const fetchPincodeDetails = async (pincode) => {
  const baseUrl = process.env.PINCODE_API_URL || "https://api.postalpincode.in/pincode/";
  
  try {
    const response = await fetch(`${baseUrl}${pincode}`);
    const data = await response.json();
    
    if (data && data[0] && data[0].Status === "Success") {
      // TODO: In the near future, you can store this data in your DB here.
      
      return {
        success: true,
        message: data[0].Message,
        postOffices: data[0].PostOffice,
      };
    } else {
      return {
        success: false,
        message: "Invalid Pincode or no records found.",
        postOffices: null,
      };
    }
  } catch (error) {
    console.error("[fetchPincodeDetails Error]:", error);
    throw error;
  }
};

/**
 * Express Route Handler for the custom Pincode API.
 * Allows the frontend to fetch pincode details via this custom API endpoint.
 */
router.get("/:pincode", async (req, res) => {
  try {
    const { pincode } = req.params;

    // Basic validation for an Indian pincode
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 6-digit pincode",
      });
    }

    const data = await fetchPincodeDetails(pincode);

    if (data.success) {
      return res.status(200).json(data);
    } else {
      return res.status(404).json(data);
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pincode details. Please try again later.",
    });
  }
});

module.exports = {
  pincodeRouter: router,
  fetchPincodeDetails
};
