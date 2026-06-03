"use strict";

const { Router } = require("express");
const router = Router();

const { getAnalytics } = require("../controllers/analytics.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { requireAdmin } = require("../middlewares/rbac.middleware");

/**
 * @route   GET /api/v1/admin/analytics
 * @desc    Get analytics data for admin dashboard
 * @access  Admin+
 */
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  getAnalytics
);

module.exports = router;
