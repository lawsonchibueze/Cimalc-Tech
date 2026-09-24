"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { defaultDestination, safeRedirectPath } from "@/lib/auth/session";
import { useSession } from "@/lib/auth/use-session";

/**
 * Landing page after Google sign-in. The API can only send the browser to one
 * fixed address, so this page reads the new session and forwards people to
 * their admin area, account, or the page they came from.
 */
export function ContinueAfterSignIn() {
    const router = useRouter();
    const params = useSearchParams();
    const { user, isPending } = useSession();
    const destination = safeRedirectPath(params.get("redirect")) ?? defaultDestination(user?.role);

    useEffect(() => {
        if (!isPending && user) router.replace(destination);
    }, [isPending, user, destination, router]);

    if (!isPending && !user) {
        return (
            <div role="alert" className="max-w-sm rounded-lg border border-border bg-surface p-6 text-center text-sm">
                <p className="text-default">We could not sign you in.</p>
                <Link href="/auth/sign-in" className="mt-3 inline-block font-medium text-brand">Try again</Link>
            </div>
        );
    }
    return <p className="text-sm text-muted" role="status">Signing you in…</p>;
}
