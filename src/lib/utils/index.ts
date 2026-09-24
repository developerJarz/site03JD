import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function readingTime(html: string): number {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 225));
}

export function truncate(input: string, length: number): string {
  if (input.length <= length) return input;
  return input.slice(0, length - 1).replace(/\s+\S*$/, "") + "…";
}

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const dateTimeFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return dateFmt.format(new Date(value));
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return dateTimeFmt.format(new Date(value));
}

export function timeAgo(value: string | Date, now: Date = new Date()): string {
  const diff = (now.getTime() - new Date(value).getTime()) / 1000;
  if (diff < 60) return "just now";
  const units: Array<[number, string]> = [
    [60, "minute"],
    [3600, "hour"],
    [86400, "day"],
    [604800, "week"],
    [2629800, "month"],
    [31557600, "year"],
  ];
  let label = "";
  for (let i = units.length - 1; i >= 0; i--) {
    const [secs, name] = units[i];
    if (diff >= secs) {
      const n = Math.floor(diff / secs);
      label = `${n} ${name}${n > 1 ? "s" : ""} ago`;
      break;
    }
  }
  return label;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function absoluteUrl(path: string, base: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(path, base).toString();
}

/** Converts Mongoose lean output (ObjectIds, Dates) into plain JSON-safe objects. */
export function serialize<T>(value: unknown): T {
  return JSON.parse(
    JSON.stringify(value, (key, v) => {
      if (key === "__v") return undefined;
      return v;
    }),
    (key, v) => (key === "_id" ? String(v) : v),
  ) as T;
}

export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out;
}

const PROPER_NOUNS = new Set(["Google", "Meta", "Facebook", "Instagram", "TikTok", "LinkedIn", "YouTube", "Shopify", "WordPress", "Laravel"]);

/** Lower-cases a name for use mid-sentence, keeping acronyms and brands: “Local SEO” → “local SEO”, “Google Ads” → “Google ads”. */
export function lowerTitle(input: string): string {
  return input.replace(/\S+/g, (w) => ((w.match(/[A-Z]/g)?.length ?? 0) >= 2 || PROPER_NOUNS.has(w) ? w : w.toLowerCase()));
}
