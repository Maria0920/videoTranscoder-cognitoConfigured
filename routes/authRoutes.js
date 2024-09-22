import express from "express";
import jwt from "jsonwebtoken";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const router = express.Router();

// Configuration Details
const clientId = "162rnv81d0nht4fh2amtgfjnvm"; // Your Cognito Client ID
const region = "ap-southeast-2"; // Your AWS Region
const userPoolId = "ap-southeast-2_zakn7Hf7X"; // Your User Pool ID
const JWT_SECRET = process.env.SECRET_KEY; // Your JWT Secret

const client = new CognitoIdentityProviderClient({ region });

// Global variable to store access token (consider using session or database for production)
let userAccessToken;

// Sign-Up Route
router.post("/signup", express.json(), async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password should be at least 8 characters long" });
  }

  try {
    await signUp(username, password, email);
    res.json({
      message:
        "Signup successful! Please confirm your email using the provided code.",
    });
  } catch (err) {
    console.error("Sign-up error:", err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// Sign-Up Function
async function signUp(username, password, email) {
  const command = new SignUpCommand({
    ClientId: clientId,
    Username: username,
    Password: password,
    UserAttributes: [{ Name: "email", Value: email }],
  });

  try {
    await client.send(command);
  } catch (err) {
    if (err.name === "UsernameExistsException") {
      throw new Error("User already exists");
    } else {
      throw new Error(`Sign-up failed: ${err.message}`);
    }
  }
}

// Confirm Code Route (User confirms sign-up with confirmation code)
router.post("/confirm-code", express.json(), async (req, res) => {
  const { username, confirmationCode } = req.body;

  try {
    await confirmSignUp(username, confirmationCode);
    res.json({ message: "Confirmation successful" });
  } catch (err) {
    console.error("Confirmation error:", err);
    res
      .status(400)
      .json({ message: "Confirmation failed", error: err.message });
  }
});

// Confirm Sign-Up Function
async function confirmSignUp(username, confirmationCode) {
  const command = new ConfirmSignUpCommand({
    ClientId: clientId,
    Username: username,
    ConfirmationCode: confirmationCode,
  });

  try {
    await client.send(command);
  } catch (err) {
    throw new Error(`Confirmation failed: ${err.message}`);
  }
}

// Login Route
router.post("/login", express.json(), async (req, res) => {
  const { username, password } = req.body;

  try {
    const response = await authenticateUser(username, password);

    if (response) {
      userAccessToken = response.AuthenticationResult.AccessToken; // Store access token
      const token = generateToken(username);
      res.json({ token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// Authenticate User Function (MFA removed)
async function authenticateUser(username, password) {
  const authParams = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  try {
    const response = await client.send(new InitiateAuthCommand(authParams));

    if (response.AuthenticationResult) {
      return response; // Return the whole response for access token
    } else {
      return false;
    }
  } catch (err) {
    console.error("Authentication failed:", err);
    throw new Error(`Authentication failed: ${err.message}`);
  }
}

// JWT Token Generation
function generateToken(username) {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
}

// Optional: Add CORS Middleware
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

export default router;
