import type { ContactFormInput } from "@/lib/validations/contact";
import type { PageMeta, Paginated } from "@/types/pagination";
import type { ContactMessage } from "@/types/user";
import { apiRequest, toQueryString } from "./client";

export function submitContactForm(data: ContactFormInput) {
    return apiRequest<{ success: true; message: string }>("/contact", { method: "POST", body: JSON.stringify(data) });
}

export type ContactMessagePage = Paginated<ContactMessage, PageMeta & { open: number }>;

export function getContactMessages(params: { page?: number; limit?: number; handled?: boolean } = {}) {
    return apiRequest<ContactMessagePage>(`/admin/contact-messages${toQueryString({ ...params })}`);
}

export function setContactMessageHandled(id: string, handled: boolean) {
    return apiRequest<ContactMessage>(`/admin/contact-messages/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ handled }) });
}
