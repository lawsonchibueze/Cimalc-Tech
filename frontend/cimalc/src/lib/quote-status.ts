import type { QuoteStatus } from "@/types/quote";

type Tone = "success" | "error" | "warning" | "info" | "neutral";

export const QUOTE_STATUS_META: Record<QuoteStatus, { label: string; description: string; tone: Tone }> = {
    PENDING: { label: "Received", description: "We have your request and will review it shortly.", tone: "warning" },
    REVIEWING: { label: "In review", description: "Our team is preparing your quote.", tone: "info" },
    QUOTED: { label: "Quote ready", description: "We have replied with a quote. See the messages below.", tone: "success" },
    ACCEPTED: { label: "Accepted", description: "This quote was accepted. We will be in touch about next steps.", tone: "success" },
    DECLINED: { label: "Declined", description: "This quote was declined.", tone: "error" },
    CANCELLED: { label: "Cancelled", description: "This request was cancelled.", tone: "neutral" },
    EXPIRED: { label: "Expired", description: "This quote has expired. Start a new request if you are still interested.", tone: "neutral" },
};

export const QUOTE_STATUSES = Object.keys(QUOTE_STATUS_META) as QuoteStatus[];

/** A customer can cancel only before staff have answered. */
export const CUSTOMER_CANCELLABLE: QuoteStatus[] = ["PENDING", "REVIEWING"];

/** Nobody can add messages once a quote is closed. */
export const CLOSED_STATUSES: QuoteStatus[] = ["CANCELLED", "EXPIRED"];

type AdminAction = { status: QuoteStatus; label: string; destructive?: boolean };

/** The status changes staff can make from each state. Cancelled quotes are final. */
export function adminActionsFor(status: QuoteStatus): AdminAction[] {
    switch (status) {
        case "PENDING":
            return [{ status: "REVIEWING", label: "Start review" }, { status: "QUOTED", label: "Mark quoted" }, { status: "DECLINED", label: "Decline", destructive: true }];
        case "REVIEWING":
            return [{ status: "QUOTED", label: "Mark quoted" }, { status: "DECLINED", label: "Decline", destructive: true }];
        case "QUOTED":
            return [{ status: "ACCEPTED", label: "Mark accepted" }, { status: "DECLINED", label: "Mark declined", destructive: true }, { status: "EXPIRED", label: "Mark expired" }];
        case "ACCEPTED":
        case "DECLINED":
        case "EXPIRED":
            return [{ status: "REVIEWING", label: "Reopen for review" }];
        default:
            return [];
    }
}
