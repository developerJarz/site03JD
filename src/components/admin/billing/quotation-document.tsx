import { ChevronRight, CircleCheck, Info } from "lucide-react";
import type { ReactNode } from "react";
import { addDays, formatDocDate, formatMoney, quotationTotals } from "@/lib/billing/calc";
import { DELIVERY, kpiValue, SECTION_DEFAULTS, splitTags } from "@/lib/billing/defaults";
import type { CompanyProfile, CostLine, Quotation, QuoteSectionId, SectionConfig } from "@/lib/billing/types";
import { cn } from "@/lib/utils";
import { CompanyBlock, ContactBar, PartyBlock, RichText, RunningFooter, RunningHeader, SectionHeading } from "./doc-parts";
import { block, PagedDocument, table, type Flow, type FlowRow } from "./paged-document";

/** Executive A4 proposal & quotation, rendered from a Quotation record and split into pages. */

const th = "px-3 py-2 text-left text-[9.5px] font-semibold uppercase tracking-[0.12em]";
const td = "px-3 py-2 align-top";
/** Row rule for separate-border tables (borders on <tr> don't render there). */
const rule = "[&>td]:border-b [&>td]:border-mist-200";

/** Sections that sit in the hero without a numbered heading. */
const UNNUMBERED: QuoteSectionId[] = ["summary", "kpis", "signature"];
/** Space between sections, and between items inside one. */
const SECTION_GAP = 28;

