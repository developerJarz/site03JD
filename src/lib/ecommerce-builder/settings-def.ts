/**
 * Admin editor definitions for builder settings, built from the CMS field
 * types so they render with the shared FieldRenderer and validate with the
 * shared schema builder. Client-safe.
 */
import type { Permission } from "@/lib/auth/permissions";
import type { FieldDef, SectionDef } from "@/lib/cms/types";
import type { SettingsSection } from "./settings";

export interface SettingsPageDef {
  section: SettingsSection;
  title: string;
  description: string;
  permission: Permission;
  /** Saved values reach customers only after Publish pricing. */
  draft?: boolean;
  sections: SectionDef[];
}

const copy = (key: string, label: string): SectionDef => ({
  title: label,
  fields: [
    { name: `sections.${key}.eyebrow`, label: "Eyebrow", type: "text", max: 80, width: "half" },
    { name: `sections.${key}.title`, label: "Title", type: "text", max: 160, width: "half", required: true },
    { name: `sections.${key}.description`, label: "Description", type: "textarea", rows: 2, max: 600 },
  ],
});

const titled = (name: string, label: string, itemLabel = "title"): FieldDef => ({
  name,
  label,
  type: "repeater",
  itemLabel,
  fields: [
    { name: "title", label: "Title", type: "text", required: true, max: 120 },
    { name: "description", label: "Description", type: "textarea", rows: 2, max: 400 },
  ],
});

