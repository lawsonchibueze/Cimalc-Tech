import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { RequireAuth } from "@/components/auth/require-auth";

export const metadata: Metadata = { title: "Staff portal", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <RequireAuth role="ADMIN">
            <AdminShell>{children}</AdminShell>
        </RequireAuth>
    );
}
