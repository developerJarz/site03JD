"use client";

import { MotionConfig, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from "motion/react";
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

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "section" | "article" | "span";
}) {
  const Cmp = motion[as];
  return (
    <Cmp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Cmp>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: (stagger: number = 0.08) => ({ transition: { staggerChildren: stagger } }),
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export function Stagger({ children, className, stagger = 0.08, as = "div" }: { children: ReactNode; className?: string; stagger?: number; as?: "div" | "ul" | "ol" }) {
  const Cmp = motion[as];
  return (
    <Cmp className={className} variants={staggerParent} custom={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }}>
      {children}
    </Cmp>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" | "article" }) {
  const Cmp = motion[as];
  return (
    <Cmp className={className} variants={staggerChild}>
      {children}
    </Cmp>
  );
}

/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */

/** Counts up to the numeric part of values like "500+", "1,000+" or "100%". */
export function Counter({ value, className, duration = 1.8 }: { value: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const match = value.match(/^(\D*)([\d,.]+)(.*)$/);
  const isYear = /^(19|20)\d{2}$/.test(value);
  const target = match ? Number(match[2].replace(/,/g, "")) : 0;
  const [display, setDisplay] = useState(match && !isYear ? `${match[1]}0${match[3]}` : value);

  useEffect(() => {
    if (!match || isYear || !inView || reduce) return;
    let frame = 0;
    const start = performance.now();
    const fmt = new Intl.NumberFormat("en-US");
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(`${match[1]}${fmt.format(Math.round(target * eased))}${match[3]}`);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)} aria-label={value}>
      <span aria-hidden>{reduce ? value : display}</span>
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

/** Image mask reveal — the frame wipes open when scrolled into view. */
export function ImageReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial={{ clipPath: "inset(12% 12% 12% 12% round 24px)", opacity: 0.4 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 24px)", opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 1.3, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Thin progress bar showing reading/scroll progress (used on articles). */
export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24, mass: 0.3 });
  return <motion.div aria-hidden style={{ scaleX }} className={cn("fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-brand-400", className)} />;
}
