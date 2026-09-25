import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * CSS-only infinite marquee (no JS). Content is duplicated once; the copy is
 * hidden from assistive tech. Pauses on hover and stops for reduced motion.
 */
export function Marquee({
  children,
  className,
  duration = 40,
  reverse,
  pauseOnHover = true,
  label,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  /** Screen-reader lead-in for the first copy, e.g. "Clients include". */
  label?: string;
}) {
  return (
    <div className={cn("group/marquee flex overflow-hidden mask-fade-x", className)}>
      <div
        className={cn(
          "flex w-max shrink-0 animate-marquee motion-reduce:animate-none",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover/marquee:[animation-play-state:paused]",
        )}
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        <div className="flex shrink-0 items-center">
          {label && <span className="sr-only">{label}: </span>}
          {children}
        </div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
