import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import { handleDemo } from "./routes/demo";
import { createIncident, getIncidents, updateIncidentStatus } from "./routes/incidents";
import { getNotifications, updateNotification, markAllAsRead } from "./routes/notifications";
import {
  getAccidentZones,
  createAccidentZone,
  updateAccidentZone,
  deleteAccidentZone,
  getTrackedEntities,
  updateEntityLocation,
  calculateRoute
} from "./routes/accident-zones";
import { setupWebSocket } from "./websocket";

export function createServer() {
  const app = express();
  const server = createHttpServer(app);

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

  // Map and Accident Zones API routes
  app.get("/api/accident-zones", getAccidentZones);
  app.post("/api/accident-zones", createAccidentZone);
  app.patch("/api/accident-zones/:id", updateAccidentZone);
  app.delete("/api/accident-zones/:id", deleteAccidentZone);

  // Entity Tracking API routes
  app.get("/api/entities", getTrackedEntities);
  app.patch("/api/entities/:id/location", updateEntityLocation);

  // Routing API routes
  app.post("/api/routes/calculate", calculateRoute);

  // Setup WebSocket
  setupWebSocket(server);

  return { app, server };
}
