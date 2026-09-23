"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  question: string;
  answer: string;
}

/** Accessible accordion (button + region pattern) with smooth height animation. */
export function Accordion({ items, tone = "light", defaultOpen = 0 }: { items: AccordionItem[]; tone?: "light" | "dark"; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const base = useId();
  const dark = tone === "dark";

  return (
    <div className={cn("divide-y border-y", dark ? "divide-white/10 border-white/10" : "divide-mist-200 border-mist-200")}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${base}-btn-${i}`;
        const panelId = `${base}-panel-${i}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn("group flex w-full items-center justify-between gap-6 py-6 text-left", dark ? "text-white" : "text-ink-900")}
              >
                <span className="font-display text-lg font-medium tracking-tight md:text-xl">{item.question}</span>
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ease-[var(--ease-out-expo)]",
                    isOpen
                      ? "rotate-45 border-brand-500 bg-brand-500 text-ink-950"
                      : dark
                        ? "border-white/20 text-white/70 group-hover:border-white"
                        : "border-mist-300 text-mist-500 group-hover:border-ink-900 group-hover:text-ink-900",
                  )}
                  aria-hidden
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className={cn("max-w-3xl pb-7 pr-12 leading-relaxed", dark ? "text-white/65" : "text-mist-600")}>{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
