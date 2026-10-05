# Jarz Digital websites: USA and Canada

Two fully separate country sites, built from one codebase with the same design.
- **USA:** `/` (homepage), `/dallas-tx/`, `/miami-fl/`, `/baltimore-md/`, `/denver-co/`
- **Canada:** `/ca/` (homepage), `/ca/toronto-on/`, `/ca/brampton-on/`, `/ca/mississauga-on/`, `/ca/calgary-ab/`, `/ca/alberta/`

Every page is a single page with no header. Each one includes:
- 12 services.
- The calculator and growth sections directly under the services.
- City buttons near the top, linking the cities of that country.
- Long-form content.

## Canada as a separate site
- **No links to the USA site:** Canadian pages have no country switcher and no links or language tags pointing to the US site.
- **No US references:** the Canadian copy, footer and structured data no longer mention US offices, US clients or US comparisons.
- **Language tags:** each page declares only its own language and region (`en-CA` for Canada, `en-US` for the USA).
- **City navigation:** each location page links to the other Canadian cities through the "Our locations" buttons near the top. There is no separate "other cities" block at the bottom.

## Growth plans in the calculator
Every calculator now compares three plans: **Ads only**, **Ads + SEO**, and **Ads + SEO + Business management**.
- **Plan buttons:** the plan buttons sit at the top of the calculator, and the summary bar shows Month-12 revenue for the chosen plan.
- **Results range:** Conservative, Expected or Strong, for SEO and management results.
- **"12-month plan" tab (the default):** Month-12 revenue, year-1 revenue, profit, leads and cost per customer, plus how much more revenue each plan earns than Ads only.
- **Growth plans section** under the calculator: three plan cards, a 12-month chart, a month-by-month table and plain-English notes on what each plan adds.
- **Optional investment fields:** monthly SEO and business management amounts, so profit can be shown after fees. Prices are not shown on the site.
- **Planning ranges** (`src/us/plans.ts`, all in one table):

  | Assumption | Conservative | Expected | Strong |
  |---|---|---|---|
  | Organic visitors by Month 12 | 1.8× | 3× | 5× |
  | Organic visitors who become leads | 2% | 2.5% | 3% |
  | Extra ad conversions (management) | +5% | +8% | +15% |
  | Extra leads closed (management) | +8% | +15% | +25% |
  | Extra repeat business (management) | +15% | +30% | +50% |
  | Extra organic lift (management) | +10% | +20% | +35% |

  - **Timing:** SEO ramps slowly for three months and then compounds. Management gains arrive by Month 3.
  - **Supporting data:** replying within 5 minutes makes a lead 21× more likely to qualify (Lead Response Management Study); 62% of calls to small businesses go unanswered (411 Locals); the first Maps result gets 14.8% of clicks (First Page Sage, 2026).
  - **Status:** these are planning ranges, still to be confirmed against published SEO growth studies.
- **Example, Toronto HVAC at CA$1,500 a month in ads, Month-12 revenue per month:**

  | Range | Ads only | Ads + SEO | Ads + SEO + Management |
  |---|---|---|---|
  | Conservative | $13,380 | $19,420 | $23,180 |
  | Expected | $13,380 | $32,255 | $45,365 |
  | Strong | $13,380 | $58,679 | $104,576 |

## Mobile app view
- **Bottom app bar:** Home, Services, Calculator, Results and WhatsApp.
- **Swipe cards:** content sections show as cards you swipe sideways, each with a discreet "Swipe to explore" label.
- **Small touches:** a reading-progress line at the top, press feedback on cards and buttons, and contact options shown as compact app-style rows.
- **Calculator on phones:**
  - Result tabs show one card at a time.
  - The summary bar stays pinned at the top.
  - Platforms sit in one swipeable row.
  - Input groups fold away.
  - Charts redraw at phone width.
- **Installable:** the site can be added to the home screen (PWA manifest). Tap targets are 44px or larger, and pages never scroll sideways.

## What's inside
- **`website/`:** the finished sites, ready to upload to the root of jarzdigital.com. Pages are pre-rendered HTML.
  - Also includes `sitemap.xml` (11 pages), `robots.txt`, images, and cache settings (`_headers` for Netlify or Cloudflare, `vercel.json` for Vercel).
- **`source/`:** the React + TypeScript source.
  - Run `npm install`, then `npm run site:dev` to edit, and `npm run site:build` to rebuild.
  - **USA content:** `src/site/content.ts`, `longform.ts`, `more.ts`.
  - **Canada content:** `src/site/ca/content.ts`, `longform.ts`, `more.ts`, `index.ts`.
  - **Calculator data:** USA in `src/us/data.ts`, Canada in `src/ca/data.ts`.

## Canada calculator data (CAD, researched Oct 2026)
- **61 categories:** the 55 standard categories plus 6 Canadian ones (snow removal, basement finishing and legal suites, immigration consultants, RMT, truck driving schools, mortgage brokers).
- **Cost per click:** set per category from Canadian 2026 sources.
  - Consultus Digital: national ranges.
  - Hetman: Alberta benchmarks.
  - Brand Butter: Canadian ranges.
  - Creative Scope: Toronto headline keywords.
  - ScopeX Media: Calgary headline keywords.
  - CiCon Marketing: "dentist near me" about $14.60.