export function QuotationDocument({ q, company }: { q: Quotation; company: CompanyProfile }) {
  const totals = quotationTotals(q);
  const money = (n: number) => formatMoney(n, q.currency);

  let n = 0;
  const flows: Flow[] = [block("hero", <Hero q={q} company={company} />)];
  for (const s of q.sections.filter((x) => x.visible)) {
    const index = UNNUMBERED.includes(s.id) ? undefined : ++n;
    const items = sectionFlows(s, index);
    if (!items.length) continue;
    items[0] = { ...items[0], gap: SECTION_GAP, breakBefore: s.newPage };
    flows.push(...items);
  }

  function sectionFlows(s: SectionConfig, index?: number): Flow[] {
    const key = (k: string) => `${s.id}:${k}`;
    const heading = (opts: { subtitle?: string } = {}) => block(key("heading"), <SectionHeading index={index} title={s.title} subtitle={opts.subtitle ?? s.subtitle} />, { keepWithNext: true });

    switch (s.id) {
      case "summary":
        return [
          block(
            key("box"),
            <div className="border-l-[3px] border-brand-500 bg-brand-50/70 px-5 py-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-700">{s.title}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-800">
                <RichText text={q.executiveSummary} />
              </p>
            </div>,
          ),
        ];
      case "kpis":
        return [
          block(
            key("band"),
            <div className="overflow-hidden bg-ink-900 text-white">
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
            </div>,
          ),
        ];
      case "workflow": {
        const rows = Array.from({ length: Math.ceil(q.workflow.length / 4) }, (_, r) => q.workflow.slice(r * 4, r * 4 + 4));
        return [
          heading(),
          ...rows.map((steps, r) =>
            block(
              key(`row${r}`),
              <div className="grid grid-cols-4 gap-2.5">
                {steps.map((step, j) => {
                  const i = r * 4 + j;
                  return (
                    <div key={step.id} className="relative border border-mist-200 bg-mist-25 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 items-center justify-center bg-brand-500 text-[9.5px] font-bold text-ink-950">{i + 1}</span>
                        <span className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-mist-400">Step {i + 1}</span>
                      </div>
                      <p className="mt-1.5 text-[11.5px] font-semibold leading-snug text-ink-900">{step.title}</p>
                      {step.detail && <p className="mt-0.5 text-[9.5px] leading-snug text-mist-600">{step.detail}</p>}
                      {i < q.workflow.length - 1 && j < 3 && (
                        <ChevronRight className="absolute -right-[11px] top-1/2 z-10 size-4 -translate-y-1/2 bg-white text-brand-500 ring-1 ring-mist-200" aria-hidden />
                      )}
                    </div>
                  );
                })}
              </div>,
              { gap: r ? 10 : 0 },
            ),
          ),
        ];
      }
      case "costs":
        // The stock subtitle mentions recurring costs; don't print that on a one-time-only quote.
        return [
          heading({ subtitle: s.subtitle === SECTION_DEFAULTS.costs.subtitle && !totals.recurringYear ? "One-time project investment" : s.subtitle }),
          ...costFlows(q, totals, money, key),
        ];
      case "features":
        return [
          heading(),
          twoColTable(
            key("table"),
            ["Module / Category", "Detailed Features & Capabilities"],
            q.features.map((f) => [f.id, f.title, <RichText key="d" text={f.detail} />]),
          ),
        ];
      case "techStack":
        return [
          heading(),
          twoColTable(
            key("table"),
            ["System Layer", "Technologies Used"],
            q.techStack.map((t) => [
              t.id,
              t.title,
              <span key="d" className="flex flex-wrap gap-1">
                {splitTags(t.detail).map((tag) => (
                  <span key={tag} className="border border-brand-100 bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-900">
                    {tag}
                  </span>
                ))}
              </span>,
            ]),
          ),
        ];
      case "payments":
        return [
          heading(),
          table(key("table"), {
            className: "text-[11px]",
            head: (
              <tr className="bg-ink-900 text-white">
                <th className={cn(th, "w-[38%]")}>Payment Milestone (When)</th>
                <th className={th}>Description (For What)</th>
                <th className={cn(th, "text-right")}>Amount ({q.currency})</th>
              </tr>
            ),
            rows: q.milestones.map((m, i) => ({
              key: m.id,
              node: (
                <tr className={cn(rule, i % 2 && "bg-mist-25")}>
                  <td className={cn(td, "font-semibold text-ink-900")}>{m.when}</td>
                  <td className={cn(td, "text-mist-700")}>{m.description}</td>
                  <td className={cn(td, "whitespace-nowrap text-right font-semibold tabular-nums text-ink-900")}>{money(m.amount)}</td>
                </tr>
              ),
            })),
            foot: (
              <tr className="bg-brand-50">
                <td className={cn(td, "font-display text-[12px] font-semibold text-ink-900")} colSpan={2}>
                  Total
                </td>
                <td className={cn(td, "whitespace-nowrap text-right font-display text-[13px] font-bold tabular-nums text-ink-900")}>{money(totals.milestones)}</td>
              </tr>
            ),
          }),
        ];
      case "timeline": {
        const phases = q.timeline.phases;
        return [
          heading({ subtitle: s.subtitle || (q.timeline.track !== "custom" ? DELIVERY[q.timeline.track].title : "") }),
          ...(q.timeline.note
            ? [
                block(
                  key("note"),
                  <p className="mb-3 flex items-start gap-2 bg-mist-50 px-3.5 py-2.5 text-[10.5px] italic text-mist-700">
                    <Info className="mt-px size-3.5 shrink-0 text-brand-600" aria-hidden />
                    {q.timeline.note}
                  </p>,
                  { keepWithNext: true },
                ),
              ]
            : []),
          ...phases.map((p, i) =>
            block(
              key(p.id),
              <div className={cn("grid grid-cols-[96px_1fr] gap-4", i < phases.length - 1 && "pb-2.5")}>
                <span className="bg-ink-900 px-2.5 py-1.5 text-center text-[10.5px] font-semibold text-brand-300">{p.period}</span>
                <span className={cn("relative border-l-2 pl-4 pt-1 text-[11px] leading-relaxed text-mist-700", i === phases.length - 1 ? "border-transparent" : "border-brand-100")}>
                  <span className="absolute -left-[5px] top-2 size-2 bg-brand-500 ring-2 ring-white" aria-hidden />
                  {p.detail}
                </span>
              </div>,
            ),
          ),
        ];
      }
      case "prerequisites":
        return [
          heading(),
          ...q.prerequisites.filter(Boolean).map((t, i) =>
            block(
              key(String(i)),
              <p className="flex gap-2.5 text-[11px] leading-relaxed text-mist-700">
                <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-brand-600" aria-hidden />
                <RichText text={t} />
              </p>,
              { gap: i ? 6 : 0 },
            ),
          ),
        ];
      case "additionalCosts":
        return [
          heading(),
          table(key("table"), {
            className: "border border-amber-200 bg-warning-50/60",
            rows: q.additionalCosts.filter(Boolean).map((t, i, all) => ({
              key: String(i),
              node: (
                <tr>
                  <td className={cn("px-4 py-1.5 text-[10.5px] leading-relaxed text-mist-700", i === 0 && "pt-3", i === all.length - 1 && "pb-3")}>
                    <span className="flex gap-2.5">
                      <span className="mt-[7px] size-1.5 shrink-0 bg-warning-500" aria-hidden />
                      <RichText text={t} />
                    </span>
                  </td>
                </tr>
              ),
            })),
          }),
        ];
      case "terms": {
        let clause = 0;
        return [
          heading(),
          ...q.terms.flatMap((g, gi) => [
            block(key(`${g.id}:title`), <p className="mb-1.5 border-b border-brand-100 pb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-brand-700">{g.title}</p>, {
              gap: gi ? 14 : 0,
              keepWithNext: true,
            }),
            ...g.items.map((t, ti) =>
              block(
                key(t.id),
                <div className="grid grid-cols-[22px_1fr] text-[10px] leading-[1.6] text-mist-700">
                  <span className="font-mono font-bold text-ink-900">{++clause}.</span>
                  <div>
                    <RichText text={t.text} />
                    {t.rates.length > 0 && (
                      <div className="mt-1.5 max-w-[118mm] overflow-hidden border border-mist-200">
                        {t.rates.map((r) => (
                          <div key={r.id} className="flex justify-between gap-2 border-b border-mist-100 px-2.5 py-1 last:border-0 odd:bg-mist-25">
                            <span>{r.label}</span>
                            <span className="shrink-0 font-semibold text-ink-900">{r.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>,
                { gap: ti ? 5 : 0 },
              ),
            ),
          ]),
        ];
      }
      case "signature":
        return [
          block(
            key("block"),
            <div>
              <p className="mb-5 border border-brand-200 bg-brand-50/60 px-4 py-2.5 text-center text-[10.5px] font-medium text-brand-900">{q.signature.validityNotice}</p>
              <div className="grid grid-cols-2 gap-10 px-2">
                <SignatureLine label={q.signature.clientLabel} name={q.client.name} title={q.client.company} />
                <SignatureLine label={q.signature.companyLabel} name={q.signature.signatoryName} title={q.signature.signatoryTitle} />
              </div>
              <div className="mt-6">
                <ContactBar company={company} />
              </div>
            </div>,
          ),
        ];
    }
  }

  return (
    <PagedDocument
      flows={flows}
      header={<RunningHeader company={company} label={`Quotation · ${q.number}`} />}
      footer={(page, pages) => <RunningFooter company={company} note={q.number} page={page} pages={pages} />}
    />
  );
}

const BILLING_LABEL: Record<CostLine["type"], string> = { "one-time": "One-time", monthly: "Monthly", annual: "Annual" };
const BILLING_SUFFIX: Record<CostLine["type"], string> = { "one-time": "", monthly: " / mo", annual: " / yr" };

/**
 * Investment summary band + one itemised cost table. One-time and recurring
 * lines are grouped only when both exist, so a quote without recurring fees
 * never shows an empty "recurring" column.
 */
function costFlows(q: Quotation, totals: ReturnType<typeof quotationTotals>, money: (n: number) => string, key: (k: string) => string): Flow[] {
  const oneTime = q.costs.filter((c) => c.type === "one-time");
  const recurring = q.costs.filter((c) => c.type !== "one-time");
  const grouped = oneTime.length > 0 && recurring.length > 0;
  const hasRecurring = recurring.length > 0;
  const cols = hasRecurring ? 4 : 3;
  let no = 0;

  const line = (c: CostLine): FlowRow => {
    const i = no++;
    return {
      key: c.id,
      node: (
        <tr className={cn(rule, i % 2 && "bg-mist-25")}>
          <td className={cn(td, "w-9 font-mono text-[9.5px] text-mist-400")}>{String(i + 1).padStart(2, "0")}</td>
          <td className={cn(td, "text-ink-900")}>{c.label}</td>
          {hasRecurring && (
            <td className={cn(td, "w-24")}>
              <span className="whitespace-nowrap border border-mist-200 bg-white px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wide text-mist-600">{BILLING_LABEL[c.type]}</span>
            </td>
          )}
          <td className={cn(td, "whitespace-nowrap text-right font-semibold tabular-nums", c.amount < 0 ? "text-success-500" : "text-ink-900")}>
            {money(c.amount)}
            {c.type !== "one-time" && <span className="font-normal text-mist-500">{BILLING_SUFFIX[c.type]}</span>}
          </td>
        </tr>
      ),
    };
  };
  const group = (id: string, label: string): FlowRow => ({
    key: `group:${id}`,
    keepWithNext: true,
    node: (
      <tr>
        <td colSpan={cols} className="border-b border-brand-100 bg-brand-50/70 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-brand-800">
          {label}
        </td>
      </tr>
    ),
  });
  const subtotal = (id: string, label: string, amount: number): FlowRow => ({
    key: `subtotal:${id}`,
    node: (
      <tr>
        <td colSpan={cols - 1} className={cn(td, "border-b border-mist-200 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-mist-500")}>
          {label}
        </td>
        <td className={cn(td, "whitespace-nowrap border-b border-mist-200 text-right font-bold tabular-nums text-ink-900")}>{money(amount)}</td>
      </tr>
    ),
  });

  const rows: FlowRow[] = grouped
    ? [
        group("one-time", "One-Time Costs"),
        ...oneTime.map(line),
        subtotal("one-time", "One-time subtotal", totals.oneTime),
        group("recurring", "Recurring Costs"),
        ...recurring.map(line),
        subtotal("recurring", totals.monthly ? "Recurring — per year" : "Recurring subtotal", totals.recurringYear),
      ]
    : q.costs.map(line);
  if (!rows.length)
    rows.push({
      key: "empty",
      node: (
        <tr>
          <td colSpan={cols} className={cn(td, "text-center italic text-mist-400")}>
            No cost lines added
          </td>
        </tr>
      ),
    });

  const totalLabel = hasRecurring ? "Total First-Year Cost" : "Total Project Cost";
  const recurringNote = [totals.monthly ? "Monthly fees are billed every month." : "", totals.annual ? "Annual fees renew every year from the second year onward." : ""].filter(Boolean).join(" ");

  return [
    block(
      key("summary"),
      <div className="flex items-stretch bg-[linear-gradient(110deg,#032e34,#060b13_60%)] text-white">
        <div className="flex-1 px-5 py-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-300">{totalLabel}</p>
          <p className="mt-0.5 text-[10.5px] text-white/60">{hasRecurring ? "One-time costs + first-year recurring costs" : "Sum of all one-time costs below"}</p>
        </div>
        {grouped && (
          <dl className="flex divide-x divide-white/10 border-l border-white/10 text-[10px]">
            <div className="px-4 py-4">
              <dt className="text-white/55">One-time</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">{money(totals.oneTime)}</dd>
            </div>
            <div className="px-4 py-4">
              <dt className="text-white/55">Recurring / year</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">{money(totals.recurringYear)}</dd>
            </div>
          </dl>
        )}
        <p className="flex items-center border-l border-white/10 px-5 font-display text-[24px] font-semibold tabular-nums tracking-tight">{money(totals.firstYear)}</p>
      </div>,
      { keepWithNext: true },
    ),
    table(key("table"), {
      gap: 12,
      className: "text-[11px]",
      head: (
        <tr className="bg-ink-900 text-white">
          <th className={cn(th, "w-9")}>#</th>
          <th className={th}>Description</th>
          {hasRecurring && <th className={th}>Billing</th>}
          <th className={cn(th, "text-right")}>Amount ({q.currency})</th>
        </tr>
      ),
      rows,
      foot: (
        <tr className="bg-brand-50">
          <td colSpan={cols - 1} className={cn(td, "font-display text-[12px] font-semibold text-ink-900")}>
            {totalLabel}
          </td>
          <td className={cn(td, "whitespace-nowrap text-right font-display text-[13px] font-bold tabular-nums text-ink-900")}>{money(totals.firstYear)}</td>
        </tr>
      ),
    }),
    ...(recurringNote ? [block(key("note"), <p className="text-[9.5px] text-mist-500">{recurringNote}</p>, { gap: 6 })] : []),
  ];
}

function Hero({ q, company }: { q: Quotation; company: CompanyProfile }) {
  const meta: [string, string][] = [
    ["Reference No", q.number],
    ["Issue Date", formatDocDate(q.issueDate)],
    ["Validity", `Valid for ${q.validityDays} Days`],
    ["Valid Until", formatDocDate(addDays(q.issueDate, q.validityDays))],
  ];
  return (
    <div>
      <div className="grid grid-cols-[1fr_auto] items-start gap-6">
        <div>
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-brand-600">Proposal &amp; Quotation</p>
          <h1 className="mt-2 font-display text-[25px] font-semibold leading-[1.15] tracking-tight text-ink-900">{q.documentTitle}</h1>
          {q.projectTitle && (
            <p className="mt-2 text-[12px] text-mist-600">
              Project: <span className="font-semibold text-ink-900">{q.projectTitle}</span>
            </p>
          )}
          {q.source && <p className="mt-1 text-[10.5px] text-mist-500">Order Ref. {q.source.orderNumber}</p>}
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

function twoColTable(key: string, head: [string, string], rows: [string, ReactNode, ReactNode][]): Flow {
  return table(key, {
    className: "text-[11px]",
    head: (
      <tr className="bg-ink-900 text-white">
        <th className={cn(th, "w-[30%]")}>{head[0]}</th>
        <th className={th}>{head[1]}</th>
      </tr>
    ),
    rows: rows.map(([id, a, b], i) => ({
      key: id,
      node: (
        <tr className={cn(rule, i % 2 && "bg-mist-25")}>
          <td className={cn(td, "font-semibold text-ink-900")}>
            <span className="mr-1.5 font-mono text-[9px] text-brand-600">{String(i + 1).padStart(2, "0")}</span>
            {a}
          </td>
          <td className={cn(td, "leading-relaxed text-mist-700")}>{b}</td>
        </tr>
      ),
    })),
  });
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
