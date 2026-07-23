import express from "express";
import cors from "cors";
import type { HealthResponse } from "@invoice/shared";

// The Express app is created in a factory (not started here) so tests can spin up
// an app instance without opening a real port. src/index.ts does the listening.
export function createApp() {
  const app = express();

  // Frontend and backend are separate origins; allow the dev frontend with creds.
  app.use(cors({ origin: true, credentials: true }));
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
