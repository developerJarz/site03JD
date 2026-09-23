/** Option lists shared by public forms, the client dashboard and admin filters. */

export const BUDGET_OPTIONS = [
  "Under $500",
  "$500 – $1,000",
  "$1,000 – $5,000",
  "$5,000 – $10,000",
  "$10,000+",
  "Not sure yet",
] as const;

export const TIMELINE_OPTIONS = ["As soon as possible", "Within 1 month", "1 – 3 months", "3+ months", "Flexible"] as const;

export const PROJECT_TYPE_OPTIONS = [
  "New website",
  "Website redesign",
  "Fix a broken website",
  "E-commerce store",
  "Web application",
  "Custom software",
  "SEO / Local SEO",
  "Marketing & ads",
  "Ongoing management",
  "Something else",
] as const;

export const LEAD_STATUS_META = {
  NEW: { label: "New", tone: "info" },
  CONTACTED: { label: "Contacted", tone: "brand" },
  QUALIFIED: { label: "Qualified", tone: "violet" },
  IN_PROGRESS: { label: "In progress", tone: "warning" },
  COMPLETED: { label: "Completed", tone: "success" },
  CLOSED: { label: "Closed", tone: "neutral" },
} as const;

export type StatusTone = "info" | "brand" | "violet" | "warning" | "success" | "neutral" | "danger";
