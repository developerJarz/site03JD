"use client";

import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, FileStack, Plus, Trash2, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Form building blocks for the quotation and invoice editors. */

export const inputCls =
  "w-full rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-mist-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export const btn = {
  base: "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
  primary: "bg-ink-900 text-white hover:bg-ink-700",
  brand: "bg-brand-500 text-ink-950 hover:bg-brand-400",
  ghost: "border border-mist-200 bg-white text-mist-700 hover:border-mist-300 hover:bg-mist-50",
  danger: "border border-danger-500/30 bg-white text-danger-500 hover:bg-danger-50",
};

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-xs font-medium text-mist-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[0.7rem] leading-snug text-mist-500">{hint}</span>}
    </label>
  );
}

export function Text({ value, onChange, placeholder, className, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; type?: string }) {
  return <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, className)} />;
}

export function Area({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return <textarea value={value} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "resize-y leading-relaxed")} />;
}

export function Num({ value, onChange, min = 0, step = 1, className }: { value: number; onChange: (v: number) => void; min?: number; step?: number; className?: string }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min={min}
      step={step}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      className={cn(inputCls, "tabular-nums", className)}
    />
  );
}

export function Select<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)} className={cn(inputCls, "pr-8", className)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-mist-700">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", checked ? "bg-brand-500" : "bg-mist-300")}
      >
        <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
      </button>
      {label}
    </label>
  );
}

/** Segmented control. */
export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex flex-wrap rounded-lg border border-mist-200 bg-mist-50 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", value === o.value ? "bg-white text-ink-900 shadow-sm" : "text-mist-500 hover:text-ink-900")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function IconButton({ icon: I, label, onClick, disabled, active, tone }: { icon: LucideIcon; label: string; onClick: () => void; disabled?: boolean; active?: boolean; tone?: "danger" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "rounded-md p-1.5 transition-colors disabled:opacity-30",
        tone === "danger" ? "text-mist-400 hover:bg-danger-50 hover:text-danger-500" : active ? "bg-brand-50 text-brand-700" : "text-mist-400 hover:bg-mist-100 hover:text-ink-900",
      )}
    >
      <I className="size-3.5" aria-hidden />
    </button>
  );
}

export function move<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const j = index + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[index], next[j]] = [next[j], next[index]];
  return next;
}

/** Collapsible editor panel, optionally with section visibility/order/page controls in its header. */
export function Panel({
  title,
  icon: I,
  children,
  defaultOpen = false,
  badge,
  visible,
  onVisible,
  onUp,
  onDown,
  newPage,
  onNewPage,
}: {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
  visible?: boolean;
  onVisible?: (v: boolean) => void;
  onUp?: () => void;
  onDown?: () => void;
  newPage?: boolean;
  onNewPage?: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={cn("rounded-xl border bg-white transition-colors", visible === false ? "border-dashed border-mist-300 bg-mist-25" : "border-mist-200")}>
      <header className="flex items-center gap-1 pr-2">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-2.5 px-3.5 py-3 text-left">
          {I && <I className={cn("size-4 shrink-0", visible === false ? "text-mist-300" : "text-brand-600")} aria-hidden />}
          <span className={cn("truncate text-sm font-semibold", visible === false ? "text-mist-400 line-through" : "text-ink-900")}>{title}</span>
          {badge}
          <ChevronDown className={cn("ml-auto size-4 shrink-0 text-mist-400 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
        {onNewPage && <IconButton icon={FileStack} label={newPage ? "Starts on a new page (click to flow)" : "Start on a new page"} active={newPage} onClick={() => onNewPage(!newPage)} />}
        {onUp && <IconButton icon={ArrowUp} label="Move section up" onClick={onUp} />}
        {onDown && <IconButton icon={ArrowDown} label="Move section down" onClick={onDown} />}
        {onVisible && <IconButton icon={visible ? Eye : EyeOff} label={visible ? "Hide section" : "Show section"} active={visible} onClick={() => onVisible(!visible)} />}
      </header>
      {open && <div className="space-y-4 border-t border-mist-100 px-3.5 pb-4 pt-3.5">{children}</div>}
    </section>
  );
}

/** Reorderable list of records. */
export function ListEditor<T extends { id: string }>({
  items,
  onChange,
  create,
  addLabel,
  render,
  compact,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  addLabel: string;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.id} className={cn("group relative rounded-lg border border-mist-200 bg-mist-25", compact ? "p-2" : "p-3")}>
          <div className="mb-2 flex items-center gap-1">
            <span className="mr-auto font-mono text-[0.65rem] font-semibold text-mist-400">#{i + 1}</span>
            <IconButton icon={ArrowUp} label="Move up" disabled={i === 0} onClick={() => onChange(move(items, i, -1))} />
            <IconButton icon={ArrowDown} label="Move down" disabled={i === items.length - 1} onClick={() => onChange(move(items, i, 1))} />
            <IconButton icon={Trash2} label="Remove" tone="danger" onClick={() => onChange(items.filter((x) => x.id !== item.id))} />
          </div>
          <div className="space-y-2">{render(item, (patch) => onChange(items.map((x) => (x.id === item.id ? { ...x, ...patch } : x))), i)}</div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, create()])} className={cn(btn.base, btn.ghost, "w-full border-dashed")}>
        <Plus className="size-4" aria-hidden /> {addLabel}
      </button>
    </div>
  );
}

/** Editable bullet list of plain strings. */
export function StringList({ items, onChange, addLabel, rows = 2 }: { items: string[]; onChange: (items: string[]) => void; addLabel: string; rows?: number }) {
  return (
    <div className="space-y-2">
      {items.map((text, i) => (
        <div key={i} className="flex gap-1.5">
          <textarea value={text} rows={rows} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} className={cn(inputCls, "resize-y leading-relaxed")} />
          <div className="flex flex-col">
            <IconButton icon={ArrowUp} label="Move up" disabled={i === 0} onClick={() => onChange(move(items, i, -1))} />
            <IconButton icon={ArrowDown} label="Move down" disabled={i === items.length - 1} onClick={() => onChange(move(items, i, 1))} />
            <IconButton icon={Trash2} label="Remove" tone="danger" onClick={() => onChange(items.filter((_, j) => j !== i))} />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className={cn(btn.base, btn.ghost, "w-full border-dashed")}>
        <Plus className="size-4" aria-hidden /> {addLabel}
      </button>
    </div>
  );
}

/** Button that asks for a second click before running a destructive action. */
export function ConfirmAction({ children, confirmLabel = "Confirm", onConfirm, className }: { children: ReactNode; confirmLabel?: string; onConfirm: () => void; className?: string }) {
  const [asking, setAsking] = useState(false);
  if (!asking)
    return (
      <button type="button" onClick={() => setAsking(true)} className={className}>
        {children}
      </button>
    );
  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
        className={cn(btn.base, "bg-danger-500 px-2.5 py-1.5 text-xs text-white hover:bg-danger-500/90")}
      >
        {confirmLabel}
      </button>
      <button type="button" onClick={() => setAsking(false)} className={cn(btn.base, btn.ghost, "px-2.5 py-1.5 text-xs")}>
        Cancel
      </button>
    </span>
  );
}
