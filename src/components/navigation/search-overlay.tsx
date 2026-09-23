"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AppWindow, ArrowRight, Building2, CornerDownLeft, FileText, Loader2, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/types/content";

const TYPE_META: Record<SearchResult["type"], { label: string; Icon: typeof Search }> = {
  service: { label: "Services", Icon: Sparkles },
  project: { label: "Work", Icon: AppWindow },
  post: { label: "Insights", Icon: FileText },
  industry: { label: "Industries", Icon: Building2 },
};

const QUICK_LINKS: SearchResult[] = [
  { type: "service", title: "Local SEO", description: "Rank on Google Maps", href: "/services/local-seo" },
  { type: "service", title: "Website Development", description: "WordPress, Shopify & Laravel", href: "/services/website-development" },
  { type: "project", title: "Selected work", description: "Recent client projects", href: "/work" },
  { type: "post", title: "Insights", description: "Guides on local SEO and growth", href: "/blog" },
];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<{ q: string; results: SearchResult[] }>({ q: "", results: [] });
  const [active, setActive] = useState(0);
  const debounced = useDebounce(query, 220);
  const searchQ = debounced.trim();
  const remote = searchQ.length >= 2;
  // Derived: we are loading while the latest response is for an older query.
  const loading = remote && response.q !== searchQ;
  const results = remote && response.q === searchQ ? response.results : [];

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!remote) return;
    const ctrl = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(searchQ)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((d: { results: SearchResult[] }) => {
        setResponse({ q: searchQ, results: d.results });
        setActive(0);
      })
      .catch(() => undefined);
    return () => ctrl.abort();
  }, [remote, searchQ]);

  const list = remote ? results : QUICK_LINKS;
  const grouped = useMemo(() => {
    const map = new Map<SearchResult["type"], SearchResult[]>();
    for (const r of list) map.set(r.type, [...(map.get(r.type) ?? []), r]);
    return [...map.entries()];
  }, [list]);

  const go = (href: string) => {
    onClose();
    setQuery("");
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, list.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
    if (e.key === "Enter" && list[active]) {
      e.preventDefault();
      go(list[active].href);
    }
  };

  let index = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-mist-200 bg-white shadow-lift"
            initial={{ y: 16, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 8, scale: 0.98 }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-mist-100 px-5">
              {loading ? <Loader2 className="size-5 animate-spin text-brand-600" aria-hidden /> : <Search className="size-5 text-mist-400" aria-hidden />}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services, work, industries and insights…"
                className="h-16 flex-1 bg-transparent text-base text-ink-900 outline-none placeholder:text-mist-400"
                aria-label="Search query"
                role="combobox"
                aria-expanded="true"
                aria-controls="search-results"
                aria-activedescendant={list[active] ? `search-item-${active}` : undefined}
              />
              <button onClick={onClose} className="rounded-lg p-1.5 text-mist-400 hover:bg-mist-100 hover:text-ink-900" aria-label="Close search">
                <X className="size-4" />
              </button>
            </div>

            <div id="search-results" role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
              {remote && !loading && results.length === 0 && (
                <p className="px-4 py-10 text-center text-sm text-mist-500">No results for “{query}”. Try “SEO”, “website” or “Dallas”.</p>
              )}
              {!remote && <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-mist-400">Quick links</p>}
              {grouped.map(([type, items]) => (
                <div key={type} className="py-1">
                  {remote && <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-mist-400">{TYPE_META[type].label}</p>}
                  {items.map((r) => {
                    index += 1;
                    const i = index;
                    const { Icon } = TYPE_META[r.type];
                    return (
                      <button
                        key={r.href}
                        id={`search-item-${i}`}
                        role="option"
                        aria-selected={i === active}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(r.href)}
                        className={cn("flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition-colors", i === active ? "bg-mist-50" : "hover:bg-mist-50")}
                      >
                        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl border", i === active ? "border-brand-200 bg-brand-50 text-brand-700" : "border-mist-200 text-mist-500")}>
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink-900">{r.title}</span>
                          <span className="block truncate text-sm text-mist-500">{r.description}</span>
                        </span>
                        {i === active ? <CornerDownLeft className="size-4 text-mist-400" aria-hidden /> : <ArrowRight className="size-4 text-mist-300" aria-hidden />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-mist-100 px-5 py-3 text-xs text-mist-400">
              <span>
                <kbd className="rounded border border-mist-200 px-1.5 font-mono">↑</kbd> <kbd className="rounded border border-mist-200 px-1.5 font-mono">↓</kbd> to navigate ·{" "}
                <kbd className="rounded border border-mist-200 px-1.5 font-mono">↵</kbd> to open
              </span>
              <span>
                <kbd className="rounded border border-mist-200 px-1.5 font-mono">Esc</kbd> to close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
