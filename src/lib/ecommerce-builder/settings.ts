/**
 * Builder settings stored in one document (builder_settings, key "ecommerce").
 * Client-safe types. Money values are integer cents.
 *
 * `pricing` is a draft: it reaches customers only through the next published
 * pricebook. `content`, `seo`, `form` and `general` are live as soon as saved.
 */
import type { Cents } from "./types";

export interface DiscountRow {
  key: string;
  label: string;
  /** Leave empty to apply automatically. */
  code?: string;
  type: "percent" | "fixed";
  percent: number | null;
  amount: Cents | null;
  minSubtotal: Cents | null;
  requiredFeatures: string[];
  appliesTo: "all" | "bundle";
  active: boolean;
}

export interface PricingSettings {
  tax: { enabled: boolean; label: string; ratePercent: number | null };
  discounts: DiscountRow[];
  quoteValidityDays: number | null;
  bdtPerUsd: number | null;
  paymentTerms: string;
  disclaimer: string;
}

export interface TitledText {
  title: string;
  description: string;
}

export interface SectionCopy {
  eyebrow: string;
  title: string;
  description: string;
}

export interface BuilderContent {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    highlights: string[];
    techStack: string[];
  };
  sections: {
    templates: SectionCopy;
    included: SectionCopy;
    features: SectionCopy;
    quote: SectionCopy & { instructions: string };
    order: SectionCopy;
    benefits: SectionCopy;
    process: SectionCopy;
    portfolio: SectionCopy;
    testimonials: SectionCopy;
    faq: SectionCopy;
  };
  benefits: TitledText[];
  process: TitledText[];
  portfolio: { title: string; description: string; url: string; image: { src: string; alt: string } | null }[];
  testimonials: { quote: string; name: string; role: string }[];
  faqs: { question: string; answer: string }[];
  cta: { eyebrow: string; title: string; description: string; primaryLabel: string };
}

export interface SeoSettings {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  noindex: boolean;
  serviceName: string;
  serviceDescription: string;
  areaServed: string[];
}

export interface FormSettings {
  businessCategories: string[];
  contactMethods: string[];
  requirementsPlaceholder: string;
  termsLabel: string;
  termsUrl: string;
  privacyUrl: string;
  successMessage: string;
}

export interface GeneralSettings {
  acceptingOrders: boolean;
  closedMessage: string;
  notifyEmails: string[];
}

export interface BuilderSettings {
  pricing: PricingSettings;
  content: BuilderContent;
  seo: SeoSettings;
  form: FormSettings;
  general: GeneralSettings;
}

export const SETTINGS_SECTIONS = ["pricing", "content", "seo", "form", "general"] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];
