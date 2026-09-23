import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

/** Full-screen branded status page used by 404, 403, 500 and similar states. */
export function StatusPage({ code, title, description, actions }: { code: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="theme-dark relative flex min-h-dvh flex-col overflow-hidden bg-ink-950">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-60 mask-radial" />
      <div aria-hidden className="absolute left-1/2 top-1/2 h-[520px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(0_175_185/0.22),transparent)] blur-2xl" />
      <header className="container-page relative flex h-[76px] items-center">
        <Logo tone="dark" />
      </header>
      <main id="main" className="container-page relative flex flex-1 flex-col items-center justify-center pb-24 text-center">
        <p className="font-display text-[clamp(6rem,20vw,14rem)] font-semibold leading-none tracking-[-0.06em] text-white/[0.08]">{code}</p>
        <h1 className="-mt-6 font-display text-display-sm font-semibold tracking-display text-white">{title}</h1>
        <p className="mt-5 max-w-lg text-lg text-white/60">{description}</p>
        {actions && <div className="mt-10 flex flex-wrap justify-center gap-3">{actions}</div>}
      </main>
    </div>
  );
}
