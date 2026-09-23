"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export interface ToolbarFilter {
  param: string;
  label: string;
  options: { value: string; label: string }[];
}

/** URL-driven search + filters for admin lists (shareable, back-button friendly). */
export function ListToolbar({ filters = [], placeholder = "Search…" }: { filters?: ToolbarFilter[]; placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const debounced = useDebounce(q, 300);
  const [pending, startTransition] = useTransition();

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  useEffect(() => {
    if ((params.get("q") ?? "") !== debounced) update({ q: debounced || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const active = filters.some((f) => params.get(f.param)) || Boolean(params.get("q"));

  return (
    <div className={cn("mb-4 flex flex-col gap-3 sm:flex-row sm:items-center", pending && "opacity-70")}>
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist-400" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label="Search"
          className="h-10 w-full rounded-xl border border-mist-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
        />
      </div>
      {filters.map((f) => (
        <label key={f.param} className="flex items-center gap-2 text-sm text-mist-600">
          <span className="sr-only">{f.label}</span>
          <select
            value={params.get(f.param) ?? ""}
            onChange={(e) => update({ [f.param]: e.target.value || null })}
            className="h-10 rounded-xl border border-mist-200 bg-white px-3 text-sm outline-none focus:border-brand-500"
          >
            <option value="">All {f.label.toLowerCase()}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      {active && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            startTransition(() => router.replace(pathname, { scroll: false }));
          }}
          className="inline-flex items-center gap-1 text-sm text-mist-600 hover:text-ink-900"
        >
          <X className="size-4" aria-hidden /> Clear
        </button>
      )}
    </div>
  );
}
