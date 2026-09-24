import { z } from "zod";

export const productSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    description: z.string().trim().min(10, "Description must be at least 10 characters."),
    categorySlug: z.string().min(1, "Choose a category."),
    inStock: z.boolean(),
    images: z.array(z.object({ id: z.string(), url: z.string(), alt: z.string(), storageKey: z.string().optional() })).min(1, "Add at least one image.").max(5, "A product can have up to 5 images."),
});

export type ProductInput = z.infer<typeof productSchema>;
