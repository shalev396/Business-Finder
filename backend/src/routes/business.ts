import express, { Request } from "express";
import { Business } from "../models/Business";
import { User } from "../models/User";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = express.Router();

// Get all businesses (public)
router.get("/", async (req, res) => {
  try {
    const { search, category, onlyOwned } = req.query;
    let query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (onlyOwned && req.user) {
      query.owner = req.user._id;
    }

    const businesses = await Business.find(query)
      .populate("owner", "name")
      .populate("subscribers", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: businesses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching businesses",
    });
  }
});

// Get business by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate("owner", "name")
      .populate("subscribers", "name")
      .populate("reviews.userId", "name");

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error("Error fetching business:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching business",
      error: error,
    });
  }
});

// Create business (authenticated)
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, description, category } = req.body;

    // Check user's plan and business limit
    const user = await User.findById(req.user._id);
    const businessCount = await Business.countDocuments({
      owner: req.user._id,
    });

    const planLimits = {
      Standard: 1,
      Gold: 3,
      Platinum: 10,
    };

    if (businessCount >= planLimits[user!.plan]) {
      return res.status(403).json({
        success: false,
        message: `You have reached the business limit for your ${
          user!.plan
        } plan`,
      });
    }

    const business = await Business.create({
      name,
      description,
      category,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: business,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating business",
    });
  }
});

// Update business (owner only)
router.put("/:id", authenticate, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (business.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const { name, description, category } = req.body;
    const updatedBusiness = await Business.findByIdAndUpdate(
      req.params.id,
      { name, description, category },
      { new: true }
    )
      .populate("owner", "name")
      .populate("subscribers", "name");

    // Try to notify subscribers about the update, but don't fail if socket.io is not available
    try {
      const io = req.app.get("io");
      if (io) {
        io.to(`business:${business._id}`).emit("businessUpdated", {
          type: "update",
          businessId: business._id,
          businessName: business.name,
          message: "Business details have been updated",
        });
      }
    } catch (socketError) {
      console.error("Socket notification failed:", socketError);
      // Continue with the response even if socket notification fails
    }

    res.json({
      success: true,
      data: updatedBusiness,
    });
  } catch (error) {
    console.error("Error updating business:", error);
    res.status(500).json({
      success: false,
      message: "Error updating business",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Delete business (owner or admin only)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (
      business.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Try to notify subscribers about the deletion, but don't fail if socket.io is not available
    try {
      const io = req.app.get("io");
      if (io) {
        io.to(`business:${business._id}`).emit("businessDeleted", {
          type: "delete",
          businessId: business._id,
          businessName: business.name,
          message: "Business has been deleted",
        });
      }
    } catch (socketError) {
      console.error("Socket notification failed:", socketError);
      // Continue with the deletion even if socket notification fails
    }

    await business.deleteOne();

    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting business",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Subscribe to business
router.post("/:id/subscribe", authenticate, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (business.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot subscribe to your own business",
      });
    }

    if (business.subscribers.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "Already subscribed",
      });
    }

    business.subscribers.push(req.user._id);
    await business.save();

    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error subscribing to business",
    });
  }
});

// Unsubscribe from business
router.delete("/:id/subscribe", authenticate, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (!business.subscribers.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "Not subscribed",
      });
    }

    business.subscribers = business.subscribers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await business.save();

    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error unsubscribing from business",
    });
  }
});

// Add review
router.post("/:id/review", authenticate, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (business.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot review your own business",
      });
    }

    const { comment } = req.body;
    business.reviews.push({
      userId: req.user._id,
      comment,
      createdAt: new Date(),
    });

    await business.save();

    // Populate the newly added review's user information
    await business.populate("reviews.userId", "name");

    res.json({
      success: true,
      data: business,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding review",
    });
  }
});

// Delete review (owner or admin only)
router.delete("/:id/review/:reviewId", authenticate, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const review = business.reviews.id(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (
      review.userId.toString() !== req.user._id.toString() &&
      business.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    review.deleteOne();
    await business.save();

    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting review",
    });
  }
});

export default router;
