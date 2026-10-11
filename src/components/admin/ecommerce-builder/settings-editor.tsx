"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { FieldRenderer, type Values } from "@/components/admin/editor/fields";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { saveBuilderSettingsAction } from "@/lib/actions/ecommerce-builder-admin";
import type { SectionDef } from "@/lib/cms/types";

/** Form for one builder settings section, rendered with the shared CMS fields. */
export function BuilderSettingsEditor({ section, sections, initial, draft }: { section: string; sections: SectionDef[]; initial: Values; draft?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const save = () =>
    start(async () => {
      const res = await saveBuilderSettingsAction(section, values);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
        return;
      }
      setErrors({});
      setDirty(false);
      toast.success(res.message ?? "Saved");
      router.refresh();
    });

  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [dirty]);

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="sticky top-16 z-20 -mx-4 mb-6 flex flex-wrap items-center justify-end gap-3 border-b border-mist-200 bg-mist-50/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        {draft && <span className="mr-auto text-xs text-mist-600">Changes here go live when you publish pricing on the Overview page.</span>}
        {dirty && <span className="text-xs text-amber-700">Unsaved changes</span>}
        <Button type="submit" variant="dark" size="sm" loading={pending}>
          Save
        </Button>
      </div>

      {Object.keys(errors).length > 0 && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-danger-50 px-4 py-3 text-sm text-red-800">
          Please fix: {Object.keys(errors).slice(0, 5).join(", ")}
        </div>
      )}

      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.title} className="rounded-2xl border border-mist-200 bg-white">
            <header className="border-b border-mist-100 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-ink-900">{s.title}</h2>
              {s.description && <p className="mt-0.5 text-xs text-mist-500">{s.description}</p>}
            </header>
            <div className="grid gap-5 p-5 sm:grid-cols-2">
              {s.fields.map((f) => (
                <FieldRenderer
                  key={f.name}
                  field={f}
                  value={values[f.name]}
                  onChange={(v) => {
                    setValues((prev) => ({ ...prev, [f.name]: v }));
                    setDirty(true);
                  }}
                  error={errors[f.name]}
                  errors={errors}
                  values={values}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </form>
  );
}
