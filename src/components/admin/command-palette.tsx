"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft, FileText, Loader2, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { can } from "@/lib/auth/permissions";
import type { Role } from "@/models/shared";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "./nav";

interface Item {
  id: string;
  label: string;
  hint: string;
  href: string;
  kind: "page" | "action" | "content";
}

const QUICK_ACTIONS: (Item & { permission: Parameters<typeof can>[1] })[] = [
  { id: "new-post", label: "New blog post", hint: "Create", href: "/admin/posts/new", kind: "action", permission: "content:manage" },
  { id: "new-project", label: "New project", hint: "Create", href: "/admin/projects/new", kind: "action", permission: "content:manage" },
  { id: "new-service", label: "New service", hint: "Create", href: "/admin/services/new", kind: "action", permission: "content:manage" },
  { id: "upload", label: "Upload media", hint: "Media", href: "/admin/media", kind: "action", permission: "media:manage" },
];

/** Admin command palette: jump to any section, run quick actions, search content. */
export function CommandPalette({ open, onClose, role }: { open: boolean; onClose: () => void; role: Role }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [response, setResponse] = useState<{ q: string; results: Item[] }>({ q: "", results: [] });
  const debounced = useDebounce(q, 200);
  const searchQ = debounced.trim();
  const searching = searchQ.length >= 2;
  const loading = searching && response.q !== searchQ;
  const remote = useMemo(() => (searching && response.q === searchQ ? response.results : []), [searching, response, searchQ]);

  // Reset the palette each time it opens (adjusted during render).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQ("");
      setActive(0);
    }
  }

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!searching) return;
    const ctrl = new AbortController();
    fetch(`/api/admin/search?q=${encodeURIComponent(searchQ)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((d: { results: Item[] }) => setResponse({ q: searchQ, results: d.results }))
      .catch(() => undefined);
    return () => ctrl.abort();
  }, [searching, searchQ]);

  const items = useMemo(() => {
    const pages: Item[] = ADMIN_NAV.flatMap((g) =>
      g.items.filter((i) => can(role, i.permission)).map((i) => ({ id: i.href, label: i.label, hint: g.label || "Go to", href: i.href, kind: "page" as const })),
    );
    const actions = QUICK_ACTIONS.filter((a) => can(role, a.permission));
    const needle = q.trim().toLowerCase();
    const local = [...actions, ...pages].filter((i) => !needle || i.label.toLowerCase().includes(needle));
    return [...local, ...remote].slice(0, 30);
  }, [q, remote, role]);

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[14vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ y: 12, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-lift"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, items.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              }
              if (e.key === "Enter" && items[active]) go(items[active].href);
            }}
          >
            <div className="flex items-center gap-3 border-b border-mist-100 px-4">
              {loading ? <Loader2 className="size-4 animate-spin text-brand-600" /> : <Search className="size-4 text-mist-400" />}
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                placeholder="Search pages, posts, projects, leads…"
                className="h-14 flex-1 bg-transparent text-sm outline-none"
                aria-label="Command"
              />
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
              {items.length === 0 && <li className="px-3 py-8 text-center text-sm text-mist-500">No matches.</li>}
              {items.map((item, i) => (
                <li key={item.id} role="option" aria-selected={i === active}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(item.href)}
                    className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm", i === active ? "bg-mist-100" : "")}
                  >
                    {item.kind === "action" ? <Plus className="size-4 text-brand-600" /> : item.kind === "content" ? <FileText className="size-4 text-mist-500" /> : <CornerDownLeft className="size-4 text-mist-400" />}
                    <span className="flex-1 truncate text-ink-900">{item.label}</span>
                    <span className="text-xs text-mist-400">{item.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
