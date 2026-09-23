import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/forms/auth-forms";
import { isStaff } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(isStaff(user.role) ? "/admin" : "/dashboard");
  return (
    <>
      <h1 className="font-display text-4xl font-semibold tracking-display text-ink-900">Welcome back.</h1>
      <p className="mb-10 mt-3 text-mist-600">Sign in to your Jarz Digital account.</p>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-8 text-center text-sm text-mist-600">
        New to Jarz Digital?{" "}
        <Link href="/register" className="font-medium text-brand-700 hover:underline">
          Create a client account
        </Link>
      </p>
    </>
  );
}
