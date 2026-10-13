"use client";

import { useState } from "react";
import { Check, CheckCircle2, ChevronRight, Sparkles, Building2, GraduationCap, Hospital, Newspaper, User, Briefcase, Landmark, Utensils, Info } from "lucide-react";
import { formatMoney } from "@/lib/ecommerce-builder/pricing";
import { cn } from "@/lib/utils";

export const SERVICE_WEBSITE_OPTIONS = [
  { id: "school-college", label: "School / College", icon: GraduationCap, hint: "Admissions, faculty, courses & student notices" },
  { id: "builder-company", label: "Builder / Construction", icon: Building2, hint: "Properties, project showcases & client inquiries" },
  { id: "corporate", label: "Corporate / Company", icon: Landmark, hint: "Corporate profile, services, team & case studies" },
  { id: "hospital", label: "Hospital / Healthcare", icon: Hospital, hint: "Departments, doctors directory & appointments" },
  { id: "news-portal", label: "News Portal / Magazine", icon: Newspaper, hint: "Article categories, breaking news & editorial layouts" },
  { id: "information", label: "Information / Directory", icon: Info, hint: "Knowledge bases, resource centers & directories" },
  { id: "personal", label: "Personal / Portfolio", icon: User, hint: "Personal branding, resume, portfolio & contact" },
  { id: "business", label: "Business / Agency", icon: Briefcase, hint: "Service packages, client booking & proposals" },
  { id: "restaurant", label: "Restaurant / Café", icon: Utensils, hint: "Digital menus, food galleries & reservations" },
  { id: "other", label: "Other (Custom Type)", icon: Sparkles, hint: "Custom industry or unique functional requirements" },
] as const;

