# Cimalc Tech API

NestJS 12 API with Prisma 7 on PostgreSQL and Better Auth. Customers browse a catalogue and request quotes. Staff manage the catalogue, quotes and contact messages.

## Setup

```bash
npm install
cp .env.example .env        # then fill in the required values
npx prisma migrate deploy   # apply migrations, see the note on DIRECT_URL below
npm run start:dev
```

If the database sits behind a connection pooler, for example a Neon host with `-pooler` in its name, migrations fail with a connection error. Put the direct address in `DIRECT_URL`. The API itself keeps using `DATABASE_URL`.

Run `npx prisma generate` after changing `prisma/schema.prisma`. The generated client is committed in `src/generated/prisma`.

## First administrator

1. Sign up through the storefront.
2. Add the account email to `ADMIN_EMAILS`.
3. Restart the API. Existing accounts on that list are promoted to `ADMIN`.

Administrators can then change other users' roles from the admin area. Roles cannot be changed through any customer route.

## Route overview

| Area | Routes | Access |
| --- | --- | --- |
| Catalogue | `GET /products`, `/products/featured`, `/products/new-arrivals`, `/products/:slug`, `/products/:slug/related` | Public, published products only |
| Categories | `GET /categories`, `/categories/:slug`, `/categories/:slug/products` | Public |
| Quotes | `POST /quotes`, `PATCH /quotes/:id/cancel`, `POST /quotes/:id/messages`, `GET /me/quotes` | Guest can create, others need a session |
| Contact | `POST /contact` | Public |
| Profile | `GET /me`, `PATCH /me` | Session |
| Admin | `/admin/products`, `/admin/categories`, `/admin/quotes`, `/admin/contact-messages`, `/admin/users`, `/admin/uploads`, `/admin/stats` | `ADMIN` only |
| Auth | `/api/auth/*` | Better Auth |

List endpoints return `{ data, meta: { page, limit, total, totalPages } }` and accept `page` and `limit`. The default page size is 20 and the maximum is 100.

## Images

Admins upload directly to R2 with a short lived presigned URL, so files never pass through the API.

1. `POST /admin/uploads/presign` returns an upload URL and the public URL.
2. The browser `PUT`s the file to R2.
3. `POST /admin/uploads/confirm` checks the stored file.

The R2 bucket needs a CORS rule that allows `PUT` from the frontend origin. Files that are removed from a product, or belong to a deleted product, are deleted from R2 automatically.

## Email

Password reset, quote confirmations, replies and staff notifications use Resend. Set `RESEND_API_KEY` and `MAIL_FROM` to enable it. Without them the API writes each email to the server log, which is enough for local development.

## Scripts

```bash
npm run build      # compile
npm run lint       # oxlint
npm test           # unit tests
```
