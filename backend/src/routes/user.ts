import express from "express";
import { User } from "../models/User";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Get user's saved businesses
router.get("/saved-businesses", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user!._id).populate("savedBusinesses");
    res.json({
      success: true,
      data: user?.savedBusinesses || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching saved businesses",
    });
  }
});

// Upgrade user's plan
router.post("/upgrade-plan", authenticate, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!["Standard", "Gold", "Platinum"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { plan },
      { new: true }
    );

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error upgrading plan",
    });
  }
});

export default router;
