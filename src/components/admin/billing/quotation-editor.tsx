"use client";

import {
  CalendarClock,
  CircleDollarSign,
  ClipboardCheck,
  Cpu,
  FileText,
  Gauge,
  Layers,
  ListChecks,
  PenLine,
  RotateCcw,
  Scale,
  Sparkles,
  TriangleAlert,
  User,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { formatMoney, primaryCost, quotationTotals, uid } from "@/lib/billing/calc";
import { applyPreset, applyTrack, defaultTerms, PRESET_IDS, PRESETS, SECTION_DEFAULTS, STACK_SWITCH, TECH_SUGGESTIONS, toggleTag, splitTags } from "@/lib/billing/defaults";
import { catalogToCostLine, catalogToFeature } from "@/lib/billing/catalog";
import type { ClientInfo, CompanyProfile, PresetId, Quotation, QuoteSectionId, QuoteStatus, SectionConfig } from "@/lib/billing/types";
import { cn } from "@/lib/utils";
import { CatalogButton, CatalogPicker, CatalogSuggest, OrderLink } from "./catalog-picker";
import { Area, btn, ConfirmAction, Field, ListEditor, move, Num, Panel, Segmented, Select, StringList, Text, Toggle } from "./fields";

export const QUOTE_STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "converted", label: "Converted to invoice" },
];

const SECTION_ICONS: Record<QuoteSectionId, LucideIcon> = {
  summary: FileText,
  kpis: Gauge,
  workflow: Workflow,
  costs: CircleDollarSign,
  features: Layers,
  techStack: Cpu,
  payments: Wallet,
  timeline: CalendarClock,
  prerequisites: ClipboardCheck,
  additionalCosts: ListChecks,
  terms: Scale,
  signature: PenLine,
};

export function ClientFields({ client, onChange }: { client: ClientInfo; onChange: (c: ClientInfo) => void }) {
  const set = (k: keyof ClientInfo) => (v: string) => onChange({ ...client, [k]: v });
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Client name">
        <Text value={client.name} onChange={set("name")} />
      </Field>
      <Field label="Company">
        <Text value={client.company} onChange={set("company")} />
      </Field>
      <Field label="Phone">
        <Text value={client.phone} onChange={set("phone")} />
      </Field>
      <Field label="Email">
        <Text value={client.email} onChange={set("email")} type="email" />
      </Field>
      <Field label="Website" className="col-span-2">
        <Text value={client.website} onChange={set("website")} />
      </Field>
      <Field label="Address" className="col-span-2">
        <Area value={client.address} onChange={set("address")} rows={2} />
      </Field>
    </div>
  );
}

