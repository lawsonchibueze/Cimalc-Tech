# Cimalc Tech storefront

Next.js 16 storefront and admin area for Cimalc Tech. Customers browse the catalogue and request quotes. Staff manage products, categories, quotes, contact messages and users. It talks to the NestJS API in `../../api`.

## Setup

```bash
npm install
cp .env.example .env.local   # then adjust the values
npm run dev                  # http://localhost:3000
```

Start the API first, see `../../api/README.md`. Sign up on the site, then follow the "First administrator" steps in the API README to get access to `/admin`.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Public URL of the API |
| `NEXT_PUBLIC_SITE_URL` | This site's public URL, used for canonical links, the sitemap and structured data |
| `NEXT_PUBLIC_MEDIA_URL` | Same value as `R2_PUBLIC_URL` in the API. Needed so product photos can be optimised |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional. Overrides the official contact email in `site.ts` |
| `AUTH_ENFORCE_PROTECTION` | Optional. Redirects signed out visitors early, needs a shared cookie domain |

`NEXT_PUBLIC_` values are baked in at build time, so rebuild after changing them.

## Where things live

| Path | What it holds |
| --- | --- |
| `src/lib/config/site.ts` | Business name, phone, email, Instagram, WhatsApp, address and navigation. Edit here, not in components |
| `src/lib/config/upload.ts` | Image limits, mirrored from the API |
| `src/lib/api/` | One module per API area. Errors are `ApiError` with the HTTP status |
| `src/lib/auth/` | Auth client, the shared `useSession` hook and safe redirects |
| `src/lib/content/faq.ts` | FAQ copy. Add delivery and return terms once there is a written policy |
| `src/components/auth/require-auth.tsx` | Keeps the wrong people out of `/account` and `/admin` |

## Access control

The interface hides admin screens from people without the admin role, but the API is what actually enforces it. Every admin route rejects requests without an administrator session, so hiding a page is never the only protection.

For sign-in to work across two sites, both must share a registrable domain, for example `shop.example.com` and `api.example.com`. Set `COOKIE_DOMAIN=example.com` in the API. Browsers that block third party cookies otherwise drop the session cookie.

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # TypeScript
```
