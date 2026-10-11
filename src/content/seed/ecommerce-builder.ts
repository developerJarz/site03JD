/**
 * Initial catalog and page content for the e-commerce website builder
 * (/services/ecommerce-website-development-bangladesh).
 *
 * Seeded idempotently by `npm run db:seed:builder` (and `npm run db:seed`):
 * rows are inserted by key and never overwrite admin edits. Without a
 * database the public page renders from this file as a preview.
 *
 * Prices are SAMPLE prices in USD cents — review them, and the included
 * list, in Admin → E-commerce Builder before announcing the page.
 */
import type { BuilderSettings } from "@/lib/ecommerce-builder/settings";
import type { FeaturePricing } from "@/lib/ecommerce-builder/types";

const usd = (dollars: number) => Math.round(dollars * 100);

export interface TemplateSeed {
  key: string;
  name: string;
  tagline: string;
  description: string;
  categories: string[];
  demoUrl: string;
  /** Internal design reference — never shown publicly. */
  referenceUrl: string;
  price: number;
  order: number;
}

export const builderTemplateSeed: TemplateSeed[] = [
  {
    key: "beauty-commerce",
    name: "Beauty Commerce",
    tagline: "For cosmetics and beauty brands",
    description: "An image-led storefront for beauty retail: rich category navigation, shade and size variants, offer banners and a fast mobile checkout.",
    categories: ["Cosmetics", "Skincare", "Personal care", "Beauty stores"],
    demoUrl: "https://shajgoj.bd/",
    referenceUrl: "https://shajgoj.bd/",
    price: usd(100),
    order: 1,
  },
  {
    key: "premium-electronics",
    name: "Premium Electronics",
    tagline: "For gadget and electronics retailers",
    description: "A spec-driven layout for technology stores: detailed product specifications, brand filters and product pages built to help customers compare before they buy.",
    categories: ["Smartphones", "Electronics", "Accessories", "Gadgets", "Technology stores"],
    demoUrl: "https://gadgetandgear.bd/",
    referenceUrl: "https://gadgetandgear.bd/",
    price: usd(100),
    order: 2,
  },
  {
    key: "korean-skincare",
    name: "Korean Skincare",
    tagline: "For K-beauty and skincare stores",
    description: "A clean, routine-focused store for skincare: ingredient highlights, skin-type collections and product pages that put authenticity and trust first.",
    categories: ["Skincare", "Beauty", "Cosmetics", "Wellness"],
    demoUrl: "https://koreanskincare.bd/",
    referenceUrl: "https://koreanskincare.bd/",
    price: usd(100),
    order: 3,
  },
  {
    key: "modern-gadget-store",
    name: "Modern Gadget Store",
    tagline: "For gadget and lifestyle brands",
    description: "A bold, modern storefront for gadgets and lifestyle products, with large product imagery, quick add-to-cart and a mobile-first browsing experience.",
    categories: ["Gadgets", "Accessories", "Electronics", "Lifestyle"],
    demoUrl: "https://dazzle-jarz.netlify.app/",
    referenceUrl: "https://dazzle-jarz.netlify.app/",
    price: usd(100),
    order: 4,
  },
];

