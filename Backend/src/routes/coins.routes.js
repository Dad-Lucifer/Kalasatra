"use strict";

const express = require("express");
const router = express.Router();
const coinsController = require("../controllers/coins.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// GET /api/v1/coins  — fetch balance
router.get("/", authenticateToken, coinsController.getCoins);

// POST /api/v1/coins/reward  — grant reward after order
router.post("/reward", authenticateToken, coinsController.grantReward);

module.exports = router;
