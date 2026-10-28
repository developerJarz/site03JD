import { addDays, formatAmountCode, nextNumber, primaryCost, todayISO, uid } from "./calc";
import type {
  BillingDoc,
  BillingState,
  ClientInfo,
  CompanyProfile,
  DeliveryTrack,
  Invoice,
  Kpi,
  Milestone,
  PresetId,
  Quotation,
  QuoteSectionId,
  SectionConfig,
  TechRow,
  TermGroup,
  TextRow,
  TimelinePhase,
} from "./types";

/* ───────────────────────────── Company ───────────────────────────── */

/** The website's JD mark (public/images/brand). */
export const DEFAULT_LOGO = "/images/brand/mark.png";

export function defaultCompany(): CompanyProfile {
  return {
    name: "Jarz Digital",
    tagline: "Software . Web . Digital Marketing",
    address: "JarzDigital, Road No 1, Block C, Mirpur 2, Dhaka 1216",
    phone: "01925-982536",
    email: "jarzdigitalltd@gmail.com",
    website: "jarzdigital.com",
    logoUrl: DEFAULT_LOGO,
    monogram: "JD",
    defaultCurrency: "BDT",
    bankDetails: "Bank: [Bank name]\nAccount Name: Jarz Digital\nAccount No: [Account number]\nBranch: [Branch] · Routing No: [Routing number]",
    mobileBanking: "bKash (Merchant): [bKash number]\nNagad (Merchant): [Nagad number]\nPlease use the invoice number as the payment reference.",
    signatoryName: "",
    signatoryTitle: "Authorized Signatory, Jarz Digital",
    usdToBdt: 0,
  };
}

export const blankClient = (): ClientInfo => ({ name: "", company: "", website: "", phone: "", email: "", address: "" });

/* ───────────────────────────── Sections ───────────────────────────── */

export const SECTION_DEFAULTS: Record<QuoteSectionId, Omit<SectionConfig, "id" | "visible">> = {
  summary: { title: "Executive Summary", subtitle: "", newPage: false },
  kpis: { title: "Project Highlights", subtitle: "", newPage: false },
  workflow: { title: "At a Glance: How Information Flows", subtitle: "Every step is recorded from the client's first message/order to the owner's dashboard", newPage: false },
  costs: { title: "Cost Breakdown Summary", subtitle: "One-time investment and annual recurring costs", newPage: true },
  features: { title: "What's Included / Scope of Work", subtitle: "Modules and capabilities delivered in this project", newPage: false },
  techStack: { title: "Technology Stack & Architecture", subtitle: "", newPage: true },
  payments: { title: "Payment Terms & Schedule", subtitle: "", newPage: false },
  timeline: { title: "Project Delivery Timeline", subtitle: "", newPage: true },
  prerequisites: { title: "What We Need From You", subtitle: "Client prerequisites to start on schedule", newPage: false },
  additionalCosts: { title: "Additional / Third-Party Costs", subtitle: "", newPage: false },
  terms: { title: "Terms & Conditions", subtitle: "", newPage: true },
  signature: { title: "Acceptance & Signature", subtitle: "", newPage: false },
};

export const SECTION_ORDER = Object.keys(SECTION_DEFAULTS) as QuoteSectionId[];

export const defaultSections = (): SectionConfig[] => SECTION_ORDER.map((id) => ({ id, visible: true, ...SECTION_DEFAULTS[id] }));

/* ───────────────────────────── Delivery tracks ───────────────────────────── */

export const DELIVERY: Record<DeliveryTrack, { label: string; title: string }> = {
  website: { label: "7–15 Days", title: "Website Development Timeline (7–15 Days)" },
  software: { label: "15–30 Days", title: "Custom Software Timeline (15–30 Days)" },
};

const TIMELINES: Record<DeliveryTrack, [string, string][]> = {
  website: [
    ["Days 1–3", "UI/UX Design, Wireframing, Domain/Hosting Configuration & Database Architecture."],
    ["Days 4–8", "Core Website Development, Product/Service Pages, Cart/Checkout & Admin Dashboard Setup."],
    ["Days 9–12", "Payment Gateway, Courier API, Meta Pixel/Social Chat Integration & Content Upload."],
    ["Days 13–15", "Speed Optimization, Security Hardening, QA Testing, Admin Training & Live Handover."],
  ],
  software: [
    ["Week 1", "UI/UX Design, Client-Vendor Module & Invoicing System."],
    ["Week 2", "Accounts, Expenses, Due/Advance Ledger & Staff Commission Engine."],
    ["Week 3", "Lead Management, Meta Social Inbox Integration & Analytical Reports."],
    ["Week 4", "Quality Assurance Testing, Staff Training & Final Handover."],
  ],
};

