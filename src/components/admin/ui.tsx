import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LEAD_STATUS_META } from "@/config/forms";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  crumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8">
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-mist-500">
            {crumbs.map((c, i) => (
              <li key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
                {c.href ? (
                  <Link href={c.href} className="hover:text-ink-900">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-mist-700">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 md:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm text-mist-600">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({ className, children, title, action, padded = true }: { className?: string; children: ReactNode; title?: ReactNode; action?: ReactNode; padded?: boolean }) {
  return (
    <section className={cn("rounded-2xl border border-mist-200 bg-white", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-mist-100 px-5 py-4">
          {title && <h2 className="text-sm font-semibold text-ink-900">{title}</h2>}
          {action}
        </header>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, icon, href, tone = "default" }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; href?: string; tone?: "default" | "brand" }) {
  const body = (
    <div
      className={cn(
        "group flex h-full flex-col rounded-2xl border p-5 transition-colors",
        tone === "brand" ? "theme-dark border-transparent bg-ink-900" : "border-mist-200 bg-white",
        href && (tone === "brand" ? "hover:bg-ink-800" : "hover:border-mist-300"),
      )}
    >
      <div className="flex items-center justify-between">
        <p className={cn("text-sm", tone === "brand" ? "text-white/60" : "text-mist-600")}>{label}</p>
        {icon && <span className={cn("flex size-8 items-center justify-center rounded-lg", tone === "brand" ? "bg-white/10 text-brand-300" : "bg-mist-50 text-brand-700")}>{icon}</span>}
      </div>
      <p className={cn("mt-4 font-display text-3xl font-semibold tracking-tight tabular-nums", tone === "brand" ? "text-white" : "text-ink-900")}>{value}</p>
      {hint && <p className={cn("mt-1 text-xs", tone === "brand" ? "text-white/50" : "text-mist-500")}>{hint}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-mist-300 bg-white px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-mist-50 text-mist-400">{icon ?? <Inbox className="size-5" aria-hidden />}</span>
      <p className="mt-4 font-medium text-ink-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-mist-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Pagination({ page, pages, total, makeHref }: { page: number; pages: number; total: number; makeHref: (p: number) => string }) {
  if (pages <= 1) return <p className="mt-4 text-sm text-mist-500">{total} total</p>;
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
      <p className="text-mist-500">
        Page {page} of {pages} · {total} total
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={makeHref(page - 1)} className="flex items-center gap-1 rounded-lg border border-mist-200 bg-white px-3 py-1.5 hover:border-mist-300">
            <ChevronLeft className="size-4" aria-hidden /> Previous
          </Link>
        ) : null}
        {page < pages ? (
          <Link href={makeHref(page + 1)} className="flex items-center gap-1 rounded-lg border border-mist-200 bg-white px-3 py-1.5 hover:border-mist-300">
            Next <ChevronRight className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

export function LeadStatusBadge({ status }: { status: keyof typeof LEAD_STATUS_META | string }) {
  const meta = LEAD_STATUS_META[status as keyof typeof LEAD_STATUS_META] ?? { label: status, tone: "neutral" as const };
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}

export function PublishBadge({ live }: { live: boolean }) {
  return (
    <Badge tone={live ? "success" : "neutral"} dot>
      {live ? "Published" : "Draft"}
    </Badge>
  );
}

/** Responsive table: horizontal scroll on small screens with sticky first column feel. */
export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-mist-200 bg-white", className)}>
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export const th = "border-b border-mist-100 bg-mist-25 px-4 py-3 text-xs font-medium uppercase tracking-wider text-mist-500";
export const td = "border-b border-mist-100 px-4 py-3 align-middle";
