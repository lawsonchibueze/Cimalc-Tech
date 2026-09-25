import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { RequireAuth } from "@/components/auth/require-auth";
import { SiteLogo } from "@/components/layout/site-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AccountNav } from "@/components/account/account-nav";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:py-8 md:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="Cimalc Tech home"
            className="w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <SiteLogo className="h-12 w-12" sizes="96px" eager />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="text-sm font-medium text-muted hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Back to store
            </Link>
          </div>
        </div>
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "My account" }]}
        />
        <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
          <AccountNav />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
