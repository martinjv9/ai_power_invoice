import express from "express";
import cors from "cors";
import type { HealthResponse } from "@invoice/shared";

// The Express app is created in a factory (not started here) so tests can spin up
// an app instance without opening a real port. src/index.ts does the listening.
export function createApp() {
  const app = express();

  // Frontend and backend are separate origins. Allow ONLY the configured
  // frontend origin (never reflect arbitrary origins — with credentials that
  // would let any site ride the session cookie once auth lands in Phase 1).
  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";
  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    const body: HealthResponse = {
      status: "ok",
      service: "api",
      time: new Date().toISOString(),
    };
    res.json(body);
  });

  return app;
}
