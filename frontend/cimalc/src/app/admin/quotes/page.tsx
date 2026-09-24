"use client";
import { useQuery } from "@tanstack/react-query";
import { getAdminQuotes } from "@/lib/api/qoutes";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminQuotesPage() {
  const quotes = useQuery({ queryKey: ["admin", "quotes"], queryFn: getAdminQuotes });
  return <div className="space-y-6"><Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Quotes" }]} /><div><p className="text-sm font-medium text-brand">Staff workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Quote requests</h1><p className="mt-2 text-sm text-muted">Review customer and administrator quote requests.</p></div>{quotes.isLoading ? <Skeleton className="h-48 w-full" /> : quotes.isError ? <ErrorState onRetry={() => void quotes.refetch()} /> : !quotes.data?.length ? <EmptyState title="No quote requests yet" description="New requests will appear here." /> : <div className="space-y-3">{quotes.data.map((quote) => <div key={quote.id} className="rounded-md border border-border bg-surface p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{quote.reference}</p><p className="text-sm text-muted">{quote.customer.name} · {quote.customer.email}</p></div><span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">{quote.status}</span></div><p className="mt-3 text-sm">{quote.productLines.map((line) => `${line.product.name} × ${line.quantity}`).join(", ")}</p><p className="mt-2 text-xs text-muted">Submitted {new Date(quote.submittedAt).toLocaleString()}</p></div>)}</div>}</div>;
}
