import type { Paginated, PageMeta } from "@/types/pagination";
import type { Quote, QuoteStatus } from "@/types/quote";
import type { QuoteRequestInput } from "@/lib/validations/quote";
import { apiRequest, toQueryString } from "./client";

export async function submitQuoteRequest(productId: string, data: QuoteRequestInput & { quantity: number }) {
    return apiRequest<Quote>("/quotes", {
        method: "POST",
        body: JSON.stringify({
            customerName: data.name,
            email: data.email,
            phone: data.phone || undefined,
            productId,
            quantity: data.quantity,
            message: data.message || undefined,
        }),
    });
}

/* Signed in customer */

export function getMyQuotes() {
    return apiRequest<Quote[]>("/me/quotes");
}

export function getMyQuote(id: string) {
    return apiRequest<Quote>(`/me/quotes/${encodeURIComponent(id)}`);
}

export function cancelQuote(id: string) {
    return apiRequest<Quote>(`/quotes/${encodeURIComponent(id)}/cancel`, { method: "PATCH" });
}

export function addQuoteMessage(id: string, body: string) {
    return apiRequest<Quote>(`/quotes/${encodeURIComponent(id)}/messages`, { method: "POST", body: JSON.stringify({ body }) });
}

/* Staff */

export interface AdminQuoteQuery {
    page?: number;
    limit?: number;
    status?: QuoteStatus;
    search?: string;
}

export type AdminQuotePage = Paginated<Quote, PageMeta & { counts: Partial<Record<QuoteStatus, number>> }>;

export function getAdminQuotes(params: AdminQuoteQuery = {}) {
    return apiRequest<AdminQuotePage>(`/admin/quotes${toQueryString({ ...params })}`);
}

export function getAdminQuote(id: string) {
    return apiRequest<Quote>(`/admin/quotes/${encodeURIComponent(id)}`);
}

export function updateAdminQuoteStatus(id: string, status: QuoteStatus) {
    return apiRequest<Quote>(`/admin/quotes/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export function addAdminQuoteMessage(id: string, body: string) {
    return apiRequest<Quote>(`/admin/quotes/${encodeURIComponent(id)}/messages`, { method: "POST", body: JSON.stringify({ body }) });
}
