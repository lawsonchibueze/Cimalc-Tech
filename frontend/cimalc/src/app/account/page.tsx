
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, FileText, LogOut, ShoppingBag } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/botton";
type SessionUser = { name?: string; email?: string; role?: "USER" | "ADMIN" };

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    authClient.getSession().then((session) => {
      if (!session?.user) {
        router.replace("/auth/sign-in");
        return;
      }
      setUser(session.user);
      setLoading(false);
    });
  }, [router]);

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.replace("/auth/sign-in");
  }

  if (loading) return <p className="text-sm text-muted">Loading your account...</p>;

  return <div className="space-y-8"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-brand">Your account</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Welcome back{user?.name ? `, ${user.name}` : ""}.</h1><p className="mt-2 text-sm leading-6 text-muted">{user?.email}</p><p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">Role: {user?.role ?? "USER"}</p></div><Button type="button" variant="secondary" size="sm" onClick={signOut} isLoading={signingOut}><LogOut className="h-4 w-4" aria-hidden="true" />Sign out</Button></div><div className="grid gap-4 md:grid-cols-2"><Card><CardContent className="p-5"><FileText className="h-5 w-5 text-brand" aria-hidden="true" /><h2 className="mt-5 font-semibold">Quotes</h2><p className="mt-2 text-sm text-muted">Track submitted requests and review responses from the Cimalc Tech team.</p><Button href="/account/quotes" variant="secondary" size="sm" className="mt-5">View quotes <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Button></CardContent></Card><Card><CardContent className="p-5"><ShoppingBag className="h-5 w-5 text-brand" aria-hidden="true" /><h2 className="mt-5 font-semibold">Orders</h2><p className="mt-2 text-sm text-muted">Orders and invoices will appear here after a quote is accepted.</p><Button href="/account/orders" variant="secondary" size="sm" className="mt-5">View orders <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Button></CardContent></Card></div></div>;
}