export const timelineFor = (track: DeliveryTrack): TimelinePhase[] => TIMELINES[track].map(([period, detail]) => ({ id: uid(), period, detail }));

/** Switch the timeline schedule and the Delivery KPI card together. */
export function applyTrack(q: Quotation, track: DeliveryTrack): Quotation {
  return {
    ...q,
    timeline: { ...q.timeline, track, phases: timelineFor(track) },
    kpis: q.kpis.map((k) => (k.id === "delivery" ? { ...k, value: DELIVERY[track].label } : k)),
  };
}

/* ───────────────────────────── Tech stack ───────────────────────────── */

export const TECH_SUGGESTIONS: Record<string, string[]> = {
  frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS", "WordPress", "WooCommerce", "Elementor", "Laravel Blade", "Alpine.js"],
  backend: ["Node.js", "TypeScript (REST API)", "Express.js", "Next.js API Routes", "Laravel PHP", "WordPress REST API"],
  database: ["PostgreSQL", "MongoDB", "MySQL", "Redis Cache", "Automated Daily Backups"],
  integrations: [
    "Official Meta API (Messenger, Instagram, WhatsApp Cloud API for real-time messaging)",
    "Payment & Courier APIs",
    "SSLCommerz",
    "bKash",
    "Nagad",
    "Steadfast",
    "Pathao",
    "RedX",
    "Meta Pixel",
    "Conversions API (CAPI)",
    "Google Analytics 4",
    "Google Search Console",
    "WhatsApp & Messenger Chat",
    "Bulk SMS Gateway",
  ],
  security: ["HTTPS (SSL)", "Encrypted Passwords", "Role-Based Admin Access Control", "Two-Factor Authentication", "Cloudflare WAF", "Daily Backups"],
  hosting: ["High-Performance Cloud Server (VPS)", "Vercel Edge", "Cloudflare CDN", "cPanel Hosting", "AWS"],
};

/** One-click stack switch for the frontend/backend/database rows. */
export const STACK_SWITCH: Record<string, Partial<Record<"frontend" | "backend" | "database", string>>> = {
  "Next.js": { frontend: "Next.js, React, TypeScript, Tailwind CSS", backend: "Node.js, TypeScript (REST API), Express.js", database: "PostgreSQL, Automated Daily Backups" },
  "WordPress / WooCommerce": { frontend: "WordPress, WooCommerce, Elementor", backend: "WordPress REST API", database: "MySQL, Automated Daily Backups" },
  Laravel: { frontend: "Laravel Blade, Tailwind CSS, Alpine.js", backend: "Laravel PHP", database: "MySQL, Automated Daily Backups" },
};

/** Split "a, b (x, y), c" on top-level commas only. */
export function splitTags(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of text) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

export function toggleTag(text: string, tag: string): string {
  const tags = splitTags(text);
  return (tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]).join(", ");
}

const tech = (rows: [string, string, string][]): TechRow[] => rows.map(([title, detail, suggest]) => ({ id: uid(), title, detail, suggest }));
const rows = (pairs: [string, string][]): TextRow[] => pairs.map(([title, detail]) => ({ id: uid(), title, detail }));

const SECURITY_ROW: [string, string, string] = ["Security", "HTTPS (SSL), Encrypted Passwords, Role-Based Admin Access Control", "security"];

/* ───────────────────────────── Presets ───────────────────────────── */

interface Preset {
  label: string;
  description: string;
  track: DeliveryTrack;
  documentTitle: string;
  projectTitle: string;
  summary: string;
  features: [string, string][];
  techStack: [string, string, string][];
  workflow: [string, string][];
}

