# Content inventory & migration notes

Source: the HTTrack mirror at `../jarzdigital.com` (the original WordPress/Elementor site). The mirror was never modified.

## What was migrated

| Content | Source page(s) | Destination |
|---|---|---|
| Business info, phone, WhatsApp, email, mailing address, hours | Home footer, Contact | `src/content/seed/site.ts` → Settings |
| Locations: Dallas, Denver, Calgary (service-based), Dhaka team | Home “Locations”, Contact | Settings → `offices` |
| 8 services incl. pricing plans, inclusions, process, FAQs | Each service page + Subscription | Services |
| 6-step “work strategy planning process” | Home | `growthProcess` (homepage) |
| Mission, vision, values, story, milestones | About | `brandFacts` |
| 9 team members (roles, bios; photos recovered) | Home + About | Team |
| 9 FAQs (homepage + contact) | Home, Contact | FAQs |
| 16 industries | “Work by Industry” menu | Industries |
| 12 portfolio projects + 5 before/after redesigns | Home portfolio imagery, file names | Projects |
| 8 blog posts (full HTML) | `feed/index.html` (RSS) | Posts (`posts.json`) |
| Logo, JD mark, client logos, platform logos | uploads | `public/images/brand`, `clients`, `platforms` |

**Asset recovery:** many images in the mirror were 0-byte failed downloads. `scripts/migrate-assets.mjs --fetch-missing` recovered 37 files from the mirror and downloaded the 37 missing ones (team photos, blog covers, before/after composites, service art) from the live site’s own public URLs. All 74 referenced assets are present.

**Legacy URLs:** every old WordPress URL (service pages, `/about-jarz-digital`, `/contact-jarz-digital`, `/subscription`, `/product/*`, dated blog URLs) 301-redirects to its new route.

## Content written or restructured (flagged `needsReview`)

The original site had no copy for these, so they were drafted from Jarz Digital’s own service descriptions and flagged **Needs review** in the admin:

- **Industry pages** — intro, challenges and solutions for all 16 industries.
- **Project descriptions** — limited to what the published imagery shows (business type, location, channels). **No results or metrics are claimed**; the Results field is empty until verified figures are added.
- **Service “problems we solve”** — reframed from each service page’s own “why” sections.
- **Privacy Policy / Terms** — placeholders, clearly labelled as awaiting legal review and set to `noindex`.

## Items needing verification (not published)

These appeared on the old site but look like template leftovers or unverifiable claims, so they were **not** used:

- About page: “With over 8 years in digital marketing, **Sarah** leads our team…” (the CEO is Rokonuzzaman Jony; the homepage says 12 years).
- About page “Awards & Certifications”: Google Partner, Facebook Marketing Partner, “Best Digital Agency 2024”, HubSpot Certified Partner.
- About page “Key Achievements”: $50M+ client revenue, 10,000+ keywords ranked, 5M+ social reach, 300% average ROI.
- Service-page stat blocks: e.g. “95% ranking improvement”, “300% traffic increase”, “500% engagement increase”, “40% lower CPC”, “4.9/5 satisfaction”.
- Homepage “Locations” intro mentioning **Digital Silk** (another agency’s copy).
- About page “98% client satisfaction” (homepage says 100% — the homepage figure is used).
- “our certification” carousel: these are platform logos (Google etc.), not certifications — not presented as certifications.

Kept (repeated site-wide by Jarz Digital): 500+ global clients, 1,000+ projects, 100% client satisfaction / 5-star reviews, founded 2019, CEO recognized as #1 SEO expert on Fiverr (2023), 300+ businesses ranked by the founder. All homepage/About stats are editable in **Admin → Settings → Homepage stats**.

## Data to confirm with the team

- **Calgary address** is published as “3730108 Ave NE #2138, Calgary, AB T3N IV9” — likely “3730 108 Ave NE … T3N 1V9”. Kept verbatim.
- **Shawn’s photo** on the old site was a generic silhouette — initials are shown until a real photo is uploaded.
- **Social links** — the old footer icons had no URLs. Add them in Admin → Settings → Social links (icons appear only when set).
- **Testimonials** — the old site had none. The section stays hidden until real, approved testimonials are published.
- Project industries for Rides On Time, Creative Tree & Stump, Firewood, Puff Picks, Quirky Cart, Doorstep Spa and Blissful don’t match the 16 listed industries and are left unassigned.
