// Seeds the first admin user — you can't register through the UI (admin-only
// app), so the first account has to come from here. Idempotent: safe to run
// repeatedly. Run with: npm run db:seed -w @invoice/api
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
const password = process.env.ADMIN_PASSWORD ?? "change-me-now";
const name = process.env.ADMIN_NAME ?? "Admin";

const existing = await prisma.user.findUnique({ where: { email } });
if (existing) {
  console.log(`[seed] admin ${email} already exists — nothing to do`);
} else {
  await prisma.user.create({
    data: { email, name, passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`[seed] created admin ${email}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`[seed] WARNING: using the default password — change it (set ADMIN_PASSWORD)`);
  }
}
await prisma.$disconnect();
