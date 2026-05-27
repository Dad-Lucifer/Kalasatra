"use strict";

const {
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  InitiateAuthCommand,
  AdminGetUserCommand,
  AdminListGroupsForUserCommand,
  AdminAddUserToGroupCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const crypto = require("crypto");

const { cognitoClient, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } =
  require("../config/cognito");
const { supabase } = require("../../database/supabase");

// ─── Constants ────────────────────────────────────────────────────────────────

const ADMIN_ROLES = {
  ADMIN: "Admin",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compute Cognito SECRET_HASH when App Client has a secret.
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
 * Standardised error handler for admin operations
 */
const handleAdminError = (res, err, context = "") => {
  console.error(`[ADMIN CONTROLLER] ${context}:`, err);

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
    InvalidPasswordException: [400, "Password does not meet security requirements."],
    InvalidParameterException: [400, "Invalid parameter provided."],
  };

  const [status, message] = errorMap[code] || [500, "An internal error occurred."];
  return res.status(status).json({ success: false, message });
};

/**
 * Get user's role (always "Admin" in single-role system)
 */
const getHighestRole = (groups) => {
  // Check if user has Admin group
  if (groups.includes("Admin")) {
    return "Admin";
  }
  return "Admin"; // Default to Admin
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/v1/admin/signup
 * Register a new admin user in Cognito. Triggers email OTP.
 * All admin users get the "Admin" role after verification.
 */
const adminSignup = async (req, res) => {
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

    // Store pending admin user in Supabase
    const { error: insertError } = await supabase.from("users").insert({
      uid: userSub,
      email,
      name,
      ...(phone && { phone }),
      role: "Admin",
      is_verified: false,
      is_active: false,
      is_admin: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("[ADMIN] Failed to create admin user in Supabase:", insertError);
      throw new Error("Failed to create admin profile");
    }

    return res.status(201).json({
      success: true,
      message: "Admin account created. Please check your email for the OTP verification code.",
      data: {
        sub: userSub,
        email,
        role: "Admin",
        isConfirmed: result.UserConfirmed,
        deliveryMedium: result.CodeDeliveryDetails?.DeliveryMedium,
        deliveryDestination: result.CodeDeliveryDetails?.Destination,
      },
    });
  } catch (err) {
    return handleAdminError(res, err, "adminSignup");
  }
};

/**
 * POST /api/v1/admin/verify-otp
 * Confirms OTP sent to email during admin signup.
 * Automatically adds user to the "Admin" group.
 */
const adminVerifyOtp = async (req, res) => {
  const { email, code } = req.body;

  try {
    const secretHash = computeSecretHash(email);

    // Confirm signup
    await cognitoClient.send(
      new ConfirmSignUpCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
        ...(secretHash && { SecretHash: secretHash }),
      })
    );

    // Get user from Supabase
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1);

    if (!fetchError && users && users.length > 0) {
      // Update Supabase - mark as verified
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
        console.error("[ADMIN] Failed to update user in Supabase:", updateError);
      }
    }

    // Add user to Admin group in Cognito
    try {
      await cognitoClient.send(
        new AdminAddUserToGroupCommand({
          UserPoolId: COGNITO_USER_POOL_ID,
          Username: email,
          GroupName: "Admin",
        })
      );
    } catch (groupErr) {
      console.error("[ADMIN] Failed to add user to Admin group:", groupErr);
      // Continue even if group assignment fails - can be done manually
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. Admin account activated. You can now log in.",
    });
  } catch (err) {
    return handleAdminError(res, err, "adminVerifyOtp");
  }
};

/**
 * POST /api/v1/admin/resend-otp
 * Resends the confirmation OTP to the given email.
 */
const adminResendOtp = async (req, res) => {
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
    return handleAdminError(res, err, "adminResendOtp");
  }
};

/**
 * POST /api/v1/admin/login
 * Admin login with email + password
 * Verifies user has admin role in Cognito groups
 */
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const secretHash = computeSecretHash(email);

    // Authenticate with Cognito
    const authParams = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        ...(secretHash && { SECRET_HASH: secretHash }),
      },
    };

    const authResult = await cognitoClient.send(
      new InitiateAuthCommand(authParams)
    );

    // Handle auth challenges
    if (authResult.ChallengeName) {
      return res.status(200).json({
        success: false,
        requiresChallenge: true,
        message: `Auth challenge required: ${authResult.ChallengeName}`,
        challenge: {
          name: authResult.ChallengeName,
          session: authResult.Session,
        },
      });
    }

    const { AccessToken, IdToken, RefreshToken, ExpiresIn } =
      authResult.AuthenticationResult;

    // Get user details
    const userResult = await cognitoClient.send(
      new AdminGetUserCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: email,
      })
    );

    // Get user's groups
    const groupsResult = await cognitoClient.send(
      new AdminListGroupsForUserCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: email,
      })
    );

    const userGroups = groupsResult.Groups?.map((g) => g.GroupName) || [];

    // Verify user has admin role
    const hasAdminRole = userGroups.includes("Admin");

    if (!hasAdminRole) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Extract user attributes
    const attributes = {};
    userResult.UserAttributes?.forEach((attr) => {
      attributes[attr.Name] = attr.Value;
    });

    // Update Supabase with admin login
    const { data: existingUsers, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1);

    let userData = {
      email: attributes.email,
      name: attributes.name,
      role: "Admin",
      groups: userGroups,
      is_admin: true,
    };

    if (!fetchError && existingUsers && existingUsers.length > 0) {
      // Update existing user
      const { error: updateError } = await supabase
        .from("users")
        .update({
          ...userData,
          last_admin_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      if (updateError) {
        console.error("[ADMIN] Failed to update admin login:", updateError);
      }
    } else {
      // Create admin user record if doesn't exist
      const { error: insertError } = await supabase.from("users").insert({
        uid: attributes.sub,
        ...userData,
        is_verified: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_admin_login_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("[ADMIN] Failed to create admin user:", insertError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      data: {
        accessToken: AccessToken,
        idToken: IdToken,
        refreshToken: RefreshToken,
        expiresIn: ExpiresIn,
        tokenType: "Bearer",
        user: {
          sub: attributes.sub,
          email: attributes.email,
          name: attributes.name,
          role: "Admin",
          groups: userGroups,
        },
      },
    });
  } catch (err) {
    return handleAdminError(res, err, "adminLogin");
  }
};

/**
 * GET /api/v1/admin/me
 * Get current admin user profile
 */
const getAdminProfile = async (req, res) => {
  const { sub } = req.user;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", sub)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    return handleAdminError(res, err, "getAdminProfile");
  }
};

module.exports = {
  adminSignup,
  adminVerifyOtp,
  adminResendOtp,
  adminLogin,
  getAdminProfile,
  ADMIN_ROLES,
};
