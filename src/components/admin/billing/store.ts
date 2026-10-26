"use client";

import { useSyncExternalStore } from "react";
import { normalizeState, sampleState } from "@/lib/billing/defaults";
import type { BillingDoc, BillingState, CompanyProfile } from "@/lib/billing/types";

/**
 * Browser-side store for the billing studio. State lives in localStorage
 * (one JSON blob, the same shape as Export/Import) and is shared across tabs.
 * Writes update memory immediately and hit storage after a short debounce so
 * typing stays smooth even with an embedded logo.
 */

const KEY = "jd-billing:v1";
const listeners = new Set<() => void>();
let cache: BillingState | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let saveError = "";

function load(): BillingState {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    /* storage blocked — run in memory */
  }
  if (raw) {
    try {
      const parsed = normalizeState(JSON.parse(raw));
      if (parsed) return parsed;
    } catch {
      /* corrupt — fall back to sample data, keeping the bad copy for recovery */
      try {
        localStorage.setItem(`${KEY}:corrupt`, raw);
      } catch {}
    }
  }
  const seeded = sampleState();
  persist(seeded);
  return seeded;
}

function persist(state: BillingState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    saveError = "";
  } catch {
    saveError = "Browser storage is full or blocked — export a JSON backup and use a smaller logo.";
  }
}

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => (cache ??= load());
const getServerSnapshot = () => null;

function commit(next: BillingState) {
  cache = next;
  emit();
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    const before = saveError;
    persist(next);
    if (before !== saveError) emit();
  }, 250);
}

const stamp = <T extends BillingDoc>(doc: T): T => ({ ...doc, updatedAt: new Date().toISOString() });

export const billing = {
  setCompany(company: CompanyProfile) {
    commit({ ...getSnapshot(), company });
  },
  upsert(doc: BillingDoc) {
    const s = getSnapshot();
    const exists = s.documents.some((d) => d.id === doc.id);
    commit({ ...s, documents: exists ? s.documents.map((d) => (d.id === doc.id ? stamp(doc) : d)) : [stamp(doc), ...s.documents] });
  },
  /** Several documents at once (e.g. a quotation and the invoice converted from it). */
  upsertMany(docs: BillingDoc[]) {
    const s = getSnapshot();
    const ids = new Set(docs.map((d) => d.id));
    const fresh = docs.filter((d) => !s.documents.some((x) => x.id === d.id)).map(stamp);
    commit({ ...s, documents: [...fresh, ...s.documents.map((d) => (ids.has(d.id) ? stamp(docs.find((x) => x.id === d.id)!) : d))] });
  },
  remove(id: string) {
    const s = getSnapshot();
    commit({ ...s, documents: s.documents.filter((d) => d.id !== id) });
  },
  replaceAll(state: BillingState) {
    commit(state);
  },
  saveError: () => saveError,
};

/** Current billing state, or null during server render / before hydration. */
export function useBilling(): BillingState | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Download any JSON value as a file. */
export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
