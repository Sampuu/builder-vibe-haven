import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  createDisasterReport,
  getDisasterReports,
  createHelpRequest,
  getHelpRequests,
  getAllData,
} from "./routes/disasters";

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

  // Disaster management routes
  app.post("/api/disasters", createDisasterReport);
  app.get("/api/disasters", getDisasterReports);

  app.post("/api/help-requests", createHelpRequest);
  app.get("/api/help-requests", getHelpRequests);

  app.get("/api/admin/data", getAllData);

  return app;
}
