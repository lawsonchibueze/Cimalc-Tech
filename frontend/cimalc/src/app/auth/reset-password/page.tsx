import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
    return <Suspense><AuthForm mode="reset" /></Suspense>;
}
