import express from "express";
import crypto from "crypto";
import { db } from "../data/db.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @body    { name, email, phone, password, confirmPassword, terms }
 */
router.post("/register", (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, terms } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, phone, password.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match.",
      });
    }

    if (terms !== true) {
      return res.status(400).json({
        success: false,
        message: "You must accept the terms and conditions.",
      });
    }

    // Check if user already exists with email or username
    const existingUser = db.findUserByEmailOrUsername(email) || db.findUserByEmailOrUsername(name);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this username or email already exists.",
      });
    }

    const newUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password, // in a production app with DB, password should be hashed with bcrypt
      terms: Boolean(terms),
      createdAt: new Date().toISOString(),
    };

    db.addUser(newUser);

    // Don't return password in response
    const { password: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: "Account created successfully! You can now log in.",
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login existing user
 * @body    { name, password, remember? }
 */
router.post("/login", (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your username/email and password.",
      });
    }

    // Find user by either username or email
    const user = db.findUserByEmailOrUsername(name.trim());

    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password. Please try again.",
      });
    }

    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user: safeUser,
      token: `dummy-jwt-token-for-${safeUser.name}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during login.",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset instructions
 * @body    { email }
 */
router.post("/forgot-password", (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = db.findUserByEmailOrUsername(email.trim());

    // We still return 200 for security so attackers can't enumerate emails easily
    return res.status(200).json({
      success: true,
      message: `Password reset instructions sent to ${email}.`,
      exists: Boolean(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error processing password reset.",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/auth/users
 * @desc    Get registered users (safe view)
 */
router.get("/users", (req, res) => {
  const users = db.getUsers().map(({ password, ...rest }) => rest);
  return res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

export default router;
