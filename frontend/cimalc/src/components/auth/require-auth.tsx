"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth/use-session";
import type { UserRole } from "@/types/user";

/**
 * Keeps signed out visitors, and visitors without the right role, out of a
 * section of the app. This only shapes the interface. The API enforces the
 * same rules on every request, so it is what actually protects the data.
 */
export function RequireAuth({ role, children }: { role?: UserRole; children: React.ReactNode }) {
  const { user, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !user) router.replace(`/auth/sign-in?redirect=${encodeURIComponent(pathname)}`);
  }, [isPending, user, router, pathname]);

  if (isPending || !user) {
    return (
      <div className="mx-auto max-w-[1440px] space-y-4 px-4 py-10 md:px-8" aria-busy="true">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (role && user.role !== role) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
        <ShieldAlert className="h-10 w-10 text-warning" aria-hidden="true" />
        <h1 className="text-xl font-bold">You do not have access to this area</h1>
        <p className="text-sm text-muted">This section is only for Cimalc Tech staff. If you think this is a mistake, ask an administrator to update your role.</p>
        <Link href="/" className="mt-2 text-sm font-medium text-brand">Back to the store</Link>
      </div>
    );
  }

  return <>{children}</>;
}