const ERP_WORKFLOW: [string, string][] = [
  ["Inquiry Arrives", "Client message lands via Facebook, Instagram, WhatsApp or the website."],
  ["Lead Created", "A lead is created automatically with source and contact details."],
  ["Staff Assigned", "The lead is assigned to a staff member for ownership."],
  ["Follow-up Calls & Notes", "Every call, note and reminder is logged against the lead."],
  ["Booking/Order & Invoice", "The confirmed booking or order generates an invoice."],
  ["Commission Calculation", "Staff commission is calculated automatically from the sale."],
  ["Sales & Profit/Loss Reports", "Sales, dues, expenses and profit/loss update in real time."],
  ["Owner's Master Dashboard", "The owner sees the whole business on one live dashboard."],
];

export const PRESETS: Record<PresetId, Preset> = {
  ecommerce: {
    label: "Custom E-Commerce Website",
    description: "Store, payments, courier & tracking · 7–15 days",
    track: "website",
    documentTitle: "E-Commerce Website Development Proposal & Quotation",
    projectTitle: "Custom E-Commerce Website",
    summary:
      "A conversion-focused online store that brings your catalogue, orders, payments, courier bookings and ad tracking into one fast, mobile-first platform—so you sell more while managing everything from a single dashboard.",
    features: [
      ["Product & Category Management", "Unlimited products with rich descriptions and image galleries, nested categories, brands, tags and bulk product upload."],
      ["Variant & Stock Control", "Size, colour and material variants with individual SKU, price and stock; low-stock alerts and automatic stock deduction on every order."],
      ["Dynamic Cart & Fast Checkout", "Slide-out cart, coupon codes, delivery-zone shipping charges and a one-page checkout optimised for mobile buyers."],
      ["Payment Gateway Integration", "SSLCommerz (cards & internet banking), bKash and Nagad online payments, plus Cash on Delivery with automatic payment status updates."],
      ["Courier API Automation", "One-click parcel booking with Steadfast, Pathao and RedX; automatic tracking numbers and delivery status sync."],
      ["Meta Pixel & Server-Side CAPI Tracking", "Browser Pixel plus server-side Conversions API with event deduplication for accurate ad attribution (ViewContent, AddToCart, Purchase)."],
      ["Order & Automated Invoice Generation", "Order pipeline with a status workflow, automatically generated printable invoices and email/SMS order notifications."],
      ["Customer Portal", "Customer accounts with order history, live order tracking, saved addresses and wishlist."],
      ["Sales Analytics Dashboard", "Revenue, orders, top products, conversion and customer insights with date-range filters and Excel export."],
    ],
    techStack: [
      ["Frontend (User Interface)", "Next.js, React, TypeScript, Tailwind CSS", "frontend"],
      ["Backend (Core Logic & API)", "Node.js, TypeScript (REST API)", "backend"],
      ["Database", "PostgreSQL, Automated Daily Backups", "database"],
      ["Payments, Courier & Tracking", "SSLCommerz, bKash, Nagad, Steadfast, Pathao, RedX, Meta Pixel, Conversions API (CAPI)", "integrations"],
      SECURITY_ROW,
      ["Hosting", "Vercel Edge, Cloudflare CDN", "hosting"],
    ],
    workflow: [
      ["Customer Discovers", "Shopper arrives from Meta ads, Google or social media."],
      ["Browse & Add to Cart", "Products, variants and live stock help them choose fast."],
      ["Checkout & Pay", "SSLCommerz, bKash, Nagad or Cash on Delivery."],
      ["Order & Invoice", "The order and its invoice are generated automatically."],
      ["Courier Booking", "Parcel is booked with Steadfast, Pathao or RedX in one click."],
      ["Pixel & CAPI Events", "Purchase data flows back to Meta for better ad targeting."],
      ["Delivery Updates", "Customer is notified as the courier status changes."],
      ["Owner's Sales Dashboard", "Revenue, orders and top products in one live view."],
    ],
  },
  corporate: {
    label: "Corporate / Business Website",
    description: "Brand, CMS, SEO & lead capture · 7–15 days",
    track: "website",
    documentTitle: "Corporate Website Development Proposal & Quotation",
    projectTitle: "Corporate Business Website",
    summary:
      "A premium, SEO-ready corporate website that presents your brand with credibility, showcases your services and portfolio, and turns visitors into qualified leads through live chat and smart inquiry forms—fully manageable from your own admin panel.",
    features: [
      ["Custom Responsive UI/UX Design", "Bespoke, brand-aligned design for desktop, tablet and mobile with modern interactions and accessibility best practices."],
      ["Dynamic CMS Pages", "Edit every page, section, image and line of text from the admin panel—no coding required."],
      ["Service & Portfolio Showcase", "Dedicated service pages, case studies, project galleries, client logos and testimonials."],
      ["SEO Architecture & Blog System", "SEO-friendly URLs, meta tags, schema markup, XML sitemap and a full blog with categories and tags."],
      ["WhatsApp/Messenger Live Chat Integration", "Floating WhatsApp and Messenger chat buttons with pre-filled messages for instant conversations."],
      ["Lead Capture & Inquiry Forms", "Contact, quote-request and consultation forms with spam protection, email alerts and lead storage in the admin panel."],
      ["Speed Optimization", "Image optimisation, caching, lazy loading and CDN delivery targeting 90+ Google PageSpeed scores."],
      ["Admin Control Panel", "Secure, role-based dashboard to manage content, leads, media, SEO settings and site configuration."],
    ],
    techStack: [
      ["Frontend (User Interface)", "Next.js, React, TypeScript, Tailwind CSS", "frontend"],
      ["Backend (Core Logic & API)", "Node.js, TypeScript (REST API)", "backend"],
      ["Database", "MongoDB, Automated Daily Backups", "database"],
      ["SEO & Integrations", "Google Analytics 4, Google Search Console, WhatsApp & Messenger Chat", "integrations"],
      SECURITY_ROW,
      ["Hosting", "Vercel Edge, Cloudflare CDN", "hosting"],
    ],
    workflow: [
      ["Visitor Lands", "Prospects arrive from Google search, social media or referrals."],
      ["Explores Services", "Service pages, portfolio and testimonials build trust."],
      ["Live Chat", "One tap opens WhatsApp or Messenger with a pre-filled message."],
      ["Inquiry Submitted", "Quote and contact forms capture the requirement."],
      ["Lead Stored & Alerted", "The lead is saved in the admin panel and the team gets an email."],
      ["Team Follows Up", "Your team responds while the prospect is still warm."],
      ["Proposal & Conversion", "Qualified leads become signed clients."],
      ["Analytics Dashboard", "Traffic, sources and conversions measured in one place."],
    ],
  },
  erp: {
    label: "Custom ERP/CRM & Office Management Software",
    description: "Clients, accounts, staff, social inbox · 15–30 days",
    track: "software",
    documentTitle: "Website & Software Development Proposal & Quotation",
    projectTitle: "Custom ERP/CRM & Office Management Software",
    summary:
      "All your operations—clients, invoices, payments, expenses, staff commissions, and Facebook, Instagram & WhatsApp messages—unified into one platform with automated calculations and centralized data.",
    features: [
      ["Client & Vendor", "Complete client list & details, add/remove vendors, individual profit/loss tracking."],
      ["Products & Services", "Service catalog management (e.g., Visa, Air Ticket, Tour Package, Work Permit, Umrah, or custom services)."],
      ["Invoice", "Create new invoices, auto-generate invoices after payment, view & print all invoices."],
      ["Money Receipt", "Payment deposit receipts for bookings and orders."],
      ["Vendor Payment", "Track payments made to suppliers, hotels, tickets, or third-party vendors."],
      ["Accounts & Expenses", "Bank, Cash, bKash/Nagad ledger management; complete office expense tracking."],
      ["Due & Advance", "Track customer/vendor dues and advance payments."],
      ["Refund & Quotation", "Send client quotations; process customer refunds for cancelled bookings/orders."],
      ["Staff & Commission", "Staff profiles, payroll, and automated commission calculation."],
      ["Lead Management", "Track which staff is communicating with which client, lead assignment, and follow-ups."],
      ["Social Inbox", "Unified dashboard for all Facebook, Instagram, and WhatsApp messages."],
      ["Reports", "Sales reports, salesperson-wise sales, profit & loss, cash flow, and staff follow-up reports."],
      ["Admin Access Control", "3 levels of Admin roles with granular view and action permissions."],
    ],
    techStack: [
      ["Frontend (User Interface)", "Next.js, React, TypeScript, Tailwind CSS", "frontend"],
      ["Backend (Core Logic & API)", "Node.js, TypeScript (REST API), Express.js", "backend"],
      ["Database", "PostgreSQL, Automated Daily Backups", "database"],
      ["Social Inbox & Integrations", "Official Meta API (Messenger, Instagram, WhatsApp Cloud API for real-time messaging), Payment & Courier APIs", "integrations"],
      SECURITY_ROW,
      ["Hosting", "High-Performance Cloud Server (VPS), Vercel Edge", "hosting"],
    ],
    workflow: ERP_WORKFLOW,
  },
};

