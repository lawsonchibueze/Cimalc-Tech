import type { ContactFormInput } from "@/lib/validations/contact";
import { apiRequest } from "./client";

export async function submitContactForm(data: ContactFormInput): Promise<{ success: true }> {
    return apiRequest<{ success: true }>("/contact", { method: "POST", body: JSON.stringify(data) });
}
