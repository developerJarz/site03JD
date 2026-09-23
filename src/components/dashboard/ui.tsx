import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-3 text-brand-700">{eyebrow}</p>}
        <h1 className="font-display text-4xl font-semibold tracking-display text-ink-900 md:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-mist-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[24px] border border-mist-200 bg-white", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 px-6 pt-6">
          {title && <h2 className="font-display text-lg font-semibold tracking-tight text-ink-900">{title}</h2>}
          {action}
        </header>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}

export function Metric({ label, value, href, dark }: { label: string; value: number | string; href?: string; dark?: boolean }) {
  const body = (
    <div className={cn("group flex h-full flex-col justify-between rounded-[24px] border p-6 transition-colors", dark ? "theme-dark border-transparent bg-ink-900" : "border-mist-200 bg-white hover:border-mist-300")}>
      <p className={cn("text-sm", dark ? "text-white/60" : "text-mist-600")}>{label}</p>
      <div className="mt-8 flex items-end justify-between">
        <p className={cn("font-display text-5xl font-semibold tracking-tight", dark ? "text-white" : "text-ink-900")}>{value}</p>
        {href && <ArrowUpRight className={cn("size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5", dark ? "text-brand-300" : "text-mist-400")} aria-hidden />}
      </div>
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

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-mist-100", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label="Progress">
      <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-azure-500 transition-[width] duration-700" style={{ width: `${value}%` }} />
    </div>
  );
}
