"use client";

import { use, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { addAdminQuoteMessage, getAdminQuote, updateAdminQuoteStatus } from "@/lib/api/quotes";
import { ApiError, errorMessage } from "@/lib/api/client";
import { adminKeys, quoteKeys } from "@/lib/queries/account";
import { adminActionsFor, CLOSED_STATUSES, QUOTE_STATUS_META } from "@/lib/quote-status";
import type { Quote, QuoteStatus } from "@/types/quote";
import { QuoteLines } from "@/components/quotes/quote-lines";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";
import { QuoteThread } from "@/components/quotes/quote-thread";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminQuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<{ status: QuoteStatus; label: string } | null>(null);
  const quote = useQuery({ queryKey: quoteKeys.adminDetail(id), queryFn: () => getAdminQuote(id), retry: false });

  /** Every change returns the whole quote. Lists and the sidebar counts need a refresh too. */
  function store(updated: Quote) {
    queryClient.setQueryData(quoteKeys.adminDetail(id), updated);
    void queryClient.invalidateQueries({ queryKey: [...quoteKeys.admin, "list"] });
    void queryClient.invalidateQueries({ queryKey: adminKeys.stats });
  }

  const changeStatus = useMutation({
    mutationFn: (status: QuoteStatus) => updateAdminQuoteStatus(id, status),
    onSuccess: (updated) => { store(updated); setConfirming(null); toast.success(`Marked as ${QUOTE_STATUS_META[updated.status].label.toLowerCase()}`); },
    onError: (error) => { setConfirming(null); toast.error(errorMessage(error)); void queryClient.invalidateQueries({ queryKey: quoteKeys.adminDetail(id) }); },
  });
  const reply = useMutation({
    mutationFn: (body: string) => addAdminQuoteMessage(id, body),
    onSuccess: (updated) => { store(updated); toast.success("Reply sent"); },
    onError: (error) => toast.error(errorMessage(error, "Your reply could not be sent.")),
  });

  if (quote.isLoading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-64 w-full" /></div>;
  if (quote.isError || !quote.data) {
    const notFound = quote.error instanceof ApiError && quote.error.status === 404;
    return <ErrorState title={notFound ? "Quote not found" : undefined} description={notFound ? "This quote no longer exists." : undefined} onRetry={notFound ? undefined : () => void quote.refetch()} />;
  }

  const data = quote.data;
  const actions = adminActionsFor(data.status);

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Quotes", href: "/admin/quotes" }, { label: data.reference }]} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand">Quote request</p>
          <h1 className="mt-1 font-mono text-2xl font-bold tracking-tight">{data.reference}</h1>
          <p className="mt-2 text-sm text-muted">Submitted {new Date(data.submittedAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}</p>
        </div>
        <QuoteStatusBadge status={data.status} />
      </div>

      <Card><CardContent className="space-y-4 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Update status</h2>
        {actions.length === 0 ? (
          <p className="text-sm text-muted">{data.status === "CANCELLED" ? "The customer cancelled this request, so its status is final." : "No further status changes are available."}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button key={action.status} size="sm" variant={action.destructive ? "destructive" : action.status === "QUOTED" ? "primary" : "secondary"} isLoading={changeStatus.isPending && changeStatus.variables === action.status} disabled={changeStatus.isPending} onClick={() => (action.destructive ? setConfirming(action) : changeStatus.mutate(action.status))}>{action.label}</Button>
            ))}
          </div>
        )}
      </CardContent></Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section className="space-y-3"><h2 className="text-lg font-semibold">Products</h2><QuoteLines lines={data.productLines} /></section>
          <QuoteThread viewer="STAFF" customerName={data.customer.name} originalMessage={data.message} messages={data.messages} submittedAt={data.submittedAt} closedReason={CLOSED_STATUSES.includes(data.status) ? "This request is closed, so replies are turned off." : undefined} onSend={(body) => reply.mutateAsync(body)} />
        </div>
        <Card className="h-fit"><CardContent className="space-y-4 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Customer</h2>
          <p className="font-semibold">{data.customer.name}</p>
          <a href={`mailto:${data.customer.email}`} className="flex items-center gap-2 break-all text-sm text-brand"><Mail className="h-4 w-4 shrink-0" aria-hidden="true" />{data.customer.email}</a>
          {data.customer.phone && <a href={`tel:${data.customer.phone}`} className="flex items-center gap-2 text-sm text-brand"><Phone className="h-4 w-4 shrink-0" aria-hidden="true" />{data.customer.phone}</a>}
        </CardContent></Card>
      </div>

      <Dialog isOpen={Boolean(confirming)} onClose={() => setConfirming(null)} title={confirming?.label ?? ""}>
        <div className="space-y-5">
          <p className="text-sm leading-6 text-muted">The customer is emailed about this change. You can reopen the request for review afterwards.</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirming(null)}>Go back</Button>
            <Button variant="destructive" isLoading={changeStatus.isPending} onClick={() => confirming && changeStatus.mutate(confirming.status)}>{confirming?.label}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
