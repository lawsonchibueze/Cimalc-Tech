"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { getMyQuotes } from "@/lib/api/quotes";
import { quoteKeys } from "@/lib/queries/account";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountQuotesPage() {
  const quotes = useQuery({ queryKey: quoteKeys.mine, queryFn: getMyQuotes });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand">Account activity</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">My quotes</h1>
        <p className="mt-2 text-sm text-muted">Your submitted quote requests and their latest status.</p>
      </div>
      {quotes.isLoading && <div className="space-y-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-24 w-full" />)}</div>}
      {quotes.isError && <ErrorState onRetry={() => void quotes.refetch()} />}
      {quotes.data?.length === 0 && <EmptyState title="No quotes yet" description="When you request a quote, it will appear here for easy follow-up." actionLabel="Explore products" actionHref="/products" />}
      {quotes.data && quotes.data.length > 0 && (
        <ul className="space-y-3">
          {quotes.data.map((quote) => (
            <li key={quote.id}>
              <Link href={`/account/quotes/${quote.id}`} className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface p-5 transition-colors hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-semibold">{quote.reference}</span>
                    <QuoteStatusBadge status={quote.status} />
                  </div>
                  <p className="mt-2 truncate text-sm text-default">{quote.productLines.map((line) => `${line.product.name} × ${line.quantity}`).join(", ")}</p>
                  <p className="mt-1 text-xs text-muted">Submitted {new Date(quote.submittedAt).toLocaleDateString(undefined, { dateStyle: "medium" })} · {quote.messages.length} {quote.messages.length === 1 ? "message" : "messages"}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
