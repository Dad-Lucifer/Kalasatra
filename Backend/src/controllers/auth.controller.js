"use strict";

const {
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
  AdminDeleteUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const { cognitoClient, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } =
  require("../config/cognito");
const { supabase } = require("../../database/supabase");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compute Cognito SECRET_HASH when App Client has a secret.
 * Remove this helper (and all its usages) if your App Client has NO secret.
 */
const computeSecretHash = (username) => {
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;
  if (!clientSecret) return undefined;
  return crypto
    .createHmac("SHA256", clientSecret)
    .update(username + COGNITO_CLIENT_ID)
    .digest("base64");
};

/**
 * Standardised error handler — never leaks internal stack traces to client.
 */
const handleCognitoError = (res, err, context = "") => {
  console.error(`[AUTH CONTROLLER] ${context}: name=${err.name} __type=${err.__type} msg=${err.message}`);

  const code = err.name || err.__type || "";

  const errorMap = {
    UsernameExistsException: [409, "An account with this email already exists."],
    UserNotFoundException: [404, "No account found with this email."],
    NotAuthorizedException: [401, "Invalid credentials."],
    CodeMismatchException: [400, "The OTP code is incorrect."],
    ExpiredCodeException: [400, "The OTP code has expired. Please request a new one."],
    LimitExceededException: [429, "Too many requests. Please try again later."],
    TooManyRequestsException: [429, "Too many requests. Please try again later."],
    TooManyFailedAttemptsException: [429, "Too many failed attempts. Account temporarily locked."],
    UserNotConfirmedException: [403, "Account not verified. Please confirm your OTP first."],
    PasswordResetRequiredException: [403, "Password reset required. Check your email."],
    InvalidPasswordException: [400, "Password does not meet security requirements."],
    InvalidParameterException: [400, "Invalid parameter provided."],
    UserLambdaValidationException: [400, "User validation failed."],
  };

  const [status, message] = errorMap[code] || [500, "An internal error occurred."];
  const extra = process.env.NODE_ENV !== "production" ? { cognitoCode: code, detail: err.message } : {};
  return res.status(status).json({ success: false, message, ...extra });
};

/**
 * Create or update the user profile in Supabase after successful Cognito auth.
 * Called after signup confirmation and first login.
 */
const upsertSupabaseUser = async (sub, data) => {
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("uid", sub)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 = not found, which is okay
    throw fetchError;
  }

  if (!existingUser) {
    // Create new user
    const { error: insertError } = await supabase.from("users").insert({
      uid: sub,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    });

    if (insertError) throw insertError;
  } else {
    // Update existing user
    const { error: updateError } = await supabase
      .from("users")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("uid", sub);

    if (updateError) throw updateError;
  }
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/signup
 * Registers a new user in Cognito. Triggers email OTP.
 */
const signup = async (req, res) => {
  const { email, password, name, phone } = req.body;

  try {
    const secretHash = computeSecretHash(email);

    const userAttributes = [
      { Name: "email", Value: email },
      { Name: "name", Value: name },
    ];

    if (phone) {
      userAttributes.push({ Name: "phone_number", Value: phone });
    }

    const params = {
      ClientId: COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: userAttributes,
      ...(secretHash && { SecretHash: secretHash }),
    };

    const result = await cognitoClient.send(new SignUpCommand(params));

    const userSub = result.UserSub;

    // Store pending user in Supabase (confirmed after OTP verification)
    const { error: insertError } = await supabase.from("users").insert({
      uid: userSub,
      email,
      name,
      ...(phone && { phone }),
      is_verified: false,
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("[AUTH] Failed to create user in Supabase:", insertError);
      throw new Error("Failed to create user profile");
    }

    return res.status(201).json({
      success: true,
      message: "Account created. Please check your email for the OTP verification code.",
      data: {
        sub: userSub,
        email,
        isConfirmed: result.UserConfirmed,
        deliveryMedium: result.CodeDeliveryDetails?.DeliveryMedium,
        deliveryDestination: result.CodeDeliveryDetails?.Destination,
      },
    });
  } catch (err) {
    return handleCognitoError(res, err, "signup");
  }
};

/**
 * POST /api/v1/auth/verify-otp
 * Confirms OTP sent to email during signup.
 */
const verifyOtp = async (req, res) => {
  const { email, code } = req.body;

  try {
    const secretHash = computeSecretHash(email);

    await cognitoClient.send(
      new ConfirmSignUpCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
        ...(secretHash && { SecretHash: secretHash }),
      })
    );

    // Mark user as verified in Supabase
    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_verified: true,
        is_active: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (updateError) {
      console.error("[AUTH] Failed to update user in Supabase:", updateError);
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (err) {
    return handleCognitoError(res, err, "verifyOtp");
  }
};

/**
 * POST /api/v1/auth/resend-otp
 * Resends the confirmation OTP to the given email.
 */
const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const secretHash = computeSecretHash(email);

    const result = await cognitoClient.send(
      new ResendConfirmationCodeCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
        ...(secretHash && { SecretHash: secretHash }),
      })
    );

    return res.status(200).json({
      success: true,
      message: "OTP resent. Please check your email.",
      data: {
        deliveryMedium: result.CodeDeliveryDetails?.DeliveryMedium,
        deliveryDestination: result.CodeDeliveryDetails?.Destination,
      },
    });
  } catch (err) {
    return handleCognitoError(res, err, "resendOtp");
  }
};

