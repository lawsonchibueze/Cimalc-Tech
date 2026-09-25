import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Account", template: "%s | Cimalc Tech" },
  description: "Sign in to manage your Cimalc Tech quotes and account.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      {children}
    </main>
  );
}