export const PRESET_IDS = Object.keys(PRESETS) as PresetId[];

/** Load a service preset: features, tech stack, workflow, Delivery KPI and timeline. */
export function applyPreset(q: Quotation, id: PresetId): Quotation {
  const p = PRESETS[id];
  return applyTrack({ ...q, preset: id, features: rows(p.features), techStack: tech(p.techStack), workflow: rows(p.workflow) }, p.track);
}

/* ───────────────────────────── Defaults ───────────────────────────── */

const defaultKpis = (track: DeliveryTrack): Kpi[] => [
  { id: "cost", label: "Development Cost", value: "40,000 BDT", caption: "Website / Software Development" },
  { id: "delivery", label: "Delivery Timeline", value: DELIVERY[track].label, caption: "Project Handover" },
  { id: "payment", label: "Payment Terms", value: "50% Advance", caption: "50% Upon Completion" },
  { id: "revision", label: "Testing & Revision", value: "1 Month", caption: "Free Testing & Revision" },
];

const defaultMilestones = (): Milestone[] => [
  { id: uid(), when: "Before Starting Work (50% Advance)", description: "Website / Software Development", amount: 20000 },
  { id: uid(), when: "Upon Project Completion (Remaining 50%)", description: "Website / Software Development", amount: 20000 },
  { id: uid(), when: "At the Time of Going Live", description: "Cloud Hosting (1 Year) + Social/API Setup", amount: 10000 },
];

