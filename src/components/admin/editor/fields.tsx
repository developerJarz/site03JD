"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { controlClass } from "@/components/ui/form";
import type { FieldDef } from "@/lib/cms/types";
import { cn, slugify } from "@/lib/utils";
import { MediaPicker, type PickedImage } from "./media-picker";

const RichTextEditor = dynamic(() => import("./rich-text").then((m) => m.RichTextEditor), {
  ssr: false,
  loading: () => <div className="h-96 rounded-xl skeleton" />,
});

export type Values = Record<string, unknown>;
export type RelationOptions = Record<string, { value: string; label: string }[]>;

interface FieldProps {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
  errors?: Record<string, string>;
  errorPrefix?: string;
  values?: Values;
  relations?: RelationOptions;
  slugTouched?: boolean;
  onSlugTouched?: () => void;
}

export function FieldShell({ id, label, required, help, error, children, className }: { id: string; label: string; required?: boolean; help?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}
        {required && <span className="ml-0.5 text-brand-600">*</span>}
      </label>
      {children}
      {help && !error && <p className="mt-1.5 text-xs text-mist-500">{help}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-danger-500">
          {error}
        </p>
      )}
    </div>
  );
}

function Switch({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-mist-200 bg-white px-4 py-3 text-left text-sm text-ink-800 hover:border-mist-300"
    >
      {label}
      <span className={cn("relative h-6 w-10 shrink-0 rounded-full transition-colors", checked ? "bg-brand-500" : "bg-mist-200")}>
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
      </span>
    </button>
  );
}

function ListInput({ value, onChange, id, placeholder }: { value: string[]; onChange: (v: string[]) => void; id: string; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v) onChange([...value, v]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((item, i) => (
            <li key={`${item}-${i}`} className="group flex items-center gap-2 rounded-lg border border-mist-200 bg-mist-25 py-1.5 pl-3 pr-1.5 text-sm">
              <input
                value={item}
                onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
                className="min-w-0 flex-1 bg-transparent outline-none"
                aria-label={`Item ${i + 1}`}
              />
              <button type="button" onClick={() => i > 0 && onChange(value.map((x, j) => (j === i - 1 ? value[i] : j === i ? value[i - 1] : x)))} className="rounded p-1 text-mist-400 hover:text-ink-900 disabled:opacity-30" disabled={i === 0} aria-label="Move up">
                <ArrowUp className="size-3.5" />
              </button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded p-1 text-mist-400 hover:text-danger-500" aria-label="Remove item">
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? "Type and press Enter"}
          className={controlClass(false, "h-10")}
        />
        <button type="button" onClick={add} className="shrink-0 rounded-xl border border-mist-200 px-3 text-sm font-medium text-ink-800 hover:border-mist-300">
          Add
        </button>
      </div>
    </div>
  );
}

function ImageField({ value, onChange, id }: { value: PickedImage | null; onChange: (v: PickedImage | null) => void; id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {value ? (
        <div className="overflow-hidden rounded-xl border border-mist-200 bg-white">
          <div className="relative aspect-[16/10] bg-mist-50">
            <Image src={value.src} alt={value.alt || ""} fill sizes="400px" className="object-contain" unoptimized={!value.src.startsWith("/")} />
          </div>
          <div className="space-y-2 p-3">
            <input
              id={id}
              value={value.alt ?? ""}
              onChange={(e) => onChange({ ...value, alt: e.target.value })}
              placeholder="Alt text (describe the image)"
              className={controlClass(false, "h-9 text-sm")}
              aria-label="Alt text"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(true)} className="flex-1 rounded-lg border border-mist-200 py-1.5 text-xs font-medium hover:border-mist-300">
                Replace
              </button>
              <button type="button" onClick={() => onChange(null)} className="rounded-lg border border-mist-200 px-3 py-1.5 text-xs font-medium text-danger-500 hover:border-danger-500">
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          id={id}
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-mist-300 bg-mist-25 py-8 text-sm text-mist-500 transition-colors hover:border-brand-500 hover:text-brand-700"
        >
          <ImagePlus className="size-5" aria-hidden />
          Choose or upload image
        </button>
      )}
      <MediaPicker open={open} onClose={() => setOpen(false)} onPick={(img) => onChange({ ...img, alt: value?.alt || img.alt })} />
    </div>
  );
}

