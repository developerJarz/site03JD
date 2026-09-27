import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { PROJECT_CATEGORIES, type Project, type Service } from "@/types/content";

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