export function settingsPageDef(section: SettingsSection, featureOptions: { value: string; label: string }[]): SettingsPageDef {
  switch (section) {
    case "pricing":
      return {
        section,
        title: "Pricing, discounts & coupons",
        description: "Tax, automatic discounts, coupon codes and quotation terms. Template and feature prices are edited on each template and feature.",
        permission: "builder:catalog",
        draft: true,
        sections: [
          {
            title: "Quotations",
            fields: [
              { name: "quoteValidityDays", label: "Quotation validity (days)", type: "number", min: 1, max: 365, width: "half", required: true },
              { name: "bdtPerUsd", label: "BDT per 1 USD (display only)", type: "number", min: 0, max: 10000, width: "half", help: "Shows approximate taka amounts beside USD. Leave empty to hide — update it yourself; the site never guesses a rate." },
              { name: "paymentTerms", label: "Payment terms", type: "textarea", rows: 3, max: 1500, help: "Printed on quotations and invoices." },
              { name: "disclaimer", label: "Project scope disclaimer", type: "textarea", rows: 4, max: 2000, help: "Printed on quotations." },
            ],
          },
          {
            title: "Tax",
            fields: [
              { name: "tax.enabled", label: "Add tax to quotations", type: "boolean" },
              { name: "tax.label", label: "Tax label", type: "text", max: 40, width: "half", placeholder: "VAT" },
              { name: "tax.ratePercent", label: "Rate (%)", type: "number", min: 0, max: 100, width: "half" },
            ],
          },
          {
            title: "Discounts, bundles & coupon codes",
            description: "Leave the coupon code empty for an automatic discount. Add a code when customers must enter it. Save, then publish pricing on Overview to activate your changes.",
            fields: [
              {
                name: "discounts",
                label: "Discount rules",
                type: "repeater",
                itemLabel: "label",
                fields: [
                  { name: "label", label: "Label (shown to customers)", type: "text", required: true, max: 120 },
                  { name: "key", label: "Discount ID", type: "text", max: 60, width: "half", help: "Generated from the label if empty." },
                  { name: "code", label: "Coupon code (optional)", type: "text", max: 40, width: "half", placeholder: "SAVE10", help: "Letters, numbers, hyphens and underscores. Codes are case-insensitive and must be unique. Leave empty to apply automatically." },
                  {
                    name: "type",
                    label: "Type",
                    type: "select",
                    required: true,
                    width: "half",
                    options: [
                      { value: "percent", label: "Percentage off" },
                      { value: "fixed", label: "Fixed amount off" },
                    ],
                  },
                  { name: "percent", label: "Percent off", type: "number", min: 0, max: 100, width: "half" },
                  { name: "amount", label: "Amount off (USD)", type: "money", width: "half" },
                  { name: "minSubtotal", label: "Minimum subtotal (USD)", type: "money", width: "half" },
                  {
                    name: "appliesTo",
                    label: "Applies to",
                    type: "select",
                    required: true,
                    width: "half",
                    options: [
                      { value: "all", label: "Whole development subtotal" },
                      { value: "bundle", label: "Only the required features (bundle)" },
                    ],
                  },
                  featureOptions.length
                    ? { name: "requiredFeatures", label: "Required features (all must be selected)", type: "select", multiple: true, options: featureOptions }
                    : { name: "requiredFeatures", label: "Required feature IDs", type: "list" },
                  { name: "active", label: "Active", type: "boolean" },
                ],
              },
            ],
          },
        ],
      };

    case "content":
      return {
        section,
        title: "Page content",
        description: "Every customer-facing text block on the builder page. Saved changes go live immediately.",
        permission: "builder:content",
        sections: [
          {
            title: "Hero",
            fields: [
              { name: "hero.eyebrow", label: "Eyebrow", type: "text", max: 80 },
              { name: "hero.title", label: "H1 heading", type: "text", required: true, max: 120, help: "Keep the primary keyword — e-commerce website development Bangladesh." },
              { name: "hero.subtitle", label: "Supporting headline", type: "text", max: 160 },
              { name: "hero.description", label: "Description", type: "textarea", rows: 3, max: 600 },
              { name: "hero.primaryCta", label: "Primary button", type: "text", max: 40, width: "half" },
              { name: "hero.secondaryCta", label: "Secondary button", type: "text", max: 40, width: "half" },
              { name: "hero.highlights", label: "Highlights", type: "list" },
              { name: "hero.techStack", label: "Technology chips", type: "list" },
            ],
          },
          copy("templates", "Step 1 — Templates"),
          copy("included", "Step 2 — Included features"),
          copy("features", "Step 3 — Feature configurator"),
          { ...copy("quote", "Step 4 — Quotation"), fields: [...copy("quote", "").fields, { name: "sections.quote.instructions", label: "Pricing instructions", type: "textarea", rows: 2, max: 600 }] },
          copy("order", "Step 5 — Order form"),
          { ...copy("benefits", "Why choose Jarz Digital"), fields: [...copy("benefits", "").fields, titled("benefits", "Benefits")] },
          { ...copy("process", "Development process"), fields: [...copy("process", "").fields, titled("process", "Steps")] },
          {
            ...copy("portfolio", "Portfolio"),
            fields: [
              ...copy("portfolio", "").fields,
              {
                name: "portfolio",
                label: "Portfolio items",
                type: "repeater",
                itemLabel: "title",
                fields: [
                  { name: "title", label: "Project", type: "text", required: true, max: 120 },
                  { name: "url", label: "Live URL", type: "url" },
                  { name: "description", label: "Description", type: "textarea", rows: 2, max: 300 },
                  { name: "image", label: "Screenshot", type: "image" },
                ],
                help: "Only real projects. When empty, your published web development projects from Portfolio are shown.",
              },
            ],
          },
          {
            ...copy("testimonials", "Testimonials"),
            fields: [
              ...copy("testimonials", "").fields,
              {
                name: "testimonials",
                label: "Testimonials",
                type: "repeater",
                itemLabel: "name",
                help: "Only real, approved client quotes. The section is hidden while empty.",
                fields: [
                  { name: "quote", label: "Quote", type: "textarea", rows: 3, required: true, max: 800 },
                  { name: "name", label: "Name", type: "text", required: true, max: 120, width: "half" },
                  { name: "role", label: "Role / business", type: "text", max: 120, width: "half" },
                ],
              },
            ],
          },
          {
            ...copy("faq", "FAQs"),
            fields: [
              ...copy("faq", "").fields,
              {
                name: "faqs",
                label: "Questions",
                type: "repeater",
                itemLabel: "question",
                help: "Also published as FAQ structured data. Answer only with what you actually offer.",
                fields: [
                  { name: "question", label: "Question", type: "text", required: true, max: 300 },
                  { name: "answer", label: "Answer", type: "textarea", rows: 4, required: true, max: 2000 },
                ],
              },
            ],
          },
          {
            title: "Final call to action",
            fields: [
              { name: "cta.eyebrow", label: "Eyebrow", type: "text", max: 80, width: "half" },
              { name: "cta.primaryLabel", label: "Button label", type: "text", max: 40, width: "half" },
              { name: "cta.title", label: "Title", type: "text", max: 160, required: true },
              { name: "cta.description", label: "Description", type: "textarea", rows: 2, max: 600 },
            ],
          },
        ],
      };

    case "seo":
      return {
        section,
        title: "SEO settings",
        description: "Search and social metadata plus Service structured data for the builder page. Saved changes go live immediately.",
        permission: "builder:content",
        sections: [
          {
            title: "Search",
            fields: [
              { name: "title", label: "SEO title", type: "text", required: true, max: 70, help: "“ | Jarz Digital” is added automatically." },
              { name: "description", label: "Meta description", type: "textarea", rows: 3, required: true, max: 320 },
              { name: "canonical", label: "Canonical URL", type: "url", help: "Leave empty to use the page’s own URL." },
              { name: "noindex", label: "Hide this page from search engines (noindex)", type: "boolean" },
            ],
          },
          {
            title: "Social sharing",
            fields: [
              { name: "ogTitle", label: "Open Graph title", type: "text", max: 120, help: "Defaults to the SEO title." },
              { name: "ogDescription", label: "Open Graph description", type: "textarea", rows: 2, max: 320 },
              { name: "ogImage", label: "Social preview image URL", type: "text", max: 1000, help: "Absolute URL or a /media/… path. Defaults to the site share image." },
            ],
          },
          {
            title: "Structured data (Service)",
            fields: [
              { name: "serviceName", label: "Service name", type: "text", max: 120, required: true },
              { name: "serviceDescription", label: "Service description", type: "textarea", rows: 3, max: 600 },
              { name: "areaServed", label: "Areas served", type: "list" },
            ],
          },
        ],
      };

    case "form":
      return {
        section,
        title: "Order form settings",
        description: "Options and wording on the customer order form. Saved changes go live immediately.",
        permission: "builder:catalog",
        sections: [
          {
            title: "Options",
            fields: [
              { name: "businessCategories", label: "Business categories", type: "list", help: "Shown in the Business Category dropdown." },
              { name: "contactMethods", label: "Preferred contact methods", type: "list" },
            ],
          },
          {
            title: "Wording",
            fields: [
              { name: "requirementsPlaceholder", label: "Requirements placeholder", type: "textarea", rows: 2, max: 300 },
              { name: "termsLabel", label: "Terms checkbox label", type: "textarea", rows: 2, max: 400, required: true },
              { name: "termsUrl", label: "Terms page path", type: "text", max: 300, width: "half", placeholder: "/terms-of-service" },
              { name: "privacyUrl", label: "Privacy page path", type: "text", max: 300, width: "half", placeholder: "/privacy-policy" },
              { name: "successMessage", label: "Success message", type: "textarea", rows: 2, max: 600, required: true },
            ],
          },
        ],
      };

    case "general":
      return {
        section,
        title: "Builder settings",
        description: "Order intake and notifications.",
        permission: "builder:catalog",
        sections: [
          {
            title: "Orders",
            fields: [
              { name: "acceptingOrders", label: "Accept order requests from the builder", type: "boolean", help: "When off, visitors can still configure and download a quotation." },
              { name: "closedMessage", label: "Message when not accepting orders", type: "textarea", rows: 2, max: 600 },
            ],
          },
          {
            title: "Notifications",
            fields: [
              { name: "notifyEmails", label: "Also email new orders to", type: "list", help: "In addition to Settings → Email admin recipients and ADMIN_NOTIFICATION_EMAIL." },
            ],
          },
        ],
      };
  }
}
