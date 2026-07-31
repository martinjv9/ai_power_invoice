import "express-session";

// What we store on the session: only the user id. Everything else (name,
// email) is looked up fresh per request, so profile changes and deleted
// users take effect immediately instead of living on in stale sessions.
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}
