import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// Import incident routes
import {
  handleCreateIncident,
  handleGetIncidents,
  handleGetIncident,
  handleUpdateIncidentStatus,
  handleAcknowledgeIncident,
  handleGetIncidentStats,
  handleGetRecentIncidents,
} from "./routes/incidents";

// Import notification routes
import {
  handleGetNotifications,
  handleMarkNotificationAsRead,
  handleMarkAllNotificationsAsRead,
  handleDeleteNotification,
  handleClearNotifications,
  handleBroadcastNews,
  handleSendTargetedNotification,
  handleSSEConnection,
  handleGetConnectedClients,
} from "./routes/notifications";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoints
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Incident management routes
  app.post("/api/incidents", handleCreateIncident);
  app.get("/api/incidents", handleGetIncidents);
  app.get("/api/incidents/stats", handleGetIncidentStats);
  app.get("/api/incidents/recent", handleGetRecentIncidents);
  app.get("/api/incidents/:id", handleGetIncident);
  app.put("/api/incidents/:id/status", handleUpdateIncidentStatus);
  app.put("/api/incidents/:id/acknowledge", handleAcknowledgeIncident);

  // Notification routes
  app.get("/api/notifications", handleGetNotifications);
  app.put("/api/notifications/:id/read", handleMarkNotificationAsRead);
  app.put("/api/notifications/mark-all-read", handleMarkAllNotificationsAsRead);
  app.delete("/api/notifications/:id", handleDeleteNotification);
  app.delete("/api/notifications/clear", handleClearNotifications);
  app.post("/api/notifications/broadcast", handleBroadcastNews);
  app.post("/api/notifications/targeted", handleSendTargetedNotification);

  // Server-Sent Events for real-time notifications
  app.get("/api/notifications/sse", handleSSEConnection);
  app.get("/api/notifications/clients", handleGetConnectedClients);

  console.log("🚀 Emergency Response API Server initialized");
  console.log("📋 Available endpoints:");
  console.log("   POST   /api/incidents - Create incident");
  console.log("   GET    /api/incidents - Get incidents");
  console.log("   PUT    /api/incidents/:id/status - Update status");
  console.log("   PUT    /api/incidents/:id/acknowledge - Acknowledge");
  console.log("   GET    /api/notifications - Get notifications");
  console.log("   POST   /api/notifications/broadcast - Broadcast news");
  console.log("   GET    /api/notifications/sse - Real-time notifications");

  return app;
}
