"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, FileText } from "lucide-react";
import { getMyQuotes } from "@/lib/api/quotes";
import { quoteKeys } from "@/lib/queries/account";
import { useSession } from "@/lib/auth/use-session";
import { QUOTE_STATUS_META } from "@/lib/quote-status";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const RECENT = 3;

export default function AccountPage() {
  const { user } = useSession();
  const quotes = useQuery({ queryKey: quoteKeys.mine, queryFn: getMyQuotes });
  const open = quotes.data?.filter((quote) => ["PENDING", "REVIEWING", "QUOTED"].includes(quote.status)).length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-brand">Your account</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Welcome back{user?.name ? `, ${user.name}` : ""}.</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{user?.email}</p>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <FileText className="h-5 w-5 text-brand" aria-hidden="true" />
              <h2 className="mt-4 font-semibold">Quotes</h2>
              <p className="mt-2 text-sm text-muted">
                {quotes.isLoading ? "Checking your requests…" : quotes.data?.length ? `${open} open of ${quotes.data.length} in total.` : "Track submitted requests and review responses from the Cimalc Tech team."}
              </p>
            </div>
            <Button href="/account/quotes" variant="secondary" size="sm">View all quotes <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Button>
          </div>
          {quotes.isLoading && <Skeleton className="mt-5 h-16 w-full" />}
          {quotes.data && quotes.data.length > 0 && (
            <ul className="mt-5 divide-y divide-border border-t border-border">
              {quotes.data.slice(0, RECENT).map((quote) => (
                <li key={quote.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <Link href={`/account/quotes/${quote.id}`} className="min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                    <span className="block font-mono text-sm font-semibold text-default">{quote.reference}</span>
                    <span className="block truncate text-xs text-muted">{quote.productLines.map((line) => line.product.name).join(", ")} · {QUOTE_STATUS_META[quote.status].description}</span>
                  </Link>
                  <QuoteStatusBadge status={quote.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
