"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { BarChart3, Boxes, FileText, FolderTree, Inbox, LogOut, Menu, Users, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SiteLogo } from "@/components/layout/site-logo";
import { getAdminStats } from "@/lib/api/dashboard";
import { adminKeys } from "@/lib/queries/account";
import { useSession, useSignOut } from "@/lib/auth/use-session";

type NavItem = { href: string; label: string; icon: typeof BarChart3; badge?: "pendingQuotes" | "openContactMessages" };

const navigation: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/products", label: "Products", icon: Boxes },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/quotes", label: "Quotes", icon: FileText, badge: "pendingQuotes" },
    { href: "/admin/messages", label: "Messages", icon: Inbox, badge: "openContactMessages" },
    { href: "/admin/users", label: "Users", icon: Users },
];

function initials(name: string | undefined) {
    return (name ?? "").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
}

function getBreadcrumbs(pathname: string) {
    const section = navigation.find((item) => item.href !== "/admin" && pathname.startsWith(item.href));
    return section ? [{ label: "Admin", href: "/admin" }, { label: section.label }] : [{ label: "Admin" }, { label: "Dashboard" }];
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();
    const { user } = useSession();
    const signOut = useSignOut();
    const stats = useQuery({ queryKey: adminKeys.stats, queryFn: getAdminStats, refetchInterval: 60_000 });

    return (
        <aside className="flex h-full w-72 flex-col border-r border-border bg-surface px-4 py-5">
            <Link href="/admin" className="mb-10 flex items-center gap-3 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
                <SiteLogo className="h-12 w-32" sizes="128px" />
                <span className="sr-only">Admin workspace</span>
            </Link>
            <Link href="/" className="mb-5 flex min-h-11 items-center rounded-sm px-3 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">&larr; Back to storefront</Link>
            <nav aria-label="Admin navigation" className="flex flex-col gap-1">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Workspace</p>
                {navigation.map(({ href, label, icon: Icon, badge }) => {
                    const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                    const count = badge ? stats.data?.[badge] ?? 0 : 0;
                    return (
                        <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-sm px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2", active ? "bg-brand text-white" : "text-default hover:bg-background hover:text-brand")}>
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            <span className="flex-1">{label}</span>
                            {count > 0 && <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", active ? "bg-white/20 text-white" : "bg-brand/10 text-brand")} aria-label={`${count} waiting`}>{count}</span>}
                        </Link>
                    );
                })}
            </nav>
            <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-md bg-background p-3"><div><p className="text-xs font-semibold text-default">Appearance</p><p className="mt-1 text-xs text-muted">Switch theme</p></div><ThemeToggle /></div>
                <div className="flex items-center gap-3 rounded-md bg-background p-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-bold text-brand" aria-hidden="true">{initials(user?.name)}</div>
                    <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-default">{user?.name}</p><p className="truncate text-xs text-muted">{user?.email}</p></div>
                    <button type="button" aria-label="Sign out" onClick={() => signOut.mutate()} disabled={signOut.isPending} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><LogOut className="h-4 w-4" aria-hidden="true" /></button>
                </div>
            </div>
        </aside>
    );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const { user } = useSession();

    return (
        <div className="min-h-screen bg-background">
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex"><Sidebar /></div>
            <div className="lg:pl-72">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur md:px-8">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="h-11 w-11 p-0 lg:hidden" aria-label="Open admin navigation" onClick={() => setIsMobileOpen(true)}>
                            <Menu className="h-5 w-5" aria-hidden="true" />
                        </Button>
                        <div className="hidden sm:block"><Breadcrumb items={getBreadcrumbs(pathname)} /></div>
                        <span className="text-sm font-semibold text-default sm:hidden">Cimalc Tech Admin</span>
                    </div>
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-xs font-bold text-brand" title={user?.name} aria-label={`Signed in as ${user?.name ?? "administrator"}`}>{initials(user?.name)}</div>
                </header>
                <main className="mx-auto max-w-[1600px] p-4 md:p-8">{children}</main>
            </div>
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.button aria-label="Close admin navigation" className="fixed inset-0 z-40 bg-brand/30 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileOpen(false)} />
                        <motion.div className="fixed inset-y-0 left-0 z-50 lg:hidden" initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: "spring", damping: 28, stiffness: 260 }}>
                            <div className="relative h-full"><Sidebar onNavigate={() => setIsMobileOpen(false)} /><Button variant="ghost" size="sm" className="absolute right-3 top-3 h-11 w-11 p-0" aria-label="Close admin navigation" onClick={() => setIsMobileOpen(false)}><X className="h-5 w-5" aria-hidden="true" /></Button></div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
