import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "light" | "mist" | "dark" | "ink";

const tones: Record<Tone, string> = {
  light: "bg-white text-ink-900",
  mist: "bg-mist-50 text-ink-900",
  dark: "theme-dark bg-ink-900",
  ink: "theme-dark bg-ink-950",
};

export function Section({
  tone = "light",
  className,
  containerClassName,
  children,
  bleed,
  ...props
}: ComponentProps<"section"> & { tone?: Tone; containerClassName?: string; bleed?: boolean }) {
  return (
    <section className={cn("relative py-24 md:py-32", tones[tone], className)} {...props}>
      {bleed ? children : <div className={cn("container-page", containerClassName)}>{children}</div>}
    </section>
  );
}

export function Eyebrow({ children, className, index }: { children: ReactNode; className?: string; index?: string }) {
  return (
    <p className={cn("eyebrow flex items-center gap-3 text-brand-700 [.theme-dark_&]:text-brand-300", className)}>
      {index && <span className="text-mist-500 [.theme-dark_&]:text-white/55">{index}</span>}
      <span aria-hidden className="h-px w-6 bg-current opacity-60" />
      {children}
    </p>
  );
}

/**
 * Standard section heading: eyebrow, display title, supporting copy and an
 * optional action aligned to the right on large screens.
 */
export function SectionHeader({
  eyebrow,
  index,
  title,
  description,
  action,
  align = "left",
  className,
  titleClassName,
  as: Heading = "h2",
}: {
  eyebrow?: ReactNode;
  index?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div
      className={cn(
        "mb-14 flex flex-col gap-8 md:mb-20",
        align === "center" ? "items-center text-center" : "lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {eyebrow && <Eyebrow index={index} className={cn("mb-5", align === "center" && "justify-center")}>{eyebrow}</Eyebrow>}
        <Heading className={cn("font-display text-display-sm font-semibold tracking-display", titleClassName)}>{title}</Heading>
        {description && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
