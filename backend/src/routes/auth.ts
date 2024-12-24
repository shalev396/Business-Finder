import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, plan } = req.body;
    console.log("Signup attempt for email:", email);
    console.log("Raw password length:", password.length);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Password hashed successfully");
    console.log("Hashed password length:", hashedPassword.length);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      plan: plan || "Standard",
    });
    console.log("User created successfully");

    // Verify the password can be compared correctly
    const verifyPassword = await bcrypt.compare(password, user.password);
    console.log("Password verification after signup:", verifyPassword);
    console.log("Stored password length:", user.password.length);

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);
    console.log("Raw password length:", password.length);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found with email:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Log the stored hashed password
    console.log("Stored hashed password length:", user.password.length);
    console.log("Stored hashed password:", user.password);

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);
    console.log("Attempted password:", password);

    if (!isMatch) {
      console.log("Password does not match for user:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    console.log("Login successful for user:", email);
    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
});

// Get current user
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
    });
  }
});

// Logout
router.post("/logout", authenticate, (req, res) => {
  res.json({
    success: true,
    data: null,
  });
});

export default router;
