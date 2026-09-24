"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Eyebrow } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { PROJECT_CATEGORIES, type Project } from "@/types/content";
import { cn } from "@/lib/utils";

const categoryLabel = (v: string) => PROJECT_CATEGORIES.find((c) => c.value === v)?.label ?? v;

/** `pinned`: one-line title and label so the caption height doesn’t depend on the card width. */
function WorkCard({ project, index, className, pinned }: { project: Project; index: number; className?: string; pinned?: boolean }) {
  return (
    <Link href={`/work/${project.slug}`} className={cn("group block", className)} aria-label={`${project.client} — view project`}>
      <div className="relative aspect-[1137/798] overflow-hidden rounded-[28px] bg-mist-100">
        <Image
          src={project.coverImage.src}
          alt={project.coverImage.alt}
          fill
          sizes="(min-width: 1024px) 46vw, 88vw"
          className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          priority={index < 2}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute right-5 top-5 flex size-12 scale-75 items-center justify-center rounded-full bg-white text-ink-900 opacity-0 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:scale-100 group-hover:opacity-100">
          <ArrowUpRight className="size-5" aria-hidden />
        </span>
        <div className="absolute bottom-5 left-5 flex flex-wrap gap-2 opacity-0 transition-all duration-500 group-hover:opacity-100">
          {project.services.slice(0, 3).map((s) => (
            <span key={s.slug} className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink-900 backdrop-blur">
              {s.title}
            </span>
          ))}
        </div>
      </div>
      <div data-caption className="mt-5 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className={cn("eyebrow text-mist-500", pinned && "truncate")}>
            {String(index + 1).padStart(2, "0")} · {project.categories.slice(0, 2).map(categoryLabel).join(" / ")}
          </p>
          <h3 className={cn("mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900 md:text-3xl", pinned && "truncate")}>{project.client}</h3>
          <p className="mt-1.5 line-clamp-2 max-w-lg text-mist-600 lg:[@media(max-height:760px)]:hidden">{project.summary}</p>
        </div>
        {project.location && <p className="hidden shrink-0 text-sm text-mist-500 md:block">{project.location}</p>}
      </div>
    </Link>
  );
}

/** Image aspect of the project mockups (1137 × 798). */
const COVER_RATIO = 1137 / 798;

/**
 * Featured work. On large screens the section pins while the project track
 * scrolls horizontally with the page; on touch/small screens (and very short
 * windows) it becomes a native swipeable carousel.
 *
 * Card size is the smaller of the width-based size and what fits the height
 * left under the navbar and heading, so nothing is cropped at any zoom level.
 */
export function FeaturedWork({ projects }: { projects: Project[] }) {
  const target = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [cardWidth, setCardWidth] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  // Fit cards to the space the stage actually has (it flexes to fill the pinned panel).
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fit = () => {
      if (!el.clientHeight) return; // pinned layout not shown (mobile / short window)
      const captions = [...el.querySelectorAll<HTMLElement>("[data-caption]")].map((c) => c.offsetHeight);
      const captionHeight = Math.max(80, ...captions) + 20; // + mt-5
      const byHeight = (el.clientHeight - captionHeight) * COVER_RATIO;
      setCardWidth(Math.floor(Math.max(200, Math.min(window.innerWidth * 0.46, 760, byHeight))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  // Horizontal travel = how far the track overflows the viewport.
  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth + 48));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [projects.length, cardWidth]);

  const header = (
    <div className="container-page flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <Eyebrow index="04" className="mb-5">
          Selected work
        </Eyebrow>
        <h2 className="font-display text-display-sm font-semibold tracking-display text-ink-900">Recent projects in web design, local SEO & growth.</h2>
      </div>
      <ButtonLink href="/work" variant="outline" arrow>
        View all work
      </ButtonLink>
    </div>
  );

  return (
    <section className="relative bg-mist-50" aria-label="Selected work">

      {/* Desktop: pinned horizontal scroll (needs ≥ 560px of height; shorter windows get the carousel) */}
      <div
        ref={target}
        className="relative hidden lg:[@media(min-height:560px)]:block"
        style={{ height: `calc(100dvh + ${distance}px)`, "--card-w": cardWidth ? `${cardWidth}px` : "min(46vw, 760px)" } as CSSProperties}
      >
        {/* Top padding clears the fixed navbar (h-16 once scrolled). */}
        <div className="sticky top-0 flex h-dvh flex-col gap-8 overflow-hidden pb-8 pt-24 [@media(min-height:820px)]:gap-12 [@media(min-height:820px)]:pb-12 [@media(min-height:820px)]:pt-28">
          {header}
          <div ref={stage} className="flex min-h-0 flex-1 items-center">
            <motion.div ref={track} style={{ x }} className="flex items-start gap-10 pl-[max(2.5rem,calc((100vw-var(--container-page))/2+2.5rem))] pr-10 will-change-transform">
              {projects.map((p, i) => (
                <WorkCard key={p.slug} project={p} index={i} pinned className="w-(--card-w) shrink-0" />
              ))}
              <Link
                href="/work"
                className="group flex aspect-[0.72] h-[calc(var(--card-w)/1.4248)] shrink-0 flex-col items-center justify-center rounded-[28px] border border-dashed border-mist-300 text-center transition-colors hover:border-ink-900"
              >
                <span className="flex size-16 items-center justify-center rounded-full bg-ink-900 text-white transition-transform duration-500 group-hover:scale-110">
                  <ArrowUpRight className="size-6" aria-hidden />
                </span>
                <span className="mt-5 font-display text-2xl font-semibold text-ink-900">All projects</span>
                <span className="mt-1 text-sm text-mist-500">Filter by service & industry</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile, tablet and very short windows: swipe carousel */}
      <div className="py-24 lg:[@media(min-height:560px)]:hidden">
        {header}
        <div className="scrollbar-none mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6">
          {projects.map((p, i) => (
            <WorkCard key={p.slug} project={p} index={i} className="w-[86vw] shrink-0 snap-start sm:w-[70vw]" />
          ))}
        </div>
      </div>
    </section>
  );
}
