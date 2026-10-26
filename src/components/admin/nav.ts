import type { Permission } from "@/lib/auth/permissions";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: string;
  permission: Permission;
  badge?: "leads" | "requests" | "notifications" | "orders";
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

/** Admin information architecture. Items are filtered by role permissions. */
export const ADMIN_NAV: AdminNavGroup[] = [
  { label: "", items: [{ label: "Dashboard", href: "/admin", icon: "layout-dashboard", permission: "dashboard:view" }] },
  {
    label: "Content",
    items: [
      { label: "Pages", href: "/admin/pages", icon: "file", permission: "content:manage" },
      { label: "Blog posts", href: "/admin/posts", icon: "newspaper", permission: "content:manage" },
      { label: "Categories", href: "/admin/categories", icon: "folder", permission: "content:manage" },
      { label: "Tags", href: "/admin/tags", icon: "tag", permission: "content:manage" },
    ],
  },
  { label: "Services", items: [{ label: "Services", href: "/admin/services", icon: "sparkles", permission: "content:manage" }] },
  {
    label: "Portfolio",
    items: [
      { label: "Projects", href: "/admin/projects", icon: "briefcase", permission: "content:manage" },
      { label: "Industries", href: "/admin/industries", icon: "building", permission: "content:manage" },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Team", href: "/admin/team", icon: "users", permission: "content:manage" },
      { label: "Testimonials", href: "/admin/testimonials", icon: "quote", permission: "content:manage" },
      { label: "FAQs", href: "/admin/faqs", icon: "help", permission: "content:manage" },
    ],
  },
  {
    label: "Leads",
    items: [
      { label: "Contact requests", href: "/admin/leads", icon: "inbox", permission: "leads:manage", badge: "leads" },
      { label: "Project requests", href: "/admin/requests", icon: "kanban", permission: "requests:manage", badge: "requests" },
    ],
  },
  { label: "Sales", items: [{ label: "Quotations & invoices", href: "/admin/billing", icon: "receipt-text", permission: "billing:manage" }] },
  {
    label: "Users",
    items: [
      { label: "All users", href: "/admin/users", icon: "user", permission: "users:manage" },
      { label: "Admins", href: "/admin/users?role=ADMIN", icon: "shield", permission: "users:manage" },
      { label: "Editors", href: "/admin/users?role=EDITOR", icon: "pen", permission: "users:manage" },
    ],
  },
  {
    label: "E-commerce Builder",
    items: [
      { label: "Overview", href: "/admin/ecommerce-builder", icon: "store", permission: "builder:content" },
      { label: "Customer orders", href: "/admin/ecommerce-builder/orders", icon: "shopping-cart", permission: "builder:orders", badge: "orders" },
      { label: "Quotes & invoices", href: "/admin/ecommerce-builder/quotes", icon: "receipt", permission: "builder:orders" },
      { label: "Website templates", href: "/admin/ecommerce-templates", icon: "layout-template", permission: "builder:catalog" },
      { label: "Feature categories", href: "/admin/ecommerce-categories", icon: "layers", permission: "builder:catalog" },
      { label: "Features", href: "/admin/ecommerce-features", icon: "puzzle", permission: "builder:catalog" },
      { label: "Pricing & coupons", href: "/admin/ecommerce-builder/pricing", icon: "percent", permission: "builder:catalog" },
      { label: "Page content", href: "/admin/ecommerce-builder/content", icon: "file-text", permission: "builder:content" },
      { label: "Builder SEO", href: "/admin/ecommerce-builder/seo", icon: "search", permission: "builder:content" },
      { label: "Order form", href: "/admin/ecommerce-builder/form", icon: "clipboard-list", permission: "builder:catalog" },
      { label: "Leads & analytics", href: "/admin/ecommerce-builder/analytics", icon: "chart-column", permission: "builder:orders" },
      { label: "Builder settings", href: "/admin/ecommerce-builder/general", icon: "sliders", permission: "builder:catalog" },
    ],
  },
  { label: "Media", items: [{ label: "Media library", href: "/admin/media", icon: "image", permission: "media:manage" }] },
  {
    label: "SEO",
    items: [
      { label: "Global SEO", href: "/admin/seo", icon: "globe", permission: "seo:global" },
      { label: "Page SEO", href: "/admin/seo/pages", icon: "search", permission: "seo:page" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: "settings", permission: "settings:manage" },
      { label: "Activity log", href: "/admin/activity", icon: "history", permission: "activity:view" },
      { label: "Notifications", href: "/admin/notifications", icon: "bell", permission: "dashboard:view", badge: "notifications" },
    ],
  },
];