export const defaultPrerequisites = () => [
  "Access to Facebook Page, Instagram, and WhatsApp Business number (if applicable).",
  "Meta Business Verification (our team will assist you through the process).",
  "Brand logo, service/product details, commission rules, and existing client list (Excel).",
];

export const defaultAdditionalCosts = () => [
  "WhatsApp messages are free when replying to a client within 24 hours; proactive promotional/template messages incur standard Meta charges. Facebook and Instagram messages are 100% free.",
  "Annual Cloud Hosting renewal from the second year onward: 8,000 BDT/year.",
  "Bulk SMS gateway charges (if SMS notifications are required) are billed separately per SMS.",
];

const term = (text: string, rates: [string, string][] = []) => ({ id: uid(), text, rates: rates.map(([label, value]) => ({ id: uid(), label, value })) });

export function defaultTerms(): TermGroup[] {
  return [
    {
      id: uid(),
      title: "Costs & Additional Work",
      items: [
        term("Any third-party paid APIs or services (e.g., SMS Gateway, WhatsApp Template Messages, Payment Gateways, paid plugins) will be borne by the client."),
        term('Any custom feature or module outside the "What\'s Included" scope will be billed separately.'),
        term(
          "The 2,000 BDT Social Setup fee covers the one-time connection of 1 Facebook Page, 1 Instagram account, and 1 WhatsApp number. Adding new pages/numbers or re-configuring setups later will incur a separate charge.",
        ),
        term(
          "**1-Month Free Testing & Revision Period** is included after handover to fix any bugs or make minor adjustments within the agreed scope. Lifetime support is available thereafter according to the post-revision rate card below:",
          [
            ["Minor Edits / Modifications to Existing Features", "1,000 – 5,000 BDT"],
            ["New Standard Function", "2,000 – 5,000 BDT"],
            ["New Premium Feature / Module", "5,000 – 10,000 BDT"],
          ],
        ),
        term(
          "Raw source code or underlying scripts are not transferred by default. If full source code ownership is required, it is valued at approximately 2,500,000 BDT (25 Lakh BDT) under a separate agreement.",
        ),
        term(
          "Clients may optionally retain the Jarz Digital team on a monthly retainer plan—eliminating the need to hire in-house developers and covering ongoing feature additions within an agreed monthly scope.",
        ),
      ],
    },
    {
      id: uid(),
      title: "Payment & Handover",
      items: [
        term("The advance payment is strictly non-refundable once project development has commenced."),
        term(
          "The remaining 50% balance must be cleared within 7 days of project completion. Final handover takes place upon full payment; Jarz Digital reserves the right to temporarily suspend service if dues remain unpaid.",
        ),
        term(
          "Any delay by the client in providing required content, credentials, or feedback will extend the delivery timeline accordingly. If the project remains stalled for more than 15 days due to client inactivity, the project will be deemed completed.",
        ),
      ],
    },
    {
      id: uid(),
      title: "Ownership & Liability",
      items: [
        term(
          "Intellectual property of the software/platform and code belongs to Jarz Digital; the client receives a license to use it for their business operations. Copying, reselling, or transferring to third parties is prohibited.",
        ),
        term("All business data (clients, orders, accounts, invoices) belongs exclusively to the client and can be exported to Excel at any time."),
        term("Failure to renew hosting on time may result in service suspension; Jarz Digital shall not be held liable for any resulting data loss."),
        term(
          "Jarz Digital is not responsible for policy/API changes or account restrictions imposed by Meta (Facebook, Instagram, WhatsApp); any required system updates due to third-party API changes will be billable.",
        ),
        term("The client assumes full responsibility for any losses resulting from incorrect data entry, staff misuse, or password sharing."),
        term("Any unauthorized modifications made to the server or codebase by the client or third parties will void our support warranty for the affected components."),
        term("Any disputes shall be resolved amicably through mutual discussion, or governed by the laws of Bangladesh if necessary."),
      ],
    },
  ];
}

