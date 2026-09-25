import type { CSSProperties, ReactNode } from "react";

/**
 * Scroll reveals without per-element JavaScript. These render plain HTML
 * (they work in server components and hydrate nothing); one shared
 * <RevealObserver> marks elements as they enter the viewport and CSS in
 * globals.css plays the entrance. Content is visible in the server HTML and
 * without JavaScript; elements already on screen at load are never hidden.
 */
type Tag = "div" | "li" | "section" | "article" | "span" | "ul" | "ol";

function el(Cmp: Tag, props: { className?: string; style?: CSSProperties; children: ReactNode; [data: `data-${string}`]: string }) {
  return <Cmp {...props} />;
}

export function Reveal({ children, className, delay = 0, y = 28, as = "div" }: { children: ReactNode; className?: string; delay?: number; y?: number; as?: "div" | "li" | "section" | "article" | "span" }) {
  return el(as, { className, "data-reveal": "", style: { "--reveal-y": `${y}px`, "--reveal-delay": `${delay}s` } as CSSProperties, children });
}

/** Children marked with <StaggerItem> enter one after another. */
export function Stagger({ children, className, stagger = 0.08, as = "div" }: { children: ReactNode; className?: string; stagger?: number; as?: "div" | "ul" | "ol" }) {
  return el(as, { className, "data-stagger": "", style: { "--stagger": `${stagger}s` } as CSSProperties, children });
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" | "article" }) {
  return el(as, { className, "data-reveal": "item", children });
}

/** Image frame that wipes open when scrolled into view. */
export function ImageReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return el("div", { className: `overflow-hidden${className ? ` ${className}` : ""}`, "data-reveal": "image", style: { "--reveal-delay": `${delay}s` } as CSSProperties, children });
}
