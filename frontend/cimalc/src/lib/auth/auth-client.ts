"use client";

import { ApiError, apiBaseUrl } from "@/lib/api/client";
import type { SessionUser } from "@/types/user";

const authApiUrl = `${apiBaseUrl.replace(/\/api\/auth$/, "")}/api/auth`;

async function authRequest<T = unknown>(path: string, body: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(`${authApiUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(payload?.message ?? "Authentication request failed", response.status);
  }

  return (await response.json().catch(() => null)) as T;
}

/** Better Auth only redirects to absolute URLs on a trusted origin, so relative paths are made absolute here. */
function absolute(path: string) {
  return new URL(path, window.location.origin).toString();
}

export interface AuthSession {
  user: SessionUser;
}

export const authClient = {
  signIn: {
    email: (data: { email: string; password: string }) => authRequest("/sign-in/email", data),

    /** Starts Google sign-in. The browser leaves the site and returns to `callbackPath` on this origin. */
    google: (callbackPath: string) =>
      authRequest<{ url?: string }>("/sign-in/social", { provider: "google", callbackURL: absolute(callbackPath) }).then((result) => {
        if (!result?.url) throw new Error("Google sign-in is not available right now.");
        window.location.assign(result.url);
      }),
  },

  signUp: {
    email: (data: { name: string; email: string; password: string }) => authRequest("/sign-up/email", data),
  },

  requestPasswordReset: (email: string) =>
    authRequest("/request-password-reset", { email, redirectTo: absolute("/auth/reset-password") }),

  resetPassword: (data: { token: string; newPassword: string }) => authRequest("/reset-password", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    authRequest("/change-password", { ...data, revokeOtherSessions: true }),

  signOut: () => authRequest("/sign-out"),

  getSession: async (): Promise<AuthSession | null> => {
    const response = await fetch(`${authApiUrl}/get-session`, { credentials: "include" });
    if (!response.ok) return null;
    const session = (await response.json().catch(() => null)) as AuthSession | null;
    return session?.user ? session : null;
  },
};
