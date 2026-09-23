"use client";

import { useCallback, useEffect, useState } from "react";
import type { MediaItem } from "@/components/admin/editor/media-picker";

/**
 * Fetches the media library for a search query. Loading is derived from
 * whether the latest response matches the current request key, so no
 * state is set synchronously inside the effect.
 */
export function useMediaList(query: string, enabled = true, limit = 60) {
  const [version, setVersion] = useState(0);
  const [response, setResponse] = useState<{ key: string; items: MediaItem[]; error?: boolean } | null>(null);
  const key = `${query}|${limit}|${version}`;

  useEffect(() => {
    if (!enabled) return;
    const ctrl = new AbortController();
    fetch(`/api/admin/media?q=${encodeURIComponent(query)}&limit=${limit}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { items: MediaItem[] }) => setResponse({ key, items: d.items ?? [] }))
      .catch((err: unknown) => {
        if ((err as Error)?.name !== "AbortError") setResponse({ key, items: [], error: true });
      });
    return () => ctrl.abort();
  }, [enabled, key, query, limit]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const current = response?.key === key ? response : null;

  return {
    items: current?.items ?? response?.items ?? [],
    loading: enabled && !current,
    error: Boolean(current?.error),
    reload,
    setItems: (updater: (items: MediaItem[]) => MediaItem[]) => setResponse((r) => (r ? { ...r, items: updater(r.items) } : r)),
  };
}
