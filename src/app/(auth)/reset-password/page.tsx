import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="font-display text-4xl font-semibold tracking-display text-ink-900">Choose a new password.</h1>
      <p className="mb-10 mt-3 text-mist-600">For your security, you’ll be signed out of all other devices.</p>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
