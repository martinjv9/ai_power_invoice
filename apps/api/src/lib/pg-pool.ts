import pg from "pg";

// Shared pg pool for things that need raw SQL access outside Prisma — today
// that's only the session store. A singleton so tests can close it cleanly.
export const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
