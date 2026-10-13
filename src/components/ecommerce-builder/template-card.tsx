"use client";

import Image from "next/image";
import { Check, ExternalLink } from "lucide-react";
import { formatMoney } from "@/lib/ecommerce-builder/pricing";
import type { PbImage, PbTemplate } from "@/lib/ecommerce-builder/types";
import { cn } from "@/lib/utils";

const ACCENTS = [
  ["#00afb9", "#2f7bff"],
  ["#e8547a", "#f59e7b"],
  ["#7c5cff", "#2f7bff"],
  ["#f2a531", "#e8547a"],
  ["#16a37f", "#00afb9"],
];

function accentFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}

const img = (image: PbImage, className: string, sizes: string) => (
  <Image src={image.src} alt={image.alt} fill sizes={sizes} className={className} unoptimized={!image.src.startsWith("/")} />
);

/**
 * Store preview: the admin's screenshots when uploaded, otherwise a neutral
 * wireframe in the template's accent colours (never another brand's imagery).
 */
export function TemplatePreview({ template }: { template: PbTemplate }) {
  const [a, b] = accentFor(template.id);
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-mist-200 bg-mist-50">
      {template.desktopImage ? (
        img(template.desktopImage, "object-cover object-top", "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw")
      ) : (
        <div aria-hidden className="absolute inset-0 flex flex-col">
          <div className="flex h-6 items-center gap-1.5 border-b border-mist-200 bg-white px-3">
            <span className="size-1.5 rounded-full bg-mist-300" />
            <span className="size-1.5 rounded-full bg-mist-300" />
            <span className="size-1.5 rounded-full bg-mist-300" />
            <span className="ml-3 h-2.5 w-28 rounded-full bg-mist-100" />
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="h-2.5 w-14 rounded-full" style={{ background: a }} />
            <span className="flex gap-2">
              <span className="h-1.5 w-8 rounded-full bg-mist-200" />
              <span className="h-1.5 w-8 rounded-full bg-mist-200" />
              <span className="h-1.5 w-8 rounded-full bg-mist-200" />
            </span>
          </div>
          <div className="mx-4 flex flex-1 items-end rounded-xl p-4" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
            <span className="font-display text-lg font-semibold leading-tight text-white/95 sm:text-xl">{template.name}</span>
          </div>
          <div className="grid grid-cols-4 gap-2 p-4">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="space-y-1">
                <span className="block aspect-square rounded-lg bg-white shadow-[0_1px_0_rgb(0_0_0/0.04)]" />
                <span className="block h-1.5 w-3/4 rounded-full bg-mist-200" />
              </span>
            ))}
          </div>
        </div>
      )}
      {template.mobileImage && (
        <div className="absolute bottom-3 right-3 aspect-[9/19] w-[22%] overflow-hidden rounded-[14px] border-[3px] border-ink-900 bg-ink-900 shadow-lift">
          {img(template.mobileImage, "object-cover object-top", "120px")}
        </div>
      )}
    </div>
  );
}

export function TemplateCard({ template, selected, onSelect, currency }: { template: PbTemplate; selected: boolean; onSelect: () => void; currency: string }) {
  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-[28px] border bg-white p-4 transition-all duration-300 sm:p-5",
        selected
          ? "border-brand-500 shadow-[0_0_0_3px_rgb(0_175_185/0.18),0_12px_32px_-8px_rgb(0_175_185/0.12)]"
          : "border-mist-200 hover:border-mist-300 hover:shadow-[0_12px_32px_-12px_rgb(0_0_0/0.1)] hover:-translate-y-1",
      )}
    >
      {selected && (
        <span className="absolute right-6 top-6 z-10 flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-ink-950 shadow-lift">
          <Check className="size-3.5" aria-hidden /> Selected
        </span>
      )}
      <TemplatePreview template={template} />
      <div className="flex flex-1 flex-col px-1 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight text-ink-900">{template.name}</h3>
            {template.tagline && <p className="mt-0.5 text-sm text-mist-500">{template.tagline}</p>}
          </div>
          <p className="shrink-0 text-right text-xs text-mist-500">
            From
            <span className="block font-display text-xl font-semibold text-ink-900">{formatMoney(template.price, currency)}</span>
          </p>
        </div>
        {template.description && <p className="mt-3 text-sm leading-relaxed text-mist-600">{template.description}</p>}
        {template.categories.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Suitable for">
            {template.categories.map((c) => (
              <li key={c} className="rounded-full bg-mist-50 px-2.5 py-1 text-xs text-mist-600">
                {c}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <button
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={onSelect}
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full px-5 text-[0.9375rem] font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
              selected ? "bg-ink-900 text-white hover:bg-red-600" : "bg-brand-400 text-ink-950 hover:bg-brand-300 hover:shadow-[0_4px_16px_-4px_rgb(0_175_185/0.4)]",
            )}
          >
            {selected ? (
              <>
                <Check className="size-4" aria-hidden /> Design selected
              </>
            ) : (
              "Select design"
            )}
          </button>
          {template.demoUrl && (
            <a
              href={template.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-mist-300 px-5 text-[0.9375rem] font-medium text-ink-900 transition-colors hover:border-ink-900 hover:bg-ink-900 hover:text-white"
            >
              Live preview <ExternalLink className="size-4" aria-hidden />
              <span className="sr-only">of {template.name} (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
