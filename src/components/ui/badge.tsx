import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/config/forms";

const tones: Record<StatusTone, string> = {
  info: "bg-info-50 text-azure-600 ring-azure-500/20",
  brand: "bg-brand-50 text-brand-800 ring-brand-500/25",
  violet: "bg-violet-50 text-violet-700 ring-violet-500/20",
  warning: "bg-warning-50 text-amber-800 ring-amber-500/25",
  success: "bg-success-50 text-green-800 ring-green-600/20",
  neutral: "bg-mist-100 text-mist-700 ring-mist-300/60",
  danger: "bg-danger-50 text-red-700 ring-red-500/20",
};

/**
 * Status pill. Always renders a text label (and optional dot) so status is
 * never communicated by colour alone.
 */
export function Badge({ tone = "neutral", dot, className, children }: { tone?: StatusTone; dot?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone], className)}>
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function Chip({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-current/15 px-3 py-1 text-xs font-medium", className)}>
      {children}
    </span>
  );
}
