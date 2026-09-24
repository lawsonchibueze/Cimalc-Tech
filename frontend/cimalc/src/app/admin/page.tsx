"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Boxes, CheckCircle2, FileClock, FileText, FolderTree, Inbox, PackageX, PenLine, Plus, Users } from "lucide-react";
import { getAdminStats, type AdminStats } from "@/lib/api/dashboard";
import { getAdminQuotes } from "@/lib/api/quotes";
import { adminKeys, quoteKeys } from "@/lib/queries/account";
import { useSession } from "@/lib/auth/use-session";
import { cn } from "@/lib/utils";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

type StatCard = { key: keyof AdminStats; label: string; href: string; icon: typeof Boxes; tone: string };

const cards: StatCard[] = [
    { key: "totalProducts", label: "Total products", href: "/admin/products", icon: Boxes, tone: "bg-brand/10 text-brand" },
    { key: "publishedProducts", label: "Published", href: "/admin/products?status=PUBLISHED", icon: CheckCircle2, tone: "bg-success-bg text-success" },
    { key: "draftProducts", label: "Drafts", href: "/admin/products?status=DRAFT", icon: PenLine, tone: "bg-warning-bg text-warning" },
    { key: "outOfStockProducts", label: "Out of stock", href: "/admin/products", icon: PackageX, tone: "bg-warning-bg text-warning" },
    { key: "totalCategories", label: "Categories", href: "/admin/categories", icon: FolderTree, tone: "bg-brand/10 text-brand" },
    { key: "pendingQuotes", label: "Quotes awaiting review", href: "/admin/quotes?status=PENDING", icon: FileClock, tone: "bg-warning-bg text-warning" },
    { key: "acceptedQuotes", label: "Accepted quotes", href: "/admin/quotes?status=ACCEPTED", icon: FileText, tone: "bg-success-bg text-success" },
    { key: "openContactMessages", label: "Open messages", href: "/admin/messages", icon: Inbox, tone: "bg-brand/10 text-brand" },
    { key: "totalUsers", label: "Registered users", href: "/admin/users", icon: Users, tone: "bg-brand/10 text-brand" },
];

function greeting() {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

export default function AdminDashboardPage() {
    const { user } = useSession();
    const stats = useQuery({ queryKey: adminKeys.stats, queryFn: getAdminStats });
    const recent = useQuery({ queryKey: quoteKeys.adminList({ limit: 5 }), queryFn: () => getAdminQuotes({ limit: 5 }) });
    const firstName = user?.name.split(" ")[0];

    return (
        <div className="space-y-8">
            <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-default md:text-4xl">{greeting()}{firstName ? `, ${firstName}` : ""}.</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Everything that needs attention across the catalog, quotes and customer messages.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button href="/admin/products/new" size="sm"><Plus className="h-4 w-4" aria-hidden="true" />Add product</Button>
                    <Button href="/admin/categories/new" size="sm" variant="secondary"><Plus className="h-4 w-4" aria-hidden="true" />Add category</Button>
                    <Button href="/admin/quotes" size="sm" variant="secondary">Review quotes</Button>
                </div>
            </section>

            {stats.isError ? <ErrorState onRetry={() => void stats.refetch()} /> : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {cards.map(({ key, label, href, icon: Icon, tone }) => (
                        <Link key={key} href={href} className="group rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                            <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
                                <CardContent className="flex items-start justify-between p-5 md:p-6">
                                    <div>
                                        <p className="text-sm text-muted">{label}</p>
                                        {stats.isLoading ? <Skeleton className="mt-3 h-9 w-20" /> : <p className="mt-2 text-3xl font-bold tracking-tight text-default">{stats.data?.[key]}</p>}
                                    </div>
                                    <div className={cn("grid h-11 w-11 place-items-center rounded-md", tone)}><Icon className="h-5 w-5" aria-hidden="true" /></div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            <Card>
                <CardContent className="p-5 md:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-default">Latest quote requests</h2>
                        <Button href="/admin/quotes" variant="ghost" size="sm">View all</Button>
                    </div>
                    {recent.isLoading && <Skeleton className="mt-4 h-24 w-full" />}
                    {recent.isError && <p className="mt-4 text-sm text-error">Could not load quotes.</p>}
                    {recent.data?.data.length === 0 && <p className="mt-4 text-sm text-muted">No quote requests yet. New requests will appear here.</p>}
                    {recent.data && recent.data.data.length > 0 && (
                        <ul className="mt-4 divide-y divide-border">
                            {recent.data.data.map((quote) => (
                                <li key={quote.id}>
                                    <Link href={`/admin/quotes/${quote.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                                        <span className="min-w-0"><span className="block font-mono text-sm font-semibold text-default">{quote.reference}</span><span className="block truncate text-xs text-muted">{quote.customer.name} · {quote.productLines.map((line) => line.product.name).join(", ")}</span></span>
                                        <QuoteStatusBadge status={quote.status} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
