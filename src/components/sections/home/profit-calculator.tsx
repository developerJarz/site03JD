"use client";

import { Check } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { forecast, steadyMonth, totals } from "@/components/proposal/calc/model";
import { DEFAULT_INPUTS, PRESETS, type PresetId } from "@/components/proposal/calc/presets";
import { STR } from "@/components/proposal/calc/strings";
import { dec, int, short, tk, usd } from "@/components/proposal/format";
import { Reveal } from "@/components/animations/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/section";
import { cn } from "@/lib/utils";

type Preset = Exclude<PresetId, "custom">;

const s = STR.en;
const PRESET_IDS = Object.keys(PRESETS) as Preset[];
const BUDGET = { min: 50, max: 2000, step: 10 };

const POINTS = [
  "Website, SEO, ads, social media and content in one 6-month plan",
  "Break-even, ROAS and a month-by-month profit forecast",
  "Read it in English or বাংলা, or download the PDF",
];

const VERDICT = {
  profit: "bg-[#3ddc97]/15 text-[#3ddc97]",
  thin: "bg-[#f2a33a]/15 text-[#f2a33a]",
  loss: "bg-[#ff6b6b]/15 text-[#ff6b6b]",
};

/**
 * Homepage teaser for the project proposal: a quick version of its ads profit
 * calculator (business type + budget) running on the same model. "Open full
 * calculator" carries both choices into /proposal.
 */
