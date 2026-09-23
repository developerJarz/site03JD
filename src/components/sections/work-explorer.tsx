"use client";

import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/marketing/cards";
import { cn } from "@/lib/utils";
import { PROJECT_CATEGORIES, type Project } from "@/types/content";

/**
 * Portfolio explorer: filter by category and industry, plus free-text search.
 * Filters are mirrored into the URL so filtered views can be shared.
 */
export function WorkExplorer({ projects, industries }: { projects: Project[]; industries: { slug: string; name: string }[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [industry, setIndustry] = useState(params.get("industry") ?? "all");
  const [query, setQuery] = useState(params.get("q") ?? "");

  const sync = (next: { category?: string; industry?: string; q?: string }) => {
    const sp = new URLSearchParams();
    const c = next.category ?? category;
    const i = next.industry ?? industry;
    const q = next.q ?? query;
    if (c !== "all") sp.set("category", c);
    if (i !== "all") sp.set("industry", i);
    if (q) sp.set("q", q);
    router.replace(`/work${sp.size ? `?${sp}` : ""}`, { scroll: false });
  };

  const usedIndustries = industries.filter((i) => projects.some((p) => p.industry?.slug === i.slug));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (category === "all" || p.categories.includes(category as Project["categories"][number])) &&
        (industry === "all" || p.industry?.slug === industry) &&
        (!q || `${p.title} ${p.client} ${p.summary} ${p.location ?? ""}`.toLowerCase().includes(q)),
    );
  }, [projects, category, industry, query]);

  const tabs = [{ value: "all", label: "All work" }, ...PROJECT_CATEGORIES.filter((c) => projects.some((p) => p.categories.includes(c.value)))];

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-mist-200 pb-8 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by service" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={category === t.value}
              onClick={() => {
                setCategory(t.value);
                sync({ category: t.value });
              }}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                category === t.value ? "border-ink-900 bg-ink-900 text-white" : "border-mist-200 text-mist-600 hover:border-ink-900 hover:text-ink-900",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="industry-filter">
            Filter by industry
          </label>
          <select
            id="industry-filter"
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value);
              sync({ industry: e.target.value });
            }}
            className="h-11 rounded-full border border-mist-200 bg-white px-4 text-sm text-ink-900 outline-none focus:border-brand-500"
          >
            <option value="all">All industries</option>
            {usedIndustries.map((i) => (
              <option key={i.slug} value={i.slug}>
                {i.name}
              </option>
            ))}
          </select>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-mist-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => sync({})}
              placeholder="Search projects"
              aria-label="Search projects"
              className="h-11 w-full rounded-full border border-mist-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-brand-500 sm:w-60"
            />
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-mist-500" aria-live="polite">
        Showing {filtered.length} of {projects.length} projects
      </p>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-[28px] border border-dashed border-mist-300 py-20 text-center">
          <p className="font-display text-xl font-semibold text-ink-900">No projects match those filters.</p>
          <button
            type="button"
            onClick={() => {
              setCategory("all");
              setIndustry("all");
              setQuery("");
              router.replace("/work", { scroll: false });
            }}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-700"
          >
            <X className="size-4" aria-hidden /> Clear filters
          </button>
        </div>
      ) : (
        <motion.ul layout className="mt-8 grid gap-x-8 gap-y-14 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.li
                layout
                key={p.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, delay: Math.min(i, 6) * 0.04 }}
              >
                <ProjectCard project={p} priority={i < 2} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