/**
 * POST /api/v1/auth/login
 * Authenticates user with email + password (USER_PASSWORD_AUTH flow).
 * Returns Cognito AccessToken, IdToken, RefreshToken.
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const secretHash = computeSecretHash(email);

    const authParams = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        ...(secretHash && { SECRET_HASH: secretHash }),
      },
    };

    const result = await cognitoClient.send(new InitiateAuthCommand(authParams));

    // Handle MFA / NEW_PASSWORD_REQUIRED challenges if configured
    if (result.ChallengeName) {
      return res.status(200).json({
        success: true,
        message: `Auth challenge required: ${result.ChallengeName}`,
        challenge: {
          name: result.ChallengeName,
          session: result.Session,
          parameters: result.ChallengeParameters,
        },
      });
    }

    const { AccessToken, IdToken, RefreshToken, ExpiresIn } =
      result.AuthenticationResult;

    // Update last login in Supabase
    const { error: updateError } = await supabase
      .from("users")
      .update({
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (updateError) {
      console.error("[AUTH] Failed to update last login:", updateError);
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        accessToken: AccessToken,
        idToken: IdToken,
        refreshToken: RefreshToken,
        expiresIn: ExpiresIn,
        tokenType: "Bearer",
      },
    });
  } catch (err) {
    return handleCognitoError(res, err, "login");
  }
};

/**
 * POST /api/v1/auth/refresh-token
 * Refreshes the access token using a valid refresh token.
 */
const refreshToken = async (req, res) => {
  const { refreshToken: token, username } = req.body;

  try {
    const AuthParameters = {
      REFRESH_TOKEN: token,
    };
    
    if (username) {
      const secretHash = computeSecretHash(username);
      if (secretHash) {
        AuthParameters.SECRET_HASH = secretHash;
      }
    }

    const result = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: COGNITO_CLIENT_ID,
        AuthParameters,
      })
    );

    const { AccessToken, IdToken, ExpiresIn, RefreshToken } = result.AuthenticationResult;

    return res.status(200).json({
      success: true,
      message: "Token refreshed.",
      data: {
        accessToken: AccessToken,
        idToken: IdToken,
        expiresIn: ExpiresIn,
        refreshToken: RefreshToken || token,
        tokenType: "Bearer",
      },
    });
  } catch (err) {
    return handleCognitoError(res, err, "refreshToken");
  }
};

/**
 * POST /api/v1/auth/logout
 * Globally signs out the user, invalidating all Cognito tokens.
 * Requires valid access token in Authorization header.
 */
const logout = async (req, res) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access token required for logout.",
    });
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    await cognitoClient.send(
      new GlobalSignOutCommand({ AccessToken: accessToken })
    );

    return res.status(200).json({
      success: true,
      message: "Logged out successfully. All sessions invalidated.",
    });
  } catch (err) {
    return handleCognitoError(res, err, "logout");
  }
};

