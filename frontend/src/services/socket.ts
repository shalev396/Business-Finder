import { io, Socket } from "socket.io-client";
import type { NotificationData } from "@/types";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, (data: any) => void> = new Map();

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(import.meta.env.VITE_WS_URL || "http://localhost:5000", {
      auth: { token },
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    // Set up notification listener
    this.socket.on("notification", (data: NotificationData) => {
      const handler = this.listeners.get("notification");
      if (handler) {
        handler(data);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNotification(callback: (data: NotificationData) => void) {
    this.listeners.set("notification", callback);
    return () => {
      this.listeners.delete("notification");
    };
  }

  // Subscribe to business updates
  subscribeToBusiness(businessId: string) {
    if (this.socket?.connected) {
      this.socket.emit("subscribe", { businessId });
    }
  }

  // Unsubscribe from business updates
  unsubscribeFromBusiness(businessId: string) {
    if (this.socket?.connected) {
      this.socket.emit("unsubscribe", { businessId });
    }
  }
}

export const socketService = new SocketService();
