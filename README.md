# Jarz Digital — Agency Platform

The website, CMS, client portal and admin dashboard for **Jarz Digital**, rebuilt from the original WordPress site (jarzdigital.com) on a modern stack.

- **Public website** — marketing site with services, portfolio, industries, team, blog (“Insights”), pricing and a lead-capturing contact form.
- **Client portal** (`/dashboard`) — clients register, submit project requests, follow progress and message the team.
- **Admin** (`/admin`) — a schema-driven CMS for all content, plus leads pipeline, project requests, users & roles, media library, SEO, settings, notifications and an audit log.

All business content (services, pricing, FAQs, team, locations, blog posts, portfolio imagery) was migrated from the original site. See [`docs/CONTENT_INVENTORY.md`](docs/CONTENT_INVENTORY.md) for sources and the items flagged for verification.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS v4 with a token-based design system ([`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)) |
| Motion | Motion (`motion/react`) + CSS keyframes for above-the-fold animation |
| Icons | lucide-react (+ inline SVG brand icons) |
| Database | MongoDB via Mongoose 9 |
| Auth | Custom: scrypt password hashing, server-side sessions (HMAC-hashed tokens, httpOnly cookies), role-based permissions |
| Validation | Zod 4 (shared client/server schemas) |
| Rich text | TipTap 3 editor, `sanitize-html` on the server |
| Email | Provider abstraction: console · SMTP (nodemailer) · Resend · Brevo |
| Media | Storage abstraction: local disk · Cloudinary · S3 (interface ready) |

---

## Quick start (local development)

Requirements: **Node.js 20.9+** (developed on Node 24). No local MongoDB install needed.

```bash
cd jarzdigital-next
npm install

# 1. Environment
cp .env.example .env.local        # then set AUTH_SECRET (see below)

# 2. Database — starts a real mongod on 127.0.0.1:27017, data in ./.data/mongo
npm run db:dev                    # leave running in its own terminal

# 3. Seed the migrated Jarz Digital content (idempotent)
npm run db:seed

# 4. Create your admin account (prompts for a password)
npm run create-admin -- --email you@jarzdigital.com --name "Your Name"

# 5. Run the app
npm run dev                       # http://localhost:3000
```

Sign in at `/login` → you’ll land on `/admin`.

> **Preview without a database:** if `MONGODB_URI` is empty, the public site renders from the migrated seed content in `src/content/seed`. Accounts, admin, forms and uploads require a database (the admin shows a banner).

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm run db:dev` | Local MongoDB (mongodb-memory-server, persisted in `.data/mongo`) |
| `npm run db:seed` | Upsert migrated content (keeps admin edits to settings). `-- --reset` wipes CMS collections first |
| `npm run create-admin -- --email … [--name …] [--role EDITOR]` | Create or promote a staff account |
| `npm run migrate:assets` | Re-copy images from the HTTrack mirror (`../jarzdigital.com`), fetching any files the mirror failed to download |
| `npm run migrate:blog` | Re-extract blog posts from the mirrored RSS feed into `src/content/seed/posts.json` |

---

## Environment variables

All configuration is via environment variables — nothing secret is committed. See [`.env.example`](.env.example).

| Variable | Required | Notes |
|---|---|---|
| `SITE_URL` | yes (prod) | Public origin — `https://www.jarzdigital.com` in production. Used for canonical URLs, sitemap, robots.txt, OG images and email links. A Vercel production build fails if it is missing or set to a `*.vercel.app` host. |
| `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_GTM_ID` | no | GA4 measurement ID or GTM container ID. Loaded only after cookie consent; fires `generate_lead`, `click_call` and `click_whatsapp`. |
| `MONGODB_URI` | yes (prod) | MongoDB connection string (Atlas recommended). |
| `MONGODB_DB` | no | Database name (default `jarzdigital`). |
| `AUTH_SECRET` | **yes (prod)** | Long random string — keys the HMAC used to store session and reset tokens. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `SESSION_TTL_DAYS` | no | Sliding session lifetime (default 30). |
| `ALLOW_REGISTRATION` | no | `false` disables client sign-up (also toggleable in Admin → Settings → Security). |
| `EMAIL_PROVIDER` | no | `console` (default, logs emails), `smtp`, `resend`, `brevo`. |
| `EMAIL_FROM` | no | Sender, e.g. `Jarz Digital <no-reply@jarzdigital.com>`. |
| `ADMIN_NOTIFICATION_EMAIL` | no | Extra recipient for lead / request alerts. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` | if SMTP | |
| `RESEND_API_KEY` | if Resend | |
| `BREVO_API_KEY` | if Brevo | |
| `STORAGE_DRIVER` | no | `local` (default), `cloudinary`, `s3`. |
| `UPLOAD_DIR`, `MAX_UPLOAD_MB` | no | Local upload folder (default `uploads`) and size limit (default 8). |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | if Cloudinary | |
| `S3_*` | if S3 | See *Media configuration*. |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` | no | Optionally create the first admin during `db:seed`. |

---

## MongoDB setup

- **Development:** `npm run db:dev` (no install; the mongod binary is downloaded once).
- **Production:** create a MongoDB Atlas cluster (or self-host MongoDB 6+), create a database user, allow your host’s IPs, and set `MONGODB_URI`.
- Run `npm run db:seed` once against the production database to load the migrated content and create indexes (unique slugs, text indexes, and TTL indexes that expire sessions, reset tokens and old notifications).

## Authentication

- Email + password. Passwords hashed with **scrypt** (N=2¹⁵, parameters stored with each hash).
- Sessions are stored in MongoDB; the browser holds only a random 256-bit token in an **httpOnly, SameSite=Lax** cookie (`__Host-` prefixed and `Secure` in production). The database stores an HMAC of the token, so a database leak can’t be replayed.
- Sessions slide forward on use and are revoked on password change, role change and suspension. Users can sign out other devices.
- Email codes (6-digit OTP) for sign-up and password reset: a new account is created only after the emailed code is confirmed; a reset needs the code plus the new password. Codes expire in 10 minutes, lock after 5 wrong tries, can be re-sent once a minute, and are stored only as HMAC hashes. Reset responses never reveal whether an email exists. Settings live in `src/config/otp.ts`.
- Roles: **ADMIN** (everything), **EDITOR** (content, portfolio, services, team, media, page SEO), **USER** (own account & requests). The single source of truth is [`src/lib/auth/permissions.ts`](src/lib/auth/permissions.ts).

### Creating the first admin

```bash
npm run create-admin -- --email you@jarzdigital.com --name "Your Name"
```
Run the same command for an existing account to promote it. `--role EDITOR` creates an editor. Admins can also change roles in **Admin → Users**.

---

## Media configuration

- **local** (default): files are written to `UPLOAD_DIR` and served by `/media/[...path]` with long-lived caching. Use persistent disk in production (a VPS or container volume — not a serverless filesystem).
- **cloudinary**: set `STORAGE_DRIVER=cloudinary` and the three `CLOUDINARY_*` variables. Uploads are signed server-side.
- **s3**: the driver interface is in [`src/lib/storage/index.ts`](src/lib/storage/index.ts). Install `@aws-sdk/client-s3`, implement `put`/`remove` with `PutObjectCommand`/`DeleteObjectCommand`, and set `S3_BUCKET`, `S3_REGION`, credentials and `S3_PUBLIC_URL`. Add the bucket host to `images.remotePatterns` in `next.config.ts`.

Uploads are validated by **magic bytes** (PNG, JPEG, WebP, GIF, AVIF only — SVG is rejected), size-limited, rate-limited and stored under random names.

## Email configuration

Set `EMAIL_PROVIDER` and the matching credentials. Transactional emails (branded HTML + plain text): sign-up verification code, password reset code, welcome, lead confirmation to the visitor, lead alert to staff, project-request alert, request status/message updates to clients. With `console`, emails are printed to the server log — including sign-up and reset codes, so real users can only sign up or reset once a real provider is configured. Delivery failures are logged and never block the user’s action.

---

## Production build & deployment

```bash
npm ci
npm run build
npm start          # listens on $PORT (default 3000)
```

**Recommended:** a Node host with persistent disk (Railway, Render, Fly.io, a VPS with PM2/systemd, or Docker) + MongoDB Atlas. Put it behind HTTPS.

**Vercel** works with `STORAGE_DRIVER=cloudinary` (serverless file systems are ephemeral — on Vercel, local uploads switch to Cloudinary automatically when its keys are set, and are refused otherwise). Rate limits are stored in MongoDB (`ratelimits` collection, TTL-expired) whenever a database is configured, so all serverless instances share them.

**Domains and redirects.** Production answers only on `SITE_URL`'s host: `*.vercel.app` and the bare/`www` twin are 301-redirected to the same path on it in one hop (legacy WordPress URLs go straight to their new page). Old WordPress URLs are mapped in `src/config/redirects.ts` (pages, dated posts, categories, tags, authors, shop pages, sitemaps) and `src/config/legacy-uploads.json` (migrated `/wp-content/uploads/` images); other `/wp-content/*` files return 410. Next's automatic trailing-slash redirect is off so every old URL is exactly one 301.

Deployment checklist:
1. Set `SITE_URL`, `MONGODB_URI`, `AUTH_SECRET`, email and storage variables.
2. `npm run db:seed` against production, then `npm run create-admin`.
3. Point DNS; old WordPress URLs are 301-redirected to their new routes (see `redirects()` in `next.config.ts`), including `/YYYY/MM/DD/slug` blog links.
4. Submit `https://<domain>/sitemap.xml` in Google Search Console (and Bing Webmaster Tools) and add the verification codes in **Admin → SEO**.

---

## SEO & local SEO

- **Location pages** — every office in **Admin → Settings → Offices & locations** gets `/locations/<city>` (plus the `/locations` overview): address, map, direct contacts, all services, local portfolio projects (matched by project location), FAQ built only from the office’s own details, and links to the other offices. Toggle “Publish a location page” to hide one.
- **Structured data** — Organization (areaServed from office countries, one ContactPoint per office phone, departments linking the offices), a ProfessionalService per office (location-page URL, map link, street address for physical offices), plus Service, FAQPage, BreadcrumbList, BlogPosting and CreativeWork.
- **Page SEO** — built-in pages (Services, Work, Industries, About, Pricing, Insights, Contact, Locations and each location page) take their defaults from [`src/lib/seo/pages.ts`](src/lib/seo/pages.ts); editors override title, description, share image or noindex in **Admin → SEO → Page SEO** (stored in `settings.seo.pages`). CMS content uses its own SEO section.
- **Audit** — Page SEO checks every public page for title/description length, missing descriptions and duplicates, with a “Needs attention” filter. Limits live in [`src/lib/seo/audit.ts`](src/lib/seo/audit.ts).
- **Global SEO** — homepage title/description, title template, keywords, default share image, Google and Bing verification codes.
- Every page emits a canonical URL and Open Graph/Twitter image (falling back to the generated `/opengraph-image`); noindex pages are left out of the sitemap.
- SEO copy for migrated content lives in [`src/content/seed/seo.ts`](src/content/seed/seo.ts), so re-seeding keeps it.
- **Internal links** — each blog post ends with a box for the service matching its category (set the category when publishing), and each service page lists those posts as “Guides” plus “[service] in [city]” links to the location pages ([`src/lib/content/links.ts`](src/lib/content/links.ts)).
- **Content plan** — pillars, topic clusters, scored topics and a 12-week calendar are in [`docs/CONTENT_STRATEGY.md`](docs/CONTENT_STRATEGY.md).

## Architecture

```
src/
  app/
    (marketing)/        Public site: home, services, work, industries, about, team, blog, pricing, contact, CMS pages
    (auth)/             login, register (+ email code), forgot-password (email code + new password); reset-password redirects there
    dashboard/          Client portal
    admin/              Admin (generic [resource] CMS routes + leads, requests, users, media, seo, settings, activity, notifications)
    api/                search, newsletter, views, auth/me, admin/media, admin/search
    media/[...path]     Serves locally stored uploads
    sitemap.ts · robots.ts · opengraph-image.tsx · not-found · error · forbidden
  components/
    ui/                 Primitives: button, form, badge, dialog, toast, accordion, section, icon, logo
    navigation/         Navbar (mega menus), mobile menu, ⌘K search, footer
    sections/           Homepage & shared page sections
    marketing/          Page hero, cards, CTA, JSON-LD, status pages
    blog/ · forms/ · animations/
    admin/              Shell, command palette, tables, charts, CMS editor (fields, TipTap, media picker)
    dashboard/          Client portal shell and widgets
  lib/
    actions/            Server actions (auth, leads, cms, admin, account)
    auth/               Passwords, sessions, tokens, permissions
    cms/                Schema-driven CMS: resource registry, validation, persistence
    data/               Cached public queries (+ seed fallback), admin aggregates
    db/ · email/ · storage/ · security/ · seo/ · validations/ · utils/
  models/               Mongoose models
  content/seed/         Migrated Jarz Digital content (source for seeding and DB-less preview)
  config/ · hooks/ · types/
scripts/                dev-db, seed, create-admin, migrate-assets, extract-blog
public/images/          Migrated brand, portfolio, team, service, blog and location imagery
```

### Rendering & caching
Public pages are statically prerendered (ISR, `revalidate = 3600`) and served in ~20 ms. Data comes from tagged caches; every CMS mutation invalidates the relevant tags **and** paths, so edits appear on the live site immediately. Admin and client portal pages are rendered per request.

### The schema-driven CMS
Each content type (posts, pages, categories, tags, services, projects, industries, team, testimonials, FAQs) is declared once in [`src/lib/cms/resources.ts`](src/lib/cms/resources.ts). That definition drives the admin list, the editor form, server-side Zod validation, slug handling, draft/publish workflow, public URLs and cache invalidation. To add a content type: add a Mongoose model, add a registry entry, map the model in `src/lib/cms/server.ts`.

### Database collections
`users`, `sessions`, `passwordresets`, `posts`, `categories`, `tags`, `services`, `projects`, `industries`, `teammembers`, `testimonials`, `faqs`, `pages`, `leads`, `projectrequests`, `messages`, `media`, `notifications`, `activitylogs`, `subscribers`, `sitesettings`.

Relations: Post → Category, Tags, Author · Project → Industry, Services · Industry → Services · Service → Category, related Services · Lead → Service, User · ProjectRequest → User, Service · Message → ProjectRequest, User · ActivityLog → User.

---

## Security summary
Role-based authorization enforced in every layout, page, server action and route handler (the proxy is only an optimistic first gate) · Zod validation everywhere · CSRF: Server Actions’ built-in origin checks + explicit origin checks on mutating route handlers + SameSite cookies · XSS: React escaping, allow-list HTML sanitization, escaped JSON-LD · rate limiting on sign-in, registration, reset, contact, newsletter, uploads, search and view counting · spam protection (honeypot + interaction time-trap) · secure headers (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) · audit log of staff actions · no secrets in client code.
