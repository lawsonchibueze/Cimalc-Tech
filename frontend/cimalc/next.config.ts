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

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: { remotePatterns: mediaPatterns() },
};

export default nextConfig;
