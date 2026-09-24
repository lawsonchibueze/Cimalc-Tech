import { QuoteRequestInput } from "../validations/qoute";
import { apiRequest } from "./client";


export async function submitQuoteRequest(
    productId: string,
    data: QuoteRequestInput & { quantity: number },
): Promise<Quote> {
    return apiRequest<Quote>("/quotes", { method: "POST", body: JSON.stringify({ customerName: data.name, email: data.email, phone: data.phone, productId, quantity: data.quantity, message: data.message }) });
}

export type Quote = {
    id: string;
    reference: string;
    status: string;
    submittedAt: string;
    customer: { name: string; email: string; phone?: string };
    productLines: Array<{ id: string; quantity: number; product: { id: string; name: string; slug: string; images?: unknown[] } }>;
    messages?: Array<{ id: string; body: string; createdAt: string }>;
    nextStepMessage: string;
};

export function getMyQuotes() { return apiRequest<Quote[]>("/me/quotes"); }
export function getMyQuote(id: string) { return apiRequest<Quote>(`/me/quotes/${encodeURIComponent(id)}`); }
export function cancelQuote(id: string) { return apiRequest<Quote>(`/quotes/${encodeURIComponent(id)}/cancel`, { method: "PATCH" }); }
export function addQuoteMessage(id: string, body: string) { return apiRequest<Quote>(`/quotes/${encodeURIComponent(id)}/messages`, { method: "POST", body: JSON.stringify({ body }) }); }

export function getAdminQuotes() { return apiRequest<Quote[]>("/admin/quotes"); }
export function getAdminQuote(id: string) { return apiRequest<Quote>(`/admin/quotes/${encodeURIComponent(id)}`); }
export function updateAdminQuoteStatus(id: string, status: string) { return apiRequest<Quote>(`/admin/quotes/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); }
export function addAdminQuoteMessage(id: string, body: string) { return apiRequest<Quote>(`/admin/quotes/${encodeURIComponent(id)}/messages`, { method: "POST", body: JSON.stringify({ body }) }); }
