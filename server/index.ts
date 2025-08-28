import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { createIncident, getIncidents, updateIncidentStatus } from "./routes/incidents";
import { getNotifications, updateNotification, markAllAsRead } from "./routes/notifications";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Incident API routes
  app.post("/api/incidents", createIncident);
  app.get("/api/incidents", getIncidents);
  app.patch("/api/incidents/:id", updateIncidentStatus);

  // Notification API routes
  app.get("/api/notifications", getNotifications);
  app.patch("/api/notifications/:id", updateNotification);
  app.post("/api/notifications/mark-all-read", markAllAsRead);

  return app;
}
