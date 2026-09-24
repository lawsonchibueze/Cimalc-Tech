export const SESSION_COOKIE_NAMES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

export function hasSessionCookie(cookieHeader: string | null) {
    return SESSION_COOKIE_NAMES.some((name) => cookieHeader?.includes(`${name}=`));
}

/**
 * Accepts only same-site paths, so a crafted `?redirect=` cannot send someone
 * to another website after signing in.
 */
export function safeRedirectPath(value: string | null | undefined, fallback: string | null = null) {
    if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
    return value;
}

export function defaultDestination(role: string | undefined) {
    return role === "ADMIN" ? "/admin" : "/account";
}
