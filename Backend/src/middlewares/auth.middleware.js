"use strict";

const {
  CognitoJwtVerifier,
} = require("aws-jwt-verify");

const {
  COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID,
} = process.env;

// Verifier that expects valid access tokens (not ID tokens)
// Use "id" if you want to verify ID tokens instead
const verifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: COGNITO_CLIENT_ID,
});

/**
 * Middleware to verify AWS Cognito JWT access token.
 * Expects: Authorization: Bearer <token>
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing or malformed.",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token missing.",
      });
    }

    // Verifies signature, expiry, audience, issuer automatically
    const payload = await verifier.verify(token);

    req.user = {
      sub: payload.sub,          // Cognito user sub (unique ID)
      username: payload.username,
      email: payload.email,
      groups: payload["cognito:groups"] || [],
    };

    next();
  } catch (err) {
    // Do not leak internal error details
    console.error("[AUTH MIDDLEWARE] Token verification failed:", err.message);

    if (err.name === "JwtExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token has expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or tampered access token.",
    });
  }
};

module.exports = { authenticateToken };
