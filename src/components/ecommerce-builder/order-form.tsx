"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, Honeypot, Input, Select, Textarea } from "@/components/ui/form";
import { useFormAction } from "@/hooks/use-form-action";
import { submitBuilderOrderAction, type OrderPayload } from "@/lib/actions/ecommerce-builder";
import type { FormSettings } from "@/lib/ecommerce-builder/settings";
import type { Selection } from "@/lib/ecommerce-builder/types";
import { builderOrderSchema, fieldErrors } from "@/lib/validations";
import { cn } from "@/lib/utils";

const customerSchema = builderOrderSchema.pick({ name: true, phone: true, email: true, businessName: true, businessCategory: true, domain: true, requirements: true, contactMethod: true, terms: true });

export function OrderForm({
  form,
  selection,
  expectedTotal,
  quoteToken,
  idempotencyKey,
  canSubmit,
  blockedReason,
  onSuccess,
}: {
  form: FormSettings;
  selection: Selection;
  expectedTotal: number | null;
  quoteToken: string | null;
  idempotencyKey: string;
  canSubmit: boolean;
  blockedReason?: string;
  onSuccess: (order: OrderPayload) => void;
}) {
  const router = useRouter();
  const [startedAt] = useState(() => Date.now());
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [contactMethod, setContactMethod] = useState(form.contactMethods[0] ?? "");

  const { state, action, onSubmit, pending } = useFormAction<OrderPayload>(submitBuilderOrderAction, {
    validate: (fd) => {
      const parsed = customerSchema.safeParse(Object.fromEntries(fd.entries()));
      const errs = parsed.success ? {} : fieldErrors(parsed.error);
      setClientErrors(errs);
      if (!parsed.success) {
        const first = Object.keys(errs)[0];
        document.querySelector<HTMLElement>(`#order-form [name="${first}"]`)?.focus();
      }
      return parsed.success && canSubmit;
    },
    onSuccess: (res) => res.ok && res.data && onSuccess(res.data),
  });

  const serverErrors = !state.ok ? state.fieldErrors ?? {} : {};
  const errors = { ...serverErrors, ...clientErrors };
  const stale = !state.ok && serverErrors._quote === "stale";

  return (
    <form id="order-form" action={action} onSubmit={onSubmit} noValidate className="relative space-y-5">
      <Honeypot />
      <input type="hidden" name="selection" value={JSON.stringify(selection)} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <input type="hidden" name="startedAt" value={startedAt} />
      {quoteToken && <input type="hidden" name="quoteToken" value={quoteToken} />}
      {expectedTotal !== null && <input type="hidden" name="expectedTotal" value={expectedTotal} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required error={errors.name}>
          {(p) => <Input {...p} name="name" autoComplete="name" maxLength={120} />}
        </Field>
        <Field label="Phone / WhatsApp number" required error={errors.phone}>
          {(p) => <Input {...p} name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+880 1XXX-XXXXXX" maxLength={40} />}
        </Field>
        <Field label="Email address" required error={errors.email}>
          {(p) => <Input {...p} name="email" type="email" autoComplete="email" maxLength={254} />}
        </Field>
        <Field label="Business name" error={errors.businessName} help="If you have one.">
          {(p) => <Input {...p} name="businessName" autoComplete="organization" maxLength={160} />}
        </Field>
        <Field label="Business category" required error={errors.businessCategory}>
          {(p) => (
            <Select {...p} name="businessCategory" defaultValue="">
              <option value="" disabled>
                Choose a category…
              </option>
              {form.businessCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Desired website name or domain" error={errors.domain} help="e.g. mystore.com.bd — or leave blank if undecided.">
          {(p) => <Input {...p} name="domain" maxLength={160} />}
        </Field>
      </div>

      <Field label="Additional project requirements" error={errors.requirements}>
        {(p) => <Textarea {...p} name="requirements" rows={4} maxLength={5000} placeholder={form.requirementsPlaceholder} />}
      </Field>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-800">
          Preferred contact method<span className="ml-0.5 text-brand-600" aria-hidden>*</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {form.contactMethods.map((m) => (
            <label key={m} className={cn("cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-500/25", contactMethod === m ? "border-ink-900 bg-ink-900 text-white" : "border-mist-200 bg-white text-mist-700 hover:border-mist-400")}>
              <input type="radio" name="contactMethod" value={m} checked={contactMethod === m} onChange={() => setContactMethod(m)} className="sr-only" />
              {m}
            </label>
          ))}
        </div>
        <FieldError message={errors.contactMethod} />
      </fieldset>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-mist-700">
          <input type="checkbox" name="terms" className="mt-0.5 size-4 shrink-0 rounded border-mist-300 accent-brand-600" aria-invalid={Boolean(errors.terms) || undefined} />
          <span>
            {form.termsLabel}{" "}
            <span className="whitespace-nowrap">
              (
              <Link href={form.termsUrl || "/terms-of-service"} target="_blank" className="text-brand-700 underline underline-offset-2">
                Terms
              </Link>
              {" · "}
              <Link href={form.privacyUrl || "/privacy-policy"} target="_blank" className="text-brand-700 underline underline-offset-2">
                Privacy
              </Link>
              )
            </span>
          </span>
        </label>
        <FieldError message={errors.terms} />
      </div>

      {!state.ok && state.error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-danger-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div className="flex-1">
            <p>{state.error}</p>
            {stale && (
              <button type="button" onClick={() => router.refresh()} className="mt-2 inline-flex items-center gap-1.5 font-medium underline underline-offset-4">
                <RefreshCw className="size-3.5" aria-hidden /> Load the updated prices
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-mist-500">No payment is taken now. We confirm scope and price with you first.</p>
        <Button type="submit" size="lg" loading={pending} disabled={!canSubmit} arrow={!pending}>
          {pending ? "Sending…" : "Submit project request"}
        </Button>
      </div>
      {!canSubmit && blockedReason && <p className="text-right text-sm text-amber-800">{blockedReason}</p>}
    </form>
  );
}
