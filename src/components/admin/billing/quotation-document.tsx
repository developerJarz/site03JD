import { ChevronRight, CircleCheck, Info } from "lucide-react";
import type { ReactNode } from "react";
import { addDays, formatDocDate, formatMoney, quotationTotals } from "@/lib/billing/calc";
import { DELIVERY, kpiValue, splitTags } from "@/lib/billing/defaults";
import type { CompanyProfile, Quotation, QuoteSectionId, SectionConfig } from "@/lib/billing/types";
import { cn } from "@/lib/utils";
import { CompanyBlock, ContactBar, DocFrame, PartyBlock, RichText, RunningFooter, RunningHeader, SectionHeading } from "./doc-parts";

/** Executive A4 proposal & quotation, rendered from a Quotation record. */

const th = "px-3 py-2 text-left text-[9.5px] font-semibold uppercase tracking-[0.12em]";
const td = "px-3 py-2 align-top";

/** Sections that sit in the hero without a numbered heading. */
const UNNUMBERED: QuoteSectionId[] = ["summary", "kpis", "signature"];

export function QuotationDocument({ q, company }: { q: Quotation; company: CompanyProfile }) {
  const totals = quotationTotals(q);
  const money = (n: number) => formatMoney(n, q.currency);
  const visible = q.sections.filter((s) => s.visible);

  let n = 0;
  const pages: ReactNode[][] = [[<Hero key="hero" q={q} company={company} />]];
  for (const s of visible) {
    const index = UNNUMBERED.includes(s.id) ? undefined : ++n;
    if (s.newPage && pages[pages.length - 1].length > 0) pages.push([]);
    pages[pages.length - 1].push(
      <div key={s.id} className="billing-section mt-7 first:mt-0">
        {renderSection(s, index)}
      </div>,
    );
  }

  function renderSection(s: SectionConfig, index?: number): ReactNode {
    const heading = <SectionHeading index={index} title={s.title} subtitle={s.subtitle} />;
    switch (s.id) {
      case "summary":
        return (
          <div className="billing-keep border-l-[3px] border-brand-500 bg-brand-50/70 px-5 py-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-700">{s.title}</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-800">
              <RichText text={q.executiveSummary} />
            </p>
          </div>
        );
      case "kpis":
        return (
          <div className="billing-keep overflow-hidden bg-ink-900 text-white">
            <div className="h-1 bg-[linear-gradient(90deg,#00afb9,#52d4dc_45%,#2f7bff)]" />
            <div className="grid grid-cols-4 divide-x divide-white/10">
              {q.kpis.map((k) => (
                <div key={k.id} className="px-4 py-4">
                  <p className="text-[8.5px] font-semibold uppercase tracking-[0.16em] text-brand-300">{k.label}</p>
                  <p className="mt-1.5 font-display text-[19px] font-semibold leading-tight tracking-tight">{kpiValue(q, k)}</p>
                  <p className="mt-1 text-[10px] leading-snug text-white/60">{k.caption}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "workflow":
        return (
          <>
            {heading}
            <div className="grid grid-cols-4 gap-2.5">
              {q.workflow.map((step, i) => (
                <div key={step.id} className="billing-keep relative border border-mist-200 bg-mist-25 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center bg-brand-500 text-[9.5px] font-bold text-ink-950">{i + 1}</span>
                    <span className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-mist-400">Step {i + 1}</span>
                  </div>
                  <p className="mt-1.5 text-[11.5px] font-semibold leading-snug text-ink-900">{step.title}</p>
                  {step.detail && <p className="mt-0.5 text-[9.5px] leading-snug text-mist-600">{step.detail}</p>}
                  {i < q.workflow.length - 1 && (i + 1) % 4 !== 0 && (
                    <ChevronRight className="absolute -right-[11px] top-1/2 z-10 size-4 -translate-y-1/2 bg-white text-brand-500 ring-1 ring-mist-200" aria-hidden />
                  )}
                </div>
              ))}
            </div>
          </>
        );
      case "costs": {
        const oneTime = q.costs.filter((c) => c.type === "one-time");
        const annual = q.costs.filter((c) => c.type === "annual");
        return (
          <>
            {heading}
            <div className="billing-keep flex items-center justify-between gap-4 bg-[linear-gradient(110deg,#032e34,#060b13_60%)] px-5 py-4 text-white">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-300">Total First-Year Cost</p>
                <p className="mt-0.5 text-[10.5px] text-white/60">One-time costs + first-year recurring costs</p>
              </div>
              <p className="font-display text-[26px] font-semibold tracking-tight">{money(totals.firstYear)}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <CostCard title="One-Time Costs" lines={oneTime} total={totals.oneTime} money={money} />
              <CostCard title="Annual Recurring Costs" lines={annual} total={totals.annual} money={money} note="Renews every year from the second year onward." />
            </div>
          </>
        );
      }
      case "features":
        return (
          <>
            {heading}
            <TwoColTable head={["Module / Category", "Detailed Features & Capabilities"]} rows={q.features.map((f) => [f.title, <RichText key="d" text={f.detail} />])} />
          </>
        );
      case "techStack":
        return (
          <>
            {heading}
            <TwoColTable
              head={["System Layer", "Technologies Used"]}
              rows={q.techStack.map((t) => [
                t.title,
                <span key="d" className="flex flex-wrap gap-1">
                  {splitTags(t.detail).map((tag) => (
                    <span key={tag} className="border border-brand-100 bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-900">
                      {tag}
                    </span>
                  ))}
                </span>,
              ])}
            />
          </>
        );
      case "payments":
        return (
          <>
            {heading}
            <table className="billing-table w-full overflow-hidden text-[11px]">
              <thead className="bg-ink-900 text-white">
                <tr>
                  <th className={cn(th, "w-[38%]")}>Payment Milestone (When)</th>
                  <th className={th}>Description (For What)</th>
                  <th className={cn(th, "text-right")}>Amount ({q.currency})</th>
                </tr>
              </thead>
              <tbody>
                {q.milestones.map((m, i) => (
                  <tr key={m.id} className={cn("billing-keep border-b border-mist-200", i % 2 && "bg-mist-25")}>
                    <td className={cn(td, "font-semibold text-ink-900")}>{m.when}</td>
                    <td className={cn(td, "text-mist-700")}>{m.description}</td>
                    <td className={cn(td, "text-right font-semibold tabular-nums text-ink-900")}>{money(m.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-brand-50">
                  <td className={cn(td, "font-display text-[12px] font-semibold text-ink-900")} colSpan={2}>
                    Total
                  </td>
                  <td className={cn(td, "text-right font-display text-[13px] font-bold tabular-nums text-ink-900")}>{money(totals.milestones)}</td>
                </tr>
              </tfoot>
            </table>
          </>
        );
      case "timeline":
        return (
          <>
            <SectionHeading index={index} title={s.title} subtitle={s.subtitle || (q.timeline.track !== "custom" ? DELIVERY[q.timeline.track].title : "")} />
            {q.timeline.note && (
              <p className="billing-keep mb-3 flex items-start gap-2 bg-mist-50 px-3.5 py-2.5 text-[10.5px] italic text-mist-700">
                <Info className="mt-px size-3.5 shrink-0 text-brand-600" aria-hidden />
                {q.timeline.note}
              </p>
            )}
            <ol className="relative">
              {q.timeline.phases.map((p, i) => (
                <li key={p.id} className="billing-keep relative grid grid-cols-[96px_1fr] gap-4 pb-2.5 last:pb-0">
                  <span className="bg-ink-900 px-2.5 py-1.5 text-center text-[10.5px] font-semibold text-brand-300">{p.period}</span>
                  <span className={cn("relative border-l-2 pl-4 pt-1 text-[11px] leading-relaxed text-mist-700", i === q.timeline.phases.length - 1 ? "border-transparent" : "border-brand-100")}>
                    <span className="absolute -left-[5px] top-2 size-2 bg-brand-500 ring-2 ring-white" aria-hidden />
                    {p.detail}
                  </span>
                </li>
              ))}
            </ol>
          </>
        );
      case "prerequisites":
        return (
          <>
            {heading}
            <ul className="space-y-1.5">
              {q.prerequisites.filter(Boolean).map((t, i) => (
                <li key={i} className="billing-keep flex gap-2.5 text-[11px] leading-relaxed text-mist-700">
                  <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-brand-600" aria-hidden />
                  <RichText text={t} />
                </li>
              ))}
            </ul>
          </>
        );
      case "additionalCosts":
        return (
          <>
            {heading}
            <ul className="space-y-1.5 border border-amber-200 bg-warning-50/60 px-4 py-3">
              {q.additionalCosts.filter(Boolean).map((t, i) => (
                <li key={i} className="billing-keep flex gap-2.5 text-[10.5px] leading-relaxed text-mist-700">
                  <span className="mt-[7px] size-1.5 shrink-0 bg-warning-500" aria-hidden />
                  <RichText text={t} />
                </li>
              ))}
            </ul>
          </>
        );
      case "terms": {
        const offsets = q.terms.map((_, gi) => q.terms.slice(0, gi).reduce((s, g) => s + g.items.length, 0));
        return (
          <>
            {heading}
            <div className="columns-2 gap-6 [column-fill:balance]">
              {q.terms.map((g, gi) => (
                <div key={g.id} className="mb-3">
                  <ol className="space-y-1.5">
                    {g.items.map((t, ti) => (
                      <li key={t.id} className="billing-keep text-[9.5px] leading-[1.55] text-mist-700">
                        {/* The group title travels with its first clause so it never sits alone at a column foot. */}
                        {ti === 0 && <p className="mb-1.5 border-b border-brand-100 pb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-brand-700">{g.title}</p>}
                        <span className="grid grid-cols-[18px_1fr]">
                        <span className="font-mono font-bold text-ink-900">{offsets[gi] + ti + 1}.</span>
                        <span>
                          <RichText text={t.text} />
                          {t.rates.length > 0 && (
                            <span className="mt-1.5 block overflow-hidden border border-mist-200">
                              {t.rates.map((r) => (
                                <span key={r.id} className="flex justify-between gap-2 border-b border-mist-100 px-2 py-1 last:border-0 odd:bg-mist-25">
                                  <span>{r.label}</span>
                                  <span className="shrink-0 font-semibold text-ink-900">{r.value}</span>
                                </span>
                              ))}
                            </span>
                          )}
                        </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </>
        );
      }
      case "signature":
        return (
          <div className="billing-keep">
            <p className="mb-5 border border-brand-200 bg-brand-50/60 px-4 py-2.5 text-center text-[10.5px] font-medium text-brand-900">{q.signature.validityNotice}</p>
            <div className="grid grid-cols-2 gap-10 px-2">
              <SignatureLine label={q.signature.clientLabel} name={q.client.name} title={q.client.company} />
              <SignatureLine label={q.signature.companyLabel} name={q.signature.signatoryName} title={q.signature.signatoryTitle} />
            </div>
            <div className="mt-6">
              <ContactBar company={company} />
            </div>
          </div>
        );
    }
  }

  const label = `Quotation · ${q.number}`;
  return (
    <DocFrame
      header={<RunningHeader company={company} label={label} />}
      footer={<RunningFooter company={company} note={q.number} />}
      pages={pages.filter((p) => p.length).map((p, i) => <div key={i}>{p}</div>)}
    />
  );
}

function Hero({ q, company }: { q: Quotation; company: CompanyProfile }) {
  const meta: [string, string][] = [
    ["Reference No", q.number],
    ["Issue Date", formatDocDate(q.issueDate)],
    ["Validity", `Valid for ${q.validityDays} Days`],
    ["Valid Until", formatDocDate(addDays(q.issueDate, q.validityDays))],
  ];
  return (
    <div className="billing-keep mb-7">
      <div className="grid grid-cols-[1fr_auto] items-start gap-6">
        <div>
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-brand-600">Proposal &amp; Quotation</p>
          <h1 className="mt-2 font-display text-[25px] font-semibold leading-[1.15] tracking-tight text-ink-900">{q.documentTitle}</h1>
          {q.projectTitle && (
            <p className="mt-2 text-[12px] text-mist-600">
              Project: <span className="font-semibold text-ink-900">{q.projectTitle}</span>
            </p>
          )}
        </div>
        <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 border border-mist-200 bg-mist-25 px-4 py-3 text-[10.5px]">
          {meta.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-mist-500">{k}</dt>
              <dd className="text-right font-semibold tabular-nums text-ink-900">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <PartyBlock eyebrow="Prepared For" client={q.client} />
        <CompanyBlock eyebrow="Prepared By" company={company} />
      </div>
    </div>
  );
}

function CostCard({ title, lines, total, money, note }: { title: string; lines: Quotation["costs"]; total: number; money: (n: number) => string; note?: string }) {
  return (
    <div className="billing-keep flex flex-col border border-mist-200">
      <p className="border-b border-mist-200 bg-mist-25 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-mist-600">{title}</p>
      <ul className="flex-1 divide-y divide-mist-100 px-4">
        {lines.length === 0 && <li className="py-2 text-[10.5px] italic text-mist-400">None</li>}
        {lines.map((c) => (
          <li key={c.id} className="flex justify-between gap-3 py-2 text-[11px]">
            <span className="text-mist-700">{c.label}</span>
            <span className="font-semibold tabular-nums text-ink-900">{money(c.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between border-t border-mist-200 px-4 py-2 text-[11px]">
        <span className="font-semibold text-ink-900">Subtotal</span>
        <span className="font-bold tabular-nums text-brand-700">{money(total)}</span>
      </div>
      {note && <p className="px-4 pb-2 text-[9px] text-mist-500">{note}</p>}
    </div>
  );
}

function TwoColTable({ head, rows }: { head: [string, string]; rows: [ReactNode, ReactNode][] }) {
  return (
    <table className="billing-table w-full overflow-hidden text-[11px]">
      <thead className="bg-ink-900 text-white">
        <tr>
          <th className={cn(th, "w-[30%]")}>{head[0]}</th>
          <th className={th}>{head[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([a, b], i) => (
          <tr key={i} className={cn("billing-keep border-b border-mist-200", i % 2 && "bg-mist-25")}>
            <td className={cn(td, "font-semibold text-ink-900")}>
              <span className="mr-1.5 font-mono text-[9px] text-brand-600">{String(i + 1).padStart(2, "0")}</span>
              {a}
            </td>
            <td className={cn(td, "leading-relaxed text-mist-700")}>{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SignatureLine({ label, name, title }: { label: string; name: string; title: string }) {
  return (
    <div>
      <div className="h-14" />
      <div className="border-t border-ink-900 pt-1.5">
        <p className="text-[10.5px] font-semibold text-ink-900">{label}</p>
        {(name || title) && <p className="text-[9.5px] text-mist-500">{[name, title].filter(Boolean).join(", ")}</p>}
      </div>
    </div>
  );
}
