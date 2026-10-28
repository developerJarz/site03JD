"use client";

import { Check, ChevronDown, ExternalLink, Link2, Palette, PencilLine, X } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { formatLiveBdt } from "@/hooks/use-live-bdt";
import { CUSTOM_DESIGN_FEE, normalizeReferenceUrl, referenceLabel, STORE_TYPE_GROUPS, storeTypeLabel } from "@/lib/ecommerce-builder/custom-design";
import { formatMoney } from "@/lib/ecommerce-builder/pricing";
import type { CustomDesignRequest } from "@/lib/ecommerce-builder/types";
import { cn } from "@/lib/utils";

const fieldCls =
  "h-12 w-full rounded-xl border border-mist-200 bg-white px-3.5 text-sm text-ink-900 outline-none transition-[border-color,box-shadow] placeholder:text-mist-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15";

/** Store type + reference website → a flat custom design fee on the estimate. */
export function CustomDesignCard({ value, onConfirm, onRemove, currency, rate }: { value?: CustomDesignRequest; onConfirm: (req: CustomDesignRequest) => void; onRemove: () => void; currency: string; rate: number }) {
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [storeType, setStoreType] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const confirmed = value && !editing;
  const fee = formatMoney(CUSTOM_DESIGN_FEE, currency);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!storeType) return setError("Choose your store type.");
    const referenceUrl = url.trim() ? normalizeReferenceUrl(url) : "";
    if (url.trim() && !referenceUrl) return setError("Enter a valid website link, e.g. https://example.com — or leave it empty.");
    setError("");
    setEditing(false);
    onConfirm(referenceUrl ? { storeType, referenceUrl } : { storeType });
  };

  const edit = () => {
    setStoreType(value?.storeType ?? "");
    setUrl(value?.referenceUrl ?? "");
    setError("");
    setEditing(true);
  };

  return (
    <article
      aria-labelledby={`${id}-title`}
      className={cn(
        "mb-6 rounded-[28px] border bg-gradient-to-br p-5 transition-[border-color,box-shadow] md:p-7",
        value ? "border-brand-500 from-brand-50/70 via-white to-white shadow-[0_0_0_2px_rgb(0_175_185/0.18)]" : "border-mist-200 from-brand-50/40 via-white to-white",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3.5">
          <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-ink-900 text-brand-300">
            <Palette className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Custom design request</p>
            <h3 id={`${id}-title`} className="mt-1 font-display text-xl font-semibold tracking-tight text-ink-900 md:text-[1.35rem]">
              Have a store you love? We’ll design yours like it.
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-mist-600">Select your store type and we design a store just for your brand — no need to pick a ready-made design below. Have a website whose look you like? Add its link too.</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-row items-baseline gap-2 sm:flex-col sm:items-end sm:gap-1">
          <span className="font-display text-2xl font-bold tracking-tight text-ink-900 tabular-nums">+{fee}</span>
          <span className="text-xs text-mist-500">one-time · {formatLiveBdt(CUSTOM_DESIGN_FEE, rate)}</span>
        </div>
      </div>

      {confirmed ? (
        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-green-200 bg-green-50/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-sm">
            <p className="flex items-center gap-1.5 font-medium text-ink-900">
              <Check className="size-4 shrink-0 text-green-600" aria-hidden />
              {storeTypeLabel(value.storeType)} store · {fee} added to your estimate
            </p>
            {value.referenceUrl ? (
              <a href={value.referenceUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-1 inline-flex max-w-full items-center gap-1.5 text-mist-600 hover:text-brand-700">
                <Link2 className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">Styled like {referenceLabel(value.referenceUrl)}</span>
                <ExternalLink className="size-3 shrink-0" aria-hidden />
              </a>
            ) : (
              <p className="mt-1 text-mist-600">No reference website — we’ll propose a design for your brand.</p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={edit} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-mist-300 bg-white px-3.5 text-xs font-medium text-ink-900 hover:border-ink-900">
              <PencilLine className="size-3.5" aria-hidden /> Change
            </button>
            <button type="button" onClick={onRemove} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium text-mist-600 hover:bg-mist-100 hover:text-danger-500">
              <X className="size-3.5" aria-hidden /> Remove
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-5">
          <div className="grid gap-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_auto] md:items-end">
            <div>
              <label htmlFor={`${id}-type`} className="mb-1.5 block text-xs font-semibold text-ink-900">
                Store type
              </label>
              <div className="relative">
                <select
                  id={`${id}-type`}
                  value={storeType}
                  onChange={(e) => {
                    setStoreType(e.target.value);
                    setError("");
                  }}
                  className={cn(fieldCls, "appearance-none pr-10", !storeType && "text-mist-400")}
                >
                  <option value="" disabled>
                    Select your store type…
                  </option>
                  {STORE_TYPE_GROUPS.map((g) => (
                    <optgroup key={g.label} label={g.label}>
                      {g.types.map((t) => (
                        <option key={t.id} value={t.id} className="text-ink-900">
                          {t.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-mist-500" aria-hidden />
              </div>
            </div>
            <div>
              <label htmlFor={`${id}-url`} className="mb-1.5 block text-xs font-semibold text-ink-900">
                Website you like <span className="font-normal text-mist-500">(optional)</span>
              </label>
              <input
                id={`${id}-url`}
                type="url"
                inputMode="url"
                autoComplete="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                placeholder="e.g. https://www.yourfavouritestore.com"
                aria-invalid={Boolean(error) || undefined}
                aria-describedby={`${id}-msg`}
                className={fieldCls}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={!storeType} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-ink-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-40 md:flex-initial">
                <Check className="size-4" aria-hidden /> Confirm
              </button>
              {editing && (
                <button type="button" onClick={() => setEditing(false)} className="inline-flex h-12 items-center rounded-xl border border-mist-300 bg-white px-4 text-sm font-medium text-ink-900 hover:border-ink-900">
                  Cancel
                </button>
              )}
            </div>
          </div>
          <p id={`${id}-msg`} aria-live="polite" className={cn("mt-2.5 text-xs", error ? "text-danger-500" : "text-mist-500")}>
            {error || `Confirming adds ${fee} to your estimate as your store design — you can skip the ready-made designs below and go straight to features.`}
          </p>
        </form>
      )}
    </article>
  );
}
