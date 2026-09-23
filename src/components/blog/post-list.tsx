"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Category, Post } from "@/types/content";
import { PostCard } from "./post-card";

const PAGE_SIZE = 9;

/** Searchable, paginated post grid with category navigation. */
export function PostList({ posts, categories, activeCategory }: { posts: Post[]; categories: Category[]; activeCategory?: string }) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => `${p.title} ${p.excerpt} ${p.tags.map((t) => t.name).join(" ")}`.toLowerCase().includes(q));
  }, [posts, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-mist-200 pb-8 md:flex-row md:items-center md:justify-between">
        <nav aria-label="Categories" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          <Link
            href="/blog"
            aria-current={!activeCategory ? "page" : undefined}
            className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-medium", !activeCategory ? "border-ink-900 bg-ink-900 text-white" : "border-mist-200 text-mist-600 hover:border-ink-900 hover:text-ink-900")}
          >
            All insights
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/blog/category/${c.slug}`}
              aria-current={activeCategory === c.slug ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium",
                activeCategory === c.slug ? "border-ink-900 bg-ink-900 text-white" : "border-mist-200 text-mist-600 hover:border-ink-900 hover:text-ink-900",
              )}
            >
              {c.name}
            </Link>
          ))}
        </nav>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-mist-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="Search articles"
            aria-label="Search articles"
            className="h-11 w-full rounded-full border border-mist-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-brand-500 md:w-72"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-mist-500" role="status">
          No articles match “{query}”.
        </p>
      ) : (
        <ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, visible).map((p, i) => (
            <li key={p.slug}>
              <PostCard post={p} priority={i < 3} />
            </li>
          ))}
        </ul>
      )}

      {visible < filtered.length && (
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-full border border-mist-300 px-6 py-3 text-sm font-medium text-ink-900 transition-colors hover:border-ink-900 hover:bg-ink-900 hover:text-white"
          >
            Load more articles ({filtered.length - visible} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