export const DEFAULT_INVOICE_TERMS = [
  "Please use the invoice number as the payment reference.",
  "The advance payment is non-refundable once project development has commenced.",
  "Final handover takes place upon full payment of the balance due.",
];

/* ───────────────────────────── Factories ───────────────────────────── */

const year = (iso: string) => Number(iso.slice(0, 4)) || new Date().getFullYear();

export function createQuotation({ company, docs, preset, today = todayISO() }: { company: CompanyProfile; docs: BillingDoc[]; preset: PresetId | "custom"; today?: string }): Quotation {
  const p = preset === "custom" ? null : PRESETS[preset];
  const track = p?.track ?? "website";
  const now = new Date().toISOString();
  const base: Quotation = {
    kind: "quotation",
    id: uid(),
    number: nextNumber(docs, "quotation", year(today)),
    status: "draft",
    createdAt: now,
    updatedAt: now,
    currency: company.defaultCurrency,
    preset,
    documentTitle: p?.documentTitle ?? "Website & Software Development Proposal & Quotation",
    projectTitle: p?.projectTitle ?? "",
    issueDate: today,
    validityDays: 30,
    client: blankClient(),
    executiveSummary: p?.summary ?? PRESETS.erp.summary,
    kpis: defaultKpis(track),
    costKpiAuto: true,
    workflow: rows(ERP_WORKFLOW),
    costs: [
      { id: uid(), label: "Website / Software Development", amount: 40000, type: "one-time" },
      { id: uid(), label: "Social / API Setup", amount: 2000, type: "one-time" },
      { id: uid(), label: "Cloud Hosting (per year)", amount: 8000, type: "annual" },
    ],
    features: [],
    techStack: tech(PRESETS.erp.techStack),
    milestones: defaultMilestones(),
    timeline: { track, note: "The delivery timeline begins from the date the advance payment is received.", phases: timelineFor(track) },
    prerequisites: defaultPrerequisites(),
    additionalCosts: defaultAdditionalCosts(),
    terms: defaultTerms(),
    signature: {
      validityNotice: "This quotation is valid for 30 days from the issue date.",
      clientLabel: "Client Signature & Date",
      companyLabel: "Authorized Signature & Date",
      signatoryName: company.signatoryName,
      signatoryTitle: company.signatoryTitle,
    },
    sections: defaultSections(),
    invoiceIds: [],
  };
  return preset === "custom" ? base : applyPreset(base, preset);
}

