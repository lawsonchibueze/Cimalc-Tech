"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LogOut, UserRound, UserCog } from "lucide-react";
import { useSignOut } from "@/lib/auth/use-session";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview", icon: UserRound, exact: true },
  { href: "/account/quotes", label: "My quotes", icon: FileText, exact: false },
  { href: "/account/profile", label: "Profile", icon: UserCog, exact: false },
];

const itemClass = "flex min-h-11 min-w-0 items-center gap-2 rounded-sm px-3 text-sm font-medium transition-colors hover:bg-background hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

export function AccountNav() {
  const pathname = usePathname();
  const signOut = useSignOut();

  return (
    <aside className="h-fit rounded-md border border-border bg-surface p-3">
      <p className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Account</p>
      <nav aria-label="Account navigation" className="grid grid-cols-2 gap-1 sm:flex sm:overflow-x-auto lg:flex-col">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn(itemClass, active ? "bg-background text-brand" : "text-default")}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="truncate">{label}</span>
            </Link>
          );
        })}
        <button type="button" onClick={() => signOut.mutate()} disabled={signOut.isPending} className={cn(itemClass, "text-default")}>
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="truncate">Sign out</span>
        </button>
      </nav>
    </aside>
  );
}
