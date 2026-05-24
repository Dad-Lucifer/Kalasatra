"use strict";

const {
  CognitoIdentityProviderClient,
} = require("@aws-sdk/client-cognito-identity-provider");

const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID,
} = process.env;

// Validate required env vars at startup
const required = {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID,
};

for (const [key, val] of Object.entries(required)) {
  if (!val) throw new Error(`Missing required env var: ${key}`);
}

const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = {
  cognitoClient,
  COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID,
};
