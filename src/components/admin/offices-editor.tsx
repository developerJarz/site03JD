"use client";

import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useId } from "react";
import { controlClass } from "@/components/ui/form";
import { officePath } from "@/lib/seo/locations";
import { cn } from "@/lib/utils";
import type { Office } from "@/types/content";

const blank: Office = { city: "", code: "", region: "", country: "", address: "", phone: "", email: "", description: "", intro: "", mapQuery: "", slug: "", image: null };

function Text({
  label,
  value,
  onChange,
  error,
  help,
  placeholder,
  rows,
  max,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  help?: string;
  placeholder?: string;
  rows?: number;
  max?: number;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex justify-between text-sm font-medium text-ink-800">
        {label}
        {max && <span className={cn("text-xs font-normal", value.length > max ? "text-amber-700" : "text-mist-500")}>{value.length}/{max}</span>}
      </label>
      {rows ? (
        <textarea id={id} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={controlClass(Boolean(error), "py-2")} aria-invalid={Boolean(error) || undefined} />
      ) : (
        <input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={controlClass(Boolean(error), "h-10")} aria-invalid={Boolean(error) || undefined} />
      )}
      {error ? (
        <span role="alert" className="mt-1 block text-xs text-danger-500">
          {error}
        </span>
      ) : (
        help && <span className="mt-1 block text-xs text-mist-500">{help}</span>
      )}
    </div>
  );
}

/**
 * Edits the office list shown in the footer, contact page, “Locations”
 * sections, the /locations pages and LocalBusiness structured data.
 */
export function OfficesEditor({ value, onChange, errors }: { value: Office[]; onChange: (v: Office[]) => void; errors: Record<string, string> }) {
  const set = (i: number, patch: Partial<Office>) => onChange(value.map((o, j) => (j === i ? { ...o, ...patch } : o)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const e = (i: number, k: string) => errors[`offices.${i}.${k}`];

  return (
    <div className="space-y-5">
      <p className="text-sm text-mist-600">
        Offices appear in the footer, on the contact page, in the “Locations” sections and in Google structured data. Each office also gets its own page at <code className="rounded bg-mist-100 px-1">/locations/…</code> — the most important page for ranking in that city. Page titles and descriptions for these pages are managed in SEO → Page SEO.
      </p>
      {(errors.offices || errors["offices."]) && (
        <p role="alert" className="text-sm text-danger-500">
          {errors.offices || errors["offices."]}
        </p>
      )}
      {value.map((o, i) => (
        <fieldset key={i} className="rounded-2xl border border-mist-200 bg-mist-25 p-5">
          <legend className="sr-only">Office {i + 1}</legend>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-medium text-ink-900">
              {o.city || `Office ${i + 1}`} <span className="ml-1 font-mono text-xs text-brand-700">{o.code}</span>
            </p>
            <div className="flex items-center gap-1">
              {o.city && !o.hidePage && (
                <a href={officePath(o)} target="_blank" rel="noopener noreferrer" className="mr-2 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
                  View page <ExternalLink className="size-3" aria-hidden />
                </a>
              )}
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded-md p-1.5 text-mist-400 hover:bg-white hover:text-ink-900 disabled:opacity-30" aria-label={`Move ${o.city || "office"} up`}>
                <ArrowUp className="size-4" />
              </button>
              <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="rounded-md p-1.5 text-mist-400 hover:bg-white hover:text-ink-900 disabled:opacity-30" aria-label={`Move ${o.city || "office"} down`}>
                <ArrowDown className="size-4" />
              </button>
              <button
                type="button"
                disabled={value.length === 1}
                onClick={() => {
                  if (confirm(`Remove the ${o.city || "new"} office? Its location page will stop working after you save.`)) onChange(value.filter((_, j) => j !== i));
                }}
                className="rounded-md p-1.5 text-mist-400 hover:bg-white hover:text-danger-500 disabled:opacity-30"
                aria-label={`Remove ${o.city || "office"}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Text label="City" value={o.city} onChange={(v) => set(i, { city: v })} error={e(i, "city")} />
            <Text label="Code" value={o.code} onChange={(v) => set(i, { code: v.toUpperCase() })} error={e(i, "code")} help="Short label, e.g. DAC" />
            <Text label="Region / state" value={o.region} onChange={(v) => set(i, { region: v })} error={e(i, "region")} />
            <Text label="Country" value={o.country} onChange={(v) => set(i, { country: v })} error={e(i, "country")} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Text label="Address" value={o.address} onChange={(v) => set(i, { address: v })} error={e(i, "address")} help="Include “Online Only” for service-area branches without a public office." className="sm:col-span-2" />
            <Text label="Phone" value={o.phone} onChange={(v) => set(i, { phone: v })} error={e(i, "phone")} />
            <Text label="Email" value={o.email ?? ""} onChange={(v) => set(i, { email: v })} error={e(i, "email")} />
            <Text label="Google Maps search" value={o.mapQuery ?? ""} onChange={(v) => set(i, { mapQuery: v })} error={e(i, "mapQuery")} help="What to search on Google Maps for directions and the map, e.g. a landmark or business listing." />
            <Text label="Page URL" value={o.slug ?? ""} onChange={(v) => set(i, { slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} error={e(i, "slug")} placeholder={o.city.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "city"} help={`/locations/${o.slug || o.city.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "…"}`} />
          </div>
          <div className="mt-4 grid gap-4">
            <Text label="Short description" value={o.description} onChange={(v) => set(i, { description: v })} error={e(i, "description")} rows={2} max={400} help="Shown on office cards." />
            <Text label="Location page introduction" value={o.intro ?? ""} onChange={(v) => set(i, { intro: v })} error={e(i, "intro")} rows={4} max={1200} help="Opening paragraph of the location page. Mention the neighbourhood, who you serve and how to reach you — this text matters most for local search." />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Text label="Photo path" value={o.image?.src ?? ""} onChange={(v) => set(i, { image: v ? { ...(o.image ?? { alt: "" }), src: v } : null })} error={e(i, "image.src")} placeholder="/images/locations/… or https://…" help="Leave empty to show a branded panel." />
            <Text label="Photo description (alt text)" value={o.image?.alt ?? ""} onChange={(v) => set(i, { image: o.image ? { ...o.image, alt: v } : null })} error={e(i, "image.alt")} placeholder={o.image ? `e.g. ${o.city} skyline` : "Add a photo first"} />
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-ink-800">
            <input type="checkbox" checked={!o.hidePage} onChange={(ev) => set(i, { hidePage: !ev.target.checked })} className="size-4 accent-brand-600" />
            Publish a location page for this office
          </label>
        </fieldset>
      ))}
      <button type="button" onClick={() => onChange([...value, { ...blank }])} className="flex items-center gap-1.5 text-sm font-medium text-brand-700">
        <Plus className="size-4" aria-hidden /> Add office
      </button>
    </div>
  );
}
