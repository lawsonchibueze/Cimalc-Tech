/**
 * Browser origins allowed to call the API and to receive auth redirects.
 * `UI_URL` accepts a comma separated list so that a production domain and,
 * for example, a www variant or a preview domain can be trusted together.
 */
export function getAllowedOrigins(): string[] {
  return (process.env.UI_URL ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}