export function QuotationEditor({ q, company, onChange }: { q: Quotation; company: CompanyProfile; onChange: (q: Quotation) => void }) {
  const [preset, setPreset] = useState<PresetId>(q.preset === "custom" ? "ecommerce" : q.preset);
  const [picking, setPicking] = useState(false);
  const set = <K extends keyof Quotation>(key: K, value: Quotation[K]) => onChange({ ...q, [key]: value });
  const totals = quotationTotals(q);
  const money = (n: number) => formatMoney(n, q.currency);

  const setSection = (id: QuoteSectionId, patch: Partial<SectionConfig>) => set("sections", q.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const setValidity = (days: number) =>
    onChange({ ...q, validityDays: days, signature: { ...q.signature, validityNotice: q.signature.validityNotice.replace(/\d+\s+days/i, `${days} days`) } });

  function sectionBody(s: SectionConfig) {
    const headingFields = (
      <div className="grid grid-cols-2 gap-3">
        <Field label="Section heading">
          <Text value={s.title} onChange={(v) => setSection(s.id, { title: v })} placeholder={SECTION_DEFAULTS[s.id].title} />
        </Field>
        <Field label="Subheading">
          <Text value={s.subtitle} onChange={(v) => setSection(s.id, { subtitle: v })} placeholder="Optional" />
        </Field>
      </div>
    );
    switch (s.id) {
      case "summary":
        return (
          <>
            <Field label="Box label">
              <Text value={s.title} onChange={(v) => setSection(s.id, { title: v })} />
            </Field>
            <Field label="Executive summary" hint="Use **double asterisks** for bold.">
              <Area value={q.executiveSummary} onChange={(v) => set("executiveSummary", v)} rows={5} />
            </Field>
          </>
        );
      case "kpis":
        return (
          <div className="space-y-3">
            {q.kpis.map((k) => (
              <div key={k.id} className="rounded-lg border border-mist-200 bg-mist-25 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Label">
                    <Text value={k.label} onChange={(v) => set("kpis", q.kpis.map((x) => (x.id === k.id ? { ...x, label: v } : x)))} />
                  </Field>
                  <Field label="Value">
                    <Text
                      value={k.id === "cost" && q.costKpiAuto ? `${primaryCost(q).toLocaleString("en-US")} ${q.currency}` : k.value}
                      onChange={(v) => onChange({ ...q, costKpiAuto: k.id === "cost" ? false : q.costKpiAuto, kpis: q.kpis.map((x) => (x.id === k.id ? { ...x, value: v } : x)) })}
                    />
                  </Field>
                  <Field label="Caption" className="col-span-2">
                    <Text value={k.caption} onChange={(v) => set("kpis", q.kpis.map((x) => (x.id === k.id ? { ...x, caption: v } : x)))} />
                  </Field>
                </div>
                {k.id === "cost" && (
                  <div className="mt-2.5">
                    <Toggle checked={q.costKpiAuto} onChange={(v) => set("costKpiAuto", v)} label="Follow the first one-time cost line" />
                  </div>
                )}
                {k.id === "delivery" && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <Segmented
                      value={q.timeline.track}
                      onChange={(v) => v !== "custom" && onChange(applyTrack(q, v))}
                      options={[
                        { value: "website", label: "7–15 Days · Website" },
                        { value: "software", label: "15–30 Days · Software" },
                      ]}
                    />
                    <span className="text-[0.7rem] text-mist-500">Also switches the timeline schedule.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      case "workflow":
        return (
          <>
            {headingFields}
            <ListEditor
              items={q.workflow}
              onChange={(v) => set("workflow", v)}
              create={() => ({ id: uid(), title: "", detail: "" })}
              addLabel="Add step"
              compact
              render={(step, update) => (
                <>
                  <Text value={step.title} onChange={(v) => update({ title: v })} placeholder="Step title" />
                  <Area value={step.detail} onChange={(v) => update({ detail: v })} rows={2} placeholder="Short description" />
                </>
              )}
            />
          </>
        );
      case "costs":
        return (
          <>
            {headingFields}
            <CatalogButton onClick={() => setPicking(true)} />
            <ListEditor
              items={q.costs}
              onChange={(v) => set("costs", v)}
              create={() => ({ id: uid(), label: "", amount: 0, type: "one-time" as const })}
              addLabel="Add cost line"
              compact
              render={(c, update) => (
                <>
                  <CatalogSuggest
                    value={c.label}
                    onChange={(v) => update({ label: v })}
                    onPick={(picked, rate) => {
                      const line = catalogToCostLine(picked, q.currency, rate);
                      update({ label: line.label, amount: picked.price === null ? c.amount : line.amount, type: line.type });
                    }}
                    currency={q.currency}
                    company={company}
                    placeholder="e.g. Website Development — type to search services"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {/* Negative amounts are allowed for discount lines. */}
                    <Num value={c.amount} onChange={(v) => update({ amount: v })} step={500} min={-1e12} />
                    <Select
                      value={c.type}
                      onChange={(v) => update({ type: v })}
                      options={[
                        { value: "one-time", label: "One-time" },
                        { value: "monthly", label: "Monthly recurring" },
                        { value: "annual", label: "Annual recurring" },
                      ]}
                    />
                  </div>
                </>
              )}
            />
            <dl className="grid grid-cols-3 gap-2 rounded-lg bg-mist-50 p-3 text-xs">
              <Stat k="One-time" v={money(totals.oneTime)} />
              <Stat k="Recurring / year" v={money(totals.recurringYear)} />
              <Stat k="First year" v={money(totals.firstYear)} strong />
            </dl>
          </>
        );
      case "features":
        return (
          <>
            {headingFields}
            <ListEditor
              items={q.features}
              onChange={(v) => set("features", v)}
              create={() => ({ id: uid(), title: "", detail: "" })}
              addLabel="Add module"
              compact
              render={(f, update) => (
                <>
                  <CatalogSuggest
                    value={f.title}
                    onChange={(v) => update({ title: v })}
                    onPick={(picked) => {
                      const row = catalogToFeature(picked);
                      update({ title: row.title, detail: row.detail });
                    }}
                    currency={q.currency}
                    company={company}
                    placeholder="Module / Category — type to search services"
                  />
                  <Area value={f.detail} onChange={(v) => update({ detail: v })} rows={2} placeholder="Detailed features & capabilities" />
                </>
              )}
            />
          </>
        );
      case "techStack":
        return (
          <>
            {headingFields}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-mist-600">Quick switch:</span>
              {Object.entries(STACK_SWITCH).map(([name, stack]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => set("techStack", q.techStack.map((r) => (r.suggest && r.suggest in stack ? { ...r, detail: stack[r.suggest as keyof typeof stack]! } : r)))}
                  className="rounded-full border border-mist-200 bg-white px-2.5 py-1 text-xs font-medium text-mist-700 hover:border-brand-400 hover:text-brand-700"
                >
                  {name}
                </button>
              ))}
            </div>
            <ListEditor
              items={q.techStack}
              onChange={(v) => set("techStack", v)}
              create={() => ({ id: uid(), title: "", detail: "", suggest: "" })}
              addLabel="Add layer"
              compact
              render={(r, update) => (
                <>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <Text value={r.title} onChange={(v) => update({ title: v })} placeholder="System layer" />
                    <Select
                      value={r.suggest ?? ""}
                      onChange={(v) => update({ suggest: v })}
                      className="w-32 text-xs"
                      options={[{ value: "", label: "No tags" }, ...Object.keys(TECH_SUGGESTIONS).map((k) => ({ value: k, label: `${k[0].toUpperCase()}${k.slice(1)} tags` }))]}
                    />
                  </div>
                  <Area value={r.detail} onChange={(v) => update({ detail: v })} rows={2} placeholder="Comma-separated technologies" />
                  {r.suggest && TECH_SUGGESTIONS[r.suggest] && (
                    <div className="flex flex-wrap gap-1">
                      {TECH_SUGGESTIONS[r.suggest].map((tag) => {
                        const on = splitTags(r.detail).includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => update({ detail: toggleTag(r.detail, tag) })}
                            aria-pressed={on}
                            className={cn(
                              "max-w-full truncate rounded-full border px-2 py-0.5 text-[0.7rem] transition-colors",
                              on ? "border-brand-500 bg-brand-50 text-brand-800" : "border-mist-200 bg-white text-mist-500 hover:border-mist-300",
                            )}
                          >
                            {on ? "✓ " : "+ "}
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            />
          </>
        );
      case "payments":
        return (
          <>
            {headingFields}
            <ListEditor
              items={q.milestones}
              onChange={(v) => set("milestones", v)}
              create={() => ({ id: uid(), when: "", description: "", amount: 0 })}
              addLabel="Add milestone"
              compact
              render={(m, update) => (
                <>
                  <Text value={m.when} onChange={(v) => update({ when: v })} placeholder="Payment milestone (when)" />
                  <div className="grid grid-cols-[1fr_120px] gap-2">
                    <Text value={m.description} onChange={(v) => update({ description: v })} placeholder="Description (for what)" />
                    <Num value={m.amount} onChange={(v) => update({ amount: v })} step={500} />
                  </div>
                </>
              )}
            />
            <div className="flex items-center justify-between rounded-lg bg-mist-50 px-3 py-2 text-xs">
              <span className="text-mist-600">Schedule total</span>
              <span className="font-semibold tabular-nums text-ink-900">{money(totals.milestones)}</span>
            </div>
            {totals.milestones !== totals.firstYear && (
              <p className="flex items-start gap-1.5 rounded-lg bg-warning-50 px-3 py-2 text-xs text-amber-900">
                <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
                The schedule totals {money(totals.milestones)} but the first-year cost is {money(totals.firstYear)}.
              </p>
            )}
          </>
        );
      case "timeline":
        return (
          <>
            {headingFields}
            <Field label="Timeline structure" hint="Website and Software load the pre-built schedules (and update the Delivery card). Edit any phase to customise.">
              <Segmented
                value={q.timeline.track}
                onChange={(v) => (v === "custom" ? set("timeline", { ...q.timeline, track: "custom" }) : onChange(applyTrack(q, v)))}
                options={[
                  { value: "website", label: "Website · 7–15 Days" },
                  { value: "software", label: "Software · 15–30 Days" },
                  { value: "custom", label: "Custom" },
                ]}
              />
            </Field>
            <Field label="Note">
              <Area value={q.timeline.note} onChange={(v) => set("timeline", { ...q.timeline, note: v })} rows={2} />
            </Field>
            <ListEditor
              items={q.timeline.phases}
              onChange={(v) => set("timeline", { ...q.timeline, phases: v })}
              create={() => ({ id: uid(), period: "", detail: "" })}
              addLabel="Add phase"
              compact
              render={(p, update) => (
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <Text value={p.period} onChange={(v) => update({ period: v })} placeholder="Days 1–3" />
                  <Area value={p.detail} onChange={(v) => update({ detail: v })} rows={2} />
                </div>
              )}
            />
          </>
        );
      case "prerequisites":
        return (
          <>
            {headingFields}
            <StringList items={q.prerequisites} onChange={(v) => set("prerequisites", v)} addLabel="Add prerequisite" />
          </>
        );
      case "additionalCosts":
        return (
          <>
            {headingFields}
            <StringList items={q.additionalCosts} onChange={(v) => set("additionalCosts", v)} addLabel="Add cost note" />
          </>
        );
      case "terms":
        return (
          <>
            {headingFields}
            <div className="flex justify-end">
              <ConfirmAction confirmLabel="Replace terms" onConfirm={() => set("terms", defaultTerms())} className={cn(btn.base, btn.ghost, "px-2.5 py-1.5 text-xs")}>
                <RotateCcw className="size-3.5" aria-hidden /> Reset to standard 16-point policy
              </ConfirmAction>
            </div>
            <ListEditor
              items={q.terms}
              onChange={(v) => set("terms", v)}
              create={() => ({ id: uid(), title: "New group", items: [] })}
              addLabel="Add term group"
              render={(g, update) => (
                <>
                  <Text value={g.title} onChange={(v) => update({ title: v })} placeholder="Group title" className="font-semibold" />
                  <ListEditor
                    items={g.items}
                    onChange={(items) => update({ items })}
                    create={() => ({ id: uid(), text: "", rates: [] })}
                    addLabel="Add clause"
                    compact
                    render={(t, updateTerm) => (
                      <>
                        <Area value={t.text} onChange={(v) => updateTerm({ text: v })} rows={3} />
                        {t.rates.length > 0 && <p className="text-[0.7rem] font-medium text-mist-500">Rate card rows</p>}
                        {t.rates.map((r, i) => (
                          <div key={r.id} className="grid grid-cols-[1fr_120px_auto] gap-1.5">
                            <Text value={r.label} onChange={(v) => updateTerm({ rates: t.rates.map((x) => (x.id === r.id ? { ...x, label: v } : x)) })} className="py-1.5 text-xs" />
                            <Text value={r.value} onChange={(v) => updateTerm({ rates: t.rates.map((x) => (x.id === r.id ? { ...x, value: v } : x)) })} className="py-1.5 text-xs" />
                            <button type="button" onClick={() => updateTerm({ rates: t.rates.filter((_, j) => j !== i) })} className="px-1 text-xs text-mist-400 hover:text-danger-500" aria-label="Remove rate row">
                              ✕
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => updateTerm({ rates: [...t.rates, { id: uid(), label: "", value: "" }] })} className="text-xs font-medium text-brand-700 hover:underline">
                          + Add rate card row
                        </button>
                      </>
                    )}
                  />
                </>
              )}
            />
          </>
        );
      case "signature":
        return (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Validity notice" className="col-span-2">
              <Text value={q.signature.validityNotice} onChange={(v) => set("signature", { ...q.signature, validityNotice: v })} />
            </Field>
            <Field label="Client signature label">
              <Text value={q.signature.clientLabel} onChange={(v) => set("signature", { ...q.signature, clientLabel: v })} />
            </Field>
            <Field label="Company signature label">
              <Text value={q.signature.companyLabel} onChange={(v) => set("signature", { ...q.signature, companyLabel: v })} />
            </Field>
            <Field label="Signatory name">
              <Text value={q.signature.signatoryName} onChange={(v) => set("signature", { ...q.signature, signatoryName: v })} placeholder="Optional" />
            </Field>
            <Field label="Signatory title">
              <Text value={q.signature.signatoryTitle} onChange={(v) => set("signature", { ...q.signature, signatoryTitle: v })} />
            </Field>
          </div>
        );
    }
  }

  return (
    <div className="space-y-3">
      {picking && (
        <CatalogPicker
          currency={q.currency}
          company={company}
          scopeOption
          onClose={() => setPicking(false)}
          onAdd={(picked, { withScope, rate }) => {
            // Drop empty placeholder lines so picked items don't sit under a blank row.
            const keep = q.costs.filter((c) => !(c.amount === 0 && !c.label.trim()));
            onChange({
              ...q,
              costs: [...keep, ...picked.map(({ item, qty }) => catalogToCostLine(item, q.currency, rate, qty))],
              features: withScope ? [...q.features, ...picked.filter(({ item }) => item.scope || item.description).map(({ item }) => catalogToFeature(item))] : q.features,
            });
          }}
        />
      )}
      {q.source && <OrderLink source={q.source} />}
      <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-3.5">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Sparkles className="size-4 text-brand-600" aria-hidden /> Load service preset
        </p>
        <p className="mt-0.5 text-xs text-mist-600">Replaces the features, tech stack, workflow, Delivery card and timeline. Client, costs and terms stay as they are.</p>
        <div className="mt-2.5 flex gap-2">
          <Select value={preset} onChange={setPreset} options={PRESET_IDS.map((id) => ({ value: id, label: `${PRESETS[id].label} (${PRESETS[id].track === "website" ? "7–15" : "15–30"} days)` }))} />
          <ConfirmAction confirmLabel="Replace content" onConfirm={() => onChange(applyPreset(q, preset))} className={cn(btn.base, btn.primary, "shrink-0")}>
            Apply
          </ConfirmAction>
        </div>
        <p className="mt-2 text-[0.7rem] text-mist-500">Current: {q.preset === "custom" ? "Custom" : PRESETS[q.preset].label}</p>
      </div>

      <Panel title="Document & metadata" icon={FileText} defaultOpen>
        <Field label="Document title">
          <Text value={q.documentTitle} onChange={(v) => set("documentTitle", v)} />
        </Field>
        <Field label="Project title">
          <Text value={q.projectTitle} onChange={(v) => set("projectTitle", v)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Reference no">
            <Text value={q.number} onChange={(v) => set("number", v)} className="font-mono" />
          </Field>
          <Field label="Status">
            <Select value={q.status} onChange={(v) => set("status", v)} options={QUOTE_STATUS_OPTIONS} />
          </Field>
          <Field label="Issue date">
            <Text type="date" value={q.issueDate} onChange={(v) => set("issueDate", v)} />
          </Field>
          <Field label="Valid for (days)">
            <Num value={q.validityDays} onChange={setValidity} min={1} />
          </Field>
        </div>
        <Field label="Currency">
          <Segmented
            value={q.currency}
            onChange={(v) => set("currency", v)}
            options={[
              { value: "BDT", label: "BDT (৳)" },
              { value: "USD", label: "USD ($)" },
            ]}
          />
        </Field>
      </Panel>

      <Panel title="Client details" icon={User} defaultOpen={!q.client.name}>
        <ClientFields client={q.client} onChange={(c) => set("client", c)} />
      </Panel>

      <p className="px-1 pt-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-mist-400">Sections — show/hide, reorder, page breaks</p>
      {q.sections.map((s, i) => (
        <Panel
          key={s.id}
          title={s.title || SECTION_DEFAULTS[s.id].title}
          icon={SECTION_ICONS[s.id]}
          visible={s.visible}
          onVisible={(v) => setSection(s.id, { visible: v })}
          newPage={s.newPage}
          onNewPage={(v) => setSection(s.id, { newPage: v })}
          onUp={i > 0 ? () => set("sections", move(q.sections, i, -1)) : undefined}
          onDown={i < q.sections.length - 1 ? () => set("sections", move(q.sections, i, 1)) : undefined}
        >
          {sectionBody(s)}
        </Panel>
      ))}
    </div>
  );
}

function Stat({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div>
      <dt className="text-mist-500">{k}</dt>
      <dd className={cn("tabular-nums", strong ? "font-bold text-brand-700" : "font-semibold text-ink-900")}>{v}</dd>
    </div>
  );
}
