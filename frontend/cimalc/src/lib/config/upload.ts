/**
 * Mirrors src/uploads/upload.constants.ts in the API. Keep the two in step so
 * the browser can reject a file before spending an upload on it.
 */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_UPLOAD_BYTES = 10_000_000;
export const MAX_PRODUCT_IMAGES = 5;

export const IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",");

/** Returns a message when the file cannot be uploaded, otherwise null. */
export function validateImageFile(file: File): string | null {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return `${file.name} is not a supported image. Use JPEG, PNG, WebP or AVIF.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `${file.name} is larger than ${Math.round(MAX_UPLOAD_BYTES / 1_000_000)} MB.`;
  }
  return null;
}
