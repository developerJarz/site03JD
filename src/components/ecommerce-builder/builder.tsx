"use client";

import { ArrowRight, CheckCircle2, ChevronDown, Download, ExternalLink, FileText, Loader2, Lock, Mail, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { createBuilderQuoteAction, type OrderPayload, type QuotePayload } from "@/lib/actions/ecommerce-builder";
import { track } from "@/lib/analytics";
import { addFeature, calculateQuote, EMPTY_SELECTION, formatMoney, removeFeature, requiredByMap, sanitizeSelection, selectionKey, setQuantity, toggleIncluded } from "@/lib/ecommerce-builder/pricing";
import type { BuilderContent, FormSettings } from "@/lib/ecommerce-builder/settings";
import type { PbFeature, Pricebook, QuoteBreakdown, Selection } from "@/lib/ecommerce-builder/types";
import { cn } from "@/lib/utils";
import { FeatureCard, FeatureDialog, type FeatureState } from "./feature-card";
import { OrderForm } from "./order-form";
import { QuoteBreakdownView } from "./quote-breakdown";
import { TemplateCard } from "./template-card";
import { CouponField } from "./coupon-field";
import { useLiveBdtRate, formatLiveBdt } from "@/hooks/use-live-bdt";
import { CustomServiceCard, SERVICE_WEBSITE_OPTIONS } from "./custom-service-card";

const STORAGE_KEY = "jd-ecom-builder";

type StoredQuote = NonNullable<QuotePayload["quote"]> & { selectionKey: string; version: number; breakdown?: QuoteBreakdown };

const newKey = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

function StepHeader({ id, index, eyebrow, title, description, aside }: { id: string; index: string; eyebrow: string; title: string; description?: string; aside?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow mb-4 flex items-center gap-3 text-brand-700">
          <span className="text-mist-500">{index}</span>
          <span aria-hidden className="h-px w-6 bg-current opacity-60" />
          {eyebrow}
        </p>
        <h2 id={id} className="font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] font-semibold leading-[1.05] tracking-display text-ink-900">
          {title}
        </h2>
        {description && <p className="mt-4 text-base leading-relaxed text-mist-600 md:text-lg">{description}</p>}
      </div>
      {aside}
    </div>
  );
}

export function EcommerceBuilder({
  pricebook: rawPb,
  content,
  form,
  acceptingOrders,
  closedMessage,
  canQuote,
}: {
  pricebook: Pricebook;
  content: BuilderContent;
  form: FormSettings;
  acceptingOrders: boolean;
  closedMessage: string;
  /** False without a database — the page still calculates estimates. */
  canQuote: boolean;
}) {
  const pb = useMemo(
    () => ({
      ...rawPb,
      features: (rawPb.features || []).map((f) => ({
        ...f,
        name: f.name.replace(/^Basic\s+/i, "Standard "),
      })),
    }),
    [rawPb],
  );
  const toast = useToast();
  const [selection, setSelection] = useState<Selection>(EMPTY_SELECTION);
  const { rate: liveBdtRate } = useLiveBdtRate(pb.rules.bdtPerUsd);
  const [customServiceType, setCustomServiceType] = useState<string>("school-college");
  const [customServiceOther, setCustomServiceOther] = useState<string>("");
  const [quote, setQuote] = useState<StoredQuote | null>(null);
  const [order, setOrder] = useState<OrderPayload | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [restored, setRestored] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [query, setQuery] = useState("");
  const [dialogId, setDialogId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [inView, setInView] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const currency = pb.currency;

  /* Restore the visitor's configuration (back navigation, reloads). */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          selection?: Selection;
          quote?: StoredQuote | null;
          customServiceType?: string;
          customServiceOther?: string;
        };
        const preserveCoupon = Boolean(saved.selection && saved.quote?.breakdown && new Date(saved.quote.validUntil) > new Date() && saved.quote.selectionKey === selectionKey(saved.selection));
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from storage after hydration
        setSelection(sanitizeSelection(pb, saved.selection, { preserveCoupon }));
        if (saved.quote && new Date(saved.quote.validUntil) > new Date()) setQuote(saved.quote);
        if (saved.customServiceType) setCustomServiceType(saved.customServiceType);
        if (saved.customServiceOther) setCustomServiceOther(saved.customServiceOther);
      }
    } catch {
      /* storage unavailable */
    }
    setIdempotencyKey(newKey());
    setRestored(true);
  }, [pb]);

  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ selection, quote, customServiceType, customServiceOther }),
      );
    } catch {
      /* storage unavailable */
    }
  }, [selection, quote, customServiceType, customServiceOther, restored]);

  /* Show the mobile price bar only while the builder is on screen. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "-20% 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const calc = useMemo(() => calculateQuote(pb, selection, { allowNoTemplate: true }), [pb, selection]);
  const estimate = useMemo(() => calc.ok ? calc : calculateQuote(pb, { ...selection, couponCode: undefined }, { allowNoTemplate: true }), [pb, selection, calc]);
  const liveBreakdown = estimate.ok ? estimate.breakdown : null;
  const requiredBy = useMemo(() => requiredByMap(pb, selection.features), [pb, selection.features]);
  // The server honours a valid quote whose selection matches, even if pricing was republished since.
  const quoteFresh = Boolean(quote && quote.selectionKey === selectionKey(selection) && new Date(quote.validUntil) > new Date());
  const configurationValid = calc.ok || quoteFresh;
  // A fresh server quote is authoritative (it may use newer pricing than this cached page).
  const breakdown = quoteFresh && quote?.breakdown ? quote.breakdown : liveBreakdown;
  const template = pb.templates.find((t) => t.id === selection.templateId) ?? null;

  const demoTemplates = useMemo(
    () => pb.templates.filter((t) => t.id !== "custom-service-website"),
    [pb.templates],
  );
  const customServiceTemplate = useMemo(
    () => pb.templates.find((t) => t.id === "custom-service-website"),
    [pb.templates],
  );
  const selectedServiceOpt = SERVICE_WEBSITE_OPTIONS.find((o) => o.id === customServiceType);
  const customServiceName = selectedServiceOpt
    ? customServiceType === "other" && customServiceOther.trim()
      ? `Custom (${customServiceOther.trim()}) Website`
      : `${selectedServiceOpt.label} Website`
    : "Custom Service & Business Website";

  const update = useCallback((next: Selection) => {
    setSelection(next);
    setIdempotencyKey(newKey()); // a changed configuration is a new submission
  }, []);

  const featureState = useCallback(
    (f: PbFeature): FeatureState => {
      if (f.pricing === "bundled") {
        const on = f.requires.length > 0 && f.requires.every((r) => r in selection.features);
        return { checked: on, locked: true, requiredBy: [], qty: 1 };
      }
      if (f.pricing === "included") {
        return { checked: !selection.omitted.includes(f.id), locked: f.mandatory || Boolean(requiredBy[f.id]), requiredBy: requiredBy[f.id] ?? [], qty: 1 };
      }
      const checked = f.id in selection.features;
      const by = requiredBy[f.id] ?? [];
      return { checked, locked: checked && by.length > 0, requiredBy: checked ? by : [], qty: selection.features[f.id] ?? Math.max(1, f.minQty) };
    },
    [selection, requiredBy],
  );

  const toggle = (f: PbFeature) => {
    if (f.pricing === "included") return update(toggleIncluded(pb, selection, f.id));
    const st = featureState(f);
    if (st.checked) {
      if (st.locked) return;
      update(removeFeature(selection, f.id));
      return;
    }
    const before = new Set(Object.keys(selection.features));
    const next = addFeature(pb, selection, f.id);
    const added = Object.keys(next.features).filter((id) => !before.has(id) && id !== f.id);
    update(next);
    if (added.length) {
      const names = added.map((id) => pb.features.find((x) => x.id === id)?.name).filter(Boolean);
      toast.success(`Also added ${names.join(", ")} — required by ${f.pricing === "bundled" ? "this feature" : f.name}.`);
    }
  };

  const selectTemplate = (id: string) => {
    if (selection.templateId === id) {
      update({ ...selection, templateId: "" });
      track("builder_template_deselected", { template: id });
      return;
    }
    update({ ...selection, templateId: id });
    track("builder_template_selected", { template: id });
  };

  const generateQuote = async (): Promise<StoredQuote | null> => {
    if (!liveBreakdown || !selection.templateId) {
      toast.error("Choose a website design first.");
      scrollToId("templates");
      return null;
    }
    if (!configurationValid) {
      toast.error(calc.ok ? "Please check your selection." : calc.errors[0]);
      scrollToId("quote");
      return null;
    }
    setQuoting(true);
    try {
      const res = await createBuilderQuoteAction(selection);
      if (!res.ok) {
        toast.error(res.error);
        return null;
      }
      if (res.data?.breakdown.total !== liveBreakdown.total) toast.error("Prices were updated since this page loaded — your quotation shows the current prices.");
      if (!res.data?.quote) {
        toast.success("Estimate calculated.");
        return null;
      }
      const stored: StoredQuote = { ...res.data.quote, selectionKey: res.data.breakdown.selectionKey, version: res.data.breakdown.pricebookVersion, breakdown: res.data.breakdown };
      setQuote(stored);
      track("builder_quote_created", { value: res.data.breakdown.total / 100, currency });
      toast.success(`Quotation ${stored.number} is ready.`);
      return stored;
    } finally {
      setQuoting(false);
    }
  };

  /* --------------------------- Feature navigation --------------------------- */

  const selectableCats = pb.categories.filter((c) => pb.features.some((f) => f.categoryId === c.id && f.pricing !== "included"));
  const activeCat = selectableCats.some((c) => c.id === category) ? category : selectableCats[0]?.id ?? "";
  const activeIndex = selectableCats.findIndex((c) => c.id === activeCat);
  const prevCat = activeIndex > 0 ? selectableCats[activeIndex - 1] : null;
  const nextCat = activeIndex >= 0 && activeIndex < selectableCats.length - 1 ? selectableCats[activeIndex + 1] : null;
  const q = query.trim().toLowerCase();
  const visibleFeatures = pb.features.filter((f) => f.pricing !== "included" && (q ? `${f.name} ${f.summary}`.toLowerCase().includes(q) : f.categoryId === activeCat));
  const countIn = (catId: string) => pb.features.filter((f) => f.categoryId === catId && f.pricing !== "included" && (f.id in selection.features || (f.pricing === "bundled" && featureState(f).checked))).length;
  const includedFeatures = pb.features.filter((f) => f.pricing === "included");
  const categoryName = (id: string) => pb.categories.find((c) => c.id === id)?.name ?? "";
  const dialogFeature = dialogId ? pb.features.find((f) => f.id === dialogId) ?? null : null;
  const addOnCount = breakdown ? breakdown.lines.length + breakdown.custom.length : 0;

  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const last = selectableCats.length - 1;
    const next = e.key === "Home" ? 0 : e.key === "End" ? last : e.key === "ArrowRight" ? (index === last ? 0 : index + 1) : index === 0 ? last : index - 1;
    setCategory(selectableCats[next].id);
    document.getElementById(`feature-tab-${selectableCats[next].id}`)?.focus();
  };

  const s = content.sections;

  /* --------------------------------- Summary -------------------------------- */

  const summary = breakdown && (
    <div className="theme-dark rounded-[28px] bg-ink-900 p-6 shadow-lift">
      <p className="eyebrow text-brand-300">Your website estimate</p>
      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-start justify-between gap-3">
          <span className="text-white/60">Design</span>
          <span className="text-right font-medium text-white">
            {template ? (
              template.id === "custom-service-website" ? (
                <span className="text-brand-300 font-semibold">{customServiceName}</span>
              ) : (
                template.name
              )
            ) : (
              <button type="button" onClick={() => scrollToId("templates")} className="text-brand-300 underline underline-offset-4">
                Choose a design
              </button>
            )}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-white/60">Base website</span>
          <span className="tabular-nums text-white">{template ? formatMoney(template.price, currency) : "—"}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-white/60">Included features</span>
          <span className="text-green-400">{breakdown.included.length} · Free</span>
        </div>
        {breakdown.lines.length > 0 && (
          <ul className="space-y-2 border-t border-white/10 pt-3">
            {breakdown.lines.slice(0, 6).map((l) => (
              <li key={l.id} className="flex justify-between gap-3">
                <span className="truncate text-white/75">
                  {l.name}
                  {l.qty > 1 ? ` × ${l.qty}` : ""}
                </span>
                <span className="shrink-0 tabular-nums text-white">{formatMoney(l.amount, currency)}</span>
              </li>
            ))}
            {breakdown.lines.length > 6 && <li className="text-xs text-white/50">+ {breakdown.lines.length - 6} more in your quotation</li>}
          </ul>
        )}
        {breakdown.custom.length > 0 && <p className="text-xs text-violet-300">+ {breakdown.custom.length} item(s) priced after review</p>}
        {breakdown.discounts.map((d) => (
          <div key={d.id} className="flex justify-between gap-3 text-green-400">
            <span>{d.label}{d.code ? ` (${d.code})` : ""}</span>
            <span className="tabular-nums">−{formatMoney(d.amount, currency)}</span>
          </div>
        ))}
        {breakdown.tax && (
          <div className="flex justify-between gap-3">
            <span className="text-white/60">{breakdown.tax.label}</span>
            <span className="tabular-nums text-white">{formatMoney(breakdown.tax.amount, currency)}</span>
          </div>
        )}
      </div>
      <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/10 pt-5">
        <span className="text-sm text-white/60">
          One-time total
          {breakdown.recurring.length > 0 && <span className="block text-xs text-white/45">+ separate running costs</span>}
        </span>
        <div className="text-right">
          <div className="flex flex-wrap items-baseline justify-end gap-2">
            <span className="block font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white tabular-nums" aria-live="polite">
              {formatMoney(breakdown.total, currency)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/35 shadow-xs">
              {formatLiveBdt(breakdown.total, liveBdtRate)}
            </span>
          </div>
          <span className="block text-[0.68rem] text-emerald-400/80 mt-1 font-mono">
            Live USD/BDT rate: ৳{liveBdtRate.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="mt-6 grid gap-2">
        <Button size="md" onClick={() => scrollToId(order ? "order" : template ? "order" : "templates")} arrow>
          {template ? "Continue to order" : "Choose a design"}
        </Button>
        <Button size="md" variant="outline-light" onClick={() => scrollToId("quote")}>
          Review full quotation
        </Button>
      </div>
    </div>
  );

  return (
    <div ref={rootRef} id="builder" className="relative bg-white">
      <div className="container-page grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 space-y-24 md:space-y-28 lg:col-span-8">
          {/* Step 1 — Templates */}
          <section aria-labelledby="templates-heading" id="templates" className="scroll-mt-28">
            <StepHeader id="templates-heading" index="01" eyebrow={s.templates.eyebrow} title={s.templates.title} description={s.templates.description} />
            <div role="radiogroup" aria-labelledby="templates-heading" className="grid gap-5 md:grid-cols-2">
              {demoTemplates.map((t) => (
                <TemplateCard key={t.id} template={t} currency={currency} selected={selection.templateId === t.id} onSelect={() => selectTemplate(t.id)} />
              ))}
            </div>

            {/* Custom Service & Business Website Card ($250) */}
            <div className="mt-6">
              <CustomServiceCard
                selected={selection.templateId === "custom-service-website"}
                onSelect={() => selectTemplate("custom-service-website")}
                currency={currency}
                price={customServiceTemplate?.price ?? 25000}
                rate={liveBdtRate}
                selectedType={customServiceType}
                onTypeChange={setCustomServiceType}
                otherText={customServiceOther}
                onOtherTextChange={setCustomServiceOther}
              />
            </div>

            {template && (
              <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl bg-mist-50 px-5 py-4 text-sm sm:flex-row sm:items-center">
                <p className="text-mist-700">
                  <CheckCircle2 className="mr-1.5 inline size-4 text-green-600" aria-hidden />
                  <strong className="font-medium text-ink-900">
                    {template.id === "custom-service-website" ? customServiceName : template.name}
                  </strong>{" "}
                  selected — {formatMoney(template.price, currency)} added. You can switch designs or click again to deselect any time.
                </p>
                <button type="button" onClick={() => scrollToId("features")} className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:text-brand-800">
                  Next: choose features <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
            )}
            <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 px-5 py-4">
              <p className="text-sm leading-relaxed text-mist-700">
                <strong className="font-medium text-ink-900"> Fully customizable —</strong> We provide fully customizable websites. You can ask for anything — from unique layouts and custom features to bespoke integrations. Every design is a starting point that we tailor exactly to your brand.
              </p>
            </div>
          </section>

          {/* Step 2 — Included */}
          <section aria-labelledby="included-heading" id="included" className="scroll-mt-28">
            <StepHeader id="included-heading" index="02" eyebrow={s.included.eyebrow} title={s.included.title} description={s.included.description} />
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {includedFeatures.map((f) => {
                const st = featureState(f);
                return (
                  <li key={f.id}>
                    <label className={cn("flex h-full items-start gap-3 rounded-2xl border px-4 py-3.5 transition-colors", st.checked ? "border-mist-200 bg-white" : "border-dashed border-mist-300 bg-mist-25", st.locked ? "cursor-default" : "cursor-pointer hover:border-mist-300")}>
                      <input type="checkbox" className="peer sr-only" checked={st.checked} disabled={st.locked} onChange={() => toggle(f)} />
                      <span aria-hidden className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/30", st.checked ? "bg-success-500 text-white" : "border-2 border-mist-300 bg-white")}>
                        {st.checked && <CheckCircle2 className="size-5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block text-sm font-medium", st.checked ? "text-ink-900" : "text-mist-500 line-through")}>{f.name}</span>
                        <span className="block text-xs leading-relaxed text-mist-500">{f.summary}</span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <span className="rounded-full bg-success-50 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-green-800">{st.checked ? "Included" : "Not needed"}</span>
                        {st.locked ? <Lock className="size-3 text-mist-400" aria-label="Always included" /> : <span className="text-[0.68rem] text-mist-400">Optional</span>}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Step 3 — Feature configurator */}
          <section aria-labelledby="features-heading" id="features" className="scroll-mt-28">
            <StepHeader id="features-heading" index="03" eyebrow={s.features.eyebrow} title={s.features.title} description={s.features.description} />

            <div className="relative -mx-4 mb-6 border-b border-mist-100 bg-white/60 px-4 pb-3 pt-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-mist-400" aria-hidden />
                <label htmlFor="feature-search" className="sr-only">
                  Search features
                </label>
                <input
                  id="feature-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search features — e.g. POS, courier, bKash…`}
                  className="h-11 w-full rounded-full border border-mist-200 bg-white pl-11 pr-11 text-sm outline-none transition-[border-color,box-shadow] focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 sm:h-12 sm:text-[0.9375rem]"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-mist-400 hover:bg-mist-100 hover:text-ink-900" aria-label="Clear search">
                    <X className="size-4" />
                  </button>
                )}
              </div>
              {!q && (
                <>
                  {/* Quick category selector on mobile */}
                  <div className="relative mt-2.5 sm:hidden">
                    <label htmlFor="mobile-category-select" className="sr-only">
                      Select feature category
                    </label>
                    <div className="relative flex items-center rounded-2xl border-2 border-[#F2A33A] bg-gradient-to-r from-[#FFF8EE] via-[#FFFBF5] to-white p-1 shadow-[0_2px_12px_rgba(242,163,58,0.22)] transition-all">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F2A33A] text-ink-950 shadow-sm">
                        <Icon name={selectableCats.find((c) => c.id === activeCat)?.icon || "layers"} className="size-4.5 text-ink-950" />
                      </div>
                      <select
                        id="mobile-category-select"
                        value={activeCat}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full appearance-none bg-transparent py-2 pl-3 pr-11 text-[0.85rem] font-bold text-ink-950 focus:outline-none"
                      >
                        {selectableCats.map((c) => {
                          const n = countIn(c.id);
                          return (
                            <option key={c.id} value={c.id} className="bg-white text-ink-900 font-medium py-1">
                              {c.name} {n > 0 ? `(${n} selected)` : ""}
                            </option>
                          );
                        })}
                      </select>
                      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex size-7 items-center justify-center rounded-full bg-[#F2A33A]/25 text-[#B86B14]">
                        <ChevronDown className="size-5 stroke-[2.75]" />
                      </div>
                    </div>
                  </div>

                  {/* Horizontal pill tablist on mobile (no x-axis page scroll, scrollbar hidden), wrapped on larger screens */}
                  <div
                    role="tablist"
                    aria-label="Feature categories"
                    className="scrollbar-none -mx-4 mt-2.5 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0"
                  >
                    {selectableCats.map((c, i) => {
                      const active = c.id === activeCat;
                      const n = countIn(c.id);
                      return (
                        <button
                          key={c.id}
                          id={`feature-tab-${c.id}`}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          aria-controls="feature-panel"
                          tabIndex={active ? 0 : -1}
                          onClick={() => setCategory(c.id)}
                          onKeyDown={(e) => onTabKey(e, i)}
                          className={cn(
                            "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:gap-2 sm:px-3.5 sm:py-2 sm:text-[0.8rem]",
                            "hover:shadow-[0_4px_12px_-4px_rgb(0_0_0/0.12)] hover:-translate-y-px",
                            active
                              ? "border-ink-900 bg-ink-900 text-white shadow-[0_4px_16px_-4px_rgb(0_0_0/0.25)]"
                              : "border-mist-200 bg-white text-mist-700 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-800",
                          )}
                        >
                          <Icon name={c.icon} className={cn("size-3.5 transition-colors sm:size-4", active ? "text-brand-300" : "text-brand-700")} />
                          <span className="whitespace-nowrap leading-tight">{c.name}</span>
                          {n > 0 && <span className={cn("rounded-full px-1.5 text-[0.65rem] font-semibold tabular-nums transition-colors", active ? "bg-brand-400 text-ink-950" : "bg-brand-50 text-brand-800")}>{n}</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div id="feature-panel" role={q ? "region" : "tabpanel"} aria-labelledby={q ? undefined : `feature-tab-${activeCat}`} aria-label={q ? "Search results" : undefined}>
              {!q && activeCat && <p className="mb-4 text-xs leading-relaxed text-mist-600 sm:mb-5 sm:text-sm">{pb.categories.find((c) => c.id === activeCat)?.description}</p>}
              {q && (
                <p className="mb-4 text-xs leading-relaxed text-mist-600 sm:mb-5 sm:text-sm" aria-live="polite">
                  {visibleFeatures.length} {visibleFeatures.length === 1 ? "feature" : "features"} match “{query.trim()}”
                </p>
              )}
              {visibleFeatures.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-mist-300 px-6 py-12 text-center">
                  <p className="font-medium text-ink-900">No features match that search.</p>
                  <p className="mt-1 text-sm text-mist-500">Try another word, or describe what you need in the order form — we build custom features too.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  {visibleFeatures.map((f) => (
                    <FeatureCard
                      key={f.id}
                      feature={f}
                      pb={pb}
                      state={featureState(f)}
                      categoryName={q ? categoryName(f.categoryId) : undefined}
                      onToggle={() => toggle(f)}
                      onQty={(n) => update(setQuantity(pb, selection, f.id, n))}
                      onLearnMore={() => setDialogId(f.id)}
                    />
                  ))}
                </div>
              )}

              {!q && selectableCats.length > 1 && (
                <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-mist-100 bg-mist-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-mist-600">
                    Category {activeIndex + 1} of {selectableCats.length}: <strong className="font-semibold text-ink-900">{selectableCats[activeIndex]?.name}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    {prevCat && (
                      <button
                        type="button"
                        onClick={() => {
                          setCategory(prevCat.id);
                          scrollToId("features-heading");
                        }}
                        className="flex-1 rounded-full border border-mist-200 bg-white px-3.5 py-1.5 text-xs font-medium text-ink-900 shadow-sm transition-colors hover:border-mist-400 sm:flex-initial"
                      >
                        ← {prevCat.name}
                      </button>
                    )}
                    {nextCat && (
                      <button
                        type="button"
                        onClick={() => {
                          setCategory(nextCat.id);
                          scrollToId("features-heading");
                        }}
                        className="flex-1 rounded-full bg-ink-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-ink-800 sm:flex-initial"
                      >
                        {nextCat.name} →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Step 4 — Quotation */}
          <section aria-labelledby="quote-heading" id="quote" className="scroll-mt-28">
            <StepHeader id="quote-heading" index="04" eyebrow={s.quote.eyebrow} title={s.quote.title} description={s.quote.description} />
            <div className="rounded-[28px] border border-mist-200 bg-white p-5 sm:p-8">
              {breakdown && <QuoteBreakdownView breakdown={breakdown} bdtPerUsd={liveBdtRate} onRemove={(id) => update(removeFeature(selection, id))} onChooseTemplate={() => scrollToId("templates")} />}
              <CouponField pricebook={pb} selection={selection} onChange={update} validationError={selection.couponCode && !calc.ok && !quoteFresh ? calc.errors[0] : undefined} />
              {s.quote.instructions && <p className="mt-5 text-xs leading-relaxed text-mist-500">{s.quote.instructions}</p>}
              <p className="mt-1 text-xs text-mist-500">Taka amounts are dynamically converted at the real-time forex rate of ৳{liveBdtRate.toFixed(2)} per US$1.</p>

              <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-mist-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                {quoteFresh && quote ? (
                  <>
                    <div className="text-sm">
                      <p className="flex items-center gap-2 font-medium text-ink-900">
                        <FileText className="size-4 text-brand-700" aria-hidden /> Quotation {quote.number}
                      </p>
                      <p className="mt-0.5 text-mist-600">Valid until {new Date(quote.validUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. Keep this link — it’s private to you.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a href={`${quote.pdfUrl}?download`} className="inline-flex h-10 items-center gap-2 rounded-full bg-ink-900 px-4 text-sm font-medium text-white hover:bg-ink-700">
                        <Download className="size-4" aria-hidden /> Download PDF
                      </a>
                      <a href={quote.url} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-full border border-mist-300 bg-white px-4 text-sm font-medium text-ink-900 hover:border-ink-900">
                        View <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-mist-600">{template ? (quote ? "Your selection changed — generate an updated quotation." : "Get a numbered quotation you can download as a PDF and share.") : "Choose a design to generate your quotation."}</p>
                    {canQuote ? (
                      <Button variant="dark" size="md" onClick={generateQuote} disabled={!template || quoting || !configurationValid} loading={quoting}>
                        {quote ? "Update quotation" : "Generate quotation"}
                      </Button>
                    ) : (
                      <p className="text-sm text-mist-500">Quotation PDFs are temporarily unavailable.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Step 5 — Order */}
          <section aria-labelledby="order-heading" id="order" className="scroll-mt-28">
            <StepHeader id="order-heading" index="05" eyebrow={s.order.eyebrow} title={s.order.title} description={s.order.description} />
            <div className="rounded-[28px] border border-mist-200 bg-white p-5 sm:p-8">
              {order ? (
                <OrderConfirmation order={order} onReset={() => {
                  setOrder(null);
                  setQuote(null);
                  update(EMPTY_SELECTION);
                  scrollToId("templates");
                }} />
              ) : !acceptingOrders ? (
                <p className="text-mist-700">{closedMessage}</p>
              ) : (
                <>
                  {template && breakdown && (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mist-50 px-5 py-4 text-sm">
                      <span className="text-mist-700">
                        <strong className="font-medium text-ink-900">
                          {template.id === "custom-service-website" ? customServiceName : template.name}
                        </strong>{" "}
                        · {addOnCount} add-on{addOnCount === 1 ? "" : "s"}
                      </span>
                      <span className="font-display text-xl font-semibold text-ink-900">{formatMoney(breakdown.total, currency)}</span>
                    </div>
                  )}
                  {idempotencyKey ? (
                    <OrderForm
                      form={form}
                      selection={selection}
                      expectedTotal={breakdown && template ? breakdown.total : null}
                      quoteToken={quoteFresh && quote ? quote.token : null}
                      idempotencyKey={idempotencyKey}
                      canSubmit={Boolean(template) && canQuote && configurationValid}
                      blockedReason={!template ? "Choose a website design first (step 1)." : !canQuote ? "Online orders are temporarily unavailable — please contact us on WhatsApp." : !configurationValid && !calc.ok ? calc.errors[0] : undefined}
                      onSuccess={(o) => {
                        setOrder(o);
                        track("generate_lead", { form: "ecommerce_builder", value: breakdown ? breakdown.total / 100 : undefined, currency });
                        requestAnimationFrame(() => scrollToId("order"));
                      }}
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-mist-400">
                      <Loader2 className="size-5 animate-spin" aria-label="Loading form" />
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        {/* Desktop sticky summary */}
        <aside className="hidden lg:col-span-4 lg:block" aria-label="Price summary">
          <div className="sticky top-28">{summary}</div>
        </aside>
      </div>

      {/* Mobile price bar + quotation drawer */}
      {breakdown && !order && (
        <div
          className={cn(
            "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-[5.25rem] z-[60] transition-[transform,opacity] duration-300 lg:hidden",
            inView ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
          )}
        >
          <button type="button" onClick={() => setDrawer(true)} className="theme-dark flex h-14 w-full items-center justify-between gap-3 rounded-full bg-ink-900 pl-5 pr-2 text-left shadow-[0_18px_40px_-12px_rgb(0_0_0/0.55)]" aria-haspopup="dialog">
            <span className="min-w-0">
              <span className="block truncate text-[0.7rem] uppercase tracking-wider text-white/55">
                {template ? `${template.id === "custom-service-website" ? customServiceName : template.name} · ${addOnCount} add-on${addOnCount === 1 ? "" : "s"}` : "Choose a design"}
              </span>
              <span className="flex flex-wrap items-baseline gap-2">
                <span className="block font-display text-lg font-semibold leading-tight text-white tabular-nums">{formatMoney(breakdown.total, currency)}</span>
                <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-2 py-0.5 text-[0.68rem] font-bold text-emerald-300 border border-emerald-400/30">
                  {formatLiveBdt(breakdown.total, liveBdtRate)}
                </span>
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-brand-400 px-4 py-2 text-sm font-semibold text-ink-950">View quote</span>
          </button>
        </div>
      )}
      <Dialog
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Your quotation"
        description={template ? (template.id === "custom-service-website" ? customServiceName : template.name) : "No design selected yet"}
        size="md"
        footer={
          <Button
            size="md"
            onClick={() => {
              setDrawer(false);
              setTimeout(() => scrollToId(template ? "order" : "templates"), 50);
            }}
            arrow
          >
            {template ? "Continue to order" : "Choose a design"}
          </Button>
        }
      >
        {breakdown && <QuoteBreakdownView breakdown={breakdown} bdtPerUsd={liveBdtRate} onRemove={(id) => update(removeFeature(selection, id))} />}
      </Dialog>

      <FeatureDialog feature={dialogFeature} pb={pb} state={dialogFeature ? featureState(dialogFeature) : null} onClose={() => setDialogId(null)} onToggle={() => dialogFeature && toggle(dialogFeature)} />
    </div>
  );
}

function OrderConfirmation({ order, onReset }: { order: OrderPayload; onReset: () => void }) {
  return (
    <div role="status" className="text-center sm:text-left">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success-50 text-green-700 sm:mx-0">
        <CheckCircle2 className="size-7" aria-hidden />
      </span>
      <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink-900">Request received — order {order.orderNumber}</h3>
      <p className="mt-2 max-w-xl leading-relaxed text-mist-600">{order.message}</p>
      <dl className="mt-6 grid gap-3 rounded-2xl bg-mist-50 p-5 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-mist-500">Order reference</dt>
          <dd className="font-medium text-ink-900">{order.orderNumber}</dd>
        </div>
        <div>
          <dt className="text-mist-500">Quotation</dt>
          <dd className="font-medium text-ink-900">{order.quoteNumber}</dd>
        </div>
        <div>
          <dt className="text-mist-500">Estimated total</dt>
          <dd className="font-medium text-ink-900">
            {order.total}
            {order.hasCustomItems && <span className="block text-xs font-normal text-mist-500">+ items priced after review</span>}
          </dd>
        </div>
      </dl>
      <p className="mt-4 flex items-center justify-center gap-2 text-sm text-mist-600 sm:justify-start">
        <Mail className="size-4" aria-hidden />
        {order.emailSent ? "A confirmation with your quotation link is on its way to your inbox." : "Save your order reference — we’ll contact you using your preferred method."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
        {order.pdfUrl && (
          <a href={`${order.pdfUrl}?download`} className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-5 text-sm font-medium text-white hover:bg-ink-700">
            <Download className="size-4" aria-hidden /> Download quotation (PDF)
          </a>
        )}
        {order.quoteUrl && (
          <a href={order.quoteUrl} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-full border border-mist-300 px-5 text-sm font-medium text-ink-900 hover:border-ink-900">
            View quotation <ExternalLink className="size-3.5" aria-hidden />
          </a>
        )}
        <button type="button" onClick={onReset} className="inline-flex h-11 items-center rounded-full px-5 text-sm font-medium text-brand-700 hover:bg-brand-50">
          Configure another store
        </button>
      </div>
      <p className="mt-6 text-xs text-mist-500">This is a quotation (an estimate), not an invoice. No payment has been taken.</p>
    </div>
  );
}
