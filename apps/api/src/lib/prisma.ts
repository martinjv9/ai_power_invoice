import { PrismaClient } from "@prisma/client";

// One PrismaClient per process — each instance owns a connection pool, so
// constructing one per request would exhaust Postgres connections.
export const prisma = new PrismaClient();
