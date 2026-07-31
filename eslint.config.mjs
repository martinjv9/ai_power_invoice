import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

// Flat config for the whole monorepo. Prettier owns formatting; ESLint is here
// for correctness rules only (unused vars, broken hook deps, etc.).
export default tseslint.config(
  { ignores: ["**/dist/**", "**/coverage/**", "**/node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // The _ prefix is the conventional "unused on purpose" marker (e.g. the
      // required 4th arg of an Express error handler).
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["apps/api/**/*.{ts,mjs}", "packages/shared/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
);
