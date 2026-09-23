import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/animations";
import { Icon } from "@/components/ui/icon";
import type { Industry } from "@/types/content";
import { cn } from "@/lib/utils";

/** Industry explorer tiles — used on the homepage and the industries index. */
export function IndustriesGrid({ industries, variant = "compact" }: { industries: Industry[]; variant?: "compact" | "detailed" }) {
  return (
    <Stagger as="ul" className={cn("grid gap-3", variant === "compact" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3")} stagger={0.04}>
      {industries.map((ind) => (
        <StaggerItem as="li" key={ind.slug}>
          <Link
            href={`/industries/${ind.slug}`}
            className={cn(
              "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-mist-200 bg-white transition-all duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-ink-900 hover:shadow-lift",
              variant === "compact" ? "p-5 md:p-6" : "p-7",
            )}
          >
            <div className="flex items-start justify-between">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-mist-50 text-brand-700 ring-1 ring-inset ring-mist-200 transition-colors duration-500 group-hover:bg-ink-900 group-hover:text-brand-300 group-hover:ring-ink-900">
                <Icon name={ind.icon} className="size-5" />
              </span>
              <ArrowUpRight className="size-4 text-mist-300 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink-900" aria-hidden />
            </div>
            <h3 className={cn("font-display font-semibold tracking-tight text-ink-900", variant === "compact" ? "mt-8 text-lg" : "mt-10 text-xl")}>{ind.name}</h3>
            {variant === "detailed" ? (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-mist-600">{ind.intro}</p>
            ) : (
              <p className="mt-1 text-sm text-mist-500">{ind.headline}</p>
            )}
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
