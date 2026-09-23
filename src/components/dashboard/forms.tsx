"use client";

import { useRef, useState, useTransition } from "react";
import { useFormAction } from "@/hooks/use-form-action";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { BUDGET_OPTIONS, TIMELINE_OPTIONS } from "@/config/forms";
import { changePasswordAction, createProjectRequestAction, signOutOtherSessionsAction, updatePreferencesAction, updateProfileAction } from "@/lib/actions/account";
import type { ActionResult } from "@/lib/actions/types";
import { cn } from "@/lib/utils";

const errs = (s: ActionResult) => (!s.ok ? (s.fieldErrors ?? {}) : {});

function Alert({ state }: { state: ActionResult }) {
  if (state.ok && state.message)
    return (
      <p role="status" className="rounded-xl bg-success-50 px-4 py-3 text-sm text-green-800">
        {state.message}
      </p>
    );
  if (!state.ok && state.error)
    return (
      <p role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-red-700">
        {state.error}
      </p>
    );
  return null;
}

export function ProjectRequestForm({ services, defaultService }: { services: { slug: string; title: string }[]; defaultService?: string }) {
  const { state, action, onSubmit, pending } = useFormAction(createProjectRequestAction);
  const e = errs(state);
  return (
    <form action={action} onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field label="Project title" required error={e.title} help="e.g. “New website for our Denver clinic”">
        {(p) => <Input {...p} name="title" required autoFocus />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Service" error={e.service}>
          {(p) => (
            <Select {...p} name="service" defaultValue={defaultService ?? ""}>
              <option value="">Not sure yet</option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Current website" error={e.website}>
          {(p) => <Input {...p} name="website" placeholder="https://" />}
        </Field>
        <Field label="Budget" error={e.budget}>
          {(p) => (
            <Select {...p} name="budget" defaultValue="">
              <option value="">Select a range</option>
              {BUDGET_OPTIONS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Timeline" error={e.timeline}>
          {(p) => (
            <Select {...p} name="timeline" defaultValue="">
              <option value="">Select a timeline</option>
              {TIMELINE_OPTIONS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <Field label="Project brief" required error={e.description} help="Goals, audience, pages or features you need, examples you like, and anything already in place.">
        {(p) => <Textarea {...p} name="description" rows={7} required />}
      </Field>
      <Alert state={state} />
      <div className="flex justify-end">
        <Button type="submit" size="lg" arrow loading={pending}>
          Submit request
        </Button>
      </div>
    </form>
  );
}

export function ProfileForm({ user }: { user: { name: string; email: string; company?: string; phone?: string; title?: string } }) {
  const { state, action, onSubmit, pending } = useFormAction(updateProfileAction);
  const e = errs(state);
  return (
    <form action={action} onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required error={e.name}>
          {(p) => <Input {...p} name="name" defaultValue={user.name} autoComplete="name" />}
        </Field>
        <Field label="Email" help="Contact us to change your sign-in email.">
          {(p) => <Input {...p} value={user.email} disabled readOnly />}
        </Field>
        <Field label="Company" error={e.company}>
          {(p) => <Input {...p} name="company" defaultValue={user.company} autoComplete="organization" />}
        </Field>
        <Field label="Job title" error={e.title}>
          {(p) => <Input {...p} name="title" defaultValue={user.title} autoComplete="organization-title" />}
        </Field>
        <Field label="Phone" error={e.phone}>
          {(p) => <Input {...p} name="phone" type="tel" defaultValue={user.phone} autoComplete="tel" />}
        </Field>
      </div>
      <Alert state={state} />
      <div className="flex justify-end">
        <Button type="submit" variant="dark" loading={pending}>
          Save profile
        </Button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { state, action, onSubmit, pending } = useFormAction(changePasswordAction, { onSuccess: () => formRef.current?.reset() });
  const e = errs(state);
  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field label="Current password" error={e.currentPassword}>
        {(p) => <Input {...p} name="currentPassword" type="password" autoComplete="current-password" />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="New password" error={e.password} help="10+ characters with a letter and a number.">
          {(p) => <Input {...p} name="password" type="password" autoComplete="new-password" />}
        </Field>
        <Field label="Confirm new password" error={e.confirmPassword}>
          {(p) => <Input {...p} name="confirmPassword" type="password" autoComplete="new-password" />}
        </Field>
      </div>
      <Alert state={state} />
      <div className="flex justify-end">
        <Button type="submit" variant="dark" loading={pending}>
          Change password
        </Button>
      </div>
    </form>
  );
}

export function PreferencesForm({ initial }: { initial: { emailNotifications: boolean; productUpdates: boolean } }) {
  const [prefs, setPrefs] = useState(initial);
  const [pending, start] = useTransition();
  const toast = useToast();
  const toggle = (k: keyof typeof prefs) => {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
    start(async () => {
      const res = await updatePreferencesAction(next);
      if (res.ok) toast.success("Preferences saved");
      else {
        toast.error(res.error);
        setPrefs(prefs);
      }
    });
  };
  const rows: { k: keyof typeof prefs; label: string; help: string }[] = [
    { k: "emailNotifications", label: "Project updates by email", help: "Status changes and new messages on your requests." },
    { k: "productUpdates", label: "Tips & insights", help: "Occasional growth guides from the Jarz Digital team." },
  ];
  return (
    <ul className={cn("divide-y divide-mist-100", pending && "opacity-70")}>
      {rows.map((r) => (
        <li key={r.k} className="flex items-center justify-between gap-6 py-4">
          <span>
            <span className="block text-sm font-medium text-ink-900">{r.label}</span>
            <span className="block text-sm text-mist-500">{r.help}</span>
          </span>
          <button type="button" role="switch" aria-checked={prefs[r.k]} aria-label={r.label} onClick={() => toggle(r.k)} className={cn("relative h-6 w-10 shrink-0 rounded-full transition-colors", prefs[r.k] ? "bg-brand-500" : "bg-mist-200")}>
            <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform", prefs[r.k] ? "translate-x-[18px]" : "translate-x-0.5")} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function SignOutOthersButton() {
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <Button
      variant="outline"
      size="sm"
      loading={pending}
      onClick={() =>
        start(async () => {
          const res = await signOutOtherSessionsAction();
          if (res.ok) toast.success(res.message ?? "Done");
          else toast.error(res.error);
        })
      }
    >
      Sign out other devices
    </Button>
  );
}
