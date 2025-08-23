import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import DashboardWebSocketServer from "./websocketServer";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();
  const httpServer = createHttpServer(app);

  // Initialize WebSocket server for dashboard communication
  const dashboardWS = new DashboardWebSocketServer(httpServer);

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

  // Dashboard stats API
  app.get("/api/dashboard/stats", (_req, res) => {
    res.json({
      connectedUsers: dashboardWS.getConnectedUsers(),
      timestamp: new Date().toISOString()
    });
  });

  // Broadcast API for server-side events
  app.post("/api/dashboard/broadcast", (req, res) => {
    const { event, data, targetRole } = req.body;

    if (targetRole) {
      dashboardWS.broadcastToRole(targetRole, event, data);
    } else {
      dashboardWS.broadcastToAll(event, data);
    }

    res.json({ success: true, message: "Event broadcasted" });
  });

  return httpServer;
}
