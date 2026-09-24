import { NextResponse, type NextRequest } from "next/server";
import { hasSessionCookie } from "@/lib/auth/session";

/**
 * Optional early redirect for signed out visitors. It is off by default
 * because it can only see the session cookie when the site and the API share a
 * domain, see COOKIE_DOMAIN in the API. The account and admin sections always
 * check the session themselves, and the API enforces every permission, so
 * turning this on only saves a page load.
 *
 * Next 16 renamed the `middleware` file convention to `proxy`.
 */
export function proxy(request: NextRequest) {
    if (process.env.AUTH_ENFORCE_PROTECTION !== "true") return NextResponse.next();
    if (hasSessionCookie(request.headers.get("cookie"))) return NextResponse.next();

    const signIn = new URL("/auth/sign-in", request.url);
    signIn.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(signIn);
}

export const config = { matcher: ["/account/:path*", "/admin/:path*"] };
