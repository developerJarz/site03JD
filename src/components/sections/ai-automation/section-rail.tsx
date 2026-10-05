"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type RailSection = { id: string; label: string };

/**
 * Page contents for long service pages: a sticky side list on large screens and a
 * sticky, swipeable bar under the navbar on smaller ones. Highlights the section in view.
 */
export function SectionRail({ sections, children }: { sections: RailSection[]; children?: React.ReactNode }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [sections]);

  // keep the active chip visible in the phone bar (scrolls the bar only, never the page)
  useEffect(() => {
    const chip = document.querySelector<HTMLElement>(`[data-rail-chip="${active}"]`);
    const bar = chip?.closest("ul");
    if (!chip || !bar || !bar.clientWidth) return;
    bar.scrollTo({ left: chip.offsetLeft - (bar.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <>
      {/* Phones & tablets */}
      <nav aria-label="On this page" className="sticky top-16 z-30 -mx-4 border-b border-mist-200 bg-white/90 backdrop-blur-xl sm:-mx-6 lg:hidden">
        <ul className="scrollbar-none relative flex gap-1 overflow-x-auto px-4 py-2.5 sm:px-6">
          {sections.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                data-rail-chip={s.id}
                aria-current={active === s.id ? "location" : undefined}
                className={cn("block rounded-full px-3.5 py-1.5 text-sm transition-colors", active === s.id ? "bg-ink-900 text-white" : "text-mist-600 hover:text-ink-900")}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop */}
      <nav aria-label="On this page" className="sticky top-28 hidden lg:block">
        <p className="mb-4 text-sm font-medium text-ink-900">On this page</p>
        <ul className="relative space-y-0.5 border-l border-mist-200">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l-2 py-1.5 pl-4 text-[0.95rem] transition-colors",
                  active === s.id ? "border-brand-500 font-medium text-ink-900" : "border-transparent text-mist-500 hover:text-ink-900",
                )}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        {children && <div className="mt-8 border-t border-mist-200 pt-8">{children}</div>}
      </nav>
    </>
  );
}
