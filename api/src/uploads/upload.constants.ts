/** Kept in one place. The frontend mirrors these values in src/lib/config/upload.ts. */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_UPLOAD_BYTES = 10_000_000;
export const UPLOAD_URL_TTL_SECONDS = 15 * 60;
export const UPLOAD_FOLDERS = ["products", "categories", "uploads"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];
