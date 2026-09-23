"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { BarChart3, Code2, MapPin, MousePointerClick, Search, TrendingUp } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { EASE, Magnetic } from "@/components/animations";
import { FadeIn, TextReveal } from "@/components/animations/text-reveal";
import { Marquee } from "@/components/animations/marquee";
import { ButtonLink } from "@/components/ui/button";

/**
 * Homepage hero. The visual on the right is a "growth network": service nodes
 * wired into the Jarz Digital core, communicating that technology, marketing
 * and growth are connected. It is decorative (aria-hidden) — the headline and
 * copy carry the meaning.
 */
const NODES = [
  { key: "seo", label: "SEO", sub: "Organic search", Icon: Search, x: 12, y: 16, depth: 18 },
  { key: "web", label: "Web Development", sub: "WordPress · Shopify · Laravel", Icon: Code2, x: 52, y: 6, depth: 28 },
  { key: "local", label: "Local SEO", sub: "Google Maps", Icon: MapPin, x: 74, y: 42, depth: 14 },
  { key: "ads", label: "Ads", sub: "Google · Meta", Icon: MousePointerClick, x: 62, y: 80, depth: 24 },
  { key: "analytics", label: "Analytics", sub: "Tracking & reporting", Icon: BarChart3, x: 8, y: 70, depth: 20 },
  { key: "growth", label: "Digital Growth", sub: "One connected strategy", Icon: TrendingUp, x: 2, y: 43, depth: 10 },
] as const;

const CORE = { x: 44, y: 44 };

function NodeCard({ node, mx, my, index }: { node: (typeof NODES)[number]; mx: MotionValue<number>; my: MotionValue<number>; index: number }) {
  const x = useTransform(mx, (v) => v * node.depth);
  const y = useTransform(my, (v) => v * node.depth);
  const { Icon } = node;
  return (
    <motion.div
      className="absolute"
      style={{ left: `${node.x}%`, top: `${node.y}%`, x, y }}
      initial={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ delay: 0.6 + index * 0.1, duration: 1, ease: EASE }}
    >
      <div className="animate-float" style={{ animationDelay: `${index * -1.3}s` }}>
        <div className="flex items-center gap-3 whitespace-nowrap rounded-2xl border border-white/10 bg-ink-850/80 py-2.5 pl-2.5 pr-4 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.8)] backdrop-blur-md">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400/25 to-azure-500/10 text-brand-200 ring-1 ring-inset ring-white/10">
            <Icon className="size-4" strokeWidth={1.8} />
          </span>
          <span className="leading-tight">
            <span className="block text-[0.82rem] font-medium text-white">{node.label}</span>
            <span className="block text-[0.7rem] text-white/45">{node.sub}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function GrowthNetwork() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });

  // Line endpoints roughly at the centre of each card (percent space).
  const endpoints = NODES.map((n) => ({ x: n.x + 9, y: n.y + 4 }));

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative aspect-square w-full max-w-[620px]"
      onPointerMove={(e) => {
        if (reduce || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width - 0.5) * 0.6);
        my.set(((e.clientY - r.top) / r.height - 0.5) * 0.6);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {/* Orbits */}
      <div className="absolute inset-[8%] rounded-full border border-white/[0.06]" />
      <div className="absolute inset-[22%] rounded-full border border-dashed border-white/[0.07]" />

      {/* Connections */}
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
        <defs>
          <linearGradient id="hero-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#52d4dc" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#52d4dc" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#5c9cff" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {endpoints.map((p, i) => {
          const cx = CORE.x + 6;
          const cy = CORE.y + 6;
          const d = `M ${p.x} ${p.y} Q ${(p.x + cx) / 2 + (i % 2 ? 6 : -6)} ${(p.y + cy) / 2 + (i % 2 ? -6 : 6)} ${cx} ${cy}`;
          return (
            <g key={i}>
              <motion.path d={d} stroke="url(#hero-line)" strokeWidth="0.25" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 + i * 0.08, duration: 1.4, ease: EASE }} />
              {!reduce && (
                <path d={d} stroke="#8fe6eb" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeDasharray="2 60" strokeLinecap="round" opacity="0.9">
                  <animate attributeName="stroke-dashoffset" from="62" to="0" dur={`${3 + (i % 3)}s`} repeatCount="indefinite" />
                </path>
              )}
            </g>
          );
        })}
      </svg>

      {/* Core */}
      <motion.div
        className="absolute"
        style={{ left: `${CORE.x}%`, top: `${CORE.y}%`, width: "12%", aspectRatio: "1" }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 1, ease: EASE }}
      >
        <span className="absolute inset-0 rounded-3xl bg-brand-400/40 animate-pulse-ring" />
        <span className="absolute inset-0 rounded-3xl bg-brand-400/25 animate-pulse-ring [animation-delay:1.2s]" />
        <div className="relative flex size-full items-center justify-center rounded-3xl border border-brand-300/40 bg-gradient-to-br from-brand-400 to-brand-700 shadow-[0_0_60px_-10px_rgb(0_175_185/0.8)]">
          <span className="font-display text-[clamp(1rem,2.4vw,1.6rem)] font-bold tracking-tight text-ink-950">JD</span>
        </div>
      </motion.div>

      {NODES.map((n, i) => (
        <NodeCard key={n.key} node={n} mx={mx} my={my} index={i} />
      ))}
    </div>
  );
}

