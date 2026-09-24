"use client";
import Link from "next/link";
import { useSession, useSignOut } from "@/lib/auth/use-session";

const linkClass = "w-fit text-sm text-muted transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

/** Shows sign in links to visitors and account links to signed in customers. */
export function FooterAccountLinks() {
  const { user } = useSession();
  const signOut = useSignOut();

  return (
    <div className="mt-4 flex flex-col gap-3">
      {user ? (
        <>
          <Link href="/account" className={linkClass}>My account</Link>
          <Link href="/account/quotes" className={linkClass}>My quotes</Link>
          <button type="button" onClick={() => signOut.mutate()} className={`${linkClass} text-left`}>Sign out</button>
        </>
      ) : (
        <>
          <Link href="/auth/sign-in" className={linkClass}>Sign in</Link>
          <Link href="/auth/sign-up" className={linkClass}>Create account</Link>
        </>
      )}
    </div>
  );
}
