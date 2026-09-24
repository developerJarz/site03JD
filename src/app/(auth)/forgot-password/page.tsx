import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="font-display text-4xl font-semibold tracking-display text-ink-900">Reset your password.</h1>
      <p className="mb-10 mt-3 text-mist-600">Enter your account email and we’ll send you a 6-digit code to choose a new password.</p>
      <ForgotPasswordForm />
      <p className="mt-8 text-center text-sm text-mist-600">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
