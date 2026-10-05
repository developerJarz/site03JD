"use client";

import Link from "next/link";
import Calculator from "@/components/proposal/components/Calculator";
import { STR } from "@/components/proposal/calc/strings";
import { setLang, useLang } from "@/components/proposal/lang";
import { Eyebrow } from "@/components/ui/section";
import "@/components/proposal/styles.css";
import "./ads-calculator.css";

/**
 * The full ads revenue & profit calculator on the homepage: the proposal page's calculator
 * (src/components/proposal), with its English/বাংলা switch. The language choice is shared with
 * the proposal page, and inputs are remembered between visits.
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
          <Eyebrow index={index}>{s.tabs.calc}</Eyebrow>
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
