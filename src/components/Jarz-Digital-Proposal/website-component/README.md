# Add the proposal page to jarzdigital.com

`jarz-proposal/` is a self-contained React + TypeScript page: the full 6-month growth proposal on one page, with the ads profit calculator, in English and Bangla. All its styles are scoped under `.jdp`, so it will not change anything else on the site.

## Next.js (App Router) — about 5 minutes
1. Copy the `jarz-proposal` folder into your site, for example `src/components/jarz-proposal/`.
2. Create the page file `src/app/proposal/page.tsx`:

```tsx
import type { Metadata } from 'next'
import JarzProposalPage from '@/components/jarz-proposal/JarzProposalPage'

export const metadata: Metadata = {
  title: '6-Month Digital Growth Plan | Jarz Digital',
  description: 'Website, SEO, ads, social media and content in one plan, with a profit calculator for your ad budget.',
}

export default function Page() {
  return <JarzProposalPage />
}
```

3. Fonts: the site already uses Geist. For the Bangla version, add Hind Siliguri in `app/layout.tsx`:

```tsx
import { Hind_Siliguri } from 'next/font/google'
const hind = Hind_Siliguri({ subsets: ['bengali', 'latin'], weight: ['400', '500', '600', '700'] })
// add hind.className to <body className=...>
```

4. Run `npm run dev` and open `/proposal`.

The page component already starts with `'use client'`. JSON and image imports work in Next.js without extra setup.

## Other React sites (Vite, CRA)
Copy the folder, then render `<JarzProposalPage />` on any route. Load the fonts once in your HTML:
`https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@500;600&family=Hind+Siliguri:wght@400;500;600;700&display=swap`

## Not a React site (WordPress, Webflow, etc.)
Upload `../Jarz-Digital-Proposal-v2/Jarz-Digital-Proposal-Page.html` and link to it, or embed it in a full-width iframe. It is one file with everything inside.

## Editing
- Calculator formulas: `calc/model.ts`. Business-type starting values: `calc/presets.ts`. Calculator wording (EN + BN): `calc/strings.ts`.
- Proposal text: `content/en.json` and `content/bn.json` (generated from `../proposal-source/copy_*.py`).
- The working project with live preview is `../proposal-app/` (`npm run dev`). After changes, copy its `src/` here again (without `main.tsx`).
