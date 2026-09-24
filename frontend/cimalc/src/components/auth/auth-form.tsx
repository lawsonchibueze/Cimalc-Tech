"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/lib/auth/auth-client";
import { defaultDestination, safeRedirectPath } from "@/lib/auth/session";
import { errorMessage } from "@/lib/api/client";
import { sessionKeys } from "@/lib/queries/account";
import { passwordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AuthMode = "signin" | "signup" | "forgot" | "reset";

const emailSchema = z.string().trim().email("Enter a valid email address.");

const copy: Record<AuthMode, { title: string; intro: string; submit: string }> = {
    signin: { title: "Welcome back", intro: "Save quotes, track requests, and manage your Cimalc Tech experience.", submit: "Sign in" },
    signup: { title: "Create your account", intro: "Save quotes, track requests, and manage your Cimalc Tech experience.", submit: "Create account" },
    forgot: { title: "Reset your password", intro: "We’ll send a secure reset link to your email.", submit: "Send reset link" },
    reset: { title: "Choose a new password", intro: "Pick a password you have not used elsewhere.", submit: "Save new password" },
};

const linkClass = "font-medium text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

export function AuthForm({ mode }: { mode: AuthMode }) {
    const router = useRouter();
    const params = useSearchParams();
    const queryClient = useQueryClient();
    const redirect = safeRedirectPath(params.get("redirect"));
    const token = params.get("token");
    const linkProblem = mode === "reset" && (!token || params.get("error"));

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [sentTo, setSentTo] = useState<string | null>(null);

    const withRedirect = (path: string) => (redirect ? `${path}?redirect=${encodeURIComponent(redirect)}` : path);

    /** Reads the new session, shares it with the rest of the app and goes to the right place. */
    async function finishSignIn() {
        const session = await authClient.getSession();
        queryClient.setQueryData(sessionKeys.current, session?.user ?? null);
        router.replace(redirect ?? defaultDestination(session?.user.role));
    }

    function validate(): string | null {
        if (mode !== "reset") {
            const emailResult = emailSchema.safeParse(email);
            if (!emailResult.success) return emailResult.error.issues[0].message;
        }
        if (mode === "signin" && !password) return "Enter your password.";
        if (mode === "signup" && name.trim().length < 2) return "Enter your name.";
        if (mode === "signup" || mode === "reset") {
            const passwordResult = passwordSchema.safeParse(password);
            if (!passwordResult.success) return passwordResult.error.issues[0].message;
        }
        if (mode === "reset" && password !== confirm) return "Passwords do not match.";
        return null;
    }

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setError("");
        const problem = validate();
        if (problem) return setError(problem);

        setLoading(true);
        try {
            if (mode === "forgot") {
                await authClient.requestPasswordReset(email.trim());
                setSentTo(email.trim());
            } else if (mode === "reset") {
                await authClient.resetPassword({ token: token ?? "", newPassword: password });
                toast.success("Password updated. Sign in with your new password.");
                router.replace("/auth/sign-in");
            } else {
                if (mode === "signup") await authClient.signUp.email({ name: name.trim(), email: email.trim(), password });
                else await authClient.signIn.email({ email: email.trim(), password });
                toast.success(mode === "signup" ? "Account created" : "Welcome back");
                await finishSignIn();
            }
        } catch (requestError) {
            setError(errorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }

    async function google() {
        setError("");
        setLoading(true);
        try {
            await authClient.signIn.google(withRedirect("/auth/continue"));
        } catch (requestError) {
            setError(errorMessage(requestError, "Google sign-in failed."));
            setLoading(false);
        }
    }

    const { title, intro, submit: submitLabel } = copy[mode];
    const showSocial = mode === "signin" || mode === "signup";

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm md:p-8">
            <div className="mb-8">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-brand text-sm font-bold text-white" aria-hidden="true">C</div>
                <h1 className="text-2xl font-bold tracking-tight text-default">{title}</h1>
                <p className="mt-2 text-sm leading-6 text-muted">{intro}</p>
            </div>

            {sentTo ? (
                <div role="status" className="flex flex-col items-center gap-3 rounded-md bg-background p-6 text-center">
                    <MailCheck className="h-8 w-8 text-success" aria-hidden="true" />
                    <p className="text-sm leading-6 text-default">If an account exists for <span className="font-semibold">{sentTo}</span>, a reset link is on its way. It expires in one hour.</p>
                    <Link href="/auth/sign-in" className={linkClass}>Back to sign in</Link>
                </div>
            ) : linkProblem ? (
                <div role="alert" className="space-y-4 rounded-md bg-error-bg p-4 text-sm text-error">
                    <p>This reset link is invalid or has expired.</p>
                    <Link href="/auth/forgot-password" className={linkClass}>Request a new link</Link>
                </div>
            ) : (
                <>
                    {showSocial && <Button type="button" variant="secondary" className="w-full" onClick={google} disabled={loading}>Continue with Google</Button>}
                    {showSocial && <div className="my-5 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-border" />or continue with email<span className="h-px flex-1 bg-border" /></div>}
                    <form onSubmit={submit} className="space-y-4" noValidate>
                        {mode === "signup" && <Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />}
                        {mode !== "reset" && <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />}
                        {mode !== "forgot" && <Input label={mode === "reset" ? "New password" : "Password"} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} hint={mode === "signup" || mode === "reset" ? "Use at least 8 characters." : undefined} />}
                        {mode === "reset" && <Input label="Confirm new password" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" />}
                        {error && <p role="alert" className="rounded-sm bg-error-bg px-3 py-2 text-sm text-error">{error}</p>}
                        <Button type="submit" className="w-full" isLoading={loading}>{submitLabel}</Button>
                    </form>
                </>
            )}

            <div className="mt-6 text-center text-sm text-muted">
                {mode === "signup" && <>Already have an account? <Link href={withRedirect("/auth/sign-in")} className={linkClass}>Sign in</Link></>}
                {mode === "signin" && <>New to Cimalc Tech? <Link href={withRedirect("/auth/sign-up")} className={linkClass}>Create an account</Link><br /><Link href="/auth/forgot-password" className="mt-3 inline-block text-xs text-muted hover:text-brand">Forgot password?</Link></>}
                {(mode === "forgot" || mode === "reset") && !sentTo && <Link href="/auth/sign-in" className={linkClass}>Back to sign in</Link>}
            </div>
        </motion.div>
    );
}
