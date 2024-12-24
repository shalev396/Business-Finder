import { Request, Response, NextFunction } from "express";
import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export const authenticateSocket = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error("User not found"));
    }

    (socket as any).user = user;
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
};

export const isBusinessOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const business = await User.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (business.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Access denied. Not the business owner." });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const checkBusinessLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const businessCount = await User.countDocuments({ owner: user._id });

    const limits = {
      Standard: 1,
      Gold: 3,
      Platinum: 10,
    };

    if (businessCount >= limits[user.plan]) {
      return res.status(403).json({
        message: `You have reached the maximum number of businesses allowed for your ${user.plan} plan.`,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
