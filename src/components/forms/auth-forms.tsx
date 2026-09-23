"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { useFormAction } from "@/hooks/use-form-action";
import { forgotPasswordAction, loginAction, registerAction, resetPasswordAction } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FieldError, Input } from "@/components/ui/form";

function PasswordInput(props: ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className="pr-12" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-mist-400 hover:text-ink-900"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function FormAlert({ state }: { state: ActionResult }) {
  if (state.ok || !state.error) return null;
  return (
    <p role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-red-700">
      {state.error}
    </p>
  );
}

const errs = (s: ActionResult) => (!s.ok ? (s.fieldErrors ?? {}) : {});

export function LoginForm() {
  const params = useSearchParams();
  const { state, action, onSubmit, pending } = useFormAction(loginAction);
  const e = errs(state);
  return (
    <form action={action} onSubmit={onSubmit} className="space-y-5" noValidate>
      {params.get("reset") && (
        <p role="status" className="rounded-xl bg-success-50 px-4 py-3 text-sm text-green-800">
          Your password was updated. Sign in with your new password.
        </p>
      )}
      <input type="hidden" name="next" value={params.get("next") ?? ""} />
      <Field label="Email" error={e.email}>
        {(p) => <Input {...p} name="email" type="email" autoComplete="email" required autoFocus />}
      </Field>
      <Field label="Password" error={e.password}>
        {(p) => <PasswordInput {...p} name="password" autoComplete="current-password" required />}
      </Field>
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-medium text-brand-700 hover:underline">
          Forgot password?
        </Link>
      </div>
      <FormAlert state={state} />
      <Button type="submit" size="lg" className="w-full" loading={pending} arrow>
        Sign in
      </Button>
    </form>
  );
}

export function RegisterForm() {
  const { state, action, onSubmit, pending } = useFormAction(registerAction);
  const e = errs(state);
  return (
    <form action={action} onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field label="Full name" error={e.name} required>
        {(p) => <Input {...p} name="name" autoComplete="name" required autoFocus />}
      </Field>
      <Field label="Work email" error={e.email} required>
        {(p) => <Input {...p} name="email" type="email" autoComplete="email" required />}
      </Field>
      <Field label="Company" error={e.company}>
        {(p) => <Input {...p} name="company" autoComplete="organization" />}
      </Field>
      <Field label="Password" error={e.password} required help="At least 10 characters, including a letter and a number.">
        {(p) => <PasswordInput {...p} name="password" autoComplete="new-password" required />}
      </Field>
      <Field label="Confirm password" error={e.confirmPassword} required>
        {(p) => <PasswordInput {...p} name="confirmPassword" autoComplete="new-password" required />}
      </Field>
      <div>
        <Checkbox
          name="terms"
          label={
            <>
              I agree to the{" "}
              <Link href="/terms-of-service" className="underline underline-offset-2">
                terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="underline underline-offset-2">
                privacy policy
              </Link>
              .
            </>
          }
        />
        <FieldError message={e.terms} />
      </div>
      <FormAlert state={state} />
      <Button type="submit" size="lg" className="w-full" loading={pending} arrow>
        Create account
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const { state, action, onSubmit, pending } = useFormAction(forgotPasswordAction);
  if (state.ok) {
    return (
      <div className="rounded-2xl border border-mist-200 p-6 text-center" role="status">
        <MailCheck className="mx-auto size-10 text-brand-600" aria-hidden />
        <p className="mt-4 font-medium text-ink-900">Check your inbox</p>
        <p className="mt-2 text-sm text-mist-600">{state.message}</p>
      </div>
    );
  }
  return (
    <form action={action} onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field label="Email" error={errs(state).email}>
        {(p) => <Input {...p} name="email" type="email" autoComplete="email" required autoFocus />}
      </Field>
      <FormAlert state={state} />
      <Button type="submit" size="lg" className="w-full" loading={pending} arrow>
        Send reset link
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { state, action, onSubmit, pending } = useFormAction(resetPasswordAction);
  const e = errs(state);
  if (!token) {
    return (
      <p className="rounded-xl bg-warning-50 px-4 py-3 text-sm text-amber-900">
        This page needs a valid reset link. <Link href="/forgot-password" className="font-medium underline">Request a new one</Link>.
      </p>
    );
  }
  return (
    <form action={action} onSubmit={onSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />
      <Field label="New password" error={e.password} help="At least 10 characters, including a letter and a number.">
        {(p) => <PasswordInput {...p} name="password" autoComplete="new-password" required autoFocus />}
      </Field>
      <Field label="Confirm new password" error={e.confirmPassword}>
        {(p) => <PasswordInput {...p} name="confirmPassword" autoComplete="new-password" required />}
      </Field>
      <FormAlert state={state} />
      <Button type="submit" size="lg" className="w-full" loading={pending} arrow>
        Update password
      </Button>
    </form>
  );
}
