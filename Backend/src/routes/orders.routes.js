"use strict";

const express = require("express");
const router = express.Router();
const { getAllOrders, updateOrderStatus } = require("../controllers/orders.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/rbac.middleware");

// All routes require valid admin JWT
router.use(authenticateToken, requireAdmin);

// GET  /api/v1/admin/orders          — list all orders
router.get("/", getAllOrders);

// PATCH /api/v1/admin/orders/:id/status — update delivery status
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
