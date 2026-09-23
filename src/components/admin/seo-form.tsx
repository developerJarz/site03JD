"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { controlClass } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { saveSettingsAction } from "@/lib/actions/admin";
import type { SiteSettings } from "@/types/content";

export function GlobalSeoForm({ initial }: { initial: SiteSettings["seo"] }) {
  const toast = useToast();
  const [seo, setSeo] = useState({ ...initial, googleVerification: initial.googleVerification ?? "" });
  const [keywords, setKeywords] = useState(initial.keywords.join(", "));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveSettingsAction("seo", { ...seo, keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean) });
          if (res.ok) {
            setErrors({});
            toast.success("SEO settings saved");
          } else {
            setErrors(res.fieldErrors ?? {});
            toast.error(res.error);
          }
        });
      }}
      className="space-y-5"
    >
      <div className="rounded-xl border border-mist-200 bg-mist-25 p-4" aria-label="Homepage search preview">
        <p className="text-xs text-mist-500">jarzdigital.com</p>
        <p className="mt-1 text-lg text-[#1a0dab]">{seo.defaultTitle}</p>
        <p className="mt-1 line-clamp-2 text-sm text-mist-600">{seo.defaultDescription}</p>
      </div>
      {[
        { k: "defaultTitle", label: "Default title (homepage)", max: 70 },
        { k: "titleTemplate", label: "Title template", help: "Use %s for the page title, e.g. “%s | Jarz Digital”." },
        { k: "googleVerification", label: "Google Search Console verification code", help: "Only the content value of the meta tag." },
      ].map((f) => (
        <label key={f.k} className="block">
          <span className="mb-1.5 flex justify-between text-sm font-medium text-ink-800">
            {f.label}
            {f.max && <span className="text-xs font-normal text-mist-500">{String(seo[f.k as keyof typeof seo] ?? "").length}/{f.max}</span>}
          </span>
          <input value={String(seo[f.k as keyof typeof seo] ?? "")} onChange={(e) => setSeo({ ...seo, [f.k]: e.target.value })} className={controlClass(Boolean(errors[f.k]), "h-11")} />
          {errors[f.k] ? <span className="mt-1 block text-xs text-danger-500">{errors[f.k]}</span> : f.help && <span className="mt-1 block text-xs text-mist-500">{f.help}</span>}
        </label>
      ))}
      <label className="block">
        <span className="mb-1.5 flex justify-between text-sm font-medium text-ink-800">
          Default meta description <span className="text-xs font-normal text-mist-500">{seo.defaultDescription.length}/160</span>
        </span>
        <textarea rows={3} value={seo.defaultDescription} onChange={(e) => setSeo({ ...seo, defaultDescription: e.target.value })} className={controlClass(Boolean(errors.defaultDescription), "py-2")} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-800">Keywords</span>
        <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="comma, separated" className={controlClass(false, "h-11")} />
      </label>
      <div className="flex justify-end">
        <Button type="submit" variant="dark" size="sm" loading={pending}>
          Save SEO settings
        </Button>
      </div>
    </form>
  );
}
