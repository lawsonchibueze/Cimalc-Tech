"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SignOutProvider } from "@/components/auth/sign-out-provider";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                    },
                },
            }),
    );

    return (
        <ThemeProvider><QueryClientProvider client={queryClient}><SignOutProvider>
            {children}
            <Toaster richColors position="top-center" />
        </SignOutProvider></QueryClientProvider></ThemeProvider>
    );
}
