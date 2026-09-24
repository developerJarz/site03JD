"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { controlClass } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { saveSettingsAction, type SettingsSection } from "@/lib/actions/admin";
import { OfficesEditor } from "./offices-editor";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/types/content";

type Tab = { key: string; label: string; sections: SettingsSection[] };

function Row({ label, help, error, children }: { label: string; help?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-800">{label}</span>
      {children}
      {help && !error && <span className="mt-1 block text-xs text-mist-500">{help}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-danger-500">
          {error}
        </span>
      )}
    </label>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between rounded-xl border border-mist-200 bg-white px-4 py-3 text-left text-sm">
      {label}
      <span className={cn("relative h-6 w-10 rounded-full transition-colors", checked ? "bg-brand-500" : "bg-mist-200")}>
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
      </span>
    </button>
  );
}

function StringList({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div className="space-y-2">
      {value.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input value={v} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} placeholder={placeholder} className={controlClass(false, "h-10")} aria-label={`Item ${i + 1}`} />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded-lg px-2 text-mist-400 hover:text-danger-500" aria-label="Remove">
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, ""])} className="flex items-center gap-1.5 text-sm font-medium text-brand-700">
        <Plus className="size-4" aria-hidden /> Add
      </button>
    </div>
  );
}

export function SettingsForm({ settings, tabs, initialTab }: { settings: SiteSettings; tabs: Tab[]; initialTab?: string }) {
  const toast = useToast();
  const [tab, setTab] = useState(tabs.some((t) => t.key === initialTab) ? initialTab! : tabs[0].key);
  const [s, setS] = useState(settings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const current = tabs.find((t) => t.key === tab)!;

  const patch = <K extends keyof SiteSettings>(section: K, value: Partial<SiteSettings[K]> | SiteSettings[K]) =>
    setS((prev) => ({ ...prev, [section]: Array.isArray(value) ? value : { ...(prev[section] as object), ...(value as object) } }));

  const save = () =>
    start(async () => {
      setErrors({});
      for (const section of current.sections) {
        const res = await saveSettingsAction(section, s[section as keyof SiteSettings]);
        if (!res.ok) {
          setErrors(Object.fromEntries(Object.entries(res.fieldErrors ?? {}).map(([k, v]) => [`${section}.${k}`, v])));
          toast.error(res.error);
          return;
        }
      }
      toast.success("Settings saved", "Changes are live on the website.");
    });

  const e = (k: string) => errors[k];

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Settings sections" className="scrollbar-none flex gap-1 overflow-x-auto lg:flex-col">
        {tabs.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} aria-current={tab === t.key ? "page" : undefined} className={cn("shrink-0 rounded-lg px-3 py-2 text-left text-sm", tab === t.key ? "bg-white font-medium text-ink-900 shadow-sm ring-1 ring-mist-200" : "text-mist-600 hover:bg-white/60")}>
            {t.label}
          </button>
        ))}
      </nav>

      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          save();
        }}
        className="rounded-2xl border border-mist-200 bg-white"
      >
        <div className="space-y-5 p-6">
          {tab === "general" && (
            <>
              <Row label="Site name" error={e("general.siteName")}>
                <input value={s.general.siteName} onChange={(ev) => patch("general", { siteName: ev.target.value })} className={controlClass(false, "h-11")} />
              </Row>
              <Row label="Tagline" error={e("general.tagline")}>
                <input value={s.general.tagline} onChange={(ev) => patch("general", { tagline: ev.target.value })} className={controlClass(false, "h-11")} />
              </Row>
              <Row label="Description" error={e("general.description")}>
                <textarea rows={3} value={s.general.description} onChange={(ev) => patch("general", { description: ev.target.value })} className={controlClass(false, "py-2")} />
              </Row>
              <Row label="Founded year" error={e("general.foundedYear")}>
                <input type="number" value={s.general.foundedYear} onChange={(ev) => patch("general", { foundedYear: Number(ev.target.value) })} className={controlClass(false, "h-11 max-w-40")} />
              </Row>
            </>
          )}

          {tab === "branding" && (
            <>
              <Row label="Logo path" help="Full logo used on light surfaces and in emails." error={e("branding.logo")}>
                <input value={s.branding.logo} onChange={(ev) => patch("branding", { logo: ev.target.value })} className={controlClass(false, "h-11")} />
              </Row>
              <Row label="Mark path" help="Square JD mark used on dark surfaces and as the app icon." error={e("branding.mark")}>
                <input value={s.branding.mark} onChange={(ev) => patch("branding", { mark: ev.target.value })} className={controlClass(false, "h-11")} />
              </Row>
              <div className="flex items-center gap-6 rounded-xl bg-mist-50 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.branding.logo} alt="Logo preview" className="h-10 w-auto" />
                <span className="rounded-xl bg-ink-900 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.branding.mark} alt="Mark preview" className="size-8" />
                </span>
              </div>
            </>
          )}

          {tab === "contact" && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Row label="Email" error={e("contact.email")}>
                  <input value={s.contact.email} onChange={(ev) => patch("contact", { email: ev.target.value })} className={controlClass(false, "h-11")} />
                </Row>
                <Row label="Phone" error={e("contact.phone")}>
                  <input value={s.contact.phone} onChange={(ev) => patch("contact", { phone: ev.target.value })} className={controlClass(false, "h-11")} />
                </Row>
                <Row label="WhatsApp" error={e("contact.whatsapp")}>
                  <input value={s.contact.whatsapp} onChange={(ev) => patch("contact", { whatsapp: ev.target.value })} className={controlClass(false, "h-11")} />
                </Row>
                <Row label="Response time" error={e("contact.responseTime")}>
                  <input value={s.contact.responseTime} onChange={(ev) => patch("contact", { responseTime: ev.target.value })} className={controlClass(false, "h-11")} />
                </Row>
              </div>
              <Row label="Mailing address" error={e("contact.mailingAddress")}>
                <input value={s.contact.mailingAddress} onChange={(ev) => patch("contact", { mailingAddress: ev.target.value })} className={controlClass(false, "h-11")} />
              </Row>
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-ink-800">Business hours</legend>
                <div className="space-y-2">
                  {s.contact.hours.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <input aria-label="Days" value={h.days} onChange={(ev) => patch("contact", { hours: s.contact.hours.map((x, j) => (j === i ? { ...x, days: ev.target.value } : x)) })} className={controlClass(false, "h-10")} />
                      <input aria-label="Hours" value={h.hours} onChange={(ev) => patch("contact", { hours: s.contact.hours.map((x, j) => (j === i ? { ...x, hours: ev.target.value } : x)) })} className={controlClass(false, "h-10")} />
                      <button type="button" onClick={() => patch("contact", { hours: s.contact.hours.filter((_, j) => j !== i) })} className="px-2 text-mist-400 hover:text-danger-500" aria-label="Remove row">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => patch("contact", { hours: [...s.contact.hours, { days: "", hours: "" }] })} className="flex items-center gap-1.5 text-sm font-medium text-brand-700">
                    <Plus className="size-4" aria-hidden /> Add row
                  </button>
                </div>
              </fieldset>
              <p className="rounded-xl bg-mist-50 px-4 py-3 text-xs text-mist-600">Office addresses and phone numbers are edited under Offices &amp; locations.</p>
            </>
          )}

          {tab === "offices" && <OfficesEditor value={s.offices} onChange={(v) => patch("offices", v)} errors={errors} />}

          {tab === "social" && (
            <>
              <p className="text-sm text-mist-600">Social icons appear in the footer only for the profiles filled in here. The original site linked icons without URLs, so these start empty.</p>
              {(["facebook", "instagram", "linkedin", "twitter", "youtube"] as const).map((k) => (
                <Row key={k} label={k === "twitter" ? "X / Twitter" : k.charAt(0).toUpperCase() + k.slice(1)} error={e(`socials.${k}`)}>
                  <input type="url" placeholder="https://" value={s.socials[k] ?? ""} onChange={(ev) => patch("socials", { [k]: ev.target.value })} className={controlClass(false, "h-11")} />
                </Row>
              ))}
            </>
          )}

          {tab === "homepage" && (
            <>
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-ink-800">Statistics</legend>
                <p className="mb-3 text-xs text-mist-500">Shown on the homepage and About page. Only publish figures you can verify.</p>
                <div className="space-y-2">
                  {s.stats.map((st, i) => (
                    <div key={i} className="flex gap-2">
                      <input aria-label="Value" value={st.value} onChange={(ev) => patch("stats", s.stats.map((x, j) => (j === i ? { ...x, value: ev.target.value } : x)))} className={controlClass(false, "h-10 w-32")} />
                      <input aria-label="Label" value={st.label} onChange={(ev) => patch("stats", s.stats.map((x, j) => (j === i ? { ...x, label: ev.target.value } : x)))} className={controlClass(false, "h-10")} />
                      <button type="button" onClick={() => patch("stats", s.stats.filter((_, j) => j !== i))} className="px-2 text-mist-400 hover:text-danger-500" aria-label="Remove stat">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => patch("stats", [...s.stats, { value: "", label: "" }])} className="flex items-center gap-1.5 text-sm font-medium text-brand-700">
                    <Plus className="size-4" aria-hidden /> Add statistic
                  </button>
                </div>
              </fieldset>
              <Row label="Hero trust points" help="Short proof points under the homepage headline.">
                <StringList value={s.trust} onChange={(v) => patch("trust", v)} />
              </Row>
            </>
          )}

          {tab === "email" && (
            <>
              <Toggle checked={s.email.notifyOnLead} onChange={(v) => patch("email", { notifyOnLead: v })} label="Email staff when a new lead arrives" />
              <Row label="Lead notification recipients" error={e("email.adminRecipients")}>
                <StringList value={s.email.adminRecipients} onChange={(v) => patch("email", { adminRecipients: v })} placeholder="name@jarzdigital.com" />
              </Row>
              <p className="rounded-xl bg-mist-50 px-4 py-3 text-xs text-mist-600">The email provider (console, SMTP, Resend or Brevo) and credentials are configured through environment variables — see the README.</p>
            </>
          )}

          {tab === "security" && (
            <>
              <Toggle checked={s.security.allowRegistration} onChange={(v) => patch("security", { allowRegistration: v })} label="Allow clients to create accounts" />
              <ul className="space-y-2 rounded-xl bg-mist-50 px-4 py-3 text-xs text-mist-600">
                <li>• Passwords are hashed with scrypt; sessions are stored server-side and can be revoked.</li>
                <li>• Sign-in, registration, password reset, contact and upload endpoints are rate limited.</li>
                <li>• Changing a user’s role or suspending them signs them out everywhere.</li>
              </ul>
            </>
          )}
        </div>
        <div className="flex justify-end border-t border-mist-100 bg-mist-25 px-6 py-4">
          <Button type="submit" variant="dark" size="sm" loading={pending}>
            Save {current.label.toLowerCase()}
          </Button>
        </div>
      </form>
    </div>
  );
}
