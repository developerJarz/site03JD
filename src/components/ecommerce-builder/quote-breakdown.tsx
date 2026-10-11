"use client";

import { Check, ChevronDown, Link2, Lock, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { formatBdt, formatMoney } from "@/lib/ecommerce-builder/pricing";
import type { QuoteBreakdown } from "@/lib/ecommerce-builder/types";
import { cn } from "@/lib/utils";

/**
 * Itemised quotation. Used in the quotation step, the mobile drawer and
 * (read-only) on the customer’s quotation page.
 */
export function QuoteBreakdownView({
  breakdown,
  bdtPerUsd,
  onRemove,
  onChooseTemplate,
  showIncluded = true,
  tone = "light",
}: {
  breakdown: QuoteBreakdown;
  bdtPerUsd?: number | null;
  onRemove?: (id: string) => void;
  onChooseTemplate?: () => void;
  showIncluded?: boolean;
  tone?: "light" | "dark";
}) {
  const [includedOpen, setIncludedOpen] = useState(false);
  const money = (c: number) => formatMoney(c, breakdown.currency);
  const dark = tone === "dark";
  const muted = dark ? "text-white/55" : "text-mist-500";
  const strong = dark ? "text-white" : "text-ink-900";
  const rule = dark ? "border-white/10" : "border-mist-100";

  return (
    <div className="text-sm">
      <ul className={cn("divide-y", dark ? "divide-white/10" : "divide-mist-100")}>
        <li className="flex items-start justify-between gap-4 py-3">
          {breakdown.template.id ? (
            <>
              <span>
                <span className={cn("block font-medium", strong)}>{breakdown.template.name}</span>
                <span className={cn("text-xs", muted)}>Website design &amp; base store</span>
              </span>
              <span className={cn("shrink-0 font-semibold tabular-nums", strong)}>{money(breakdown.template.price)}</span>
            </>
          ) : (
            <span className={muted}>
              No design selected yet.{" "}
              {onChooseTemplate && (
                <button type="button" onClick={onChooseTemplate} className="font-medium text-brand-700 underline underline-offset-4 [.theme-dark_&]:text-brand-300">
                  Choose a design
                </button>
              )}
            </span>
          )}
        </li>

        {showIncluded && breakdown.included.length > 0 && (
          <li className="py-3">
            <button type="button" onClick={() => setIncludedOpen((v) => !v)} aria-expanded={includedOpen} className="flex w-full items-center justify-between gap-4 text-left">
              <span className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-success-500 text-white">
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                </span>
                <span className={strong}>{breakdown.included.length} included features</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-green-700 [.theme-dark_&]:text-green-400">Included</span>
                <ChevronDown className={cn("size-4 transition-transform", muted, includedOpen && "rotate-180")} aria-hidden />
              </span>
            </button>
            {includedOpen && (
              <ul className={cn("mt-3 grid gap-1.5 text-xs sm:grid-cols-2", muted)}>
                {breakdown.included.map((f) => (
                  <li key={f.id} className="flex items-start gap-1.5">
                    <Check className="mt-0.5 size-3 shrink-0 text-green-600" aria-hidden /> {f.name}
                  </li>
                ))}
              </ul>
            )}
          </li>
        )}

        {breakdown.lines.map((l) => (
          <li key={l.id} className="flex items-start justify-between gap-3 py-3">
            <span className="min-w-0">
              <span className={cn("block font-medium", strong)}>
                {l.name}
                {l.qty > 1 && <span className={cn("font-normal", muted)}> × {l.qty}</span>}
              </span>
              <span className={cn("text-xs", muted)}>
                {l.pricing === "quantity" ? `${money(l.unitPrice)} per ${l.unitLabel}` : l.categoryName}
                {l.requiredBy?.length ? ` · required by ${l.requiredBy.join(", ")}` : ""}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span className={cn("font-semibold tabular-nums", strong)}>{money(l.amount)}</span>
              {onRemove &&
                (l.requiredBy?.length ? (
                  <span className={cn("flex size-7 items-center justify-center", muted)} title={`Required by ${l.requiredBy.join(", ")}`}>
                    <Lock className="size-3.5" aria-label={`Required by ${l.requiredBy.join(", ")}`} />
                  </span>
                ) : (
                  <button type="button" onClick={() => onRemove(l.id)} className={cn("flex size-7 items-center justify-center rounded-full", dark ? "text-white/50 hover:bg-white/10 hover:text-white" : "text-mist-400 hover:bg-mist-100 hover:text-danger-500")} aria-label={`Remove ${l.name}`}>
                    <X className="size-3.5" />
                  </button>
                ))}
            </span>
          </li>
        ))}

        {breakdown.bundled.map((b) => (
          <li key={b.id} className="flex items-start justify-between gap-4 py-3">
            <span>
              <span className={cn("block font-medium", strong)}>{b.name}</span>
              <span className={cn("flex items-center gap-1 text-xs", muted)}>
                <Link2 className="size-3" aria-hidden /> Included with {b.with}
              </span>
            </span>
            <span className={cn("shrink-0 tabular-nums", muted)}>{money(0)}</span>
          </li>
        ))}
      </ul>

      {breakdown.custom.length > 0 && (
        <div className={cn("mt-3 rounded-2xl border border-dashed p-4", dark ? "border-white/20" : "border-violet-300 bg-violet-50/50")}>
          <p className={cn("text-xs font-semibold uppercase tracking-wider", dark ? "text-violet-300" : "text-violet-700")}>Requires review</p>
          <ul className="mt-2 space-y-1.5">
            {breakdown.custom.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3">
                <span className={strong}>{c.name}</span>
                <span className="flex items-center gap-1.5">
                  <span className={cn("text-xs", muted)}>Contact for pricing</span>
                  {onRemove && (
                    <button type="button" onClick={() => onRemove(c.id)} className={cn("flex size-7 items-center justify-center rounded-full", dark ? "text-white/50 hover:bg-white/10" : "text-mist-400 hover:bg-mist-100 hover:text-danger-500")} aria-label={`Remove ${c.name}`}>
                      <X className="size-3.5" />
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className={cn("mt-2 text-xs", muted)}>Priced after a short consultation — not included in the total below.</p>
        </div>
      )}

      <dl className={cn("mt-4 space-y-2 border-t pt-4", rule)}>
        <div className="flex justify-between gap-4">
          <dt className={muted}>Subtotal</dt>
          <dd className={cn("tabular-nums", strong)}>{money(breakdown.subtotal)}</dd>
        </div>
        {breakdown.discounts.map((d) => (
          <div key={d.id} className="flex justify-between gap-4 text-green-700 [.theme-dark_&]:text-green-400">
            <dt>{d.label}{d.code ? ` (${d.code})` : ""}</dt>
            <dd className="tabular-nums">−{money(d.amount)}</dd>
          </div>
        ))}
        {breakdown.tax && (
          <div className="flex justify-between gap-4">
            <dt className={muted}>
              {breakdown.tax.label} ({breakdown.tax.ratePercent}%)
            </dt>
            <dd className={cn("tabular-nums", strong)}>{money(breakdown.tax.amount)}</dd>
          </div>
        )}
        <div className={cn("flex items-end justify-between gap-4 border-t pt-3", rule)}>
          <dt className={cn("font-medium", strong)}>
            Estimated development total
            <span className={cn("block text-xs font-normal", muted)}>One-time · {breakdown.currency}</span>
          </dt>
          <dd className="text-right">
            <span className={cn("font-display text-3xl font-semibold tracking-tight tabular-nums", strong)}>{money(breakdown.total)}</span>
            {bdtPerUsd ? <span className={cn("block text-xs", muted)}>≈ {formatBdt(breakdown.total, bdtPerUsd)}</span> : null}
          </dd>
        </div>
      </dl>

      {breakdown.recurring.length > 0 && (
        <div className={cn("mt-4 rounded-2xl p-4", dark ? "bg-white/5" : "bg-mist-50")}>
          <p className={cn("flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider", muted)}>
            <RefreshCw className="size-3" aria-hidden /> Separate running costs
          </p>
          <ul className="mt-2 space-y-1.5 text-xs">
            {breakdown.recurring.map((r) => (
              <li key={r.id} className="flex justify-between gap-3">
                <span className={dark ? "text-white/75" : "text-mist-700"}>
                  <span className="font-medium">{r.name}:</span> {r.note || "Billed by the provider"}
                </span>
                <span className={cn("shrink-0 tabular-nums", muted)}>{r.amount !== null ? `${money(r.amount * r.qty)}/${r.interval === "year" ? "yr" : "mo"}` : "Provider"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
