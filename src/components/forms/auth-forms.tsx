"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, MailCheck } from "lucide-react";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { OTP_LENGTH, OTP_TTL_MINUTES, RESEND_COOLDOWN_SECONDS } from "@/config/otp";
import { useFormAction } from "@/hooks/use-form-action";
import { forgotPasswordAction, loginAction, registerAction, resendCodeAction, resetPasswordAction, verifyRegistrationAction } from "@/lib/actions/auth";
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

function FormAlert({ state }: { state: ActionResult<unknown> }) {
  if (state.ok || !state.error) return null;
  return (
    <p role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-red-700">
      {state.error}
    </p>
  );
}

const errs = (s: ActionResult<unknown>) => (!s.ok ? (s.fieldErrors ?? {}) : {});

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

/* ----------------------------- Email codes ------------------------------ */

function useCountdown(seconds: number) {
  const [until, setUntil] = useState(() => Date.now() + seconds * 1000);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const restart = () => {
    const t = Date.now();
    setUntil(t + seconds * 1000);
    setNow(t);
  };
  return { left: Math.max(0, Math.ceil((until - now) / 1000)), restart };
}

function CodeInput(props: ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      name="code"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9 ]*"
      maxLength={OTP_LENGTH + 1}
      placeholder={"•".repeat(OTP_LENGTH)}
      className="text-center font-mono text-2xl tracking-[0.5em]"
    />
  );
}

function CodeSentNotice({ email, message }: { email: string; message?: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-brand-200 bg-brand-50/60 p-5" role="status">
      <MailCheck className="mt-0.5 size-6 shrink-0 text-brand-600" aria-hidden />
      <div className="text-sm text-mist-700">
        <p className="font-medium text-ink-900">Check your inbox</p>
        <p className="mt-1">
          {message ?? (
            <>
              We sent a {OTP_LENGTH}-digit code to <strong className="text-ink-900">{email}</strong>.
            </>
          )}{" "}
          It expires in {OTP_TTL_MINUTES} minutes.
        </p>
      </div>
    </div>
  );
}

function ResendCode({ email, purpose }: { email: string; purpose: "register" | "reset" }) {
  const { left, restart } = useCountdown(RESEND_COOLDOWN_SECONDS);
  const { state, action, onSubmit, pending } = useFormAction(resendCodeAction, { onSuccess: restart });
  return (
    <form action={action} onSubmit={onSubmit} className="space-y-3 text-center text-sm text-mist-600">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="purpose" value={purpose} />
      <p>
        Didn’t get it? Check your spam folder, or{" "}
        <button
          type="submit"
          disabled={left > 0 || pending}
          className="font-medium text-brand-700 hover:underline disabled:cursor-not-allowed disabled:text-mist-400 disabled:no-underline"
        >
          {pending ? "sending…" : left > 0 ? `send a new code in ${left}s` : "send a new code"}
        </button>
        .
      </p>
      {state.ok && state.message && (
        <p role="status" className="text-green-800">
          {state.message}
        </p>
      )}
      <FormAlert state={state} />
    </form>
  );
}

function BackLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="mx-auto flex items-center gap-1.5 text-sm font-medium text-mist-600 hover:text-ink-900">
      <ArrowLeft className="size-4" aria-hidden /> {children}
    </button>
  );
}

/* ------------------------------- Sign-up -------------------------------- */

export function RegisterForm() {
  const [sent, setSent] = useState<{ email: string; message?: string } | null>(null);
  const { state, action, onSubmit, pending } = useFormAction(registerAction, {
    onSuccess: (s) => {
      if (s.ok && s.data) setSent({ email: s.data.email, message: s.message?.startsWith("We already") ? s.message : undefined });
    },
  });
  const e = errs(state);
  return (
    <>
      {/* Kept mounted while verifying so "Use a different email" returns to the filled-in form. */}
      <form action={action} onSubmit={onSubmit} className="space-y-5" noValidate hidden={!!sent}>
        <Field label="Full name" error={e.name} required>
          {(p) => <Input {...p} name="name" autoComplete="name" required autoFocus />}
        </Field>
        <Field label="Work email" error={e.email} required help="We’ll email you a code to confirm it’s yours.">
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
      {sent && <VerifyEmailStep key={sent.email} email={sent.email} message={sent.message} onBack={() => setSent(null)} />}
    </>
  );
}

function VerifyEmailStep({ email, message, onBack }: { email: string; message?: string; onBack: () => void }) {
  const { state, action, onSubmit, pending } = useFormAction(verifyRegistrationAction);
  const e = errs(state);
  return (
    <div className="space-y-6">
      <CodeSentNotice email={email} message={message} />
      <form action={action} onSubmit={onSubmit} className="space-y-5" noValidate>
        <input type="hidden" name="email" value={email} />
        <Field label="Verification code" error={e.code}>
          {(p) => <CodeInput {...p} required autoFocus />}
        </Field>
        <FormAlert state={state} />
        <Button type="submit" size="lg" className="w-full" loading={pending} arrow>
          Verify email
        </Button>
      </form>
      <ResendCode email={email} purpose="register" />
      <BackLink onClick={onBack}>Use a different email</BackLink>
    </div>
  );
}

/* ---------------------------- Password reset ---------------------------- */

export function ForgotPasswordForm() {
  const [sent, setSent] = useState<{ email: string; message?: string } | null>(null);
  const { state, action, onSubmit, pending } = useFormAction(forgotPasswordAction, {
    onSuccess: (s) => {
      if (s.ok && s.data) setSent({ email: s.data.email, message: s.message });
    },
  });
  if (sent) return <ResetWithCodeStep key={sent.email} email={sent.email} message={sent.message} onBack={() => setSent(null)} />;
  return (
    <form action={action} onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field label="Email" error={errs(state).email}>
        {(p) => <Input {...p} name="email" type="email" autoComplete="email" required autoFocus />}
      </Field>
      <FormAlert state={state} />
      <Button type="submit" size="lg" className="w-full" loading={pending} arrow>
        Send code
      </Button>
    </form>
  );
}

function ResetWithCodeStep({ email, message, onBack }: { email: string; message?: string; onBack: () => void }) {
  const { state, action, onSubmit, pending } = useFormAction(resetPasswordAction);
  const e = errs(state);
  return (
    <div className="space-y-6">
      <CodeSentNotice email={email} message={message?.replace(/ It expires in \d+ minutes\.$/, "")} />
      <form action={action} onSubmit={onSubmit} className="space-y-5" noValidate>
        <input type="hidden" name="email" value={email} />
        <Field label="Reset code" error={e.code}>
          {(p) => <CodeInput {...p} required autoFocus />}
        </Field>
        <Field label="New password" error={e.password} help="At least 10 characters, including a letter and a number.">
          {(p) => <PasswordInput {...p} name="password" autoComplete="new-password" required />}
        </Field>
        <Field label="Confirm new password" error={e.confirmPassword}>
          {(p) => <PasswordInput {...p} name="confirmPassword" autoComplete="new-password" required />}
        </Field>
        <FormAlert state={state} />
        <Button type="submit" size="lg" className="w-full" loading={pending} arrow>
          Update password
        </Button>
      </form>
      <ResendCode email={email} purpose="reset" />
      <BackLink onClick={onBack}>Use a different email</BackLink>
    </div>
  );
}
