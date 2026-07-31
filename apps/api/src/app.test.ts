import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "./app";
import { pgPool } from "./lib/pg-pool";

// Phase 0 heartbeat: proves the test harness + Express app + supertest all work.
describe("GET /health", () => {
  // createApp wires the session store to the shared pg pool; close it so the
  // test process can exit cleanly.
  afterAll(() => pgPool.end());

  it("returns status ok", async () => {
    const res = await request(createApp()).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("api");
  });
});
