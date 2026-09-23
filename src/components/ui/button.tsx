import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "dark" | "light" | "outline" | "outline-light" | "ghost" | "ghost-light" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium tracking-[-0.01em] transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-400 text-ink-950 hover:bg-brand-300 shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] hover:shadow-glow",
  dark: "bg-ink-900 text-white hover:bg-ink-700",
  light: "bg-white text-ink-900 hover:bg-mist-100",
  outline: "border border-mist-300 bg-white/0 text-ink-900 hover:border-ink-900 hover:bg-ink-900 hover:text-white",
  "outline-light": "border border-white/20 text-white hover:border-white hover:bg-white hover:text-ink-900",
  ghost: "text-ink-800 hover:bg-mist-100",
  "ghost-light": "text-white/80 hover:bg-white/10 hover:text-white",
  danger: "bg-danger-500 text-white hover:bg-red-700",
  link: "px-0! h-auto! text-brand-700 hover:text-brand-600 underline-offset-4 hover:underline",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 rounded-full px-4 text-sm",
  md: "h-11 rounded-full px-5 text-[0.9375rem]",
  lg: "h-14 rounded-full px-7 text-base",
};

export function buttonClasses({ variant = "primary", size = "md", className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

function Arrow() {
  return (
    <span aria-hidden className="relative -mr-1 inline-flex size-5 items-center justify-center overflow-hidden">
      <ArrowUpRight className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-5 group-hover/btn:-translate-y-5" />
      <ArrowUpRight className="absolute size-4 -translate-x-5 translate-y-5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-0 group-hover/btn:translate-y-0" />
    </span>
  );
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; arrow?: boolean; children?: ReactNode };

export function Button({
  variant,
  size,
  arrow,
  loading,
  className,
  children,
  disabled,
  ...props
}: Common & ComponentProps<"button"> & { loading?: boolean }) {
  return (
    <button className={buttonClasses({ variant, size, className })} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
      {arrow && !loading && <Arrow />}
    </button>
  );
}

export function ButtonLink({ variant, size, arrow, className, children, ...props }: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}
