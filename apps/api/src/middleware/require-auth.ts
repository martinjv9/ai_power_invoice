import type { NextFunction, Request, Response } from "express";

// Gate for any route that needs a logged-in staff member. 401 means "not
// logged in" — the frontend reacts by redirecting to the login page.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}
