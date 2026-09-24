import { z } from "zod";
import { MAX_PRODUCT_IMAGES } from "@/lib/config/upload";

export const productSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(200, "Name must be 200 characters or fewer."),
    /** Leave empty to generate it from the name. */
    slug: z.string().trim().max(100, "Keep the URL slug under 100 characters.").regex(/^([a-z0-9]+(?:-[a-z0-9]+)*)?$/, "Use lowercase letters, numbers and single hyphens."),
    description: z.string().trim().max(5000, "Description must be 5000 characters or fewer."),
    categorySlug: z.string().min(1, "Choose a category."),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    featured: z.boolean(),
    stock: z.number("Enter a stock quantity.").int("Stock must be a whole number.").min(0, "Stock cannot be negative.").max(1_000_000, "Stock is too large."),
    images: z
        .array(z.object({ id: z.string(), url: z.string(), alt: z.string().max(200), storageKey: z.string().optional() }))
        .min(1, "Add at least one image.")
        .max(MAX_PRODUCT_IMAGES, `A product can have up to ${MAX_PRODUCT_IMAGES} images.`),
});

export type ProductInput = z.infer<typeof productSchema>;