function GalleryField({ value, onChange }: { value: PickedImage[]; onChange: (v: PickedImage[]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((img, i) => (
          <li key={`${img.src}-${i}`} className="overflow-hidden rounded-xl border border-mist-200 bg-white">
            <div className="relative aspect-[4/3] bg-mist-50">
              <Image src={img.src} alt={img.alt} fill sizes="200px" className="object-cover" unoptimized={!img.src.startsWith("/")} />
            </div>
            <div className="space-y-1.5 p-2">
              <input
                value={img.alt}
                onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
                placeholder="Alt text"
                aria-label={`Alt text for image ${i + 1}`}
                className="h-8 w-full rounded-md border border-mist-200 px-2 text-xs outline-none focus:border-brand-500"
              />
              <div className="flex justify-between">
                <button type="button" disabled={i === 0} onClick={() => onChange(value.map((x, j) => (j === i - 1 ? value[i] : j === i ? value[i - 1] : x)))} className="rounded p-1 text-mist-400 hover:text-ink-900 disabled:opacity-30" aria-label="Move earlier">
                  <ArrowUp className="size-3.5 -rotate-90" />
                </button>
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded p-1 text-mist-400 hover:text-danger-500" aria-label="Remove image">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => setOpen(true)} className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-mist-300 text-sm text-mist-500 hover:border-brand-500 hover:text-brand-700">
            <Plus className="size-5" aria-hidden /> Add image
          </button>
        </li>
      </ul>
      <MediaPicker open={open} onClose={() => setOpen(false)} onPick={(img) => onChange([...value, img])} />
    </div>
  );
}

function MultiChoice({ options, value, onChange, id }: { options: { value: string; label: string }[]; value: string[]; onChange: (v: string[]) => void; id: string }) {
  const [q, setQ] = useState("");
  const shown = options.filter((o) => !q || o.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="rounded-xl border border-mist-200 bg-white">
      {options.length > 8 && (
        <input id={id} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" className="w-full border-b border-mist-100 px-3 py-2 text-sm outline-none" />
      )}
      <ul className="max-h-56 overflow-y-auto p-1.5" role="group" aria-labelledby={id}>
        {shown.map((o) => {
          const checked = value.includes(o.value);
          return (
            <li key={o.value}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-mist-50">
                <input type="checkbox" checked={checked} onChange={() => onChange(checked ? value.filter((v) => v !== o.value) : [...value, o.value])} className="size-4 accent-brand-600" />
                {o.label}
              </label>
            </li>
          );
        })}
        {shown.length === 0 && <li className="px-2 py-3 text-center text-xs text-mist-500">No options</li>}
      </ul>
    </div>
  );
}

function SeoField({ value, onChange, values }: { value: Record<string, unknown>; onChange: (v: unknown) => void; values?: Values }) {
  const v = value ?? {};
  const set = (k: string, val: unknown) => onChange({ ...v, [k]: val });
  const fallbackTitle = String(values?.title ?? values?.name ?? "");
  const fallbackDesc = String(values?.excerpt ?? values?.summary ?? values?.intro ?? values?.bio ?? "");
  const title = String(v.title || fallbackTitle || "Page title");
  const desc = String(v.description || fallbackDesc || "Meta description preview.");
  const slug = String(values?.slug ?? "");
  const base = useId();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-mist-200 bg-mist-25 p-4" aria-label="Search result preview">
        <p className="text-xs text-mist-500">jarzdigital.com › {slug || "…"}</p>
        <p className="mt-1 truncate text-lg text-[#1a0dab]">{title.slice(0, 70)}</p>
        <p className="mt-1 line-clamp-2 text-sm text-mist-600">{desc.slice(0, 170)}</p>
      </div>
      <div>
        <label htmlFor={`${base}-t`} className="mb-1.5 flex justify-between text-sm font-medium text-ink-800">
          Meta title <span className={cn("text-xs font-normal", String(v.title ?? "").length > 60 ? "text-amber-700" : "text-mist-500")}>{String(v.title ?? "").length}/60</span>
        </label>
        <input id={`${base}-t`} value={String(v.title ?? "")} onChange={(e) => set("title", e.target.value)} placeholder={fallbackTitle} className={controlClass(false, "h-10")} />
      </div>
      <div>
        <label htmlFor={`${base}-d`} className="mb-1.5 flex justify-between text-sm font-medium text-ink-800">
          Meta description <span className={cn("text-xs font-normal", String(v.description ?? "").length > 160 ? "text-amber-700" : "text-mist-500")}>{String(v.description ?? "").length}/160</span>
        </label>
        <textarea id={`${base}-d`} rows={3} value={String(v.description ?? "")} onChange={(e) => set("description", e.target.value)} placeholder={fallbackDesc.slice(0, 160)} className={controlClass(false, "py-2")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${base}-c`} className="mb-1.5 block text-sm font-medium text-ink-800">
            Canonical URL
          </label>
          <input id={`${base}-c`} value={String(v.canonical ?? "")} onChange={(e) => set("canonical", e.target.value)} placeholder="Auto" className={controlClass(false, "h-10")} />
        </div>
        <div>
          <label htmlFor={`${base}-o`} className="mb-1.5 block text-sm font-medium text-ink-800">
            Open Graph image URL
          </label>
          <input id={`${base}-o`} value={String(v.ogImage ?? "")} onChange={(e) => set("ogImage", e.target.value)} placeholder="Uses featured image" className={controlClass(false, "h-10")} />
        </div>
      </div>
      <Switch id={`${base}-n`} checked={Boolean(v.noindex)} onChange={(c) => set("noindex", c)} label="Hide from search engines (noindex)" />
    </div>
  );
}

function RepeaterField({ field, value, onChange, errors, errorPrefix, relations }: { field: FieldDef; value: Values[]; onChange: (v: Values[]) => void; errors?: Record<string, string>; errorPrefix: string; relations?: RelationOptions }) {
  const blank = () => Object.fromEntries((field.fields ?? []).map((f) => [f.name, f.type === "list" ? [] : f.type === "boolean" ? false : ""]));
  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <fieldset key={i} className="rounded-xl border border-mist-200 bg-mist-25 p-4">
          <legend className="sr-only">
            {field.label} {i + 1}
          </legend>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-ink-900">{String(item[field.itemLabel ?? "title"] || `${field.label} ${i + 1}`)}</p>
            <div className="flex gap-1">
              <button type="button" disabled={i === 0} onClick={() => onChange(value.map((x, j) => (j === i - 1 ? value[i] : j === i ? value[i - 1] : x)))} className="rounded-md p-1.5 text-mist-400 hover:bg-white hover:text-ink-900 disabled:opacity-30" aria-label="Move up">
                <ArrowUp className="size-4" />
              </button>
              <button type="button" disabled={i === value.length - 1} onClick={() => onChange(value.map((x, j) => (j === i + 1 ? value[i] : j === i ? value[i + 1] : x)))} className="rounded-md p-1.5 text-mist-400 hover:bg-white hover:text-ink-900 disabled:opacity-30" aria-label="Move down">
                <ArrowDown className="size-4" />
              </button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded-md p-1.5 text-mist-400 hover:bg-white hover:text-danger-500" aria-label="Remove">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(field.fields ?? []).map((sf) => (
              <FieldRenderer
                key={sf.name}
                field={sf}
                value={item[sf.name]}
                onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, [sf.name]: v } : x)))}
                error={errors?.[`${errorPrefix}.${i}.${sf.name}`]}
                relations={relations}
              />
            ))}
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={() => onChange([...value, blank()])} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-mist-300 py-3 text-sm font-medium text-mist-600 hover:border-brand-500 hover:text-brand-700">
        <Plus className="size-4" aria-hidden /> Add {field.itemLabel === "question" ? "question" : field.label.toLowerCase().replace(/s$/, "")}
      </button>
    </div>
  );
}

/** Renders a single CMS field based on its definition. */
export function FieldRenderer({ field, value, onChange, error, errors, values, relations, slugTouched, onSlugTouched }: FieldProps) {
  const id = useId();
  const full = field.width !== "half" ? "sm:col-span-2" : "";
  const describedBy = error ? `${id}-error` : undefined;
  const str = (value as string) ?? "";

  switch (field.type) {
    case "text":
    case "url":
      return (
        <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error} className={full}>
          <input id={id} type={field.type === "url" ? "url" : "text"} value={str} onChange={(e) => onChange(e.target.value)} maxLength={field.max} placeholder={field.placeholder} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={controlClass(Boolean(error), "h-11")} />
        </FieldShell>
      );
    case "textarea":
      return (
        <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error} className={full}>
          <textarea id={id} rows={field.rows ?? 4} value={str} onChange={(e) => onChange(e.target.value)} maxLength={field.max} placeholder={field.placeholder} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={controlClass(Boolean(error), "py-2.5 leading-relaxed")} />
          {field.max && <p className="mt-1 text-right text-xs text-mist-400">{str.length}/{field.max}</p>}
        </FieldShell>
      );
    case "slug": {
      const source = String(values?.[field.from ?? "title"] ?? "");
      return (
        <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error} className={full}>
          <div className="flex gap-2">
            <div className="flex flex-1 items-center rounded-xl border border-mist-200 bg-mist-25 pl-3 focus-within:border-brand-500">
              <span className="text-sm text-mist-400">/</span>
              <input
                id={id}
                value={slugTouched ? str : str || slugify(source)}
                onChange={(e) => {
                  onSlugTouched?.();
                  onChange(slugify(e.target.value) + (e.target.value.endsWith("-") ? "-" : ""));
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                className="h-11 min-w-0 flex-1 bg-transparent px-1 text-sm outline-none"
              />
            </div>
            <button type="button" onClick={() => onChange(slugify(source))} className="flex shrink-0 items-center gap-1.5 rounded-xl border border-mist-200 px-3 text-sm text-mist-600 hover:border-mist-300" title="Regenerate from title">
              <RefreshCw className="size-3.5" aria-hidden /> <span className="sr-only sm:not-sr-only">Generate</span>
            </button>
          </div>
        </FieldShell>
      );
    }
    case "number":
      return (
        <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error} className={full}>
          <input id={id} type="number" inputMode="numeric" value={str === null ? "" : String(value ?? "")} min={field.min} max={field.max} onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(error)} className={controlClass(Boolean(error), "h-11")} />
        </FieldShell>
      );
    case "date":
      return (
        <FieldShell id={id} label={field.label} help={field.help} error={error} className={full}>
          <input id={id} type="datetime-local" value={str} onChange={(e) => onChange(e.target.value)} className={controlClass(Boolean(error), "h-11")} />
        </FieldShell>
      );
    case "boolean":
      return (
        <div className={full}>
          <Switch id={id} checked={Boolean(value)} onChange={onChange} label={field.label} />
          {field.help && <p className="mt-1.5 text-xs text-mist-500">{field.help}</p>}
        </div>
      );
    case "select":
    case "icon":
      if (field.multiple) {
        return (
          <FieldShell id={id} label={field.label} help={field.help} error={error} className={full}>
            <MultiChoice id={id} options={field.options ?? []} value={(value as string[]) ?? []} onChange={onChange} />
          </FieldShell>
        );
      }
      return (
        <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error} className={full}>
          <div className="flex gap-2">
            {field.type === "icon" && str && (
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-brand-300">
                <Icon name={str} className="size-5" />
              </span>
            )}
            <select id={id} value={str} onChange={(e) => onChange(e.target.value)} className={controlClass(Boolean(error), "h-11")}>
              <option value="">— Select —</option>
              {(field.options ?? []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </FieldShell>
      );
    case "relation": {
      const options = relations?.[field.name] ?? [];
      if (field.multiple) {
        return (
          <FieldShell id={id} label={field.label} help={field.help} error={error} className={full}>
            <MultiChoice id={id} options={options} value={(value as string[]) ?? []} onChange={onChange} />
          </FieldShell>
        );
      }
      return (
        <FieldShell id={id} label={field.label} help={field.help} error={error} className={full}>
          <select id={id} value={str} onChange={(e) => onChange(e.target.value)} className={controlClass(Boolean(error), "h-11")}>
            <option value="">— None —</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FieldShell>
      );
    }
    case "list":
      return (
        <FieldShell id={id} label={field.label} help={field.help} error={error} className="sm:col-span-2">
          <ListInput id={id} value={(value as string[]) ?? []} onChange={onChange} placeholder={field.placeholder} />
        </FieldShell>
      );
    case "image":
      return (
        <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error} className={full}>
          <ImageField id={id} value={(value as PickedImage) ?? null} onChange={onChange} />
        </FieldShell>
      );
    case "gallery":
      return (
        <FieldShell id={id} label={field.label} help={field.help} error={error} className="sm:col-span-2">
          <GalleryField value={(value as PickedImage[]) ?? []} onChange={onChange} />
        </FieldShell>
      );
    case "richtext":
      return (
        <FieldShell id={id} label={field.label} help={field.help} error={error} className="sm:col-span-2">
          <RichTextEditor id={id} value={str} onChange={onChange} />
        </FieldShell>
      );
    case "repeater":
      return (
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-medium text-ink-800">{field.label}</p>
          <RepeaterField field={field} value={(value as Values[]) ?? []} onChange={onChange} errors={errors} errorPrefix={field.name} relations={relations} />
        </div>
      );
    case "seo":
      return (
        <div className="sm:col-span-2">
          <SeoField value={(value as Record<string, unknown>) ?? {}} onChange={onChange} values={values} />
        </div>
      );
  }
}
