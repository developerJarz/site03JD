# Jarz Digital website: USA (updated calculator version)

Pages: `/` (USA homepage), `/dallas-tx/`, `/miami-fl/`, `/baltimore-md/`, `/denver-co/`.

## What's new in this version
- **Growth plans in every calculator:** compare Ads only, Ads + SEO, and Ads + SEO + Business management. Choose a results range (Conservative, Expected or Strong), and the summary bar shows Month-12 revenue for the chosen plan.
- **"12-month plan" tab (first tab):** Month-12 revenue, year-1 revenue, profit and leads, cost per customer, and extra revenue compared with Ads only.
- **Growth plans section under the calculator:** three plan cards, a 12-month chart, a month-by-month table, and notes on what SEO and business management add.
- **Optional investment fields:** monthly SEO and business-management amounts, so profit can be shown after fees. Prices are not shown on the site.
- **App-style mobile view:**
  - Swipe-card sections.
  - Bottom app bar.
  - Result tabs.
  - Compact contact rows.
  - A reading-progress line at the top.
- **Formal copy and fixed statistics.**

## Planning ranges (`source/src/us/plans.ts`)

| Assumption | Conservative | Expected | Strong |
|---|---|---|---|
| Organic visitors by Month 12 | 1.8× | 3× | 5× |
| Organic visitors who become leads | 2% | 2.5% | 3% |
| Management: extra ad conversions | +5% | +8% | +15% |
| Management: extra leads closed | +8% | +15% | +25% |
| Management: extra repeat business | +15% | +30% | +50% |
| Management: extra organic lift | +10% | +20% | +35% |

These are planning estimates, not guarantees.

## Go live
- Upload the contents of `website/` to the root of jarzdigital.com.
- Submit `sitemap.xml` (5 URLs) in Google Search Console.

## Edit
- In `source/`, run `npm install`, then `npm run site:build`. The output goes to `dist-site/`, which contains the USA and Canada sites. This package includes the USA pages only.
- Contact on the site: WhatsApp +880 1677-248045, Facebook and jarzdigital36@gmail.com.
