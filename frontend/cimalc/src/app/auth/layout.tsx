import Link from "next/link";
import type { Metadata } from "next";
import { SiteLogo } from "@/components/layout/site-logo";

export const metadata: Metadata = { title: { default: "Account", template: "%s | Cimalc Tech" }, description: "Sign in to manage your Cimalc Tech quotes and account.", robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      <Link href="/" aria-label="Cimalc Tech home" className="rounded-lg bg-white p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><SiteLogo className="h-14 w-40" sizes="160px" eager /></Link>
      {children}
    </main>
  );
}
