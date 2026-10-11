"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Calculator from "@/components/proposal/components/Calculator";
import { STR } from "@/components/proposal/calc/strings";
import { setLang, useLang } from "@/components/proposal/lang";
import { Flag, type FlagCode } from "@/components/ui/flags";
import { Eyebrow } from "@/components/ui/section";
import "@/components/proposal/styles.css";
import "./ads-calculator.css";

/** The other countries' calculators, on their country pages. */
const MARKETS = [
  { code: "us", href: "/usa#calculator" },
  { code: "ca", href: "/canada#calculator" },
] as const;

const MarketFlag = ({ code }: { code: FlagCode }) => (
  <span className="block h-[22px] w-8 shrink-0 overflow-hidden rounded-[4px] ring-1 ring-inset ring-white/20">
    <Flag code={code} className="size-full" />
  </span>
);

/**
 * The Bangladesh ads revenue & profit calculator on the homepage: the proposal page's calculator
 * (src/components/proposal), with its English/বাংলা switch. The language choice is shared with
 * the proposal page, and inputs are remembered between visits. Buttons above it link to the USA
 * and Canada calculators on their country pages.
 */
export function AdsCalculator({ index, whatsappHref }: { index?: string; whatsappHref: string }) {
  const lang = useLang();
  const s = STR[lang];
  // No overflow-hidden on the section: it would stop the calculator's summary bar and inputs from
  // sticking while the results scroll. The background glows clip in their own layer instead.
  return (
    <section id="calculator" className="theme-dark relative bg-ink-900 py-20 md:py-28" aria-label={s.calcTitle}>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="absolute -left-40 top-24 h-[520px] w-[620px] rounded-full bg-[radial-gradient(closest-side,rgb(0_175_185/0.14),transparent)] blur-3xl" />
      </div>

      <div className="container-page relative">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Eyebrow index={index}>{s.calcEyebrow}</Eyebrow>
          <div className={`jdp home-calc ${lang === "bn" ? "bn" : ""}`}>
            <div className="lang-sw" role="group" aria-label="Language">
              <button aria-pressed={lang === "en"} onClick={() => setLang("en")}>
                EN
              </button>
              <button aria-pressed={lang === "bn"} onClick={() => setLang("bn")}>
                বাংলা
              </button>
            </div>
          </div>
        </div>

        {/* This is the Bangladesh calculator; the USA and Canada ones live on their country pages. */}
        <nav aria-label={s.markets.label} className="mb-2 flex flex-wrap items-center gap-2.5" lang={lang}>
          <span aria-current="page" className="inline-flex h-11 items-center gap-2.5 rounded-full border border-brand-400/60 bg-brand-400/15 pl-2 pr-4 text-sm font-semibold text-white">
            <MarketFlag code="bd" /> {s.markets.bd}
          </span>
          {MARKETS.map((m) => (
            <Link
              key={m.code}
              href={m.href}
              className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] py-1.5 pl-2 pr-4 text-sm font-medium leading-snug text-white/80 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              <MarketFlag code={m.code} /> {s.markets[m.code]}
              <ArrowUpRight className="size-4 text-white/50" aria-hidden />
            </Link>
          ))}
        </nav>

        <div className={`jdp home-calc ${lang === "bn" ? "bn" : ""}`} lang={lang}>
          <Calculator s={s} lang={lang} />
          <div className="home-calc-cta">
            <a className="btn primary" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              {s.ctaBtn}
            </a>
            <Link className="btn ghost" href="/bangladesh">
              {s.side.title}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