- **Local Services Ads per lead (Toronto 2026, Creative Scope):** electrical about $39, HVAC $51, plumbing $57, drain $59.
- **City adjustments:** Toronto +35%, Mississauga +25%, Brampton +20%, Calgary +15%, Alberta at the base rate.
- **Job values in CAD:**
  - Toronto furnace: $3,500–7,000 installed.
  - Roof replacement: $9,000–15,000.
  - Toronto plumbers: $200–300 an hour.
  - Ontario AZ truck course: $7,000–10,000.
- **Conversion rates:** published category rates (WordStream / LocaliQ 2025). Every value can be edited in the calculator.

## SEO audit (Oct 2026)
| Page | Words | Title |
|---|---|---|
| `/ca/` | about 11,500 | Local SEO Services & Google Ads Agency Canada |
| `/ca/toronto-on/` | about 10,500 | SEO Company Toronto: Local SEO & Google Ads |
| `/ca/brampton-on/` | about 10,300 | SEO Company Brampton: Local SEO & Web Design |
| `/ca/mississauga-on/` | about 10,200 | Mississauga SEO Company & Google Ads Agency |
| `/ca/calgary-ab/` | about 10,400 | SEO Company Calgary: Google Ads & Web Design |
| `/ca/alberta/` | about 10,200 | Alberta SEO Agency: Local SEO & Google Ads |
| US pages | 9,600–10,500 | unchanged |

- **Technical audit, all 11 pages, no issues:**
  - One H1 per page and no skipped heading levels.
  - No broken links or duplicate headings.
  - Valid structured data: Organization, Jarz Digital Canada, Service catalogue, FAQPage, Breadcrumb.
- **City targeting on location pages:**
  - Every heading names the city.
  - Every FAQ question names the city.
  - The keyword line lists only that city's searches.
- **City keyword placement (Canada):** each location page's main keyword appears in the title, H1, meta description, opening text and a section heading.
  - Toronto: "SEO company in Toronto".
  - Brampton: "SEO company in Brampton".
  - Mississauga: "Mississauga SEO agency".
  - Calgary: "Calgary SEO company".
  - Alberta: "Alberta SEO agency".
- **Lighthouse (Canada pages):**
  - Mobile: Performance 94–98, and 100 for Accessibility, Best Practices and SEO.
  - Desktop: Performance 99–100, and 100 for Accessibility, Best Practices and SEO.
- **Images:** Canadian proof screenshots are served as WebP, about 50% smaller.
- **Statistics:** headline figures (500+ websites, 500+ clients, 10+ years) appear as fixed numbers, so they never show a partial count.
- **Copy:** formal and professional, in Canadian English on the Canada site (neighbourhood, centre, licence, defence). Canadian topics covered: CASL, PIPEDA and Alberta's PIPA, AODA accessibility, the Google Verified badge, and French and multilingual AI agents.

## Canada keyword map (Google autocomplete, Canada)
| Page | Main keywords |
|---|---|
| `/ca/` | local seo services canada, ai seo agency canada, google ads agency canada, ai receptionist canada, chatgpt seo |
| Toronto | seo company toronto, seo services toronto, local seo company toronto, ppc agency toronto, web design company toronto, ai seo agency toronto |
| Brampton | seo company brampton, seo services brampton, local seo brampton, web design company brampton, digital marketing agency brampton |
| Mississauga | mississauga seo agency, seo company mississauga, local seo mississauga, website development mississauga, google ads agency mississauga |
| Calgary | seo company calgary, seo services calgary, local seo services calgary, web design calgary, google ads calgary |
| Alberta | alberta seo agency, seo company alberta, seo edmonton, web design edmonton, digital marketing alberta |

The pages cover both high-cost keywords (personal injury, immigration, mortgage, HVAC, roofing, dental implants) and low-cost ones (restaurants, cleaning, tires, salons, RMT).

## Proof used on the Canada site (client names, addresses, phones and signage blurred)
- Richmond Hill auto repair: #1 in the map results, 5.0 stars from 492 reviews.
- Calgary beauty and spa: first business listing, directly beneath the only paid ad, 4.9 stars.
- 1,845 calls in one month from a Google Business Profile (June 2026).
- GTA massage and physiotherapy clinic: 442 reviews, top result with sitelinks.
- E-commerce reports: $122,458 sales and 1,859 orders, and $85,396 sales and 1,285 orders.

## Go live
1. Upload the contents of `website/` to the root of jarzdigital.com.
2. In Google Search Console:
   - Submit `sitemap.xml`.
   - Request indexing for the 11 pages.
3. For Canada, these off-site steps matter as much as the content:
   - A Canadian Google Business Profile for the Calgary team.
   - A Canadian phone number.
   - Listings on Yelp.ca, YellowPages.ca, Canada411, Clutch and Bing Places.
   - Google reviews from Canadian clients.

## Contact on the site
WhatsApp +880 1677-248045, Facebook and jarzdigital36@gmail.com. There is no contact form.
