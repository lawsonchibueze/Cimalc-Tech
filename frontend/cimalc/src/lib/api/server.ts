import { cache } from "react";
import { getCategoryBySlug } from "./categories";
import { getProductBySlug } from "./products";

/**
 * Server side loaders for page metadata and structured data. `cache` makes the
 * metadata function and the layout of one request share a single API call.
 * Both return null when the item does not exist, so callers can fall back.
 */
export const loadProduct = cache(async (slug: string) => {
    try {
        return await getProductBySlug(slug);
    } catch {
        return null;
    }
});

export const loadCategory = cache(async (slug: string) => {
    try {
        return await getCategoryBySlug(slug);
    } catch {
        return null;
    }
});
