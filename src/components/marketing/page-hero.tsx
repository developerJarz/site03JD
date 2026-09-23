import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { FadeIn, TextReveal } from "@/components/animations/text-reveal";
import { JsonLd } from "@/components/marketing/json-ld";
import { breadcrumbSchema } from "@/lib/seo";
import { cn } from "@/lib/utils";

export interface Crumb {
  name: string;
  path: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <JsonLd data={breadcrumbSchema(all)} />
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/45">
          {all.map((c, i) => (
            <li key={c.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
              {i === all.length - 1 ? (
                <span aria-current="page" className="text-white/75">
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className="transition-colors hover:text-white">
                  {c.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/**
 * Dark hero used by every inner marketing page. Titles can be split into
 * lines for the mask reveal; `aside` renders on the right on large screens.
 */
export function PageHero({
  eyebrow,
  title,
  titleLines,
  description,
  crumbs,
  actions,
  aside,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  titleLines?: ReactNode[];
  description?: ReactNode;
  crumbs: Crumb[];
  actions?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("theme-dark relative overflow-hidden bg-ink-950 pb-20 pt-36 md:pb-28 md:pt-44", className)}>
      <div aria-hidden className="absolute inset-0 bg-grid opacity-70 mask-fade-b" />
      <div aria-hidden className="absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgb(0_175_185/0.22),transparent)] blur-2xl" />
      <div aria-hidden className="absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgb(47_123_255/0.12),transparent)] blur-2xl" />

      <div className="container-page relative">
        <Breadcrumbs items={crumbs} className="mb-10" />
        <div className={cn("grid gap-12", aside && "lg:grid-cols-12 lg:items-end")}>
          <div className={cn(aside && "lg:col-span-7")}>
            {eyebrow && (
              <FadeIn>
                <p className="eyebrow mb-6 flex items-center gap-3 text-brand-300">
                  <span aria-hidden className="h-px w-6 bg-current opacity-60" />
                  {eyebrow}
                </p>
              </FadeIn>
            )}
            <TextReveal
              lines={titleLines ?? [title]}
              className="max-w-5xl font-display text-display-md font-semibold tracking-display text-white"
              delay={0.05}
            />
            {description && (
              <FadeIn delay={0.3}>
                <div className="mt-8 max-w-2xl text-lg leading-relaxed text-white/65">{description}</div>
              </FadeIn>
            )}
            {actions && (
              <FadeIn delay={0.4}>
                <div className="mt-10 flex flex-wrap gap-3">{actions}</div>
              </FadeIn>
            )}
          </div>
          {aside && (
            <FadeIn delay={0.35} className="lg:col-span-5">
              {aside}
            </FadeIn>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
