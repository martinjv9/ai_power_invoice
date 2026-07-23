import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/  (defineConfig from vitest/config adds the `test` field)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // `@invoice/shared` is raw TS from the workspace; let Vite process it directly
  // rather than pre-bundling with esbuild.
  optimizeDeps: {
    exclude: ["@invoice/shared"],
  },
  server: {
    // In dev, the frontend calls /api/* and Vite proxies to the backend, so there
    // are no CORS issues while developing.
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
