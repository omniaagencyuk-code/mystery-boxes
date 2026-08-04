# Mystery-Boxes.com

An affiliate comparison and review site for mystery box operators, serving the UK
and US markets from one codebase. No payments, no visitor accounts, no prizes.
All monetisation is via outbound tracking links.

Stack: Next.js (App Router, TypeScript), Tailwind CSS, Supabase, Vercel.

## Local setup

1. Install dependencies.

   ```bash
   npm install
   ```

2. Create `.env.local` from the example and fill in your Supabase values.

   ```bash
   cp .env.example .env.local
   ```

   Use the current Supabase key format: a publishable key (`sb_publishable_...`)
   and a secret key (`sb_secret_...`). The secret key is server side only.

3. Apply the database schema. All schema lives in `supabase/migrations/` as
   timestamped SQL. With the Supabase CLI linked to your project:

   ```bash
   supabase db push
   ```

   For local development, `supabase db reset` also applies `supabase/seed.sql`,
   which loads clearly marked placeholder operators, offers, reviews and pages.
   That seed file is never pushed to a remote database.

4. Run the dev server.

   ```bash
   npm run dev
   ```

## How geo works

Two separate behaviours, kept apart in the code:

- Soft market suggestion. The proxy (`src/proxy.ts`) reads the visitor country
  from Vercel headers and, if it differs from the market being viewed, shows a
  dismissable switch banner. It never redirects on IP, so the UK section stays
  indexable by mostly-US crawlers.
- Hard geo block. Operators flagged `requires_geo_block` for the visitor's
  detected market return a 404 on their review page and are excluded from every
  listing. The proxy 404s early; the review page re-checks against the database
  as the authoritative backstop.

### Simulating geo locally

Vercel geo headers are not present locally. In development you can simulate a
location with a query param or cookie:

```
http://localhost:3000/uk?geo=US-WA   # United States, Washington
http://localhost:3000/uk?geo=GB      # United Kingdom
```

## Admin dashboard

The dashboard lives at `/admin` and manages operators, reviews, categories,
pages, posts, offers, affiliate links and media. It is never indexed.

Access model:

- Admin sign in uses Supabase Auth (email and password). There is no public
  sign-up.
- Only users on the `admins` allowlist can use it. Everyone else sees a
  not-authorised message.
- All writes run server side with the secret key after the session and admin
  status are verified. Public RLS stays read-only.

### Create the first admin

1. In the Supabase dashboard, go to Authentication and add a user with an email
   and password.
2. Add that user to the allowlist. In the SQL editor run:

   ```sql
   insert into public.admins (user_id, email, name, active)
   select id, email, 'Your name', true
   from auth.users
   where email = 'you@example.com';
   ```

3. Sign in at `/admin/login`.

### Media storage

Run `supabase/storage-setup.sql` once against your project. It creates a public
`media` bucket and a public read policy. Uploads and deletes happen server side
with the secret key.

### Affiliate links

Manage outbound links under Affiliate links. Each has a slug and is reachable at
`/go/<slug>`, which records a click and redirects to the target. Use these
cloaked links in content instead of raw affiliate URLs.

## Compliance

Compliance furniture is decided only by `operator_type`, in `src/lib/compliance.ts`:

- `digital_unboxing`: 18+, BeGambleAware, licence details when present, #ad, and
  GamStop on UK pages.
- `physical_retail`: affiliate disclosure (#ad) only, never gambling messaging.

## Open items to confirm before launch

- US responsible-gambling reference for digital operators. BeGambleAware and
  GamStop are UK bodies (GamStop is already UK-only). No US equivalent has been
  invented; confirm the correct US reference. See the note in
  `src/lib/compliance.ts`.
- Replace all `PLACEHOLDER` seed content with verified operator data, ratings,
  licence numbers and offer terms.
- Set `NEXT_PUBLIC_SITE_URL` in production so canonical, hreflang and sitemap
  URLs are absolute and correct.

## Project layout

- `supabase/migrations/` timestamped schema with RLS from creation
- `supabase/seed.sql` local-dev placeholder content
- `src/proxy.ts` geo detection, soft suggestion, hard block
- `src/lib/` env, geo, compliance, SEO, Supabase clients, data access
- `src/components/` operator card (full / compact / table_row), compliance,
  breadcrumbs, banner
- `src/app/` routes: `/` chooser, `/[market]`, `/[market]/[slug]`,
  `/[market]/reviews/[operator]`, `sitemap`, `robots`
