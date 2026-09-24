import { Badge } from "@/components/ui/badge";
import { QUOTE_STATUS_META } from "@/lib/quote-status";
import type { QuoteStatus } from "@/types/quote";

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
    const meta = QUOTE_STATUS_META[status];
    return <Badge variant={meta.tone}>{meta.label}</Badge>;
}
