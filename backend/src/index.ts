import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth";
import businessRoutes from "./routes/business";
import userRoutes from "./routes/user";
import { authenticateSocket } from "./middleware/auth";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
console.log(process.env.MONGODB_URI);
// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO middleware
io.use(authenticateSocket);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("subscribe", ({ businessId }) => {
    socket.join(`business:${businessId}`);
    console.log(`Client ${socket.id} subscribed to business ${businessId}`);
  });

  socket.on("unsubscribe", ({ businessId }) => {
    socket.leave(`business:${businessId}`);
    console.log(`Client ${socket.id} unsubscribed from business ${businessId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/users", userRoutes);

// Start server
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
