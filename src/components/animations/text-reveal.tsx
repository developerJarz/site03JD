import { Fragment, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Line-mask reveal for display headings, driven purely by CSS so above-the-fold
 * text animates on first paint without waiting for JavaScript (better LCP).
 * The text is real DOM text for SEO and assistive tech.
 */
export function TextReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  as: Tag = "h1",
  prefix,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "p";
  /** Rendered inside the heading before the lines (e.g. a kicker that names the page topic). */
  prefix?: ReactNode;
}) {
  return (
    <Tag className={className}>
      {prefix}
      {prefix && " "}
      {lines.map((line, i) => (
        <Fragment key={i}>
          {/* The space keeps words apart in the text search engines and screen readers get. */}
          {i > 0 && " "}
          <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
            <span
              className={cn("block animate-reveal-up motion-reduce:animate-none", lineClassName)}
              style={{ animationDelay: `${delay + i * stagger}s` } as CSSProperties}
            >
              {line}
            </span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}

/** Fade-up on first paint (CSS only). Use for above-the-fold supporting content. */
export function FadeIn({ children, delay = 0, className, as: Tag = "div" }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "p" | "ul" }) {
  return (
    <Tag className={cn("animate-fade-up motion-reduce:animate-none", className)} style={{ animationDelay: `${delay}s` }}>
      {children}
    </Tag>
  );
}
