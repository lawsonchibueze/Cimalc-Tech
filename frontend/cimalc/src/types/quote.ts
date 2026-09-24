export type QuoteStatus = "PENDING" | "REVIEWING" | "QUOTED" | "ACCEPTED" | "DECLINED" | "CANCELLED" | "EXPIRED";

export interface QuoteMessage {
    id: string;
    body: string;
    createdAt: string;
    sender: "CUSTOMER" | "STAFF";
}

export interface QuoteLine {
    id: string;
    quantity: number;
    product: { id: string; slug: string; name: string; image: string | null };
}

export interface Quote {
    id: string;
    reference: string;
    status: QuoteStatus;
    submittedAt: string;
    updatedAt: string;
    cancelledAt: string | null;
    /** What the customer wrote when they submitted the request. */
    message: string | null;
    customer: { name: string; email: string; phone: string | null };
    productLines: QuoteLine[];
    messages: QuoteMessage[];
}