const CHIPS = ["Website Development", "SEO", "Local SEO", "Social Media", "Google Ads", "Business Management", "Web Applications", "Software"];

export function HomeHero({ trust, children }: { trust: string[]; children?: ReactNode }) {
  return (
    <section className="theme-dark relative isolate overflow-hidden bg-ink-950">
      {/* Background */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-80 [mask-image:radial-gradient(ellipse_70%_60%_at_60%_40%,black,transparent)]" />
        <motion.div
          className="absolute right-[-10%] top-[-20%] h-[900px] w-[900px] rounded-full bg-[radial-gradient(closest-side,rgb(0_175_185/0.28),rgb(47_123_255/0.1)_60%,transparent)] blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute bottom-0 left-[-10%] h-[500px] w-[700px] rounded-full bg-[radial-gradient(closest-side,rgb(47_123_255/0.14),transparent)] blur-3xl" />
        <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay" />
      </div>

      <div className="container-page grid min-h-[100svh] items-center gap-10 pb-16 pt-32 lg:grid-cols-12 lg:pb-24 lg:pt-36">
        <div className="lg:col-span-7">
          <FadeIn as="p" className="eyebrow flex items-center gap-3 text-brand-300">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-brand-400" />
            </span>
            Jarz Digital — Digital growth partner
          </FadeIn>

          <TextReveal
            className="mt-8 font-display text-display-lg font-semibold tracking-display text-white"
            delay={0.1}
            lines={[
              "We build digital",
              "experiences that",
              <>
                <span className="text-gradient-brand">grow</span> businesses.
              </>,
            ]}
          />

          <FadeIn as="p" delay={0.45} className="mt-8 max-w-xl text-lg leading-relaxed text-white/65 md:text-xl">
            Custom web design, Local SEO, Google Ads and complete business management for growing brands across the USA and Canada — from Dallas, Denver and Calgary.
          </FadeIn>

          <FadeIn delay={0.6} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Magnetic>
              <ButtonLink href="/contact?intent=project" size="lg" arrow className="w-full sm:w-auto">
                Start a Project
              </ButtonLink>
            </Magnetic>
            <ButtonLink href="/work" size="lg" variant="outline-light">
              Explore Our Work
            </ButtonLink>
          </FadeIn>

          <FadeIn as="ul" delay={0.75} className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/55">
            {trust.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <svg viewBox="0 0 16 16" className="size-4 text-brand-400" aria-hidden>
                  <path fill="currentColor" d="M8 1.2 9.9 5l4.2.6-3 3 .7 4.2L8 10.8l-3.8 2 .7-4.2-3-3L6.1 5 8 1.2Z" />
                </svg>
                {t}
              </li>
            ))}
          </FadeIn>
        </div>

        <div className="hidden justify-center lg:col-span-5 lg:flex">
          <GrowthNetwork />
        </div>
      </div>

      {/* Mobile: services as a gentle marquee instead of the network visual */}
      <div className="-mt-6 pb-12 lg:hidden" aria-hidden>
        <Marquee duration={30}>
          {CHIPS.map((c) => (
            <span key={c} className="mx-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70">
              {c}
            </span>
          ))}
        </Marquee>
      </div>
      {children}
    </section>
  );
}