export function ProfitCalculator({ index }: { index?: string }) {
  const [preset, setPreset] = useState<Preset>("fashion");
  const [budget, setBudget] = useState(DEFAULT_INPUTS.budgetUsd);
  const budgetId = useId();

  const inputs = useMemo(() => ({ ...DEFAULT_INPUTS, ...PRESETS[preset], budgetUsd: budget }), [preset, budget]);
  const m = useMemo(() => steadyMonth(inputs), [inputs]);
  const rows = useMemo(() => forecast(inputs), [inputs]);
  const tot = useMemo(() => totals(rows), [rows]);

  const verdict = m.netProfit > m.revenue * 0.03 ? "profit" : m.netProfit >= -m.revenue * 0.03 ? "thin" : "loss";
  const peak = Math.max(...rows.map((r) => r.revenue), 1);
  const fullHref = `/proposal?preset=${preset}&budget=${budget}#jdp-calculator`;
  const T = (n: number) => tk(n, "en");

  return (
    <section className="theme-dark relative overflow-hidden bg-ink-950 py-24 md:py-32" aria-labelledby="calculator-heading">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div aria-hidden className="absolute -left-40 top-1/3 h-[520px] w-[620px] rounded-full bg-[radial-gradient(closest-side,rgb(0_175_185/0.16),transparent)] blur-3xl" />
      <div aria-hidden className="absolute -right-20 bottom-0 h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgb(47_123_255/0.1),transparent)] blur-3xl" />

      <div className="container-page relative grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-5">
          <Eyebrow index={index} className="mb-6">
            Project proposal
          </Eyebrow>
          <h2 id="calculator-heading" className="font-display text-display-sm font-semibold tracking-display text-white">
            See what your ad budget can earn before you spend it.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/65">
            Our 6-month growth proposal comes with a live ads profit calculator. Pick your business type, set a monthly budget and see orders, sales and profit, month by month.
          </p>
          <ul className="mt-8 grid gap-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-white/70">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-brand-400/15 text-brand-300">
                  <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href={fullHref} size="lg" arrow>
              Open full calculator
            </ButtonLink>
            <ButtonLink href="/proposal" size="lg" variant="outline-light">
              View project proposal
            </ButtonLink>
          </div>
        </div>

        <Reveal className="lg:col-span-7" delay={0.1}>
          <div className="rounded-[28px] border border-white/10 bg-ink-900/70 p-5 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)] backdrop-blur-sm sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="font-display text-xl font-semibold text-white">{s.calcTitle}</p>
              <span className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-400 opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-brand-400" />
                </span>
                Live estimate
              </span>
            </div>

            {/* Business type */}
            <p className="mt-7 text-sm text-white/55">{s.presetsLabel}</p>
            <div role="radiogroup" aria-label={s.presetsLabel} className="mt-3 flex flex-wrap gap-2">
              {PRESET_IDS.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={preset === p}
                  onClick={() => setPreset(p)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-300",
                    preset === p ? "border-brand-400 bg-brand-400 font-medium text-ink-950" : "border-white/12 bg-white/[0.03] text-white/70 hover:border-white/30 hover:text-white",
                  )}
                >
                  {s.presets[p]}
                </button>
              ))}
            </div>

            {/* Budget */}
            <div className="mt-7">
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor={budgetId} className="text-sm text-white/55">
                  {s.f.budgetUsd}
                </label>
                <output htmlFor={budgetId} className="text-right font-display text-lg font-semibold tabular-nums text-white">
                  {usd(budget)} <span className="text-sm font-normal text-white/45">≈ {T(m.spend)}</span>
                </output>
              </div>
              <input
                id={budgetId}
                type="range"
                min={BUDGET.min}
                max={BUDGET.max}
                step={BUDGET.step}
                value={budget}
                onChange={(e) => setBudget(+e.target.value)}
                className="mt-3 h-2 w-full cursor-pointer accent-brand-400"
              />
              <div className="mt-1 flex justify-between text-xs text-white/35">
                <span>{usd(BUDGET.min)}</span>
                <span>{usd(BUDGET.max)}</span>
              </div>
            </div>

            {/* Results */}
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-live="polite">
              <div className="col-span-2 rounded-2xl border border-brand-400/25 bg-gradient-to-br from-brand-400/15 to-brand-600/5 p-5 sm:col-span-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm text-white/60">{s.k.netProfit}</span>
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", VERDICT[verdict])}>{s.verdict[verdict]}</span>
                </div>
                <p className={cn("mt-2 font-display text-4xl font-semibold tracking-tight tabular-nums md:text-5xl", m.netProfit >= 0 ? "text-[#3ddc97]" : "text-[#ff6b6b]")}>{T(m.netProfit)}</p>
              </div>
              {[
                [s.k.revenue, T(m.revenue)],
                [s.k.orders, int(m.orders)],
                [s.k.roas, `${dec(m.roas)}×`],
              ].map(([label, value], i) => (
                <div key={label} className={cn("rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4", i === 2 && "col-span-2 sm:col-span-1")}>
                  <p className="text-xs text-white/50">{label}</p>
                  <p className="mt-1 font-display text-xl font-semibold tabular-nums text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* 6-month sales forecast */}
            <div className="mt-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-white/55">{s.forecast}: sales</p>
                <p className="text-sm text-white/55">
                  {s.totals.profit}: <span className={cn("font-semibold tabular-nums", tot.netProfit >= 0 ? "text-[#3ddc97]" : "text-[#ff6b6b]")}>{T(tot.netProfit)}</span>
                </p>
              </div>
              <div className="mt-4 grid h-36 grid-cols-6 items-end gap-2 sm:gap-3" aria-hidden>
                {rows.map((r) => (
                  <div key={r.month} className="flex h-full flex-col items-center justify-end gap-1.5">
                    <span className="text-[0.68rem] tabular-nums text-white/50">{short(r.revenue, "en").replace("Tk ", "")}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-300 transition-[height] duration-500 ease-[var(--ease-out-expo)]"
                      style={{ height: `${Math.max(4, (r.revenue / peak) * 78)}%` }}
                    />
                    <span className="text-[0.68rem] text-white/40">M{r.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-6 border-t border-white/[0.08] pt-5 text-xs leading-relaxed text-white/40">
              Estimates in Bangladeshi Taka, using typical 2025–26 Meta ad costs. Fine-tune every input in the full calculator.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
