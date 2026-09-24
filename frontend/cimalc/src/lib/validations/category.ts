import { z } from "zod";

export const categorySchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120, "Name must be 120 characters or fewer."),
    /** Optional. Leave empty to clear it. */
    description: z.string().trim().max(1000, "Description must be 1000 characters or fewer."),
});

export type CategoryInput = z.infer<typeof categorySchema>;
