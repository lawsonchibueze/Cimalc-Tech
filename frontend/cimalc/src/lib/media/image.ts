export const PLACEHOLDER_IMAGE = "/placeholder.svg";

function hostnameOf(value: string | undefined) {
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

const mediaHostname = hostnameOf(process.env.NEXT_PUBLIC_MEDIA_URL);

/**
 * next/image only optimises local files and hosts listed in next.config.ts.
 * Anything else must be rendered unoptimised or Next throws at render time.
 */
export function canOptimize(src: string) {
  if (src.startsWith("/")) return true;
  return mediaHostname !== null && hostnameOf(src) === mediaHostname;
}
