import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), local-network=(self), loopback-network=(self), local-network-access=(self)",
  },
];

// Where the backend listens from the GUI's point of view (same container or host).
// Read at build time: Next.js stores rewrites in the build output.
const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL ?? "http://127.0.0.1:1920";

// Extra hosts allowed to load dev resources (HMR websocket, /_next/*) when the GUI is
// opened from a LAN IP or custom hostname. Comma-separated, no protocol/port.
// Example: NEXT_ALLOWED_DEV_ORIGINS=192.168.0.99
const ALLOWED_DEV_ORIGINS = (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  output: "standalone",
  // Trace from this folder, not the monorepo root, so the standalone server lands at .next/standalone/server.js.
  outputFileTracingRoot: __dirname,
  ...(ALLOWED_DEV_ORIGINS.length > 0 ? { allowedDevOrigins: ALLOWED_DEV_ORIGINS } : {}),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_INTERNAL_URL}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default withNextIntl(nextConfig);
