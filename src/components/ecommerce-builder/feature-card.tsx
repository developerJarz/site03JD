"use client";

import Image from "next/image";
import { Check, Info, Link2, Lock, Minus, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { priceLabel } from "@/lib/ecommerce-builder/pricing";
import type { PbFeature, Pricebook } from "@/lib/ecommerce-builder/types";
import { cn } from "@/lib/utils";

export interface FeatureState {
  checked: boolean;
  /** Can't be unticked here (bundled, or required by another selected feature). */
  locked: boolean;
  requiredBy: string[];
  qty: number;
}

function QtyStepper({ feature, qty, onQty }: { feature: PbFeature; qty: number; onQty: (n: number) => void }) {
  const min = Math.max(1, feature.minQty);
  return (
    <div className="flex items-center gap-1 rounded-full border border-mist-200 bg-white p-1" role="group" aria-label={`Number of ${feature.unitLabel || "units"} for ${feature.name}`}>
      <button type="button" onClick={() => onQty(qty - 1)} disabled={qty <= min} className="flex size-7 items-center justify-center rounded-full text-mist-600 hover:bg-mist-100 disabled:opacity-40" aria-label="Decrease">
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-[4.5rem] text-center text-xs font-medium tabular-nums text-ink-900" aria-live="polite">
        {qty} {feature.unitLabel || "unit"}
        {qty === 1 ? "" : "s"}
      </span>
      <button type="button" onClick={() => onQty(qty + 1)} disabled={qty >= feature.maxQty} className="flex size-7 items-center justify-center rounded-full text-mist-600 hover:bg-mist-100 disabled:opacity-40" aria-label="Increase">
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export function FeatureCard({
  feature,
  pb,
  state,
  onToggle,
  onQty,
  onLearnMore,
  categoryName,
}: {
  feature: PbFeature;
  pb: Pricebook;
  state: FeatureState;
  onToggle: () => void;
  onQty: (n: number) => void;
  onLearnMore: () => void;
  categoryName?: string;
}) {
  const requires = feature.requires.map((id) => pb.features.find((f) => f.id === id)?.name).filter(Boolean) as string[];
  const custom = feature.pricing === "custom";
  const inputId = `feature-${feature.id}`;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white p-4 transition-all duration-200 sm:rounded-3xl sm:p-5",
        state.checked
          ? "border-brand-500 bg-brand-50/40 shadow-[0_0_0_2px_rgb(0_175_185/0.12),0_8px_24px_-8px_rgb(0_175_185/0.12)]"
          : "border-mist-200 hover:border-brand-200 hover:shadow-[0_8px_24px_-8px_rgb(0_0_0/0.08)] hover:-translate-y-0.5",
      )}
    >
      <label htmlFor={inputId} className={cn("flex gap-3 sm:gap-4", state.locked ? "cursor-default" : "cursor-pointer")}>
        <input id={inputId} type="checkbox" className="peer sr-only" checked={state.checked} disabled={state.locked && state.checked} onChange={onToggle} aria-describedby={`${inputId}-price`} />
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors sm:size-11 sm:rounded-2xl", state.checked ? "bg-ink-900 text-brand-300" : "bg-mist-50 text-brand-700")}>
          <Icon name={feature.icon} className="size-4 sm:size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-display text-[0.95rem] font-semibold leading-snug tracking-tight text-ink-900 sm:text-[1.05rem]">{feature.name}</span>
            {feature.popular && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-brand-800 sm:text-[0.68rem]">Popular</span>}
          </span>
          {categoryName && <span className="mt-0.5 block text-[0.7rem] text-mist-500 sm:text-xs">{categoryName}</span>}
          <span className="mt-1 block text-xs leading-relaxed text-mist-600 sm:mt-1.5 sm:text-sm">{feature.summary}</span>
          <span id={`${inputId}-price`} className={cn("mt-2 inline-flex items-center gap-1.5 text-xs font-semibold sm:mt-3 sm:text-sm", custom ? "text-violet-700" : feature.pricing === "bundled" ? "text-green-700" : "text-ink-900")}>
            {feature.pricing === "bundled" && <Link2 className="size-3 sm:size-3.5" aria-hidden />}
            {priceLabel(feature, pb)}
          </span>
        </span>
        <span
          aria-hidden
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/30 sm:size-6 sm:rounded-lg",
            state.checked ? "border-brand-500 bg-brand-500 text-ink-950" : "border-mist-300 bg-white",
          )}
        >
          {state.checked && (state.locked ? <Lock className="size-2.5 sm:size-3" /> : <Check className="size-3 sm:size-3.5" strokeWidth={3} />)}
        </span>
      </label>

      {(state.requiredBy.length > 0 || (requires.length > 0 && feature.pricing !== "bundled") || feature.recurring) && (
        <ul className="mt-2.5 space-y-1 border-t border-mist-100 pt-2.5 text-[0.7rem] text-mist-600 sm:mt-3 sm:pt-3 sm:text-xs">
          {state.requiredBy.length > 0 && (
            <li className="flex items-start gap-1.5 text-amber-800">
              <Lock className="mt-0.5 size-3 shrink-0" aria-hidden /> Required by {state.requiredBy.join(", ")}
            </li>
          )}
          {requires.length > 0 && feature.pricing !== "bundled" && (
            <li className="flex items-start gap-1.5">
              <Link2 className="mt-0.5 size-3 shrink-0" aria-hidden /> Also adds {requires.join(", ")}
            </li>
          )}
          {feature.recurring && (
            <li className="flex items-start gap-1.5">
              <RefreshCw className="mt-0.5 size-3 shrink-0" aria-hidden /> {feature.recurring.note || "Ongoing third-party costs apply."}
            </li>
          )}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:mt-4">
        <button type="button" onClick={onLearnMore} className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 hover:text-brand-800 sm:text-sm">
          <Info className="size-3.5 sm:size-4" aria-hidden /> Learn more<span className="sr-only"> about {feature.name}</span>
        </button>
        {feature.pricing === "quantity" && state.checked && <QtyStepper feature={feature} qty={state.qty} onQty={onQty} />}
      </div>
    </div>
  );
}

export function FeatureDialog({ feature, pb, state, onClose, onToggle }: { feature: PbFeature | null; pb: Pricebook; state: FeatureState | null; onClose: () => void; onToggle: () => void }) {
  const category = feature ? pb.categories.find((c) => c.id === feature.categoryId)?.name : undefined;
  const requires = feature ? (feature.requires.map((id) => pb.features.find((f) => f.id === id)?.name).filter(Boolean) as string[]) : [];
  const canToggle = feature && state && feature.pricing !== "included" && !(state.locked && state.checked);
  return (
    <Dialog
      open={Boolean(feature)}
      onClose={onClose}
      title={feature?.name ?? ""}
      description={category}
      size="md"
      footer={
        feature && state ? (
          <>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            {canToggle && (
              <Button
                variant={state.checked ? "outline" : "dark"}
                size="sm"
                onClick={() => {
                  onToggle();
                  onClose();
                }}
              >
                {state.checked ? "Remove feature" : `Add — ${priceLabel(feature, pb)}`}
              </Button>
            )}
          </>
        ) : null
      }
    >
      {feature && (
        <div className="space-y-4">
          {feature.image && (
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-mist-200 bg-mist-50">
              <Image src={feature.image.src} alt={feature.image.alt || feature.name} fill sizes="512px" className="object-cover object-top" unoptimized={!feature.image.src.startsWith("/")} />
            </div>
          )}
          <p className="leading-relaxed text-mist-700">{feature.summary}</p>
          {feature.details && <p className="whitespace-pre-line text-sm leading-relaxed text-mist-600">{feature.details}</p>}
          <dl className="grid gap-3 rounded-xl bg-mist-50 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-mist-500">Price</dt>
              <dd className="text-right font-semibold text-ink-900">{priceLabel(feature, pb)}</dd>
            </div>
            {requires.length > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-mist-500">{feature.pricing === "bundled" ? "Comes with" : "Also adds"}</dt>
                <dd className="text-right text-ink-900">{requires.join(", ")}</dd>
              </div>
            )}
            {feature.recurring && (
              <div className="flex justify-between gap-4">
                <dt className="text-mist-500">Running costs</dt>
                <dd className="text-right text-ink-900">{feature.recurring.note || "Billed by the provider"}</dd>
              </div>
            )}
            {state?.requiredBy.length ? (
              <div className="flex justify-between gap-4">
                <dt className="text-mist-500">Required by</dt>
                <dd className="text-right text-ink-900">{state.requiredBy.join(", ")}</dd>
              </div>
            ) : null}
          </dl>
          {feature.pricing === "custom" && <p className="text-sm text-mist-600">This feature is scoped with you during the consultation. It appears on your quotation as “requires review” and isn’t included in the estimated total.</p>}
        </div>
      )}
    </Dialog>
  );
}
