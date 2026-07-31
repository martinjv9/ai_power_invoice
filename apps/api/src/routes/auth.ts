import { Router } from "express";
import bcrypt from "bcrypt";
import { loginSchema, type UserResponse } from "@invoice/shared";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/require-auth";

// Map the DB row to the safe public DTO. Explicit field-by-field (never a
// spread) so a new sensitive column can't leak to the frontend by default.
function toUserResponse(user: { id: string; email: string; name: string }): UserResponse {
  return { id: user.id, email: user.email, name: user.name };
}

// One source of truth for the cookie name; app.ts uses it for the session
// middleware, logout uses it to clear the cookie.
export const SESSION_COOKIE_NAME = "invoice.sid";

// Compared against when the email doesn't exist, so unknown-email and
// wrong-password take the same time (no user enumeration via timing).
const dummyHash = bcrypt.hashSync("timing-equalizer", 12);

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
      return;
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);
    if (!user || !passwordOk) {
      // Same message for bad email and bad password — don't reveal which
      // accounts exist.
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Fresh session id on login so a session id planted pre-login can't be
    // reused after (session fixation).
    await new Promise<void>((resolve, reject) =>
      req.session.regenerate((err) => (err ? reject(err) : resolve())),
    );
    req.session.userId = user.id;
    res.json(toUserResponse(user));
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
      return;
    }
    res.clearCookie(SESSION_COOKIE_NAME);
    res.status(204).end();
  });
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
    if (!user) {
      // Session points at a deleted user — treat as logged out.
      req.session.destroy(() => {});
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    res.json(toUserResponse(user));
  } catch (err) {
    next(err);
  }
});
