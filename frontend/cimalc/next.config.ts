import type { NextConfig } from "next";

/**
 * Product images live in Cloudflare R2. The public bucket URL must be listed
 * here or next/image refuses to load them. Set NEXT_PUBLIC_MEDIA_URL to the
 * same value as R2_PUBLIC_URL in the API.
 */
function mediaPatterns(): NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> {
  const value = process.env.NEXT_PUBLIC_MEDIA_URL;
  if (!value) return [];
  try {
    const url = new URL(value);
    return [{ protocol: url.protocol.replace(":", "") as "http" | "https", hostname: url.hostname, port: url.port, pathname: "/**" }];
  } catch {
    return [];
  }
}

/** Address of the API. Server side only, so it never reaches the browser. */
const backendUrl = (process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  reactCompiler: true,
  // The browser only talks to this site. These rules forward to the API, which keeps
  // session cookies first party and lets Google send people back to this address.
  async rewrites() {
    return [
      { source: "/api/auth/:path*", destination: `${backendUrl}/api/auth/:path*` },
      { source: "/backend/:path*", destination: `${backendUrl}/:path*` },
    ];
  },
  images: { remotePatterns: mediaPatterns() },
};

export default nextConfig;
