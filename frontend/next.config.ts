import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(process.cwd(), ".."),
  serverExternalPackages: ["@sparticuz/chromium"],
  outputFileTracingIncludes: {
    "/api/catalogue/export": [
      "../node_modules/.pnpm/playwright-core@*/node_modules/playwright-core/browsers.json",
      "../node_modules/.pnpm/@sparticuz+chromium@*/node_modules/@sparticuz/chromium/bin/**/*",
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
