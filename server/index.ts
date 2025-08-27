import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSignup, handleSignin, handleSignout, handleGetUser } from "./routes/auth";
import { handleDatabaseSetup } from "./routes/setup";
import { handleSupabaseTest, handleSupabaseAuthTest } from "./routes/test";
import { handleAuthTroubleshoot } from "./routes/troubleshoot";
import { handleCreateTestUser } from "./routes/test-user";

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

  // Authentication routes
  app.post("/api/auth/signup", handleSignup);
  app.post("/api/auth/signin", handleSignin);
  app.post("/api/auth/signout", handleSignout);
  app.get("/api/auth/user", handleGetUser);

  // Database setup route
  app.get("/api/setup/database", handleDatabaseSetup);

  // Test routes
  app.get("/api/test/supabase", handleSupabaseTest);
  app.get("/api/test/auth", handleSupabaseAuthTest);

  // Troubleshooting
  app.get("/api/troubleshoot/auth", handleAuthTroubleshoot);
  app.post("/api/test/create-users", handleCreateTestUser);

  return app;
}
