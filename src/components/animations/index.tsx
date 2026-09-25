"use client";

import { MotionConfig, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable motion primitives. Every animation honours the user's
 * reduced-motion preference through <MotionProvider reducedMotion="user">.
 */
export const EASE = [0.16, 1, 0.3, 1] as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user" transition={{ ease: EASE }}>{children}</MotionConfig>;
}

/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */

/**
 * Counts up to the numeric part of values like "500+", "1,000+" or "100%".
 * The real value is what the server renders (search engines, link previews
 * and no-JS visitors never see "0"); after hydration, counters that start
 * below the fold reset to zero and count up when scrolled into view.
 */
export function Counter({ value, className, duration = 1.8 }: { value: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const match = value.match(/^(\D*)([\d,.]+)(.*)$/);
  const animatable = Boolean(match) && !/^(19|20)\d{2}$/.test(value);
  const [display, setDisplay] = useState(value);
  const armed = useRef(false);

  // Arm the count-up only for counters the visitor hasn’t seen yet.
  useEffect(() => {
    const el = ref.current;
    if (!animatable || reduce || !el || el.getBoundingClientRect().top < window.innerHeight) return;
    armed.current = true;
    setDisplay(`${match![1]}0${match![3]}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!armed.current || !inView) return;
    let frame = 0;
    const start = performance.now();
    const target = Number(match![2].replace(/,/g, ""));
    const fmt = new Intl.NumberFormat("en-US");
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(t < 1 ? `${match![1]}${fmt.format(Math.round(target * eased))}${match![3]}` : value);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display}
    </span>
  );
}

/* ------------------------------------------------------------------ */

/** Subtle magnetic pull toward the pointer. Disabled for touch and reduced motion. */
export function Magnetic({ children, strength = 0.25, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */

/** Vertical parallax for imagery inside an overflow-hidden frame. */
export function Parallax({ children, className, offset = 60 }: { children: ReactNode; className?: string; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);
  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={{ y }} className="h-[calc(100%+120px)] -translate-y-[60px] will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/** Thin reading-progress bar (articles). Pure CSS scroll timeline — no scroll listener; hidden where unsupported. */
export function ScrollProgress({ className }: { className?: string }) {
  return <div aria-hidden className={cn("scroll-progress fixed inset-x-0 top-0 z-[60] h-[2px] bg-brand-400", className)} />;
}
