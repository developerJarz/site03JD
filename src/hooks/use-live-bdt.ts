"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "jd_live_usd_bdt";
export const DEFAULT_BDT_PER_USD = 123.14;

/**
 * Returns the real-time USD to BDT exchange rate.
 * Fetches live bank/forex rate from public API, caches in sessionStorage,
 * and falls back to server pricebook rate or current standard rate (123.14).
 */
export function useLiveBdtRate(initialRate?: number | null): { rate: number; isLive: boolean } {
  const fallback = initialRate && initialRate > 0 ? initialRate : DEFAULT_BDT_PER_USD;
  const [rateState, setRateState] = useState<{ rate: number; isLive: boolean }>({
    rate: fallback,
    isLive: false,
  });

  useEffect(() => {
    let active = true;
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.rate === "number" && parsed.rate > 50 && active) {
          setRateState({ rate: parsed.rate, isLive: true });
        }
      }
    } catch {
      /* storage unavailable */
    }

    async function fetchLiveRate() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const bdt = data?.rates?.BDT;
        if (typeof bdt === "number" && bdt > 50 && active) {
          setRateState({ rate: bdt, isLive: true });
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ rate: bdt, time: Date.now() }));
          } catch {
            /* storage unavailable */
          }
        }
      } catch {
        // Keeps fallback
      }
    }

    fetchLiveRate();
    return () => {
      active = false;
    };
  }, []);

  return rateState;
}

/** Formats cents into real-time Taka string */
export function formatLiveBdt(cents: number, rate: number): string {
  const taka = Math.round((cents / 100) * rate);
  return `৳${taka.toLocaleString("en-IN")}`;
}