export function createInvoice({ company, docs, today = todayISO() }: { company: CompanyProfile; docs: BillingDoc[]; today?: string }): Invoice {
  const now = new Date().toISOString();
  return {
    kind: "invoice",
    id: uid(),
    number: nextNumber(docs, "invoice", year(today)),
    createdAt: now,
    updatedAt: now,
    currency: company.defaultCurrency,
    quotationId: "",
    quotationNumber: "",
    projectTitle: "",
    issueDate: today,
    dueDate: addDays(today, 7),
    delivery: "website",
    deliveryNote: deliveryNote("website"),
    statusOverride: "auto",
    client: blankClient(),
    items: [{ id: uid(), title: "Website Development", description: "", billingType: "one-time", qty: 1, unitPrice: 40000, discount: 0, taxRate: 0 }],
    showTax: false,
    payments: [],
    schedule: [],
    showSchedule: false,
    bankDetails: company.bankDetails,
    mobileBanking: company.mobileBanking,
    notes: "Thank you for choosing Jarz Digital. We look forward to building with you.",
    terms: [...DEFAULT_INVOICE_TERMS],
    showStamp: true,
    showSignature: true,
    signatoryName: company.signatoryName,
    signatoryTitle: company.signatoryTitle,
  };
}

export const deliveryNote = (track: DeliveryTrack) => `Estimated Delivery: ${DELIVERY[track].label} from Advance Payment`;

export type ConvertMode = "full" | "milestones";

/** Build an invoice from a quotation: client, line items, delivery note and milestone schedule. */
export function quotationToInvoice(q: Quotation, { company, docs, mode, today = todayISO() }: { company: CompanyProfile; docs: BillingDoc[]; mode: ConvertMode; today?: string }): Invoice {
  const inv = createInvoice({ company, docs, today });
  const track = q.timeline.track === "custom" ? null : q.timeline.track;
  const scope = q.features.map((f) => f.title).filter(Boolean).join(" · ");
  const items =
    mode === "full"
      ? q.costs.map((c, i) => ({
          id: uid(),
          title: c.label,
          description: i === 0 && c.type === "one-time" ? [q.projectTitle, scope].filter(Boolean).join(" — ") : "",
          billingType: c.type,
          qty: 1,
          unitPrice: c.amount,
          discount: 0,
          taxRate: 0,
        }))
      : q.milestones.map((m) => ({ id: uid(), title: m.description, description: m.when, billingType: "milestone" as const, qty: 1, unitPrice: m.amount, discount: 0, taxRate: 0 }));
  return {
    ...inv,
    currency: q.currency,
    quotationId: q.id,
    quotationNumber: q.number,
    projectTitle: q.projectTitle,
    client: { ...q.client },
    items,
    delivery: track ?? "none",
    deliveryNote: track ? deliveryNote(track) : "",
    schedule: q.milestones.map((m) => ({ ...m, id: uid() })),
    showSchedule: q.milestones.length > 0,
    // Payments already taken on the website order are deducted on the first invoice only.
    payments: q.source && q.invoiceIds.length === 0 ? q.source.payments.map((p) => ({ ...p, id: uid() })) : [],
    ...(q.source && { source: { ...q.source, payments: [] } }),
  };
}

export function duplicateDocument(doc: BillingDoc, docs: BillingDoc[], today = todayISO()): BillingDoc {
  const now = new Date().toISOString();
  const copy = structuredClone(doc);
  const number = nextNumber(docs, doc.kind, year(today));
  if (copy.kind === "quotation") {
    return { ...copy, id: uid(), number, status: "draft", issueDate: today, createdAt: now, updatedAt: now, invoiceIds: [], projectTitle: copy.projectTitle ? `${copy.projectTitle} (Copy)` : "" };
  }
  return { ...copy, id: uid(), number, issueDate: today, dueDate: addDays(today, 7), createdAt: now, updatedAt: now, payments: [], statusOverride: "auto" };
}

/** KPI value the Development Cost card shows. */
export const kpiValue = (q: Quotation, k: Kpi) => (k.id === "cost" && q.costKpiAuto ? formatAmountCode(primaryCost(q), q.currency) : k.value);

/* ───────────────────────────── Sample data ───────────────────────────── */

