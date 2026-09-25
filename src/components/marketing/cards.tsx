import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { PROJECT_CATEGORIES, type PricingPlan, type Project, type Service } from "@/types/content";

export const categoryLabel = (v: string) => PROJECT_CATEGORIES.find((c) => c.value === v)?.label ?? v;

export function ProjectCard({ project, priority, className }: { project: Project; priority?: boolean; className?: string }) {
  return (
    <Link href={`/work/${project.slug}`} className={cn("group block", className)}>
      <div className="relative aspect-[1137/798] overflow-hidden rounded-3xl bg-mist-100">
        <Image
          src={project.coverImage.src}
          alt={project.coverImage.alt}
          fill
          {...(priority ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
          sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
        />
        <span className="absolute right-4 top-4 flex size-11 scale-75 items-center justify-center rounded-full bg-white text-ink-900 opacity-0 shadow-soft transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:scale-100 group-hover:opacity-100">
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </div>
      <div className="mt-4">
        <p className="eyebrow text-mist-500">{project.categories.slice(0, 2).map(categoryLabel).join(" · ")}</p>
        <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink-900 transition-colors group-hover:text-brand-700">{project.client}</h3>
        <p className="mt-1 line-clamp-2 text-[0.95rem] text-mist-600">{project.summary}</p>
      </div>
    </Link>
  );
}

export function ServiceCard({ service, index }: { service: Service; index?: number }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-mist-200 bg-white p-7 transition-all duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-ink-900 hover:shadow-lift md:p-8"
    >
      <div className="flex items-start justify-between">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-ink-900 text-brand-300 transition-colors duration-500 group-hover:bg-brand-500 group-hover:text-ink-950">
          <Icon name={service.icon} className="size-5" />
        </span>
        {index !== undefined && <span className="font-mono text-xs text-mist-500">{String(index + 1).padStart(2, "0")}</span>}
      </div>
      <h3 className="mt-10 font-display text-2xl font-semibold tracking-tight text-ink-900">{service.title}</h3>
      <p className="mt-3 flex-1 leading-relaxed text-mist-600">{service.tagline}</p>
      <div className="mt-8 flex items-center justify-between border-t border-mist-100 pt-5">
        {service.startingPrice ? (
          <p className="text-sm text-mist-500">
            From <span className="font-semibold text-ink-900">{service.startingPrice}</span>
          </p>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900">
          Explore <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function PricingPlans({ plans, serviceSlug, note }: { plans: PricingPlan[]; serviceSlug: string; note?: string }) {
  if (!plans.length) return null;
  const cols = plans.length === 1 ? "max-w-xl" : plans.length === 2 ? "md:grid-cols-2 max-w-4xl" : "lg:grid-cols-3";
  return (
    <div>
      <div className={cn("mx-auto grid gap-5", cols)}>
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={cn(
              "relative flex flex-col rounded-[28px] border p-8",
              plan.highlighted ? "theme-dark border-transparent bg-ink-900 shadow-lift" : "border-mist-200 bg-white",
            )}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-8 rounded-full bg-brand-400 px-3 py-1 text-xs font-semibold text-ink-950">{plans.length > 1 ? "Most popular" : "Recommended"}</span>
            )}
            <h3 className={cn("font-display text-xl font-semibold tracking-tight", plan.highlighted ? "text-white" : "text-ink-900")}>{plan.name}</h3>
            {plan.audience && <p className={cn("mt-1 text-sm", plan.highlighted ? "text-white/55" : "text-mist-500")}>{plan.audience}</p>}
            <p className="mt-6 flex items-baseline gap-1.5">
              <span className={cn("font-display text-5xl font-semibold tracking-tight", plan.highlighted ? "text-white" : "text-ink-900")}>{plan.price}</span>
              {plan.period && <span className={cn("text-sm", plan.highlighted ? "text-white/55" : "text-mist-500")}>{plan.period}</span>}
            </p>
            {plan.description && <p className={cn("mt-4 text-sm leading-relaxed", plan.highlighted ? "text-white/65" : "text-mist-600")}>{plan.description}</p>}
            <ul className={cn("mt-7 flex-1 space-y-3 border-t pt-7", plan.highlighted ? "border-white/10" : "border-mist-100")}>
              {plan.features.map((f) => (
                <li key={f} className={cn("flex items-start gap-3 text-sm", plan.highlighted ? "text-white/80" : "text-mist-700")}>
                  <Check className={cn("mt-0.5 size-4 shrink-0", plan.highlighted ? "text-brand-300" : "text-brand-600")} aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <ButtonLink
              href={`/contact?service=${serviceSlug}&plan=${encodeURIComponent(plan.name)}`}
              variant={plan.highlighted ? "primary" : "outline"}
              className="mt-8 w-full"
              arrow
            >
              Get started
            </ButtonLink>
          </article>
        ))}
      </div>
      {note && <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-mist-500">{note}</p>}
    </div>
  );
}
