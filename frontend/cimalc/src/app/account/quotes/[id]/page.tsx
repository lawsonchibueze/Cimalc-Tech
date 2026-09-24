"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addQuoteMessage, cancelQuote, getMyQuote } from "@/lib/api/quotes";
import { ApiError, errorMessage } from "@/lib/api/client";
import { quoteKeys } from "@/lib/queries/account";
import { CLOSED_STATUSES, CUSTOMER_CANCELLABLE, QUOTE_STATUS_META } from "@/lib/quote-status";
import { QuoteLines } from "@/components/quotes/quote-lines";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";
import { QuoteThread } from "@/components/quotes/quote-thread";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Quote } from "@/types/quote";

export default function AccountQuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const quote = useQuery({ queryKey: quoteKeys.mineDetail(id), queryFn: () => getMyQuote(id), retry: false });

  /** Every change returns the whole quote, so the cache is updated without another request. */
  function store(updated: Quote) {
    queryClient.setQueryData(quoteKeys.mineDetail(id), updated);
    void queryClient.invalidateQueries({ queryKey: quoteKeys.mine, exact: true });
  }

  const cancel = useMutation({
    mutationFn: () => cancelQuote(id),
    onSuccess: (updated) => { store(updated); setConfirmCancel(false); toast.success("Quote request cancelled"); },
    onError: (error) => { setConfirmCancel(false); toast.error(errorMessage(error)); void queryClient.invalidateQueries({ queryKey: quoteKeys.mineDetail(id) }); },
  });
  const send = useMutation({
    mutationFn: (body: string) => addQuoteMessage(id, body),
    onSuccess: store,
    onError: (error) => toast.error(errorMessage(error, "Your message could not be sent.")),
  });

  if (quote.isLoading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-40 w-full" /></div>;
  if (quote.isError || !quote.data) {
    const notFound = quote.error instanceof ApiError && quote.error.status === 404;
    return <ErrorState title={notFound ? "Quote not found" : undefined} description={notFound ? "We could not find that quote on your account." : undefined} onRetry={notFound ? undefined : () => void quote.refetch()} />;
  }

  const data = quote.data;
  const meta = QUOTE_STATUS_META[data.status];

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: "My account", href: "/account" }, { label: "My quotes", href: "/account/quotes" }, { label: data.reference }]} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand">Quote request</p>
          <h1 className="mt-1 font-mono text-2xl font-bold tracking-tight">{data.reference}</h1>
          <p className="mt-2 text-sm text-muted">Submitted {new Date(data.submittedAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}</p>
        </div>
        <div className="flex items-center gap-3">
          <QuoteStatusBadge status={data.status} />
          {CUSTOMER_CANCELLABLE.includes(data.status) && <Button variant="secondary" size="sm" onClick={() => setConfirmCancel(true)}>Cancel request</Button>}
        </div>
      </div>
      <p className="rounded-md bg-background px-4 py-3 text-sm text-default">{meta.description}</p>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Products</h2>
        <QuoteLines lines={data.productLines} />
      </section>
      <QuoteThread viewer="CUSTOMER" customerName={data.customer.name} originalMessage={data.message} messages={data.messages} submittedAt={data.submittedAt} closedReason={CLOSED_STATUSES.includes(data.status) ? "This request is closed. Start a new request if you still need this item." : undefined} onSend={(body) => send.mutateAsync(body)} />
      <Link href="/account/quotes" className="inline-block text-sm font-medium text-brand">Back to all quotes</Link>
      <Dialog isOpen={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancel this request?">
        <div className="space-y-5">
          <p className="text-sm leading-6 text-muted">We will stop working on {data.reference}. You can always send a new request later.</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirmCancel(false)}>Keep request</Button>
            <Button variant="destructive" isLoading={cancel.isPending} onClick={() => cancel.mutate()}>Cancel request</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
