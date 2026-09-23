import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/forms/auth-forms";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <>
      <h1 className="font-display text-4xl font-semibold tracking-display text-ink-900">Create your account.</h1>
      <p className="mb-10 mt-3 text-mist-600">Submit project requests, follow progress and message our team.</p>
      <RegisterForm />
      <p className="mt-8 text-center text-sm text-mist-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
