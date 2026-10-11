# E-commerce Website Builder

Public page: **`/services/ecommerce-website-development-bangladesh`** — template picker, included features, dashboard-feature configurator, live price, itemised quotation (PDF) and order form.
Admin: **Admin → E-commerce Builder** (`/admin/ecommerce-builder`).

## How pricing works

1. Edit the **catalog** (drafts): Website templates, Feature categories, Features (CMS screens), and **Pricing & coupons** (tax, automatic discounts/bundles, coupon codes, quote validity, payment terms, disclaimer, optional BDT display rate).
2. On **Overview**, review validation issues and click **Publish pricing**. This freezes everything into an immutable, versioned *pricebook* (`builder_pricebooks`).
3. The public page, the in-browser calculator and every new server-side quote use the latest published pricebook. The pricing engine (`src/lib/ecommerce-builder/pricing.ts`) is shared by client and server. The server calculates new quotations and uses stored snapshots for matching valid quotations; client prices are never accepted.
4. Quotes, orders and invoices store a full price snapshot plus the pricebook version, so later edits never change them.

Feature billing types: `included` ($0, optionally mandatory), `fixed`, `quantity` (per unit, e.g. per courier), `bundled` (free with the feature it requires, e.g. Advanced Permissions with Staff & Roles) and `custom` (“Contact for pricing”, listed separately, never $0). Dependencies (`requires`) are added automatically. Third-party running costs are recorded per feature and shown apart from the development total.

Page content, SEO, order-form options and builder settings are live as soon as they are saved.

## Admin editing and coupon codes

- **Website templates**: add or edit the display name, descriptions, base price and live preview URL. Use **Desktop preview** or **Mobile preview** to upload a screenshot or choose an image from the media library.
- **Feature categories**: create or rename the tabs in Step 3, edit their descriptions and icons, and set the display order.
- **Features**: add or edit names, short descriptions, detailed explanations, screenshots, category, billing type and price. Included features appear in Step 2; optional features appear under their category in Step 3.
- **Pricing & coupons**: add a discount rule, select percentage or fixed amount, and optionally enter a minimum subtotal or required features. Leave **Coupon code** empty for an automatic discount; enter a unique code (up to 40 letters, numbers, hyphens or underscores) when the customer must apply it. Codes are case-insensitive. Turn **Active** off to disable a rule.
- Save your edits, then open **E-commerce Builder → Overview → Publish pricing** to make templates, categories, feature prices and coupon changes live together. Page headings and section descriptions can be edited under **Page content** and go live on save.

Customers apply or remove one coupon in Step 4. The code is rechecked whenever their configuration changes, and the server recalculates eligibility and discounts for new quotations and orders without a matching valid quotation. Existing valid quotations retain their agreed discount even if the coupon is disabled and the customer reloads. Tax is calculated after discounts; the displayed discount lines always add up to the saved discount total. Quotation and order snapshots retain the coupon code and amount, and PDFs show the code beside the discount.

## Quote → order → invoice

- **Quotation** (estimate, `JDQ-YYYY-NNNNN`): created by “Generate quotation” or on order submission. Customers get a private link `/quote/<token>` and `/quote/<token>/pdf`. Only an HMAC of the token is stored; staff can issue a new link from the order page (the old one stops working).
- **Order** (`JDE-YYYY-NNNN`): honeypot, minimum fill time, per-IP rate limit, server validation, and idempotency (a retried or double-clicked submit returns the original order; one order per quote). Staff get an in-app notification and email; the customer gets a confirmation email when a real email provider is configured.
- **Invoice** (`JDI-YYYY-NNNN`): only for orders with status *Confirmed* or later. Payments are **recorded manually** by staff (no online payment provider is connected); invoices show recorded payments and the balance due.

## Permissions

| Permission | Roles | Covers |
|---|---|---|
| `builder:content` | Admin, Editor | Overview, page content, SEO |
| `builder:catalog` | Admin | Templates, categories, features, pricing, publishing, order form, settings |
| `builder:orders` | Admin | Orders, quotes, invoices, analytics (customer data) |

## Commands

```bash
npm run db:seed:builder   # insert-only seed: templates, categories, features, settings; publishes v1 if none exists
npm run db:seed           # full site seed (includes the builder seed)
npm test                  # pricing engine tests
npx tsx --conditions=react-server scripts/verify-ecommerce-builder.ts   # integration check on a throwaway in-memory MongoDB
```

The seed never overwrites rows that already exist, so it is safe to re-run. Without a database the page renders the seed catalog as a preview (quotes and orders are disabled).

## Before announcing the page

- Review the sample prices and the included-feature list against what you deliver for $100.
- Upload preview screenshots you own for each template (Admin → Website templates). The Live Preview links open the reference stores (Shajgoj, Gadget & Gear, Korean Skincare) and your own Dazzle demo; change them under each template’s *Live preview URL*.
- Check the FAQ answers, payment terms and disclaimer (Page content / Pricing & coupons).
- Visits are tracked only through GA4/GTM (`NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_GTM_ID`) with consent: `builder_template_selected`, `builder_quote_created`, `generate_lead`.
