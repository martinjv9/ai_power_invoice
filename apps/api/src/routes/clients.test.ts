import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import type TestAgent from "supertest/lib/agent";
import bcrypt from "bcrypt";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";
import { pgPool } from "../lib/pg-pool";

// Integration tests against real Postgres. Unique marker per run so parallel/
// repeated runs never collide; everything created here is deleted in afterAll.
const marker = `clients-test-${process.pid}-${Date.now()}`;
const email = `${marker}@example.com`;
const password = "correct-horse-battery";

const newClient = {
  name: `${marker} Constructors`,
  contactPerson: "Pat Foreman",
  email: "pat@example.com",
  phone: "555-0100",
  billingAddress: "1 Billing Way, Austin, TX",
};

describe("clients & projects", () => {
  const app = createApp();
  let agent: TestAgent;
  let clientId: string;

  beforeAll(async () => {
    await prisma.user.create({
      data: { email, name: "Test User", passwordHash: await bcrypt.hash(password, 10) },
    });
    agent = request.agent(app);
    const login = await agent.post("/auth/login").send({ email, password });
    expect(login.status).toBe(200);
  });

  afterAll(async () => {
    await prisma.project.deleteMany({ where: { client: { name: { contains: marker } } } });
    await prisma.client.deleteMany({ where: { name: { contains: marker } } });
    await prisma.user.delete({ where: { email } });
    await prisma.$disconnect();
    await pgPool.end();
  });

  it("requires auth for every clients route", async () => {
    expect((await request(app).get("/clients")).status).toBe(401);
    expect((await request(app).post("/clients").send(newClient)).status).toBe(401);
  });

  it("rejects an invalid create body with 400", async () => {
    const res = await agent.post("/clients").send({ name: "" });
    expect(res.status).toBe(400);
  });

  it("creates a client and returns exactly the DTO fields (no leaks)", async () => {
    const res = await agent.post("/clients").send(newClient);
    expect(res.status).toBe(201);
    clientId = res.body.id;
    // Exact key set: a new DB column must never reach the frontend by default.
    expect(Object.keys(res.body).sort()).toEqual([
      "billingAddress",
      "contactPerson",
      "email",
      "id",
      "name",
      "phone",
    ]);
  });

  it("finds the client by name or contact search, case-insensitive", async () => {
    const byName = await agent.get(`/clients?search=${marker.toUpperCase()}`);
    expect(byName.status).toBe(200);
    expect(byName.body.map((c: { id: string }) => c.id)).toContain(clientId);

    const byContact = await agent.get("/clients?search=pat foreman");
    expect(byContact.body.map((c: { id: string }) => c.id)).toContain(clientId);

    const noMatch = await agent.get("/clients?search=zzz-no-such-client");
    expect(noMatch.body.map((c: { id: string }) => c.id)).not.toContain(clientId);
  });

  it("updates a client partially and 404s on a missing one", async () => {
    const res = await agent.patch(`/clients/${clientId}`).send({ phone: "555-0199" });
    expect(res.status).toBe(200);
    expect(res.body.phone).toBe("555-0199");
    expect(res.body.name).toBe(newClient.name); // untouched fields intact

    const missing = await agent.patch("/clients/nope").send({ phone: "1" });
    expect(missing.status).toBe(404);
  });

  it("creates a project under the client, recording created_by from the session", async () => {
    const res = await agent.post(`/clients/${clientId}/projects`).send({
      description: "Panel upgrade at the north site",
      jobSiteAddress: "42 Job Site Rd, Dallas, TX",
    });
    expect(res.status).toBe(201);
    expect(res.body.clientId).toBe(clientId);
    expect(res.body.status).toBe("active"); // default
    const user = await prisma.user.findUnique({ where: { email } });
    expect(res.body.createdById).toBe(user!.id); // from session, not the body

    const list = await agent.get(`/clients/${clientId}/projects`);
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
  });

  it("updates a project only through its own client's path", async () => {
    const list = await agent.get(`/clients/${clientId}/projects`);
    const projectId = list.body[0].id;

    const res = await agent
      .patch(`/clients/${clientId}/projects/${projectId}`)
      .send({ status: "completed" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("completed");

    // Same project via a different (nonexistent) client path → 404.
    const wrongClient = await agent
      .patch(`/clients/nope/projects/${projectId}`)
      .send({ status: "active" });
    expect(wrongClient.status).toBe(404);
  });

  it("404s project routes for an unknown client", async () => {
    const res = await agent.get("/clients/does-not-exist/projects");
    expect(res.status).toBe(404);
  });
});
