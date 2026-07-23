import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "./app";

// Phase 0 heartbeat: proves the test harness + Express app + supertest all work.
describe("GET /health", () => {
  it("returns status ok", async () => {
    const res = await request(createApp()).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("api");
  });
});
