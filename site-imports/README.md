# site-imports: externally built sites, before they are ported

This folder holds standalone sites built outside this project (Vite/React apps with their own
`package.json`, `source/` and built `website/` output). They are **raw material, not part of the app**:
TypeScript and ESLint ignore this folder, and nothing here is served.

| Folder | Ported to | Live at |
|---|---|---|
| `jarz-digital-proposal/` | `src/components/proposal/` | `/proposal` and `/bangladesh` (Bangladesh · Dhaka) |
| `jarz-digital-ads-calculator/` | already in `src/components/proposal/` (same calculator; this drop only renamed its title) | homepage calculator, and the proposal page |
| `jarz-digital-usa/` (newer; includes the Canada content too) | `src/content/country-sites/` + `src/components/country-site/` | `/usa`, `/usa/<city>`, `/canada`, `/canada/<city>` |
| `jarz-digital-canada/` | same as above (older copy of the same codebase) | — |

## Why not `src/components/`?

`src/components/` is for React components the app imports. A whole external project there gets
type-checked and linted as part of the app, ships megabytes of images and build output inside `src/`,
and its `index.html` / `package.json` mean nothing to Next.js. Nothing in it would become a page.

## Adding a new external site (e.g. UK · London)

1. **Drop it here** as `site-imports/jarz-digital-<name>/` (the zip from the builder, unchanged).
2. **Data goes to `src/content/`.** Copy the copy/data files (`.ts` with text, cities, FAQs, numbers)
   verbatim, keeping their folder layout, so the next version can be copied over file by file.
   Only remove things that can't run on the server (e.g. React `createContext`).
3. **UI goes to `src/components/`**, rebuilt with the site's own parts: `Section`, `SectionHeader`,
   `Accordion`, `Reveal`, `WhatsAppButton`, `CtaBanner`. Drop the source's own header, footer and
   mobile app bar — the site layout already has a navbar, footer and WhatsApp button.
   Interactive widgets (calculators) can keep their CSS, scoped under one class.
4. **Routes go to `src/app/(marketing)/<path>/page.tsx`**, with metadata through `pageMetadata()`.
5. **Images** go to `public/images/<name>/` and render with `next/image`.
6. **Register the pages** in `src/lib/seo/pages.ts` (Admin → SEO) and `src/app/sitemap.ts`.
7. **Contact details** come from Admin → Settings, never from numbers hard-coded in the source.

For the UK: the country-site code already supports it — the source's `SiteData` has a `'uk'` market.
Add `site/uk/` data next to `site/ca/`, a `uk` entry in `COUNTRY_SITES`
(`src/content/country-sites/index.ts`), two route files like `src/app/(marketing)/canada/`, and point
the London card in `src/components/sections/home/hero.tsx` at it. The calculator needs a UK market
(`£`, UK cost data) in `src/content/country-sites/us/market.ts`.

## Updating USA or Canada copy from a new build

Copy the changed files from the new build's `source/src/site/`, `us/` or `ca/` over the same paths in
`src/content/country-sites/` (keep the `createContext` lines out of `site/sitedata.ts`), then run
`npm run typecheck`.
