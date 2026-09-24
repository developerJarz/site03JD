"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { controlClass } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { savePageSeoAction } from "@/lib/actions/admin";
import { DESC_MAX, TITLE_MAX, applyTemplate } from "@/lib/seo/audit";
import { cn } from "@/lib/utils";
import type { SeoFields } from "@/types/content";

interface Props {
  path: string;
  label: string;
  host: string;
  titleTemplate: string;
  defaults: { title: string; description: string };
  override?: SeoFields;
}

/** “Edit SEO” button + dialog for a built-in page (Services, Contact, /locations/dhaka…). */
export function PageSeoEditor({ path, label, host, titleTemplate, defaults, override }: Props) {
  const router = useRouter();
  const toast = useToast();
  const base = useId();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initial = { title: override?.title ?? "", description: override?.description ?? "", ogImage: override?.ogImage ?? "", noindex: Boolean(override?.noindex) };
  const [v, setV] = useState(initial);
  const hasOverride = Boolean(override && (override.title || override.description || override.ogImage || override.noindex));

  const fullTitle = applyTemplate(v.title || defaults.title, titleTemplate);
  const desc = v.description || defaults.description;

  const save = (data: typeof v) =>
    start(async () => {
      const res = await savePageSeoAction(path, data);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
        return;
      }
      setErrors({});
      toast.success(res.message ?? "Saved");
      setOpen(false);
      router.refresh();
    });

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setV(initial);
          setErrors({});
          setOpen(true);
        }}
      >
        Edit SEO
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title={`SEO · ${label}`}
        description="Leave a field empty to use the default shown as a placeholder."
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            {hasOverride ? (
              <Button variant="ghost" size="sm" disabled={pending} onClick={() => save({ title: "", description: "", ogImage: "", noindex: false })}>
                Reset to default
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="dark" size="sm" loading={pending} onClick={() => save(v)}>
                Save
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-mist-200 bg-mist-25 p-4" aria-label="Google search preview">
            <p className="truncate text-xs text-mist-500">
              {host}
              {path === "/" ? "" : ` › ${path.slice(1).split("/").join(" › ")}`}
            </p>
            <p className="mt-1 truncate text-lg text-[#1a0dab]">{fullTitle}</p>
            <p className="mt-1 line-clamp-2 text-sm text-mist-600">{desc}</p>
            {v.noindex && <p className="mt-2 text-xs font-medium text-amber-700">This page will be hidden from search engines.</p>}
          </div>

          <div>
            <label htmlFor={`${base}-t`} className="mb-1.5 flex justify-between text-sm font-medium text-ink-800">
              Meta title
              <span className={cn("text-xs font-normal", fullTitle.length > TITLE_MAX ? "text-amber-700" : "text-mist-500")}>
                {fullTitle.length}/{TITLE_MAX} with site name
              </span>
            </label>
            <input id={`${base}-t`} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} placeholder={defaults.title} className={controlClass(Boolean(errors.title), "h-10")} />
            {errors.title && <span className="mt-1 block text-xs text-danger-500">{errors.title}</span>}
          </div>

          <div>
            <label htmlFor={`${base}-d`} className="mb-1.5 flex justify-between text-sm font-medium text-ink-800">
              Meta description
              <span className={cn("text-xs font-normal", desc.length > DESC_MAX ? "text-amber-700" : "text-mist-500")}>
                {desc.length}/{DESC_MAX}
              </span>
            </label>
            <textarea id={`${base}-d`} rows={3} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} placeholder={defaults.description} className={controlClass(Boolean(errors.description), "py-2")} />
            {errors.description ? (
              <span className="mt-1 block text-xs text-danger-500">{errors.description}</span>
            ) : (
              <span className="mt-1 block text-xs text-mist-500">Tip: include the service and the city (e.g. “web design in Dhaka”) and a reason to click.</span>
            )}
          </div>

          <div>
            <label htmlFor={`${base}-o`} className="mb-1.5 block text-sm font-medium text-ink-800">
              Social share image
            </label>
            <input id={`${base}-o`} value={v.ogImage} onChange={(e) => setV({ ...v, ogImage: e.target.value })} placeholder="Default share image" className={controlClass(Boolean(errors.ogImage), "h-10")} />
            {errors.ogImage ? <span className="mt-1 block text-xs text-danger-500">{errors.ogImage}</span> : <span className="mt-1 block text-xs text-mist-500">1200 × 630. A site path (/images/…) or an https:// URL.</span>}
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-800">
            <input type="checkbox" checked={v.noindex} onChange={(e) => setV({ ...v, noindex: e.target.checked })} className="size-4 accent-brand-600" />
            Hide from search engines (noindex) and the sitemap
          </label>
        </div>
      </Dialog>
    </>
  );
}
