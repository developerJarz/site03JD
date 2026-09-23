/**
 * Plain, serialisable content types shared by the database layer,
 * the migrated seed content and the UI. Relations are resolved into
 * lightweight "Ref" objects by the data layer before reaching components.
 */

export type ID = string;

export interface ImageRef {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface SeoFields {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export interface Ref {
  _id: ID;
  slug: string;
  title: string;
}

export interface TitledItem {
  title: string;
  description: string;
}

export interface FeatureGroup {
  title: string;
  description?: string;
  items: string[];
}

export interface PricingPlan {
  name: string;
  audience?: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Service {
  _id: ID;
  slug: string;
  title: string;
  shortTitle: string;
  icon: string;
  tagline: string;
  summary: string;
  heroTitle: string;
  heroSubtitle: string;
  overview: string;
  image?: ImageRef | null;
  problems: TitledItem[];
  included: FeatureGroup[];
  benefits: string[];
  process: TitledItem[];
  capabilities: string[];
  plans: PricingPlan[];
  planNote?: string;
  startingPrice?: string;
  faqs: FaqItem[];
  related: Ref[];
  category?: Ref | null;
  order: number;
  featured: boolean;
  published: boolean;
  seo: SeoFields;
  updatedAt?: string;
}

export const PROJECT_CATEGORIES = [
  { value: "web-development", label: "Web Development" },
  { value: "seo", label: "SEO" },
  { value: "local-seo", label: "Local SEO" },
  { value: "business-management", label: "Business Management" },
  { value: "social-media", label: "Social Media" },
  { value: "advertising", label: "Advertising" },
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]["value"];

export interface Project {
  _id: ID;
  slug: string;
  title: string;
  client: string;
  location?: string;
  industry?: Ref | null;
  services: Ref[];
  categories: ProjectCategory[];
  summary: string;
  description: string;
  coverImage: ImageRef;
  gallery: ImageRef[];
  beforeAfter?: ImageRef | null;
  technologies: string[];
  results: Stat[];
  websiteUrl?: string;
  year?: number;
  featured: boolean;
  order: number;
  published: boolean;
  needsReview: boolean;
  seo: SeoFields;
  updatedAt?: string;
}

export interface Industry {
  _id: ID;
  slug: string;
  name: string;
  headline: string;
  icon: string;
  intro: string;
  challenges: TitledItem[];
  solutions: TitledItem[];
  services: Ref[];
  order: number;
  published: boolean;
  needsReview: boolean;
  seo: SeoFields;
  updatedAt?: string;
}

export interface TeamMember {
  _id: ID;
  slug: string;
  name: string;
  role: string;
  region?: string;
  bio: string;
  highlights: string[];
  photo?: ImageRef | null;
  socials: { linkedin?: string; twitter?: string; website?: string };
  order: number;
  published: boolean;
}

export interface Testimonial {
  _id: ID;
  author: string;
  role?: string;
  company?: string;
  quote: string;
  rating?: number;
  avatar?: ImageRef | null;
  published: boolean;
  order: number;
}

export interface Faq {
  _id: ID;
  question: string;
  answer: string;
  group: string;
  order: number;
  published: boolean;
}

export interface Category {
  _id: ID;
  name: string;
  slug: string;
  description?: string;
  kind: "post" | "service";
}

export interface Tag {
  _id: ID;
  name: string;
  slug: string;
}

export type PostStatus = "draft" | "published";

export interface Post {
  _id: ID;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: ImageRef | null;
  category?: { _id: ID; slug: string; name: string } | null;
  tags: { _id: ID; slug: string; name: string }[];
  authorName: string;
  status: PostStatus;
  publishedAt?: string | null;
  featured: boolean;
  views: number;
  readingTime: number;
  seo: SeoFields;
  updatedAt?: string;
}

export interface CmsPage {
  _id: ID;
  slug: string;
  title: string;
  intro?: string;
  content: string;
  status: PostStatus;
  needsReview: boolean;
  seo: SeoFields;
  updatedAt?: string;
}

export interface Office {
  city: string;
  code: string;
  region: string;
  country: string;
  address: string;
  phone: string;
  email?: string;
  description: string;
  image?: ImageRef | null;
  mapQuery?: string;
}

export interface SiteSettings {
  general: { siteName: string; tagline: string; description: string; foundedYear: number };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    mailingAddress: string;
    hours: { days: string; hours: string }[];
    responseTime: string;
  };
  offices: Office[];
  socials: { facebook?: string; instagram?: string; linkedin?: string; twitter?: string; youtube?: string };
  stats: Stat[];
  trust: string[];
  seo: {
    titleTemplate: string;
    defaultTitle: string;
    defaultDescription: string;
    ogImage?: string;
    keywords: string[];
    googleVerification?: string;
  };
  email: { notifyOnLead: boolean; adminRecipients: string[] };
  security: { allowRegistration: boolean };
  branding: { logo: string; mark: string };
}

export interface SearchResult {
  type: "service" | "project" | "post" | "industry";
  title: string;
  description: string;
  href: string;
}
