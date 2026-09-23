import "server-only";

/**
 * Fixed-window rate limiter.
 *
 * The default store is in-process memory, which is correct for a single
 * Node.js server. For multi-instance deployments, implement `RateLimitStore`
 * with Redis/Upstash and pass it to `setRateLimitStore()` at startup.
 */
export interface RateLimitStore {
  hit(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
}

class MemoryStore implements RateLimitStore {
  private buckets = new Map<string, { count: number; resetAt: number }>();

  async hit(key: string, windowMs: number) {
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      const fresh = { count: 1, resetAt: now + windowMs };
      this.buckets.set(key, fresh);
      if (this.buckets.size > 10_000) this.sweep(now);
      return fresh;
    }
    bucket.count += 1;
    return bucket;
  }

  private sweep(now: number) {
    for (const [k, v] of this.buckets) if (v.resetAt <= now) this.buckets.delete(k);
  }
}

const globalStore = globalThis as unknown as { __rateLimitStore?: RateLimitStore };
let store: RateLimitStore = globalStore.__rateLimitStore ?? new MemoryStore();
globalStore.__rateLimitStore = store;

export function setRateLimitStore(next: RateLimitStore) {
  store = next;
  globalStore.__rateLimitStore = next;
}

export const LIMITS = {
  login: { limit: 8, windowMs: 15 * 60_000 },
  register: { limit: 5, windowMs: 60 * 60_000 },
  forgot: { limit: 5, windowMs: 60 * 60_000 },
  contact: { limit: 6, windowMs: 60 * 60_000 },
  newsletter: { limit: 5, windowMs: 60 * 60_000 },
  search: { limit: 60, windowMs: 60_000 },
  upload: { limit: 60, windowMs: 60 * 60_000 },
  message: { limit: 30, windowMs: 10 * 60_000 },
  view: { limit: 120, windowMs: 60 * 60_000 },
} as const;

export type LimitName = keyof typeof LIMITS;

export async function rateLimit(name: LimitName, identifier: string) {
  const { limit, windowMs } = LIMITS[name];
  const { count, resetAt } = await store.hit(`${name}:${identifier}`, windowMs);
  return {
    ok: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)),
  };
}
