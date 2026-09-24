import { z } from "zod";

export const quoteRequestSchema = z.object({
    name: z.string().trim().min(2, "Please enter your full name").max(120, "Name must be 120 characters or fewer"),
    email: z.string().trim().email("Please enter a valid email address"),
    phone: z.string().trim().max(40, "Phone number is too long").optional(),
    message: z.string().trim().max(2000, "Message must be 2000 characters or fewer").optional(),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
