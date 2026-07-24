import { defineConfig } from "tsup";

// tsup bundles the api for production. Two problems it solves that plain `tsc`
// doesn't: Node's ESM loader requires explicit `.js` extensions on relative
// imports (tsc doesn't add them under moduleResolution "Bundler"), and
// `@invoice/shared` ships raw .ts source that Node can't load. Bundling inlines
// shared and rewrites imports, so `node dist/index.js` just works.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node22",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  // Inline the workspace package (raw TS); real node_modules deps stay external.
  noExternal: ["@invoice/shared"],
});
