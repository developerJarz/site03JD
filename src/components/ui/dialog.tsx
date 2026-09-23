"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Accessible modal dialog: focus is moved in and restored on close, Tab is
 * trapped, Escape and backdrop clicks close it, and background scroll locks.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => {
      const first = panel.current?.querySelector<HTMLElement>("[autofocus], input, select, textarea, button:not([data-close])");
      (first ?? panel.current)?.focus();
    }, 20);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const nodes = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-3xl", xl: "max-w-5xl" };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[95] flex items-end justify-center p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={cn("relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-lift outline-none sm:rounded-2xl", widths[size])}
          >
            <div className="flex items-start justify-between gap-4 border-b border-mist-100 px-6 py-5">
              <div>
                <h2 id={titleId} className="font-display text-lg font-semibold tracking-tight text-ink-900">
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="mt-1 text-sm text-mist-600">
                    {description}
                  </p>
                )}
              </div>
              <button data-close onClick={onClose} className="rounded-lg p-1.5 text-mist-400 hover:bg-mist-100 hover:text-ink-900" aria-label="Close dialog">
                <X className="size-4" />
              </button>
            </div>
            {children && <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>}
            {footer && <div className="flex justify-end gap-2 border-t border-mist-100 bg-mist-25 px-6 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
