import type { NextConfig } from "next";

// Client-only app: exported as static files (no server). See docs/architecture/overview.md.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Shared packages (packages/core, packages/canvas) are TypeScript source, compiled with the app.
  transpilePackages: ["@ig-layout/core", "@ig-layout/canvas"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
