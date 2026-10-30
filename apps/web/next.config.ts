import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Always render <title> and <meta> inside <head> for link-preview crawlers (Zalo, Messenger, Telegram, etc.).
  htmlLimitedBots: /.*/,
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
