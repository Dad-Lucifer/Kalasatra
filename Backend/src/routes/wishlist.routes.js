"use strict";

const { Router } = require("express");
const router = Router();

const { getWishlist, addToWishlist, removeFromWishlist } = require("../controllers/wishlist.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get("/", authenticateToken, getWishlist);

router.post("/", authenticateToken, addToWishlist);

router.delete("/:product_id", authenticateToken, removeFromWishlist);

module.exports = router;
