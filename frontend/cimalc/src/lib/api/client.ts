/**
 * Where API calls go. By default the browser talks only to this site, and Next.js
 * forwards /backend and /api/auth to the API (see next.config.ts). Cookies are
 * then first party, so sign-in survives browsers that block third-party cookies.
 * Setting NEXT_PUBLIC_API_URL skips the proxy and calls the API directly.
 */
const trimSlashes = (value: string) => value.replace(/\/+$/, "");
const directUrl = process.env.NEXT_PUBLIC_API_URL ? trimSlashes(process.env.NEXT_PUBLIC_API_URL) : undefined;
export const apiBaseUrl =
  directUrl ?? (typeof window === "undefined" ? trimSlashes(process.env.BACKEND_URL ?? "http://localhost:8000") : "/backend");

/** Base of the Better Auth routes. Same origin when proxied, which is what Google redirects back to. */
export const authBaseUrl = directUrl ? `${directUrl.replace(/\/api\/auth$/, "")}/api/auth` : "/api/auth";

/** An API error that keeps the HTTP status so callers can react to 401, 403 or 409. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function messageFrom(payload: unknown, status: number) {
  const message = (payload as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join(" ");
  if (typeof message === "string" && message) return message;
  return `Request failed (${status})`;
}

/** Best message to show a person for any thrown value. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, credentials: "include", headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(messageFrom(payload, response.status), response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function toQueryString(params: Record<string, string | number | boolean | undefined | null>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}
