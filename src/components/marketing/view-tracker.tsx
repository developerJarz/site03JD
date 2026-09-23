"use client";

import { useEffect } from "react";

/**
 * Records a page view for engagement analytics (blog views, portfolio
 * engagement). Fires once per session per item; no cookies, no personal data.
 */
export function ViewTracker({ type, slug }: { type: "post" | "project"; slug: string }) {
  useEffect(() => {
    const key = `jd:viewed:${type}:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage unavailable — still count */
    }
    const body = JSON.stringify({ type, slug });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/views", new Blob([body], { type: "application/json" }));
    else fetch("/api/views", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => undefined);
  }, [type, slug]);
  return null;
}
