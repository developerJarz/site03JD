"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { workflowAreas } from "@/content/ai-automation";
import { cn } from "@/lib/utils";

/**
 * "What could we automate?" — pick a part of the business, see three concrete
 * workflows written as trigger, what the automation does, and what you get.
 */
export function WorkflowFinder() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();
  const area = workflowAreas[active];

  const onKey = (e: KeyboardEvent) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + workflowAreas.length) % workflowAreas.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Part of your business" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" onKeyDown={onKey}>
        {workflowAreas.map((a, i) => (
          <button
            key={a.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            id={`${uid}-tab-${a.id}`}
            role="tab"
            type="button"
            aria-selected={i === active}
            aria-controls={`${uid}-panel`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300",
              i === active ? "border-ink-900 bg-ink-900 text-white" : "border-mist-200 bg-white text-mist-700 hover:border-mist-400 hover:text-ink-900",
            )}
          >
            {a.name}
          </button>
        ))}
      </div>

      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${area.id}`} className="mt-8">
        <p className="max-w-2xl text-lg leading-relaxed text-mist-600">{area.intro}</p>

        <div className="mt-8 overflow-hidden rounded-[28px] border border-mist-200">
          {/* column labels describe the three parts of every row */}
          <div aria-hidden className="hidden grid-cols-3 gap-8 border-b border-mist-200 bg-mist-50 px-7 py-3 text-sm text-mist-500 md:grid">
            <span>When</span>
            <span>The automation</span>
            <span>What you get</span>
          </div>
          <ul className="divide-y divide-mist-200">
            {area.workflows.map((w) => (
              <li key={w.when} className="grid gap-3 px-6 py-6 md:grid-cols-3 md:gap-8 md:px-7">
                <p className="font-display text-[1.05rem] font-semibold leading-snug tracking-tight text-ink-900">
                  <span className="mb-1 block text-xs font-normal text-mist-500 md:hidden">When</span>
                  {w.when}
                </p>
                <p className="leading-relaxed text-mist-700">
                  <span className="mb-1 block text-xs text-mist-500 md:hidden">The automation</span>
                  {w.then}
                </p>
                <p className="leading-relaxed text-ink-900">
                  <span className="mb-1 block text-xs text-mist-500 md:hidden">What you get</span>
                  <span className="border-b-2 border-brand-300/70">{w.result}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
