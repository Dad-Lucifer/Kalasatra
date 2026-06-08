"use strict";

const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// GET /api/v1/user/profile
// Fetch the authenticated user's profile (from user_info table)
router.get("/profile", authenticateToken, userController.getProfile);

// PUT /api/v1/user/profile
// Upsert the authenticated user's profile (including address)
router.put("/profile", authenticateToken, userController.updateProfile);

module.exports = router;
