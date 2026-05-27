"use strict";

const { ADMIN_ROLES } = require("../controllers/admin.controller");

/**
 * Role-Based Access Control Middleware
 * Checks if user has required role(s) to access endpoint
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userGroups = user.groups || [];

    // Check if user has any of the allowed roles
    const hasRole = allowedRoles.some((role) => userGroups.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions. Required role(s): " + allowedRoles.join(", "),
      });
    }

    next();
  };
};

/**
 * Require admin role
 */
const requireAdmin = requireRole(
  ADMIN_ROLES.ADMIN,
);

/**
 * Check if user is admin (any admin role)
 */
const isAdmin = (req, res, next) => {
  const userGroups = req.user?.groups || [];
  const adminRoles = Object.values(ADMIN_ROLES);
  
  req.isAdmin = userGroups.some((group) => adminRoles.includes(group));
  next();
};

module.exports = {
  requireRole,
  requireAdmin,
  isAdmin,
};
