import type { StatusTone } from "@/config/forms";

/** Public URL of the builder / service page. */
export const BUILDER_PATH = "/services/ecommerce-website-development-bangladesh";

/** How the builder appears in the Services menu and footer, listed right after this service. */
export const BUILDER_NAV = {
  slug: "ecommerce-website-development-bangladesh",
  after: "website-development",
  title: "E-commerce Website Development",
  shortTitle: "E-commerce Websites",
  tagline: "Choose a store design, add features and see your price instantly.",
  icon: "shopping-cart",
};

/** Inserts the builder link after BUILDER_NAV.after (or at the end) in a list of service links. */
export function withBuilderLink<T extends { slug: string }>(items: T[], entry: (afterItem: T | undefined) => T): T[] {
  if (items.some((i) => i.slug === BUILDER_NAV.slug)) return items;
  const at = items.findIndex((i) => i.slug === BUILDER_NAV.after);
  const out = [...items];
  out.splice(at === -1 ? out.length : at + 1, 0, entry(items[at]));
  return out;
}

/** Service pages that show a link to the builder. */
export const BUILDER_LINKED_SERVICES = ["website-development"];

export const ORDER_STATUSES = [
  "new",
  "contacted",
  "awaiting_confirmation",
  "confirmed",
  "awaiting_payment",
  "in_development",
  "testing",
  "delivered",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: StatusTone }> = {
  new: { label: "New", tone: "info" },
  contacted: { label: "Contacted", tone: "brand" },
  awaiting_confirmation: { label: "Awaiting confirmation", tone: "violet" },
  confirmed: { label: "Confirmed", tone: "success" },
  awaiting_payment: { label: "Awaiting payment", tone: "warning" },
  in_development: { label: "In development", tone: "warning" },
  testing: { label: "Testing", tone: "violet" },
  delivered: { label: "Delivered", tone: "success" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

/** The customer has confirmed scope: an invoice may be issued and the value counts as confirmed. */
export const CONFIRMED_STATUSES: readonly OrderStatus[] = ["confirmed", "awaiting_payment", "in_development", "testing", "delivered", "completed"];

export const PAYMENT_METHODS = ["bKash", "Nagad", "Rocket", "Bank transfer", "Card", "Cash", "PayPal", "Wise", "Other"] as const;

export type PaymentStatus = "unpaid" | "partial" | "paid";

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; tone: StatusTone }> = {
  unpaid: { label: "Unpaid", tone: "neutral" },
  partial: { label: "Partially paid", tone: "warning" },
  paid: { label: "Paid", tone: "success" },
};

/** Derived from payments an admin recorded — never from an unverified client claim. */
export function paymentStatus(total: number, paid: number): PaymentStatus {
  if (paid <= 0) return "unpaid";
  return paid >= total ? "paid" : "partial";
}