export function sampleState(today = todayISO()): BillingState {
  const company = defaultCompany();
  const docs: BillingDoc[] = [];

  const shop = createQuotation({ company, docs, preset: "ecommerce", today: addDays(today, -5) });
  shop.status = "sent";
  shop.client = {
    name: "Nusrat Jahan",
    company: "Bunon Fashion House",
    website: "bunonfashion.com.bd",
    phone: "01700-000001",
    email: "hello@bunonfashion.com.bd",
    address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  };
  docs.push(shop);

  const erp = createQuotation({ company, docs, preset: "erp", today: addDays(today, -12) });
  erp.client = {
    name: "Rafiqul Islam",
    company: "SkyWay Travels & Tours",
    website: "skywaytravels.com.bd",
    phone: "01800-000002",
    email: "accounts@skywaytravels.com.bd",
    address: "Suite 4B, Kemal Ataturk Avenue, Banani, Dhaka 1213",
  };
  docs.push(erp);

  const corporate = createQuotation({ company, docs, preset: "corporate", today: addDays(today, -1) });
  corporate.client = { name: "Tanvir Ahmed", company: "Green Leaf Consultancy", website: "greenleaf.com.bd", phone: "01900-000003", email: "", address: "Gulshan 1, Dhaka 1212" };
  docs.push(corporate);

  const inv = quotationToInvoice(erp, { company, docs, mode: "full", today: addDays(today, -10) });
  inv.payments = [{ id: uid(), date: addDays(today, -10), method: "bKash", reference: "TrxID 9K7X2M4P1Q", amount: 20000 }];
  docs.push(inv);
  erp.status = "converted";
  erp.invoiceIds = [inv.id];

  return { version: 2, company, documents: docs };
}

/* ───────────────────────────── Import / normalise ───────────────────────────── */

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const arr = <T,>(v: unknown, fallback: T[]): T[] => (Array.isArray(v) ? (v as T[]) : fallback);

/** Fill missing fields from defaults so older or hand-edited JSON still opens. Returns null for anything unrecognisable. */
export function normalizeDoc(raw: unknown, company: CompanyProfile = defaultCompany()): BillingDoc | null {
  if (!isObj(raw) || typeof raw.id !== "string" || typeof raw.number !== "string") return null;
  if (raw.kind === "quotation") {
    const base = createQuotation({ company, docs: [], preset: "custom" });
    const r = raw as Partial<Quotation>;
    const sections = arr<SectionConfig>(r.sections, base.sections).filter((s) => s && s.id in SECTION_DEFAULTS);
    for (const s of base.sections) if (!sections.some((x) => x.id === s.id)) sections.push(s);
    return {
      ...base,
      ...r,
      kind: "quotation",
      client: { ...base.client, ...(isObj(r.client) ? r.client : {}) },
      signature: { ...base.signature, ...(isObj(r.signature) ? r.signature : {}) },
      timeline: { ...base.timeline, ...(isObj(r.timeline) ? r.timeline : {}), phases: arr(r.timeline?.phases, base.timeline.phases) },
      kpis: arr(r.kpis, base.kpis),
      workflow: arr(r.workflow, base.workflow),
      costs: arr(r.costs, base.costs),
      features: arr(r.features, base.features),
      techStack: arr(r.techStack, base.techStack),
      milestones: arr(r.milestones, base.milestones),
      prerequisites: arr(r.prerequisites, base.prerequisites),
      additionalCosts: arr(r.additionalCosts, base.additionalCosts),
      terms: arr(r.terms, base.terms),
      invoiceIds: arr(r.invoiceIds, []),
      sections,
    };
  }
  if (raw.kind === "invoice") {
    const base = createInvoice({ company, docs: [] });
    const r = raw as Partial<Invoice>;
    return {
      ...base,
      ...r,
      kind: "invoice",
      client: { ...base.client, ...(isObj(r.client) ? r.client : {}) },
      items: arr(r.items, base.items),
      payments: arr(r.payments, []),
      schedule: arr(r.schedule, []),
      terms: arr(r.terms, base.terms),
    };
  }
  return null;
}

export function normalizeState(raw: unknown): BillingState | null {
  if (!isObj(raw) || !Array.isArray(raw.documents)) return null;
  const company = { ...defaultCompany(), ...(isObj(raw.company) ? (raw.company as Partial<CompanyProfile>) : {}) };
  // v1 shipped with the "JD" monogram as the default; v2 defaults to the website logo.
  if (raw.version !== 2 && !company.logoUrl) company.logoUrl = DEFAULT_LOGO;
  const documents = raw.documents.map((d) => normalizeDoc(d, company)).filter((d): d is BillingDoc => d !== null);
  return { version: 2, company, documents };
}
