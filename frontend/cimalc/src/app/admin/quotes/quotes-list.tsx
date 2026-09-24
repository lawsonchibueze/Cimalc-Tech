"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronRight, Search } from "lucide-react";
import { getAdminQuotes } from "@/lib/api/quotes";
import { quoteKeys } from "@/lib/queries/account";
import { QUOTE_STATUSES, QUOTE_STATUS_META } from "@/lib/quote-status";
import { cn } from "@/lib/utils";
import type { QuoteStatus } from "@/types/quote";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;

export function AdminQuotesList() {
  const initial = useSearchParams().get("status");
  const [status, setStatus] = useState<QuoteStatus | "">(QUOTE_STATUSES.includes(initial as QuoteStatus) ? (initial as QuoteStatus) : "");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params = { page, limit: PAGE_SIZE, status: status || undefined, search: search || undefined };
  const quotes = useQuery({ queryKey: quoteKeys.adminList(params), queryFn: () => getAdminQuotes(params), placeholderData: keepPreviousData });
  const result = quotes.data;
  const counts = result?.meta.counts ?? {};
  const total = Object.values(counts).reduce((sum, value) => sum + (value ?? 0), 0);

  const tabClass = (active: boolean) => cn("inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", active ? "border-brand bg-brand text-white" : "border-border bg-surface text-default hover:border-brand/40");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand">Staff workspace</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Quote requests</h1>
        <p className="mt-2 text-sm text-muted">Review requests, update their status and reply to customers.</p>
      </div>
      <Card><CardContent className="space-y-5 p-4 md:p-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          <button type="button" className={tabClass(status === "")} aria-pressed={status === ""} onClick={() => { setStatus(""); setPage(1); }}>All <span className="opacity-70">{total}</span></button>
          {QUOTE_STATUSES.map((item) => (
            <button key={item} type="button" className={tabClass(status === item)} aria-pressed={status === item} onClick={() => { setStatus(item); setPage(1); }}>{QUOTE_STATUS_META[item].label} <span className="opacity-70">{counts[item] ?? 0}</span></button>
          ))}
        </div>
        <div className="relative max-w-xl"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" /><Input aria-label="Search quotes" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search by reference, name or email" className="pl-9" /></div>
        {quotes.isLoading && <div className="space-y-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-24 w-full" />)}</div>}
        {quotes.isError && <ErrorState onRetry={() => void quotes.refetch()} />}
        {result && result.data.length === 0 && <EmptyState title="No quote requests found" description={status || search ? "Try a different filter or search." : "New requests will appear here."} />}
        {result && result.data.length > 0 && (
          <ul className={cn("space-y-3 transition-opacity", quotes.isPlaceholderData && "opacity-60")}>
            {result.data.map((quote) => (
              <li key={quote.id}>
                <Link href={`/admin/quotes/${quote.id}`} className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface p-5 transition-colors hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3"><span className="font-mono text-sm font-semibold">{quote.reference}</span><QuoteStatusBadge status={quote.status} /></div>
                    <p className="mt-2 text-sm text-default">{quote.customer.name} · {quote.customer.email}{quote.customer.phone ? ` · ${quote.customer.phone}` : ""}</p>
                    <p className="mt-1 truncate text-sm text-muted">{quote.productLines.map((line) => `${line.product.name} × ${line.quantity}`).join(", ")}</p>
                    <p className="mt-1 text-xs text-muted">Submitted {new Date(quote.submittedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · {quote.messages.length} {quote.messages.length === 1 ? "message" : "messages"}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {result && <Pagination currentPage={result.meta.page} totalPages={result.meta.totalPages} onPageChange={setPage} />}
      </CardContent></Card>
    </div>
  );
}