export interface CategorySeed {
  key: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

export const builderCategorySeed: CategorySeed[] = [
  { key: "core-store", name: "Core Store", description: "Everything that comes with your base website.", icon: "store", order: 0 },
  { key: "sales-orders", name: "Sales & Orders", description: "Sell more and process orders faster.", icon: "shopping-cart", order: 1 },
  { key: "customers-engagement", name: "Customers & Engagement", description: "Keep customers coming back.", icon: "contact", order: 2 },
  { key: "products-inventory", name: "Products & Inventory", description: "Control stock, suppliers and catalog.", icon: "boxes", order: 3 },
  { key: "vendors-marketplace", name: "Vendors & Marketplace", description: "Turn your store into a marketplace.", icon: "network", order: 4 },
  { key: "marketing-promotions", name: "Marketing & Promotions", description: "Campaigns, offers and tracking.", icon: "megaphone", order: 5 },
  { key: "content-customization", name: "Content & Customization", description: "Build pages and content without code.", icon: "layout-template", order: 6 },
  { key: "finance-analytics", name: "Finance & Analytics", description: "Understand revenue, profit and customers.", icon: "chart-column", order: 7 },
  { key: "delivery-payments", name: "Delivery & Payments", description: "Couriers, gateways and shipping rules.", icon: "truck", order: 8 },
  { key: "admin-security", name: "Administration & Security", description: "Staff access, monitoring and protection.", icon: "shield-check", order: 9 },
  { key: "ai-advanced", name: "AI & Advanced Tools", description: "AI assistants and advanced business tools.", icon: "sparkles", order: 10 },
];

export interface FeatureSeed {
  key: string;
  name: string;
  category: string;
  summary: string;
  details?: string;
  icon: string;
  pricing: FeaturePricing;
  mandatory?: boolean;
  price?: number;
  unitLabel?: string;
  minQty?: number;
  maxQty?: number;
  requires?: string[];
  recurringNote?: string;
  popular?: boolean;
}

const included = (key: string, name: string, icon: string, summary: string, mandatory = true): FeatureSeed => ({ key, name, category: "core-store", icon, summary, pricing: "included", mandatory });
const paid = (category: string) => (key: string, name: string, dollars: number, icon: string, summary: string, extra: Partial<FeatureSeed> = {}): FeatureSeed => ({ key, name, category, icon, summary, pricing: "fixed", price: usd(dollars), ...extra });

const sales = paid("sales-orders");
const customers = paid("customers-engagement");
const products = paid("products-inventory");
const vendors = paid("vendors-marketplace");
const marketing = paid("marketing-promotions");
const content = paid("content-customization");
const finance = paid("finance-analytics");
const delivery = paid("delivery-payments");
const admin = paid("admin-security");
const ai = paid("ai-advanced");

const SMS_NOTE = "SMS credits are billed separately by your SMS provider.";
const AI_NOTE = "AI usage is billed separately by the AI provider, based on usage.";

export const builderFeatureSeed: FeatureSeed[] = [
  /* Included with every website (base package) */
  included("responsive-frontend", "Fully responsive frontend", "smartphone", "A storefront designed for phones first, and tested on tablets and desktops."),
  included("homepage", "Homepage", "layout-template", "A branded homepage with banners, featured categories and products."),
  included("product-listing", "Product listing pages", "columns-3", "Category and search pages with sorting and pagination."),
  included("product-details", "Product detail pages", "package", "Product pages with gallery, price, variants, stock status and add to cart."),
  included("product-management", "Basic product management", "package-search", "Add, edit and publish products from the admin dashboard."),
  included("product-categories", "Product categories", "layers", "Organise products into categories and sub-categories."),
  included("brands", "Brands", "badge-check", "Group products by brand with brand pages.", false),
  included("product-images", "Product images", "images", "Multiple images per product with zoom on product pages."),
  included("colors-sizes", "Product colors and sizes", "sliders-horizontal", "Offer products in different colours and sizes."),
  included("product-variants", "Product variants", "boxes", "Separate price and stock for each variant."),
  included("basic-inventory", "Basic inventory management", "warehouse", "Track stock quantities and show out-of-stock products."),
  included("add-to-cart", "Add to cart", "shopping-cart", "A persistent cart customers can review and update."),
  included("checkout", "Checkout", "credit-card", "A short, mobile-friendly checkout with delivery details."),
  included("basic-orders", "Basic order management", "receipt", "View orders and update their status from the dashboard."),
  included("customer-accounts", "Customer accounts", "contact", "Customers can register, sign in and see their order history."),
  included("cash-on-delivery", "Cash on delivery option", "banknote", "Accept cash on delivery at checkout."),
  included("basic-shipping", "Basic shipping settings", "truck", "Set delivery charges, for example inside and outside Dhaka."),
  included("basic-coupons", "Basic discount coupons", "ticket-percent", "Create simple percentage or fixed-amount coupon codes.", false),
  included("review-display", "Basic review display", "star", "Show product ratings and reviews on product pages.", false),
  included("static-pages", "Static pages", "file-text", "About, contact, privacy, terms and return policy pages."),
  included("media-library", "Basic media library", "image", "Upload and reuse images across the store."),
  included("admin-dashboard", "Basic admin dashboard", "layout-dashboard", "A secure dashboard to run your store day to day."),
  included("sales-overview", "Basic sales overview", "chart-column", "Key numbers at a glance: orders, revenue and top products."),
  included("admin-auth", "Admin authentication", "key-round", "Secure sign-in for store administrators."),
  included("basic-seo", "Basic on-page SEO configuration", "search", "Page titles, meta descriptions and clean URLs for products and categories."),
  included("store-settings", "Basic store settings", "sliders-horizontal", "Store name, logo, contact details and social links."),

  /* Sales & Orders */
  sales("advanced-orders-pipeline", "Advanced Orders Pipeline", 30, "receipt", "Custom order stages, bulk status updates, advanced filters and order assignment for busy stores.", { popular: true }),
  sales("incomplete-orders", "Incomplete Orders", 20, "shopping-bag", "See checkouts customers started but didn’t finish — with their phone number — so your team can call and recover the sale."),
  sales("pos", "Point of Sale (POS)", 80, "store", "Manage physical store sales, inventory synchronization, and in-store transactions from your dashboard.", { popular: true }),
  sales("returns-refunds", "Returns & Refunds", 45, "undo-2", "Handle return requests, approvals, restocking and refund records in one workflow."),
  sales("advanced-coupons", "Advanced Coupons & Vouchers", 25, "ticket-percent", "Usage limits, minimum order values, product- or category-specific coupons and gift vouchers.", { requires: ["basic-coupons"] }),
  sales("flash-sales", "Flash Sales & Deals", 25, "zap", "Time-limited sales with countdown timers and scheduled start and end times."),
  sales("order-tracking", "Advanced Order Tracking", 30, "package-search", "A tracking page where customers follow their order’s progress, step by step."),
  sales("order-notifications", "Automated Order Notifications", 30, "bell-ring", "Automatic SMS and email updates when an order is placed, confirmed, shipped or delivered.", { recurringNote: SMS_NOTE }),

  /* Customers & Engagement */
  customers("customer-crm", "Customer CRM", 55, "contact", "Customer profiles with order history, total spend, notes and tags for follow-ups.", { popular: true }),
  customers("abandoned-cart", "Abandoned Cart Recovery", 55, "shopping-bag", "Automatic reminders with a link back to the cart for customers who left without ordering.", { recurringNote: SMS_NOTE }),
  customers("reviews-moderation", "Reviews Moderation", 25, "star", "Approve, hide or reply to product reviews before they appear on your store.", { requires: ["review-display"] }),
  customers("support-tickets", "Customer Support & Returns Tickets", 45, "life-buoy", "A ticket system for customer questions and return requests, with status tracking and staff replies."),
  customers("customer-inbox", "Customer Inbox", 45, "inbox", "All customer messages from your store’s contact and order forms in one inbox."),
  customers("subscribers", "Subscriber Management", 25, "mail", "Collect newsletter subscribers and export or manage your subscriber list."),
  customers("loyalty-points", "Loyalty Points & Rewards", 60, "gift", "Customers earn points on purchases and redeem them for discounts.", { requires: ["customer-accounts"] }),
  customers("referrals", "Customer Referral System", 45, "user-plus", "Referral links that reward customers when friends place their first order.", { requires: ["customer-accounts"] }),

  /* Products & Inventory */
  products("advanced-inventory", "Advanced Inventory Management", 35, "warehouse", "Stock adjustments, low-stock thresholds, reserved stock and inventory valuation.", { popular: true }),
  products("stock-history", "Stock Movement History", 25, "history", "A full log of every stock change — sales, returns, adjustments and purchases.", { requires: ["advanced-inventory"] }),
  products("barcode-sku", "Barcode & SKU Management", 35, "scan-barcode", "Generate SKUs and printable barcodes, and look products up by scanning."),
  products("suppliers", "Suppliers Management", 35, "factory", "Keep supplier details, products supplied and contact history in one place."),
  products("purchases", "Purchase Management", 45, "clipboard-list", "Create purchase orders, receive stock and track what you owe suppliers.", { requires: ["suppliers"] }),
  products("multi-warehouse", "Multi-Warehouse Inventory", 100, "warehouse", "Track stock separately across warehouses or shops and transfer between them.", { requires: ["advanced-inventory"] }),
  products("inventory-alerts", "Inventory Alerts", 25, "triangle-alert", "Notifications when products run low or go out of stock."),
  products("advanced-filtering", "Advanced Product Filtering", 50, "sliders-horizontal", "Filter products by price, brand, attributes and specifications on listing pages."),
  products("product-comparison", "Product Comparison", 35, "columns-3", "Let customers compare products side by side before buying."),

  /* Vendors & Marketplace */
  vendors("multi-vendor", "Multi-Vendor Management", 180, "network", "Let multiple sellers list and sell products on your store, each with their own catalog."),
  vendors("vendor-dashboard", "Vendor Dashboard", 75, "layout-dashboard", "A separate dashboard where vendors manage their products, orders and earnings.", { requires: ["multi-vendor"] }),
  vendors("vendor-commission", "Vendor Commission Management", 90, "percent", "Set commission rates per vendor or category and calculate earnings automatically.", { requires: ["multi-vendor"] }),
  vendors("vendor-payouts", "Vendor Payout Tracking", 65, "wallet", "Track what each vendor is owed and record payouts.", { requires: ["vendor-commission"] }),
  vendors("vendor-approval", "Vendor Approval System", 35, "badge-check", "Review and approve vendor applications and their products before they go live.", { requires: ["multi-vendor"] }),

  /* Marketing & Promotions */
  marketing("campaigns", "Campaign Management", 35, "megaphone", "Plan seasonal campaigns that group offers, banners and featured products with start and end dates."),
  marketing("marketing-suite", "Marketing Suite", 45, "target", "Pop-ups, announcement bars and UTM campaign tracking to promote offers across your store."),
  marketing("sms-marketing", "SMS Marketing Panel", 40, "message-square", "Send promotional SMS to customer segments from your dashboard.", { recurringNote: SMS_NOTE }),
  marketing("email-marketing", "Email Marketing Integration", 45, "mail", "Sync customers and subscribers with your email marketing platform.", { recurringNote: "Your email platform’s subscription is billed separately by the provider." }),
  marketing("advanced-promotions", "Advanced Promotions", 45, "gift", "Buy-X-get-Y, tiered discounts, free-shipping rules and automatic cart offers."),
  marketing("meta-pixel", "Meta Pixel & Conversion API", 35, "target", "Track purchases and add-to-cart events for Facebook and Instagram ads, including server-side events.", { popular: true }),
  marketing("coupon-automation", "Coupon Automation", 35, "wand-sparkles", "Automatically issue coupons — for example after a first order, on birthdays or for inactive customers.", { requires: ["advanced-coupons"] }),

  /* Content & Website Customization */
  content("homepage-builder", "Advanced Homepage Builder", 60, "layout-template", "Rearrange and edit homepage sections — sliders, collections, banners — from the dashboard."),
  content("landing-pages", "Landing Page Builder", 45, "file-text", "Create campaign and product landing pages for ads without a developer."),
  content("blog-cms", "Blog & CMS", 35, "newspaper", "Publish blog posts and guides to attract search traffic."),
  content("seo-manager", "Advanced SEO Manager", 45, "search", "Bulk meta editing, redirects, structured data and an XML sitemap manager."),
  content("mega-menu", "Mega Menu Builder", 35, "menu", "Build large, multi-column navigation menus with images."),
  content("section-builder", "Page Layout Section Builder", 75, "layers", "Compose any page from reusable sections and save layouts for later."),
  content("banners", "Dynamic Banner Management", 25, "image", "Schedule banners and sliders, and target them to pages or categories."),
  content("languages", "Additional Language Support", 85, "languages", "Offer your store in another language — for example Bangla and English — with translated content.", { pricing: "quantity", unitLabel: "language", minQty: 1, maxQty: 5 }),
  content("advanced-media", "Advanced Media Management", 35, "images", "Folders, bulk upload, image optimisation and usage tracking for your media.", { requires: ["media-library"] }),

  /* Finance & Analytics */
  finance("finance-dashboard", "Finance Dashboard", 55, "chart-pie", "Revenue, collections, refunds and outstanding cash on delivery in one view."),
  finance("expenses", "Expense Tracking", 25, "receipt", "Record business expenses by category to see where money goes."),
  finance("sales-analytics", "Advanced Sales Analytics", 45, "chart-column", "Sales trends by day, product, category and channel with date comparisons.", { popular: true }),
  finance("custom-reports", "Custom Reports", 35, "file-spreadsheet", "Build and export reports on orders, products and customers."),
  finance("profit-analysis", "Revenue & Profit Analysis", 45, "trending-up", "Profit by product and order using product costs, discounts and delivery charges."),
  finance("customer-analytics", "Customer Analytics", 40, "user-search", "Repeat-purchase rate, customer lifetime value and top customers."),
  finance("invoice-management", "Advanced Invoice Management", 30, "file-check", "Branded invoices, custom numbering and bulk invoice printing."),
  finance("activity-reports", "Store Activity Reports", 30, "activity", "Daily and weekly summaries of store activity sent to your team."),

  /* Delivery & Payments */
  delivery("shipping-zones", "Advanced Shipping Zones", 30, "map", "Delivery charges by district, area, weight or order value.", { requires: ["basic-shipping"] }),
  delivery("courier-api", "Courier API Integration", 50, "truck", "Create courier bookings from the dashboard and sync consignment status. Priced per courier company.", {
    pricing: "quantity",
    unitLabel: "provider",
    minQty: 1,
    maxQty: 5,
    popular: true,
    recurringNote: "Delivery charges are billed by the courier. Requires a merchant account with each courier.",
  }),
  delivery("payment-gateway", "Payment Gateway Integration", 60, "credit-card", "Accept online payments through gateways such as bKash, Nagad or card processors. Priced per gateway.", {
    pricing: "quantity",
    unitLabel: "provider",
    minQty: 1,
    maxQty: 5,
    popular: true,
    recurringNote: "Transaction fees are charged by the payment provider. Each gateway needs its own approved merchant account.",
  }),
  delivery("delivery-tracking", "Automated Delivery Tracking", 35, "route", "Order status updates automatically from courier tracking data.", { requires: ["courier-api"] }),
  delivery("delivery-management", "Delivery Management", 40, "truck", "Assign deliveries to riders, plan routes and record delivery outcomes."),
  delivery("delivery-methods", "Multiple Delivery Methods", 25, "package", "Offer standard, express and store pickup with different charges."),
  delivery("advanced-cod", "Advanced Cash on Delivery Management", 25, "banknote", "COD limits, partial advance payment and courier cash collection reconciliation.", { requires: ["cash-on-delivery"] }),

  /* Administration & Security */
  admin("staff-roles", "Staff & Roles", 60, "user-cog", "Add staff accounts with roles such as manager, order processor and content editor."),
  { key: "advanced-permissions", name: "Advanced Permissions", category: "admin-security", icon: "key-round", summary: "Fine-grained permissions for each role. Comes with Staff & Roles.", pricing: "bundled", requires: ["staff-roles"] },
  admin("audit-trail", "Audit Trail", 35, "scroll-text", "A permanent record of who changed what — prices, orders, products and settings."),
  admin("activity-monitor", "Activity Monitor", 35, "monitor-dot", "See staff sign-ins, active sessions and recent activity in real time."),
  admin("fraud-detection", "Fraud Detection & Blocking", 60, "shield-alert", "Flag suspicious orders and block repeat fake orders by phone number or IP address."),
  admin("security-controls", "Advanced Security Controls", 40, "shield-check", "Two-step sign-in, login attempt limits and IP restrictions for the dashboard."),
  admin("automated-backup", "Automated Backup", 35, "database-backup", "Scheduled database backups with restore points.", { recurringNote: "Backup storage may be billed by your hosting or storage provider." }),
  admin("health-monitoring", "System Health Monitoring", 35, "heart-pulse", "Uptime and error monitoring with alerts when something goes wrong."),
  admin("api-webhooks", "API & Webhooks", 75, "webhook", "A secure API and webhooks to connect your store with other software."),
  admin("integrations", "Integration Management", 45, "plug", "Manage connected services and their API keys from one settings screen."),

  /* AI & Advanced Tools */
  ai("ai-descriptions", "AI Product Description Writer", 40, "pen-line", "Generate SEO-friendly product descriptions from a few product details.", { recurringNote: AI_NOTE }),
  ai("ai-support", "AI Customer Support Assistant", 100, "bot", "An assistant that answers common customer questions about products, delivery and orders.", { recurringNote: AI_NOTE }),
  ai("ai-recommendations", "AI Product Recommendations", 80, "sparkles", "Personalised “you may also like” and “frequently bought together” suggestions.", { recurringNote: AI_NOTE }),
  ai("ai-marketing", "AI Marketing Content Generator", 50, "wand-sparkles", "Draft social posts, ad copy and promotional emails for your products.", { recurringNote: AI_NOTE }),
  ai("ai-seo", "AI SEO Assistant", 50, "search", "Suggestions for titles, meta descriptions and content improvements.", { recurringNote: AI_NOTE }),
  { key: "ai-suite", name: "AI Suite", category: "ai-advanced", icon: "brain", summary: "A tailored package of AI tools for your store, scoped together with our team.", pricing: "custom", recurringNote: AI_NOTE },
  { key: "business-automation", name: "Business Automation", category: "ai-advanced", icon: "workflow", summary: "Custom automations between your store, team and tools — scoped after a consultation.", pricing: "custom" },
  ai("b2b-wholesale", "B2B Wholesale Pricing", 125, "building-2", "Wholesale customer groups with tiered pricing and minimum order quantities.", { requires: ["customer-accounts"] }),
  ai("pwa", "PWA Support", 75, "smartphone", "Let customers install your store on their phone like an app."),
  ai("multi-store", "Multi-Store Management", 180, "store", "Run several storefronts from one dashboard with shared or separate catalogs."),
];

export const builderSettingsSeed: BuilderSettings = {
  pricing: {
    tax: { enabled: false, label: "VAT", ratePercent: null },
    discounts: [
      {
        key: "marketplace-bundle",
        label: "Marketplace bundle — 10% off vendor modules",
        type: "percent",
        percent: 10,
        amount: null,
        minSubtotal: null,
        requiredFeatures: ["multi-vendor", "vendor-dashboard", "vendor-commission", "vendor-payouts"],
        appliesTo: "bundle",
        active: false,
      },
    ],
    quoteValidityDays: 14,
    bdtPerUsd: null,
    paymentTerms: "Payment terms and the advance required to start are confirmed with you before work begins. Development starts once the project scope is confirmed in writing.",
    disclaimer:
      "This quotation is an estimate based on the features selected in the Jarz Digital e-commerce builder. Final scope, timeline and price are confirmed after a consultation. Third-party charges — domain, hosting, SMS, payment gateway, courier and AI usage fees — are not included unless listed. This quotation is not an invoice or proof of payment.",
  },
  content: {
    hero: {
      eyebrow: "E-commerce website development",
      title: "Custom E-commerce Website Development in Bangladesh",
      subtitle: "Build Your E-commerce Website Your Way — Starting at $100",
      description:
        "Choose your preferred online store design, customize your admin dashboard with the features your business needs, and calculate your website development cost instantly with Jarz Digital.",
      primaryCta: "Build Your Website",
      secondaryCta: "Explore Website Designs",
      highlights: ["Choose from ready-made store designs", "Add only the dashboard features you need", "Fully responsive on every device", "Itemised quotation in minutes"],
      techStack: ["Next.js", "MongoDB", "Admin dashboard"],
    },
    sections: {
      templates: { eyebrow: "Step 1 — Design", title: "Choose your store design.", description: "Every design includes the complete base store. Pick the one closest to your brand — we adapt colours, logo and content to you." },
      included: { eyebrow: "Step 2 — Included", title: "What’s included with your website.", description: "These features come with every store at no extra cost." },
      features: { eyebrow: "Step 3 — Dashboard features", title: "Customize your admin dashboard.", description: "Add the advanced modules your business needs. Prices update instantly — remove anything at any time." },
      quote: {
        eyebrow: "Step 4 — Quotation",
        title: "Your itemised quotation.",
        description: "Review your selection, then generate a quotation you can download or share.",
        instructions: "Prices are one-time development fees in US dollars. Third-party running costs, where they apply, are listed separately.",
      },
      order: { eyebrow: "Step 5 — Order", title: "Send us your project request.", description: "Tell us about your business. We’ll review your quotation and contact you to confirm scope, timeline and next steps — no payment is taken here." },
      benefits: { eyebrow: "Why Jarz Digital", title: "Why build your online store with Jarz Digital.", description: "" },
      process: { eyebrow: "Process", title: "How we build your e-commerce website.", description: "" },
      portfolio: { eyebrow: "Portfolio", title: "Websites we’ve built.", description: "A selection of recent website projects by our team." },
      testimonials: { eyebrow: "Testimonials", title: "What our clients say.", description: "" },
      faq: { eyebrow: "FAQ", title: "E-commerce website questions, answered.", description: "" },
    },
    benefits: [
      { title: "Pay only for what you need", description: "Start with a complete $100 store and add only the dashboard features your business will actually use." },
      { title: "Built for how Bangladesh shops", description: "Cash on delivery, delivery charges by area, and add-ons for local courier and payment gateway integrations." },
      { title: "Modern, fast technology", description: "Next.js storefronts and MongoDB-powered admin dashboards built for speed on mobile connections." },
      { title: "Transparent, itemised pricing", description: "See every line of your estimate before you talk to us, and get a written quotation before work starts." },
      { title: "SEO-ready from day one", description: "Clean page structure, meta tags and fast loading to help customers find your store on Google." },
      { title: "One team, end to end", description: "Design, development, SEO and marketing from one agency, with offices in Dhaka, Dallas, Calgary and Cork." },
    ],
    process: [
      { title: "Configure", description: "Choose a design and the features you need, and get an instant itemised estimate." },
      { title: "Confirm", description: "We review your requirements with you and confirm the final scope, timeline and price." },
      { title: "Design & build", description: "We brand your store, build your selected features and set up your admin dashboard." },
      { title: "Test & launch", description: "We test on real devices, add your products and launch your store." },
      { title: "Support & grow", description: "We help with updates, new features and marketing as your business grows." },
    ],
    portfolio: [],
    testimonials: [],
    faqs: [
      {
        question: "How much does an e-commerce website cost in Bangladesh?",
        answer:
          "With Jarz Digital, a custom e-commerce website starts at $100 for the base store — your chosen design plus everything listed under “What’s included”. Advanced dashboard features are priced individually, so the total depends on what your business needs. Use the calculator on this page for an itemised estimate; we confirm the final scope and price with you before work begins.",
      },
      {
        question: "Can I choose my own e-commerce website design?",
        answer: "Yes. Pick one of our store designs as your starting point and we adapt the colours, logo, banners and content to your brand. If you have a different design in mind, describe it in the order form and we’ll review it with you.",
      },
      {
        question: "What features are included in the $100 package?",
        answer:
          "The base package includes a responsive storefront, homepage, product listing and detail pages, categories, product variants, cart, checkout with cash on delivery, customer accounts, basic order and inventory management, and an admin dashboard. The full list is shown in the “What’s included” section on this page.",
      },
      { question: "Can I add advanced features later?", answer: "Yes. You can launch with the base store and add modules such as POS, CRM, courier integration or multi-vendor later. Each addition is quoted separately when you need it." },
      { question: "Will I get an admin dashboard?", answer: "Yes. Every store includes an admin dashboard to manage products, orders, customers and store settings. The configurator on this page lets you add advanced dashboard modules on top of it." },
      {
        question: "Can you integrate bKash, Nagad or other payment gateways?",
        answer:
          "Payment gateway integration is available as an add-on, priced per provider. Each gateway requires its own merchant account and approval from the provider, and transaction fees are charged by the provider. We’ll confirm which gateways suit your business during the consultation.",
      },
      {
        question: "Can you integrate Bangladesh courier services?",
        answer: "Courier API integration is available as an add-on, priced per courier company. It depends on the courier providing an API and approving your merchant account; delivery charges are billed by the courier.",
      },
      {
        question: "Do you develop websites using Next.js and MongoDB?",
        answer: "Yes. Our custom e-commerce builds use Next.js for a fast storefront and MongoDB for the store database and admin dashboard. We also build on WordPress, Shopify and Laravel when one of them suits a project better.",
      },
      { question: "Will my website be mobile-friendly?", answer: "Yes. Every store is built mobile-first and fully responsive, so it looks and works well on phones, tablets and desktops." },
      {
        question: "Can I add AI features?",
        answer: "Yes. AI tools such as a product description writer, a customer support assistant and product recommendations are available as add-ons. AI services are billed by the AI provider based on usage, separately from development.",
      },
      {
        question: "How long does development take?",
        answer: "It depends on the design changes and the features you choose — a base store takes less time than a store with many advanced modules. We confirm a timeline together with your quotation after reviewing your requirements.",
      },
      {
        question: "Do you provide hosting, maintenance and technical support?",
        answer: "Yes. We can set up hosting and provide ongoing maintenance and support. These are ongoing services, quoted separately from the one-time development price shown in the calculator.",
      },
    ],
    cta: {
      eyebrow: "Ready when you are",
      title: "Let’s build your online store.",
      description: "Configure your store above for an instant estimate, or talk to our team on WhatsApp about what you need.",
      primaryLabel: "Build your website",
    },
  },
  seo: {
    title: "Ecommerce Website Development Bangladesh",
    description: "Build a custom ecommerce website in Bangladesh with Jarz Digital. Choose your design, select dashboard features, and calculate your development price instantly.",
    canonical: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    noindex: false,
    serviceName: "E-commerce Website Development",
    serviceDescription:
      "Custom e-commerce website development in Bangladesh: choose a store design, add admin dashboard features such as POS, CRM, courier and payment gateway integration, and get an instant itemised price — starting at $100.",
    areaServed: ["Bangladesh"],
  },
  form: {
    businessCategories: [
      "Beauty & cosmetics",
      "Fashion & clothing",
      "Electronics & gadgets",
      "Grocery & food",
      "Health & wellness",
      "Home & lifestyle",
      "Jewellery & accessories",
      "Books & stationery",
      "Kids & toys",
      "Other",
    ],
    contactMethods: ["WhatsApp", "Phone call", "Email"],
    requirementsPlaceholder: "Anything else we should know — number of products, design ideas, deadlines, integrations you already use…",
    termsLabel: "I agree to the Terms of Service and Privacy Policy, and understand this quotation is an estimate until Jarz Digital confirms the project scope.",
    termsUrl: "/terms-of-service",
    privacyUrl: "/privacy-policy",
    successMessage: "Thank you! Your project request has reached our team. We’ll contact you within 24 hours to confirm your scope and next steps.",
  },
  general: {
    acceptingOrders: true,
    closedMessage: "We’re not taking new store orders through the builder right now. Please contact us on WhatsApp and we’ll help you directly.",
    notifyEmails: [],
  },
};
