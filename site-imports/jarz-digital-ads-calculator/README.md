# Jarz Digital — Ads Revenue & Profit Calculator

## Ads-Revenue-Calculator.html
The finished calculator page in one file (English + Bangla). Double-click to open, or upload it to any website
(WordPress, Webflow, cPanel) and link to it.

## website-component/ads-calculator (React + TypeScript)
For a Next.js site like jarzdigital.com:
1. Copy the `ads-calculator` folder to `src/components/ads-calculator/`.
2. Create `src/app/ads-calculator/page.tsx`:

```tsx
import type { Metadata } from 'next'
import AdsCalculatorPage from '@/components/ads-calculator/AdsCalculatorPage'

export const metadata: Metadata = {
  title: 'Ads Revenue & Profit Calculator | Jarz Digital',
  description: 'See what your Facebook and Google ad budget can bring in orders, sales and profit, from $50 a month.',
}

export default function Page() {
  return <AdsCalculatorPage />
}
```

3. For Bangla, load the Hind Siliguri font (next/font/google) in `app/layout.tsx`. Geist is already on the site.
4. Open `/ads-calculator`.

Styles are scoped under `.jdp`, so nothing else on the site changes.

## What to edit
- `calc/model.ts` — the formulas (ad views → clicks → orders, returns, repeat buyers, break-even, 6-month forecast).
- `calc/presets.ts` — starting values for each business type, and the default budget ($300, minimum $50).
- `calc/strings.ts` — all wording in English and Bangla.
