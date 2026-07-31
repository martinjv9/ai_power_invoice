import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import type { HealthResponse } from "@invoice/shared";
import { pgPool } from "./lib/pg-pool";
import { authRouter, SESSION_COOKIE_NAME } from "./routes/auth";

// The Express app is created in a factory (not started here) so tests can spin up
// an app instance without opening a real port. src/index.ts does the listening.
export function createApp() {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";

  // Behind a proxy/load balancer in production, trust X-Forwarded-* so
  // "secure" cookies work (the app sees https even though the hop is http).
  if (isProduction) app.set("trust proxy", 1);

  // Frontend and backend are separate origins. Allow ONLY the configured
  // frontend origin (never reflect arbitrary origins — with credentials that
  // would let any site ride the session cookie).
  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";
  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json());

  const sessionSecret = process.env.SESSION_SECRET;
  if (isProduction && !sessionSecret) {
    // A guessable secret lets anyone forge session cookies — refuse to boot.
    throw new Error("SESSION_SECRET must be set in production");
  }

  const PgStore = connectPgSimple(session);
  app.use(
    session({
      name: SESSION_COOKIE_NAME,
      store: new PgStore({
        pool: pgPool,
        // The store owns its table (it's infrastructure, not domain data —
        // which is why it isn't in the Prisma schema).
        createTableIfMissing: true,
        // Timer-based cleanup only in production; in dev/tests it would keep
        // the event loop alive and stop processes from exiting.
        pruneSessionInterval: isProduction ? 60 * 15 : false,
      }),
      secret: sessionSecret ?? "dev-only-secret",
      resave: false,
      // No cookie until something is stored (i.e. until login succeeds).
      saveUninitialized: false,
      cookie: {
        httpOnly: true, // browser JS can never read the session id
        sameSite: "lax", // sent on top-level navigation, not cross-site POSTs
        secure: isProduction, // https-only in production
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    }),
  );

  app.get("/health", (_req, res) => {
    const body: HealthResponse = {
      status: "ok",
      service: "api",
      time: new Date().toISOString(),
    };
    res.json(body);
  });

  app.use("/auth", authRouter);

  // Central JSON error handler — keeps stack traces out of responses.
  // (Express identifies error middleware by arity, so all 4 params matter.)
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[api] unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
