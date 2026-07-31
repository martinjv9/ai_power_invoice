import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./auth/AuthContext";
import App from "./App";
import "./index.css";

// One QueryClient for the app: caches server data, dedupes requests, and
// refetches after mutations invalidate a key.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Admin CRUD app: data is fresh enough for 30s; no refetch storm on
      // window focus while someone is filling in a form.
      staleTime: 30_000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
