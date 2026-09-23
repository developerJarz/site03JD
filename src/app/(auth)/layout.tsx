import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const POINTS = ["Submit and track project requests", "Message the Jarz Digital team directly", "Follow progress from brief to launch"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-2">
      <aside className="theme-dark relative hidden overflow-hidden bg-ink-950 p-12 lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-60 mask-fade-b" />
        <div aria-hidden className="absolute -left-32 -top-32 size-[520px] rounded-full bg-[radial-gradient(closest-side,rgb(0_175_185/0.3),transparent)] blur-2xl" />
        <Logo tone="dark" className="relative" />
        <div className="relative">
          <p className="eyebrow text-brand-300">Client portal</p>
          <h2 className="mt-5 max-w-md font-display text-5xl font-semibold leading-[1.02] tracking-display text-white">Your growth, in one place.</h2>
          <ul className="mt-10 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-white/70">
                <span className="flex size-6 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
                  <Check className="size-3.5" aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/40">
          Need help? <a href="mailto:info@jarzdigital.com" className="text-white/70 underline-offset-4 hover:underline">info@jarzdigital.com</a>
        </p>
      </aside>
      <main id="main" className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between lg:justify-end">
          <Logo tone="light" className="lg:hidden" />
          <Link href="/" className="text-sm text-mist-600 hover:text-ink-900">
            ← Back to site
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">{children}</div>
      </main>
    </div>
  );
}
