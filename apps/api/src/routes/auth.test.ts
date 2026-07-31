import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";
import { pgPool } from "../lib/pg-pool";

// Integration tests: real Express app, real Postgres (local docker / CI
// service container). Unique email per run so parallel/repeated runs never
// collide, cleaned up in afterAll.
const email = `auth-test-${process.pid}-${Date.now()}@example.com`;
const password = "correct-horse-battery";

describe("auth", () => {
  const app = createApp();

  beforeAll(async () => {
    await prisma.user.create({
      data: { email, name: "Test User", passwordHash: await bcrypt.hash(password, 10) },
    });
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { email } });
    await prisma.$disconnect();
    await pgPool.end();
  });

  it("rejects a malformed login body with 400", async () => {
    const res = await request(app).post("/auth/login").send({ email: "not-an-email" });
    expect(res.status).toBe(400);
  });

  it("rejects a wrong password with 401", async () => {
    const res = await request(app).post("/auth/login").send({ email, password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("rejects an unknown email with 401 and the same message as a wrong password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@example.com", password });
    expect(res.status).toBe(401);
    const wrongPw = await request(app).post("/auth/login").send({ email, password: "wrong" });
    expect(res.body.error).toBe(wrongPw.body.error); // no user enumeration
  });

  it("requires auth for /auth/me", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
  });

  it("logs in, stays logged in via the session cookie, and logs out", async () => {
    // agent persists cookies across requests, like a browser
    const agent = request.agent(app);

    const login = await agent.post("/auth/login").send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.email).toBe(email);
    expect(login.body.passwordHash).toBeUndefined(); // DTO must not leak the hash
    expect(login.headers["set-cookie"]?.[0]).toContain("invoice.sid");
    expect(login.headers["set-cookie"]?.[0]).toContain("HttpOnly");

    const me = await agent.get("/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(email);

    const logout = await agent.post("/auth/logout");
    expect(logout.status).toBe(204);

    const meAfter = await agent.get("/auth/me");
    expect(meAfter.status).toBe(401);
  });
});
