import Image, { type ImageProps } from "next/image";
import { canOptimize, PLACEHOLDER_IMAGE } from "@/lib/media/image";

/**
 * next/image that never crashes on a host missing from next.config.ts.
 * Hosts that are not configured are shown as they are, without optimisation.
 */
export function MediaImage({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string }) {
    const source = src || PLACEHOLDER_IMAGE;
    return <Image src={source} alt={alt} unoptimized={!canOptimize(source)} {...props} />;
}
