"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check } from "lucide-react";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface ServiceSummary {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  icon: string;
  startingPrice?: string;
  image?: { src: string; alt: string } | null;
  highlights: string[];
}

/**
 * Interactive service index: a large numbered list on the left drives a
 * sticky preview panel on the right. On small screens each row expands in place.
 */
export function ServicesExplorer({ services }: { services: ServiceSummary[] }) {
  const [active, setActive] = useState(0);
  const current = services[active];

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <ol className="lg:col-span-7" role="list">
        {services.map((s, i) => {
          const isActive = i === active;
          return (
            <li key={s.slug} className="border-t border-mist-200 last:border-b">
              <Link
                href={`/services/${s.slug}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group flex items-baseline gap-5 py-6 md:gap-8 md:py-7"
                aria-describedby={`svc-tag-${s.slug}`}
              >
                <span className={cn("font-mono text-sm transition-colors duration-300", isActive ? "text-brand-600" : "text-mist-400")}>{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block font-display text-[clamp(1.6rem,1.1rem+2vw,2.6rem)] font-semibold leading-tight tracking-[-0.03em] transition-[color,transform] duration-500 ease-[var(--ease-out-expo)]",
                      isActive ? "translate-x-1 text-ink-900" : "text-mist-400 group-hover:text-ink-900",
                    )}
                  >
                    {s.title}
                  </span>
                  <span id={`svc-tag-${s.slug}`} className={cn("mt-2 block text-mist-600 transition-opacity duration-300 lg:hidden")}>
                    {s.tagline}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center self-center rounded-full border transition-all duration-500",
                    isActive ? "border-ink-900 bg-ink-900 text-white" : "border-mist-200 text-mist-400 group-hover:border-ink-900 group-hover:text-ink-900",
                  )}
                  aria-hidden
                >
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-28">
          <AnimatePresence mode="wait">
            <motion.article
              key={current.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45 }}
              className="theme-dark overflow-hidden rounded-[28px] bg-ink-900 shadow-lift"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {current.image && <Image src={current.image.src} alt={current.image.alt} fill sizes="40vw" className="object-cover opacity-70" />}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
                <span className="absolute left-6 top-6 flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-ink-950/60 text-brand-300 backdrop-blur">
                  <Icon name={current.icon} className="size-5" />
                </span>
              </div>
              <div className="-mt-10 p-8 pt-0">
                <h3 className="relative font-display text-2xl font-semibold tracking-tight text-white">{current.title}</h3>
                <p className="mt-3 leading-relaxed text-white/65">{current.summary}</p>
                <ul className="mt-6 grid gap-2.5">
                  {current.highlights.slice(0, 4).map((h) => (
                    <li key={h} className="flex items-start gap-3 text-sm text-white/80">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand-400" aria-hidden />
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                  {current.startingPrice ? (
                    <p className="text-sm text-white/50">
                      From <span className="font-display text-xl font-semibold text-white">{current.startingPrice}</span>
                    </p>
                  ) : (
                    <span />
                  )}
                  <Link href={`/services/${current.slug}`} className="link-underline text-sm font-medium text-brand-300">
                    Explore service →
                  </Link>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
