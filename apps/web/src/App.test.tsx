import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
  // Fresh QueryClient per test — no cached data bleeding between tests, and
  // no retries so failures surface immediately.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

const loggedIn = {
  "/api/auth/me": {
    status: 200,
    body: { id: "u1", email: "admin@example.com", name: "Admin" },
  },
};

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
      ...loggedIn,
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

  it("lists clients on the clients page", async () => {
    mockFetch({
      ...loggedIn,
      "/api/clients": {
        status: 200,
        body: [
          {
            id: "c1",
            name: "Acme Builders",
            contactPerson: "Pat Foreman",
            email: "pat@acme.test",
            phone: null,
            billingAddress: "1 Billing Way",
          },
        ],
      },
    });
    renderApp("/clients");
    expect(await screen.findByText("Acme Builders")).toBeInTheDocument();
    expect(screen.getByText("Pat Foreman")).toBeInTheDocument();
    // Optional phone renders as a dash, not "null".
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows the empty state when there are no clients", async () => {
    mockFetch({ ...loggedIn, "/api/clients": { status: 200, body: [] } });
    renderApp("/clients");
    expect(await screen.findByText(/no clients yet/i)).toBeInTheDocument();
  });
});
