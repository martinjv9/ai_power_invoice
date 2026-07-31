import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import App from "./App";

// fetch is mocked per-URL so tests cover both auth states without a backend.
function mockFetch(routes: Record<string, { status: number; body?: unknown }>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const match = Object.entries(routes).find(([path]) => url.includes(path));
      const { status, body } = match?.[1] ?? { status: 404 };
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
      } as Response;
    }),
  );
}

function renderApp(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("App", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("redirects to the login page when not authenticated", async () => {
    mockFetch({ "/api/auth/me": { status: 401 } });
    renderApp("/");
    // findBy* waits for the initial /auth/me check to settle.
    expect(await screen.findByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows the app shell and dashboard when logged in", async () => {
    mockFetch({
      "/api/auth/me": {
        status: 200,
        body: { id: "u1", email: "admin@example.com", name: "Admin" },
      },
      "/api/health": {
        status: 200,
        body: { status: "ok", service: "api", time: new Date().toISOString() },
      },
    });
    renderApp("/");
    expect(await screen.findByText(/welcome back, admin/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
    expect(await screen.findByText(/API OK/i)).toBeInTheDocument();
  });
});
