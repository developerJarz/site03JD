/**
 * Consent-gated analytics (GA4 or Google Tag Manager), configured purely by
 * public env vars — nothing is loaded when neither is set:
 *
 *   NEXT_PUBLIC_GA_ID   GA4 measurement ID (G-XXXXXXX)
 *   NEXT_PUBLIC_GTM_ID  GTM container ID (GTM-XXXXXXX) — takes precedence over GA_ID
 *
 * Tags load only after the visitor accepts analytics cookies in the consent
 * banner. Events fired before that (or after a decline) are dropped.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() || "";
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "";
export const analyticsEnabled = Boolean(GA_ID || GTM_ID);

export const CONSENT_KEY = "jd-analytics-consent";
export const CONSENT_EVENT = "jd:consent";
export type Consent = "granted" | "denied";

type Params = Record<string, string | number | boolean | undefined>;
type DataLayerWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function saveConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* storage blocked — the choice lasts for this page view only */
  }
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: value }));
}

/** Sends a conversion event: `generate_lead`, `click_call`, `click_whatsapp`… No-op without consent. */
export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined" || !analyticsEnabled || readConsent() !== "granted") return;
  const w = window as DataLayerWindow;
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
  if (GTM_ID) (w.dataLayer ??= []).push({ event, ...clean });
  else w.gtag?.("event", event, clean);
}