/**
 * POST /api/v1/auth/forgot-password
 * Initiates the forgot-password flow — sends reset code to email.
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const secretHash = computeSecretHash(email);

    const result = await cognitoClient.send(
      new ForgotPasswordCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
        ...(secretHash && { SecretHash: secretHash }),
      })
    );

    return res.status(200).json({
      success: true,
      message: "Password reset code sent. Check your email.",
      data: {
        deliveryMedium: result.CodeDeliveryDetails?.DeliveryMedium,
        deliveryDestination: result.CodeDeliveryDetails?.Destination,
      },
    });
  } catch (err) {
    return handleCognitoError(res, err, "forgotPassword");
  }
};

/**
 * POST /api/v1/auth/reset-password
 * Confirms the reset code and sets a new password.
 */
const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const secretHash = computeSecretHash(email);

    await cognitoClient.send(
      new ConfirmForgotPasswordCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
        ...(secretHash && { SecretHash: secretHash }),
      })
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (err) {
    return handleCognitoError(res, err, "resetPassword");
  }
};

/**
 * GET /api/v1/auth/me
 * Returns the authenticated user's profile from Supabase.
 * Protected route — requires valid Cognito access token.
 */
const getMe = async (req, res) => {
  try {
    const { sub } = req.user;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", sub)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    console.error("[AUTH CONTROLLER] getMe:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile.",
    });
  }
};

/**
 * PATCH /api/v1/auth/me
 * Updates the authenticated user's profile in Supabase.
 * Protected route — requires valid Cognito access token.
 */
const updateProfile = async (req, res) => {
  try {
    const { sub } = req.user;
    const updates = req.body;

    const allowedFields = [
      "name", "phone", "email", "gender", "birthday",
      "alternate_phone", "hint_name",
      "address_line1", "address_line2", "city", "state", "pincode", "country",
    ];

    const sanitized = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitized[key] = updates[key];
      }
    }

    if (Object.keys(sanitized).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update.",
      });
    }

    sanitized.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("users")
      .update(sanitized)
      .eq("uid", sub);

    if (error) {
      console.error("[AUTH CONTROLLER] updateProfile:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile.",
      });
    }

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("uid", sub)
      .single();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: { user },
    });
  } catch (err) {
    console.error("[AUTH CONTROLLER] updateProfile:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};

/**
 * DELETE /api/v1/auth/me
 * Deletes the authenticated user's account — removes from Supabase
 * and deletes the Cognito user. Protected route.
 */
const deleteAccount = async (req, res) => {
  try {
    const { sub, email } = req.user;

    // Delete from Supabase
    const { error: dbError } = await supabase
      .from("users")
      .delete()
      .eq("uid", sub);

    if (dbError) {
      console.error("[AUTH CONTROLLER] deleteAccount Supabase:", dbError);
      return res.status(500).json({
        success: false,
        message: "Failed to delete account data.",
      });
    }

    // Delete from Cognito
    try {
      await cognitoClient.send(
        new AdminDeleteUserCommand({
          UserPoolId: COGNITO_USER_POOL_ID,
          Username: email,
        })
      );
    } catch (cogErr) {
      console.error("[AUTH CONTROLLER] deleteAccount Cognito:", cogErr);
      // Continue — Supabase record is already removed
    }

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (err) {
    console.error("[AUTH CONTROLLER] deleteAccount:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete account.",
    });
  }
};

/**
 * POST /api/v1/auth/check-email
 * Checks whether an email is registered in the Supabase users table.
 * Used by the frontend to gate the Forgot Password flow.
 */
const checkEmailExists = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("uid")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    return res.status(200).json({ success: true, message: "Email is registered." });
  } catch (err) {
    console.error("[AUTH CONTROLLER] checkEmailExists:", err);
    return res.status(500).json({ success: false, message: "An internal error occurred." });
  }
};

module.exports = {
  signup,
  verifyOtp,
  resendOtp,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  deleteAccount,
  checkEmailExists,
};
