import { z } from "zod";

export const passwordSchema = z.string().min(8, "Use at least 8 characters.").max(128, "Use 128 characters or fewer.");

export const profileSchema = z.object({
    name: z.string().trim().min(2, "Enter your name.").max(120, "Name must be 120 characters or fewer."),
});

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Enter your current password."),
        newPassword: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((value) => value.newPassword === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
