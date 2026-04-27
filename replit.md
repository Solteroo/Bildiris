# Soltero — Türkmenistan Bildirişler Platformasy

A Turkmen-language classifieds (OLX-style) web app for Türkmenistan, designed mobile-first with a black/gold premium look. Starts in Daşoguz region, expandable to all 5 viloyats. Users browse and post free classified ads, with paid VIP highlighting via TMCell mobile transfer (receipt-screenshot + admin approval).

## Architecture

Monorepo (pnpm workspaces) with these artifacts:
- `artifacts/soltero` — main React + Vite + Tailwind v4 web app at `/`
- `artifacts/api-server` — Express 5 + Drizzle backend at `/api`
- `artifacts/mockup-sandbox` — design playground (not for production)

Shared libraries in `lib/`:
- `lib/db` — Drizzle schema and pg client. Tables: `users`, `categories`, `listings`, `favorites`, `payment_requests`.
- `lib/api-spec` — OpenAPI 3.1 spec at `lib/api-spec/openapi.yaml`. Run `pnpm --filter @workspace/api-spec run codegen` after changes.
- `lib/api-zod` — generated Zod schemas (used server-side for validation).
- `lib/api-client-react` — generated React Query hooks (used by the frontend).
- `lib/object-storage-web` — Uppy-based image uploader components (used in soltero).

## Auth

Clerk (white-label) is wired up; sign-in is Gmail / Google OAuth. The `requireAuth` middleware in `artifacts/api-server/src/lib/clerkUser.ts` upserts a row in `users` on first authenticated request and exposes `req.authedUser` to handlers.

## Admin

A user with `users.is_admin = true` can access the `/admin` page (Tölegler / Bildirişler / Ulanyjylar / Statistika tabs) and call `/api/admin/*` endpoints. To bootstrap the first admin: set the `ADMIN_EMAIL` secret to the admin's Gmail address — on next sign-in, `clerkUser.ts` will auto-promote them. After that, admins can promote others via the admin UI.

## Contact / IMO

Single admin contact channel for both seller-buyer messaging (per listing) and Soltero support / advertising sales: IMO. The platform's main admin number is `+91 88268 16138` (stored as `ADMIN_IMO_PHONE` in `artifacts/soltero/src/lib/i18n.ts`). There is no WhatsApp integration — the IMO link format `https://imo.im/{phone}` is used everywhere.

## Object Storage

Replit App Storage. Image upload flow: client requests a presigned URL via `/api/storage/uploads/request-url`, uploads directly, then sends the resulting `objectPath` to the listing/payment endpoints. Uploads are resized client-side (max 1600px long edge, JPEG 0.85) before being sent.

## VIP / Payments

Three plans defined in `artifacts/api-server/src/routes/payments.ts`:
- `1month` — 20 TMT / 30 days
- `3month` — 40 TMT / 90 days
- `lifetime` — 50 TMT, never expires

Payment flow: user contacts admin via IMO to receive the active TMCell account number, transfers via TMCell, takes a screenshot, uploads it on `/vip`. Admin approves/rejects in the `/admin` panel — on approval, `users.vipUntil` or `users.isLifetimeVip` is updated automatically.

Free tier: 3 listings per calendar month, 7 days each. VIP listings get 30 days each and `isVip=true` (highlighted + bumped to top of feeds).

## Categories (seeded)

Run `pnpm --filter @workspace/scripts run seed` to seed the 14 categories. Names are in Turkmen, icons are Lucide React names: Ulaglar, Gozgalmaýan emläk, Elektronika, Öý üçin, Eşik, Iş, Hyzmatlar, Haýwanlar, Çagalar, Sport we dynç alyş, Saz gurallary, Kitaplar, Iş gurallary, Beýlekiler.

## Regions

Six values stored as slugs in `listings.region`: `dashoguz`, `ashgabat`, `ahal`, `balkan`, `lebap`, `mary`. Display names are mapped in `artifacts/soltero/src/lib/i18n.ts`.

## Conventions

- All UI strings are in Turkmen (Latin alphabet).
- Mobile-first layout — content centered in a ~480-560px column even on desktop.
- Theme tokens in `artifacts/soltero/src/index.css`: deep black background, gold (`hsl(44 78% 56%)`) primary. Helper utilities `.gold-text`, `.gold-border`, `.glass`.
- After modifying the OpenAPI spec, run codegen and let TypeScript point you to the route handlers and components that need to update.
- After modifying `lib/db` schema, run `pnpm --filter @workspace/db run push` (use `push-force` only if you understand the data loss).
