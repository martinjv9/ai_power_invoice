import { useEffect, useState } from "react";
import type { HealthResponse } from "@invoice/shared";
import { cn } from "@/lib/utils";

// Phase 0 end-to-end proof: the frontend calls the backend /health (via the Vite
// proxy) using the shared HealthResponse type, and renders the result.
export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => {
        // fetch only rejects on network failure — an HTTP error still resolves.
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: HealthResponse) => setHealth(data))
      .catch(() => setError(true));
  }, []);

  const status = error
    ? "API unreachable"
    : health
      ? `API OK — ${health.service} @ ${new Date(health.time).toLocaleTimeString()}`
      : "Checking API…";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50 text-neutral-900">
      <h1 className="text-2xl font-semibold">Invoice System</h1>
      <div
        className={cn(
          "rounded-lg border px-4 py-2 text-sm",
          error
            ? "border-red-300 bg-red-50 text-red-700"
            : health
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-neutral-300 bg-white text-neutral-500",
        )}
      >
        {status}
      </div>
    </div>
  );
}
