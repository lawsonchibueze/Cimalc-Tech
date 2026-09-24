"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { getAdminUsers, updateAdminUser } from "@/lib/api/users";
import { errorMessage } from "@/lib/api/client";
import { adminKeys } from "@/lib/queries/account";
import { useSession } from "@/lib/auth/use-session";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const { user: me } = useSession();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<AdminUser | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params = { page, limit: PAGE_SIZE, search: search || undefined };
  const users = useQuery({ queryKey: adminKeys.users(params), queryFn: () => getAdminUsers(params), placeholderData: keepPreviousData });

  const changeRole = useMutation({
    mutationFn: (person: AdminUser) => updateAdminUser(person.id, { role: person.role === "ADMIN" ? "USER" : "ADMIN" }),
    onSuccess: (person) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(`${person.name} is now ${person.role === "ADMIN" ? "an administrator" : "a customer"}`);
      setTarget(null);
    },
    onError: (error) => { setTarget(null); toast.error(errorMessage(error)); },
  });

  const result = users.data;
  const promoting = target?.role !== "ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand">Staff workspace</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Users</h1>
        <p className="mt-2 text-sm text-muted">Everyone with an account. Administrators can manage the catalog, quotes and other users.</p>
      </div>
      <Card><CardContent className="space-y-5 p-4 md:p-6">
        <div className="relative max-w-xl"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" /><Input aria-label="Search users" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search by name or email" className="pl-9" /></div>
        {users.isLoading && <div className="space-y-3">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div>}
        {users.isError && <ErrorState onRetry={() => void users.refetch()} />}
        {result && result.data.length === 0 && <EmptyState title="No users found" description="Try a different search." />}
        {result && result.data.length > 0 && (
          <ul className={cn("divide-y divide-border transition-opacity", users.isPlaceholderData && "opacity-60")}>
            {result.data.map((person) => (
              <li key={person.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{person.name}{person.id === me?.id && <span className="ml-2 text-xs text-muted">(you)</span>}</p>
                  <p className="truncate text-sm text-muted">{person.email}</p>
                  <p className="text-xs text-muted">Joined {new Date(person.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={person.role === "ADMIN" ? "info" : "neutral"}>{person.role === "ADMIN" ? "Administrator" : "Customer"}</Badge>
                  <Button size="sm" variant="secondary" disabled={person.id === me?.id} title={person.id === me?.id ? "You cannot change your own role" : undefined} onClick={() => setTarget(person)}>
                    {person.role === "ADMIN" ? <><ShieldOff className="h-4 w-4" aria-hidden="true" />Remove admin</> : <><ShieldCheck className="h-4 w-4" aria-hidden="true" />Make admin</>}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {result && <Pagination currentPage={result.meta.page} totalPages={result.meta.totalPages} onPageChange={setPage} />}
      </CardContent></Card>
      <Dialog isOpen={Boolean(target)} onClose={() => setTarget(null)} title={promoting ? "Make administrator" : "Remove administrator"}>
        <div className="space-y-5">
          <p className="text-sm leading-6 text-muted">{promoting ? `${target?.name} will be able to manage products, categories, quotes, messages and other users.` : `${target?.name} will lose access to the admin area and become a regular customer.`}</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setTarget(null)}>Cancel</Button>
            <Button variant={promoting ? "primary" : "destructive"} isLoading={changeRole.isPending} onClick={() => target && changeRole.mutate(target)}>{promoting ? "Make admin" : "Remove admin"}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
