import { z } from "zod";

export const contactFormSchema = z.object({
    name: z.string().trim().min(2, "Please enter your full name").max(120, "Name must be 120 characters or fewer"),
    email: z.string().trim().email("Please enter a valid email address"),
    message: z.string().trim().min(10, "Please enter a message (min 10 characters)").max(2000, "Message must be 2000 characters or fewer"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
