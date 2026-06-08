"use strict";

const express = require("express");
const router = express.Router();
const addressController = require("../controllers/address.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// GET  /api/v1/addresses         — list all addresses for the user
router.get("/", authenticateToken, addressController.getAddresses);

// POST /api/v1/addresses         — add a new address
router.post("/", authenticateToken, addressController.addAddress);

// DELETE /api/v1/addresses/:id   — delete an address by id
router.delete("/:id", authenticateToken, addressController.deleteAddress);

module.exports = router;
