"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, Mail, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { getContactMessages, setContactMessageHandled } from "@/lib/api/contact";
import { errorMessage } from "@/lib/api/client";
import { adminKeys } from "@/lib/queries/account";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

type Filter = "open" | "handled" | "all";
const PAGE_SIZE = 10;
const FILTERS: Array<{ value: Filter; label: string }> = [{ value: "open", label: "Open" }, { value: "handled", label: "Handled" }, { value: "all", label: "All" }];

export default function AdminMessagesPage() {
  const [filter, setFilter] = useState<Filter>("open");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const params = { page, limit: PAGE_SIZE, handled: filter === "all" ? undefined : filter === "handled" };
  const messages = useQuery({ queryKey: adminKeys.messages(params), queryFn: () => getContactMessages(params), placeholderData: keepPreviousData });

  const toggle = useMutation({
    mutationFn: ({ id, handled }: { id: string; handled: boolean }) => setContactMessageHandled(id, handled),
    onSuccess: (message) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "messages"] });
      void queryClient.invalidateQueries({ queryKey: adminKeys.stats });
      toast.success(message.handledAt ? "Marked as handled" : "Reopened");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const result = messages.data;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand">Staff workspace</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Contact messages</h1>
        <p className="mt-2 text-sm text-muted">Messages sent through the contact form. Reply by email, then mark them as handled.</p>
      </div>
      <Card><CardContent className="space-y-5 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2" role="group" aria-label="Filter messages">
            {FILTERS.map((item) => (
              <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => { setFilter(item.value); setPage(1); }} className={cn("min-h-9 rounded-full border px-4 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", filter === item.value ? "border-brand bg-brand text-white" : "border-border bg-surface hover:border-brand/40")}>
                {item.label}{item.value === "open" && result ? ` ${result.meta.open}` : ""}
              </button>
            ))}
          </div>
        </div>
        {messages.isLoading && <div className="space-y-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-28 w-full" />)}</div>}
        {messages.isError && <ErrorState onRetry={() => void messages.refetch()} />}
        {result && result.data.length === 0 && <EmptyState title={filter === "open" ? "Nothing waiting" : "No messages"} description={filter === "open" ? "Every message has been handled." : "Messages will appear here."} />}
        {result && result.data.length > 0 && (
          <ul className={cn("space-y-3 transition-opacity", messages.isPlaceholderData && "opacity-60")}>
            {result.data.map((message) => (
              <li key={message.id} className="rounded-md border border-border bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{message.name}</p>
                    <a href={`mailto:${message.email}?subject=${encodeURIComponent("Re: your message to Cimalc Tech")}`} className="inline-flex items-center gap-1 text-sm text-brand"><Mail className="h-3.5 w-3.5" aria-hidden="true" />{message.email}</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={message.handledAt ? "success" : "warning"}>{message.handledAt ? "Handled" : "Open"}</Badge>
                    <Button size="sm" variant="secondary" disabled={toggle.isPending} onClick={() => toggle.mutate({ id: message.id, handled: !message.handledAt })}>
                      {message.handledAt ? <><Undo2 className="h-4 w-4" aria-hidden="true" />Reopen</> : <><CheckCheck className="h-4 w-4" aria-hidden="true" />Mark handled</>}
                    </Button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-default">{message.message}</p>
                <p className="mt-3 text-xs text-muted">Received {new Date(message.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p>
              </li>
            ))}
          </ul>
        )}
        {result && <Pagination currentPage={result.meta.page} totalPages={result.meta.totalPages} onPageChange={setPage} />}
      </CardContent></Card>
    </div>
  );
}