export function CustomServiceCard({
  selected,
  onSelect,
  currency = "USD",
  price = 25000,
  rate = 123.14,
  selectedType,
  onTypeChange,
  otherText,
  onOtherTextChange,
}: {
  selected: boolean;
  onSelect: () => void;
  currency?: string;
  price?: number;
  rate?: number;
  selectedType: string;
  onTypeChange: (type: string) => void;
  otherText: string;
  onOtherTextChange: (text: string) => void;
}) {
  const isOther = selectedType === "other";

  const handleOptionClick = (id: string) => {
    if (selected && selectedType === id) {
      onSelect();
      return;
    }
    onTypeChange(id);
    if (!selected) {
      onSelect();
    }
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-[28px] border bg-gradient-to-b transition-all duration-300 md:p-7 p-5 shadow-sm",
        selected
          ? "border-brand-500 from-brand-50/50 via-white to-white shadow-[0_0_0_2px_rgb(0_175_185/0.2),0_16px_40px_-12px_rgb(0_175_185/0.2)]"
          : "border-mist-200 from-white to-mist-25/50 hover:border-brand-300 hover:shadow-lift",
      )}
    >
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-500/15 to-azure-500/15 px-3 py-1 text-xs font-semibold text-brand-800 border border-brand-500/25">
              Custom Business & Service Package
            </span>
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-amber-800 border border-amber-500/25">
              Non-Ecommerce / Service Sites
            </span>
          </div>

          <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-900 md:text-[1.65rem]">
            Custom Service & Corporate Website
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-mist-600">
            Need a website for a <strong>school, college, construction firm, hospital, news portal, corporate business, or personal portfolio</strong>? Select your category below. We tailor design, branding, lead capture, and admin controls to your exact business model.
          </p>
        </div>

        {/* Pricing badge */}
        <div
          className={cn(
            "flex shrink-0 flex-col items-start rounded-2xl border p-4 shadow-sm transition-all duration-200 sm:items-end",
            selected
              ? "border-brand-400 bg-white ring-1 ring-brand-400/40 shadow-xs"
              : "border-mist-200/80 bg-white/95 hover:border-mist-300",
          )}
        >
          <span className="text-[0.68rem] font-bold uppercase tracking-wider text-mist-500">
            Package Price
          </span>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="font-display text-3xl font-extrabold tracking-tight text-ink-900 md:text-[2.1rem]">
              {formatMoney(price, currency)}
            </span>
            <span className="text-xs font-semibold text-mist-400">/ flat rate</span>
          </div>
          <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[0.68rem] font-semibold text-emerald-700 border border-emerald-200/60">
            <span className="size-1.5 rounded-full bg-emerald-500" /> All 26 standard features included
          </span>
        </div>
      </div>

      {/* Website type selection grid */}
      <div className="mt-6 border-t border-mist-100 pt-5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-900 mb-3">
          Select your website category:
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {SERVICE_WEBSITE_OPTIONS.map((opt) => {
            const active = selected && selectedType === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleOptionClick(opt.id)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-all duration-200",
                  active
                    ? "border-brand-500 bg-brand-50/80 shadow-xs ring-1 ring-brand-500"
                    : "border-mist-200 bg-white hover:border-brand-200 hover:bg-mist-25/50",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className={cn("flex size-7 items-center justify-center rounded-lg transition-colors", active ? "bg-brand-500 text-ink-950" : "bg-mist-100 text-mist-700")}>
                    <Icon className="size-4" />
                  </span>
                  {active && <Check className="size-4 text-brand-600" />}
                </div>
                <span className={cn("mt-1 text-xs font-semibold leading-tight", active ? "text-brand-950" : "text-ink-900")}>
                  {opt.label}
                </span>
                <span className="text-[0.65rem] leading-tight text-mist-500 line-clamp-2">
                  {opt.hint}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom input for 'Other' or extra specifications */}
        <div className={cn("mt-4 rounded-2xl border p-4 transition-all", isOther ? "border-brand-300 bg-brand-50/40" : "border-mist-200/80 bg-mist-50/50")}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="custom-website-spec" className="text-xs font-semibold text-ink-900">
              {isOther ? "Specify your custom website requirement:" : "Add custom specifications or industry notes (optional):"}
            </label>
            {isOther && (
              <span className="text-[0.7rem] font-medium text-brand-700">Custom requirements priced at flat $250</span>
            )}
          </div>
          <input
            id="custom-website-spec"
            type="text"
            value={otherText}
            onChange={(e) => {
              onOtherTextChange(e.target.value);
              if (!selected) onSelect();
            }}
            placeholder={isOther ? "e.g. Real Estate Portal, Online Academy, Media Production House, Law Firm..." : "e.g. Need student login, online appointment booking, bilingual Bangla/English..."}
            className="mt-2 h-11 w-full rounded-xl border border-mist-200 bg-white px-3.5 text-xs text-ink-900 shadow-inner outline-none transition-all placeholder:text-mist-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Action selection footer */}
      <div className="mt-6 flex flex-col items-stretch justify-between gap-3 border-t border-mist-100 pt-5 sm:flex-row sm:items-center">
        <div className="text-xs text-mist-600">
          {selected ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-green-700">
              <CheckCircle2 className="size-4 text-green-600" />
              Selected: {SERVICE_WEBSITE_OPTIONS.find((o) => o.id === selectedType)?.label || "Custom Service Website"} ({formatMoney(price, currency)})
            </span>
          ) : (
            <span>Click below to select this custom $250 package as your website base design.</span>
          )}
        </div>

        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-xs font-bold transition-all shadow-sm",
            selected
              ? "border border-brand-500 bg-brand-50 text-brand-900 hover:bg-brand-100"
              : "bg-ink-900 text-white hover:bg-ink-800 hover:shadow-md",
          )}
        >
          {selected ? (
            <>
              <Check className="size-4 text-brand-600" />
              Package Selected
            </>
          ) : (
            <>
              Select this package — {formatMoney(price, currency)}
              <ChevronRight className="size-4" />
            </>
          )}
        </button>
      </div>
    </article>
  );
}
