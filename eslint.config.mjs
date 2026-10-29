import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// One config for the whole workspace (apps/*, packages/*). The Next app is apps/web.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // React is a dependency of apps/web, not of the repo root.
  { settings: { next: { rootDir: "apps/web/" }, react: { version: "19.3" } } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/next-env.d.ts",
    // onnxruntime-web runtime copied at build time (scripts/copy-ort.mjs).
    "apps/web/public/ort/**",
    // Cloudflare worker build cache (apps/signal).
    "apps/*/.wrangler/**",
  ]),
]);

export default eslintConfig;
