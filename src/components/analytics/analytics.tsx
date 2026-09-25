"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState, useSyncExternalStore } from "react";
import { CONSENT_EVENT, GA_ID, GTM_ID, analyticsEnabled, readConsent, saveConsent, track, type Consent } from "@/lib/analytics";

const OPEN_EVENT = "jd:consent-open";

/**
 * Consent banner + Google tag loader + click tracking for call/WhatsApp links.
 * Renders nothing unless NEXT_PUBLIC_GA_ID or NEXT_PUBLIC_GTM_ID is set, and
 * loads no Google script until the visitor allows analytics.
 */
/** Consent lives in localStorage; "pending" on the server so the banner never renders into static HTML. */
function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function Analytics() {
  const consent = useSyncExternalStore<Consent | null | "pending">(subscribeConsent, readConsent, () => "pending");
  const [reopened, setReopened] = useState(false);
  const asking = consent === null || reopened;

  useEffect(() => {
    if (!analyticsEnabled) return;
    const onOpen = () => setReopened(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  // One listener covers every phone and WhatsApp link on the site.
  useEffect(() => {
    if (!analyticsEnabled) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      const href = a?.getAttribute("href") ?? "";
      const where = { page_path: location.pathname };
      if (href.startsWith("tel:")) track("click_call", { ...where, phone: href.slice(4) });
      else if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) track("click_whatsapp", where);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!analyticsEnabled) return null;

  const choose = (value: Consent) => {
    saveConsent(value);
    setReopened(false);
    // A withdrawn consent stops Google tags that are already running on this page.
    if (value === "denied") (window as Window & { gtag?: (...a: unknown[]) => void }).gtag?.("consent", "update", { analytics_storage: "denied" });
  };

  return (
    <>
      {consent === "granted" && <GoogleTags />}
      {asking && (
        <section
          aria-label="Cookie preferences"
          className="theme-dark fixed inset-x-4 bottom-4 z-[70] rounded-3xl border border-white/10 bg-ink-900 p-5 text-sm text-white/75 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.7)] sm:right-auto sm:max-w-sm"
        >
          <p className="font-medium text-white">Help us improve the site?</p>
          <p className="mt-1.5 leading-relaxed">
            With your OK we use Google Analytics cookies to see which pages are useful and to count enquiries. Nothing is loaded unless you allow it.{" "}
            <Link href="/privacy-policy" className="text-brand-300 underline underline-offset-2 hover:text-white">
              Privacy policy
            </Link>
          </p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => choose("granted")} className="rounded-full bg-brand-500 px-4 py-2 font-medium text-ink-950 transition-colors hover:bg-brand-400">
              Allow analytics
            </button>
            <button type="button" onClick={() => choose("denied")} className="rounded-full border border-white/20 px-4 py-2 font-medium text-white transition-colors hover:border-white">
              No thanks
            </button>
          </div>
        </section>
      )}
    </>
  );
}

/** Reopens the consent banner (footer "Cookie settings"). */
export function CookieSettingsButton({ className }: { className?: string }) {
  if (!analyticsEnabled) return null;
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className={className}>
      Cookie settings
    </button>
  );
}

/** Loaded only after consent. Ads storage stays denied — this site only measures. */
function GoogleTags() {
  const consentDefaults = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});`;
  if (GTM_ID) {
    return (
      <Script id="gtm" strategy="afterInteractive">
        {`${consentDefaults}dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}';document.head.appendChild(s);`}
      </Script>
    );
  }
  return (
    <>
      <Script id="ga-init" strategy="afterInteractive">
        {`${consentDefaults}gtag('js',new Date());gtag('config','${encodeURIComponent(GA_ID)}');`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`} strategy="afterInteractive" />
    </>
  );
}
