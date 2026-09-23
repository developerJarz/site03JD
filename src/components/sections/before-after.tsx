"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface BeforeAfterItem {
  project: string;
  client: string;
  image: string;
}

/**
 * Before & after redesign showcase. Each published image is a composite
 * (previous site on the left, the Jarz Digital redesign on the right).
 */
export function BeforeAfterShowcase({ items, projectSlugs }: { items: BeforeAfterItem[]; projectSlugs: string[] }) {
  const [active, setActive] = useState(0);
  const current = items[active];
  if (!current) return null;

  return (
    <div>
      <div role="tablist" aria-label="Redesign projects" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
        {items.map((item, i) => (
          <button
            key={item.project}
            role="tab"
            id={`ba-tab-${i}`}
            aria-selected={i === active}
            aria-controls="ba-panel"
            onClick={() => setActive(i)}
            className={cn(
              "shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300",
              i === active ? "border-ink-900 bg-ink-900 text-white" : "border-mist-200 text-mist-600 hover:border-ink-900 hover:text-ink-900",
            )}
          >
            {item.client}
          </button>
        ))}
      </div>

      <div id="ba-panel" role="tabpanel" aria-labelledby={`ba-tab-${active}`} className="relative mt-8 overflow-hidden rounded-[28px] border border-mist-200 bg-gradient-to-br from-mist-50 to-white">
        <div className="relative aspect-[16/9]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={current.image} className="absolute inset-0" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              <Image src={current.image} alt={`${current.client} website before and after the Jarz Digital redesign`} fill sizes="(min-width: 1320px) 1240px, 100vw" className="object-contain" />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="pointer-events-none absolute left-5 top-5 flex gap-2 md:left-8 md:top-8">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-mist-600 ring-1 ring-mist-200 backdrop-blur">Before</span>
          <span className="rounded-full bg-ink-900 px-3 py-1 text-xs font-medium text-white">After</span>
        </div>
        {projectSlugs.includes(current.project) && (
          <Link
            href={`/work/${current.project}`}
            className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-900 shadow-soft ring-1 ring-mist-200 transition-colors hover:bg-ink-900 hover:text-white md:bottom-8 md:right-8"
          >
            View project <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
