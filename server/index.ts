import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSubmitReport, handleGetReports, handleUpdateReportStatus } from "./routes/reports";

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

  // Report submission and management routes
  app.post("/api/reports", handleSubmitReport);
  app.get("/api/reports/:problemType", handleGetReports);
  app.patch("/api/reports/:problemType/:reportId/status", handleUpdateReportStatus);

  return app;
}
