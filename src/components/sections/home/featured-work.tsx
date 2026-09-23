"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { PROJECT_CATEGORIES, type Project } from "@/types/content";
import { cn } from "@/lib/utils";

const categoryLabel = (v: string) => PROJECT_CATEGORIES.find((c) => c.value === v)?.label ?? v;

function WorkCard({ project, index, className }: { project: Project; index: number; className?: string }) {
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
      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <p className="eyebrow text-mist-500">
            {String(index + 1).padStart(2, "0")} · {project.categories.slice(0, 2).map(categoryLabel).join(" / ")}
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900 md:text-3xl">{project.client}</h3>
          <p className="mt-1.5 max-w-lg text-mist-600">{project.summary}</p>
        </div>
        {project.location && <p className="hidden shrink-0 text-sm text-mist-500 md:block">{project.location}</p>}
      </div>
    </Link>
  );
}

/**
 * Featured work. On large screens the section pins while the project track
 * scrolls horizontally with the page; on touch/small screens it becomes a
 * native swipeable carousel.
 */
export function FeaturedWork({ projects }: { projects: Project[] }) {
  const target = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth + 48));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [projects.length]);

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

      {/* Desktop: pinned horizontal scroll */}
      <div ref={target} className="relative hidden lg:block" style={{ height: `calc(100vh + ${distance}px)` }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center gap-12 overflow-hidden py-14">
          {header}
          <motion.div ref={track} style={{ x }} className="flex gap-10 pl-[max(2.5rem,calc((100vw-var(--container-page))/2+2.5rem))] pr-10 will-change-transform">
            {projects.map((p, i) => (
              <WorkCard key={p.slug} project={p} index={i} className="w-[min(46vw,760px)] shrink-0" />
            ))}
            <Link
              href="/work"
              className="group flex w-[22vw] min-w-72 shrink-0 flex-col items-center justify-center rounded-[28px] border border-dashed border-mist-300 text-center transition-colors hover:border-ink-900"
              style={{ aspectRatio: "0.72" }}
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

      {/* Mobile & tablet: swipe carousel */}
      <div className="py-24 lg:hidden">
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
