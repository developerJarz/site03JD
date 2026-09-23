"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { PublishBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deleteResourceAction, saveResourceAction } from "@/lib/actions/cms";
import type { ResourceDef } from "@/lib/cms/types";
import { cn } from "@/lib/utils";
import { FieldRenderer, type RelationOptions, type Values } from "./fields";

type Intent = "save" | "draft" | "publish";

export function ResourceEditor({
  def,
  id,
  initial,
  relations,
  liveUrl,
}: {
  def: ResourceDef;
  id: string | null;
  initial: Values;
  relations: RelationOptions;
  liveUrl: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [pending, start] = useTransition();
  const [intentRunning, setIntentRunning] = useState<Intent | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const publishState = def.publish ? values[def.publish.field] === def.publish.live : undefined;

  const set = (name: string, v: unknown) => {
    setValues((prev) => ({ ...prev, [name]: v }));
    setDirty(true);
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
  };

  // Keep an untouched slug in sync with its source field.
  const slugField = def.sections.flatMap((s) => s.fields).find((f) => f.type === "slug");

  const save = useCallback(
    (intent: Intent) => {
      setIntentRunning(intent);
      start(async () => {
        const payload = { ...values };
        const res = await saveResourceAction(def.key, id, payload, intent);
        setIntentRunning(null);
        if (!res.ok) {
          setErrors(res.fieldErrors ?? {});
          toast.error(res.error);
          const first = Object.keys(res.fieldErrors ?? {})[0];
          if (first) formRef.current?.querySelector<HTMLElement>(`[data-field="${first.split(".")[0]}"] input, [data-field="${first.split(".")[0]}"] textarea, [data-field="${first.split(".")[0]}"] select`)?.focus();
          return;
        }
        setDirty(false);
        setErrors({});
        toast.success(res.message ?? "Saved");
        if (def.publish && intent !== "save") setValues((v) => ({ ...v, [def.publish!.field]: intent === "publish" ? def.publish!.live : def.publish!.draft }));
        if (res.data?.slug) setValues((v) => ({ ...v, slug: res.data!.slug }));
        if (!id && res.data?.id) router.replace(`/admin/${def.key}/${res.data.id}`);
        else router.refresh();
      });
    },
    [def, id, values, router, toast],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save("save");
      }
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [save, dirty]);

  const main = def.sections.filter((s) => !s.aside);
  const aside = def.sections.filter((s) => s.aside);
  const title = String(values[def.titleField] || `New ${def.singular.toLowerCase()}`);

  const renderSection = (section: (typeof def.sections)[number]) => (
    <section key={section.title} className="rounded-2xl border border-mist-200 bg-white">
      <h2 className="border-b border-mist-100 px-5 py-3.5 text-sm font-semibold text-ink-900">{section.title}</h2>
      <div className="grid gap-5 p-5 sm:grid-cols-2">
        {section.fields.map((f) => (
          <div key={f.name} data-field={f.name} className={cn("contents")}>
            <FieldRenderer
              field={section.aside ? { ...f, width: "full" } : f}
              value={values[f.name]}
              onChange={(v) => {
                set(f.name, v);
                if (slugField && f.name === (slugField.from ?? def.titleField) && !slugTouched) set(slugField.name, "");
              }}
              error={errors[f.name]}
              errors={errors}
              values={values}
              relations={relations}
              slugTouched={slugTouched}
              onSlugTouched={() => setSlugTouched(true)}
            />
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        save("save");
      }}
      noValidate
    >
      {/* Sticky action bar */}
      <div className="sticky top-16 z-20 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-mist-200 bg-mist-50/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Link href={`/admin/${def.key}`} className="rounded-lg p-2 text-mist-500 hover:bg-white hover:text-ink-900" aria-label={`Back to ${def.label}`}>
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-mist-500">{id ? `Edit ${def.singular.toLowerCase()}` : `New ${def.singular.toLowerCase()}`}</p>
          <p className="truncate font-medium text-ink-900">{title}</p>
        </div>
        {publishState !== undefined && <PublishBadge live={Boolean(publishState)} />}
        {dirty && <span className="text-xs text-amber-700">Unsaved changes</span>}
        {liveUrl && publishState && (
          <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-mist-600 hover:bg-white hover:text-ink-900 sm:flex">
            View <ExternalLink className="size-3.5" aria-hidden />
          </a>
        )}
        {def.publish ? (
          <>
            <Button type="button" variant="outline" size="sm" loading={pending && intentRunning === "draft"} disabled={pending} onClick={() => save("draft")}>
              {publishState ? "Unpublish" : "Save draft"}
            </Button>
            <Button type="button" variant="dark" size="sm" loading={pending && intentRunning === "publish"} disabled={pending} onClick={() => save(publishState ? "save" : "publish")}>
              {publishState ? "Update" : "Publish"}
            </Button>
          </>
        ) : (
          <Button type="submit" variant="dark" size="sm" loading={pending} disabled={pending}>
            Save
          </Button>
        )}
      </div>

      {Object.keys(errors).length > 0 && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-danger-50 px-4 py-3 text-sm text-red-800">
          Please fix {Object.keys(errors).length} field{Object.keys(errors).length > 1 ? "s" : ""}: {Object.keys(errors).slice(0, 4).join(", ")}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">{main.map(renderSection)}</div>
        <div className="space-y-6">
          {aside.map(renderSection)}
          {id && (
            <section className="rounded-2xl border border-red-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-ink-900">Danger zone</h2>
              <p className="mt-1 text-sm text-mist-500">Permanently delete this {def.singular.toLowerCase()}.</p>
              <ConfirmButton
                action={() => deleteResourceAction(def.key, id)}
                title={`Delete “${title}”?`}
                description="This cannot be undone. The public page will be removed."
                confirmLabel="Delete"
                redirectTo={`/admin/${def.key}`}
                className="mt-4 border-red-200 text-danger-500 hover:border-danger-500 hover:bg-danger-500 hover:text-white"
              >
                Delete {def.singular.toLowerCase()}
              </ConfirmButton>
            </section>
          )}
        </div>
      </div>
    </form>
  );
}
