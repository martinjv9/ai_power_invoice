import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

// Phase 0 heartbeat: proves the web test harness (Vitest + jsdom + RTL) works.
// We mock fetch so the test makes no real network call.
describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ status: "ok", service: "api", time: new Date().toISOString() }),
        }),
      ),
    );
  });

  it("renders the app title and shows API OK once health resolves", async () => {
    render(<App />);
    expect(screen.getByText("Invoice System")).toBeInTheDocument();
    // findByText waits for the async state update (and flushes act warnings).
    expect(await screen.findByText(/API OK/i)).toBeInTheDocument();
  });
});
