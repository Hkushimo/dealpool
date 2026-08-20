# DealPool

DealPool is a small private Next.js application for tracking pooled participation in individual deals.

## Environment Variables

Create `.env.local` for development:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SECRET_KEY=
```

`SUPABASE_SECRET_KEY` is server-only and must never be renamed to `NEXT_PUBLIC_*`. Supabase Auth is not used; DealPool stores salted password hashes in Postgres and uses an HTTP-only session cookie.

This repository ignores `.env`, `.env.*`, and `credentials.txt`.

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Apply Supabase Migration

Apply the SQL in:

```bash
supabase/migrations/0001_initial_schema.sql
```

You can paste it into the Supabase SQL editor, or run it with the Supabase CLI after linking the project:

```bash
supabase db push
```

The migration creates:

- `users`
- `sessions`
- `deals`
- `participations`
- enum statuses
- a `deal_funding_totals` view

Confirmed funding is calculated from confirmed participations. It is not stored as an editable deal field.

## Make The Initial User An Admin

1. Start the app and sign up with your username.
2. In Supabase, open SQL editor.
3. Run:

```sql
update public.users
set is_admin = true
where username = 'your_username';
```

Sign out and back in if the admin link does not appear immediately.

## MVP Flow

1. Admin opens `/admin/deals/new`.
2. Admin creates a deal.
3. Admin copies the generated `/d/[slug]` URL.
4. Friend opens the URL, signs up or logs in, and enters a participation amount.
5. The participation is stored as `pending`.
6. Admin receives payment outside the app.
7. Admin opens `/admin/deals/[id]` and confirms the participation.
8. Confirmed funding and share percentages update from confirmed participation totals.

## Deployment Later

This project includes OpenNext Cloudflare scripts:

```bash
npm run cf:build
npm run cf:preview
npm run cf:deploy
```

Before deployment, set the same environment variables in Cloudflare:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SECRET_KEY`, only as a secret

Use the deployed domain for `NEXT_PUBLIC_SITE_URL` so copied deal links use the production URL.

## Recommended Deployment: GitHub + Cloudflare

1. Create a private GitHub repository.
2. Push this project to the repo.
3. In GitHub, set repository variables:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SITE_URL
```

4. In GitHub, set repository secrets:

```txt
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
SUPABASE_SECRET_KEY
```

5. Push to the `main` branch. The workflow in `.github/workflows/deploy-cloudflare.yml` builds and deploys the Cloudflare Worker.

Create the Cloudflare API token with Workers deploy permissions for the target account. Keep `SUPABASE_SECRET_KEY` as a secret only.

