import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import type { ClientInfo, CompanyProfile } from "@/lib/billing/types";
import { cn } from "@/lib/utils";

/**
 * Printed-document building blocks. On screen each page is an A4 "sheet" with
 * its own header and footer; when printing, sheets become plain page-broken
 * blocks inside a table whose thead/tfoot repeat the branding on every page
 * (see the `billing-*` rules in globals.css).
 */

export function BrandMark({ company, size = 36 }: { company: CompanyProfile; size?: number }) {
  if (company.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={company.logoUrl} alt={company.name} style={{ height: size, maxWidth: size * 4 }} className="w-auto object-contain" />;
  }
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="flex shrink-0 items-center justify-center bg-ink-900 font-display font-bold tracking-tight text-brand-300"
      aria-label={company.name}
    >
      {company.monogram || "JD"}
    </span>
  );
}

export function RunningHeader({ company, label }: { company: CompanyProfile; label: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-mist-200 pb-3">
      <BrandMark company={company} size={34} />
      <div className="min-w-0 leading-tight">
        <p className="font-display text-[15px] font-semibold tracking-tight text-ink-900">{company.name}</p>
        <p className="text-[9.5px] font-medium uppercase tracking-[0.16em] text-brand-700">{company.tagline}</p>
      </div>
      <p className="ml-auto text-right text-[9.5px] font-semibold uppercase tracking-[0.14em] text-mist-500">{label}</p>
    </div>
  );
}

export const contactLine = (c: CompanyProfile) => [c.address, c.phone, c.email, c.website].filter(Boolean).join("  |  ");

export function RunningFooter({ company, note }: { company: CompanyProfile; note?: string }) {
  return (
    <div className="flex items-center gap-3 border-t border-mist-200 pt-2.5 text-[8.5px] text-mist-500">
      <span className="h-1 w-6 shrink-0 bg-brand-500" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{contactLine(company)}</span>
      {note && <span className="shrink-0 font-mono font-medium text-mist-600">{note}</span>}
    </div>
  );
}

/** A4 pages for screen preview + one print frame with repeating header/footer. */
export function DocFrame({ header, footer, pages, decor }: { header: ReactNode; footer: ReactNode; pages: ReactNode[]; decor?: ReactNode }) {
  return (
    <div className="billing-doc text-ink-900">
      <table className="billing-frame">
        <thead className="billing-frame-head">
          <tr>
            <td>{header}</td>
          </tr>
        </thead>
        <tfoot className="billing-frame-foot">
          <tr>
            <td>{footer}</td>
          </tr>
        </tfoot>
        <tbody>
          <tr>
            <td>
              {pages.map((content, i) => (
                <section key={i} className="billing-sheet" aria-label={`Page ${i + 1}`}>
                  {decor}
                  <div className="billing-sheet-chrome mb-5">{header}</div>
                  <div className="billing-sheet-body flex-1">{content}</div>
                  <div className="billing-sheet-chrome mt-6">{footer}</div>
                </section>
              ))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/**
 * Dot grid for CornerPattern, fading out from the corner. Dots are kept out of
 * the header/content area (right of 11mm and below 6.5mm) so they only ever
 * fill the margins. Drawn as individual circles rather than an SVG mask or
 * pattern, which some PDF viewers ignore.
 */
const CORNER_DOTS = Array.from({ length: 25 * 20 }, (_, i) => ({ x: 1.3 + (i % 25) * 2.6, y: 1.3 + Math.floor(i / 25) * 2.6 }))
  .filter((d) => !(d.x > 11 && d.y > 6.5))
  .map((d) => ({ ...d, o: Math.round(Math.max(0, 1 - Math.hypot(d.x, d.y) / 56) * 90) / 100 }))
  .filter((d) => d.o >= 0.05);

/**
 * Blue geometric accent for a page corner, drawn in millimetres. On screen it
 * sits in the sheet corner; in print it is position:fixed, so it lands in the
 * corner of every page.
 */
export function CornerPattern({ corner }: { corner: "top-left" | "bottom-left" }) {
  const id = `billing-${corner}`;
  return (
    <svg className={`billing-corner billing-corner-${corner}`} viewBox="0 0 64 52" aria-hidden>
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1b5fe0" />
          <stop offset="1" stopColor="#00afb9" />
        </linearGradient>
      </defs>
      {CORNER_DOTS.map((d) => (
        <circle key={`${d.x}-${d.y}`} cx={d.x} cy={d.y} r="0.42" fill="#2f7bff" fillOpacity={d.o} />
      ))}
      <polygon points="0,0 17,0 0,17" fill={`url(#${id}-fill)`} />
      <polygon points="0,0 9,0 0,9" fill="#060b13" opacity="0.28" />
      <line x1="19.2" y1="0" x2="0" y2="19.2" stroke="#2f7bff" strokeWidth="0.7" />
      <line x1="20.8" y1="0" x2="0" y2="20.8" stroke="#00afb9" strokeWidth="0.4" />
    </svg>
  );
}

export function SectionHeading({ index, title, subtitle }: { index?: number; title: string; subtitle?: string }) {
  return (
    <div className="billing-keep mb-3.5">
      <div className="flex items-baseline gap-2">
        {index !== undefined && <span className="w-[18px] shrink-0 font-mono text-[11px] font-bold text-brand-600">{String(index).padStart(2, "0")}</span>}
        <h2 className="font-display text-[17px] font-semibold leading-tight tracking-tight text-ink-900">{title}</h2>
        <span className="ml-1 h-px flex-1 self-center bg-mist-200" aria-hidden />
      </div>
      {subtitle && <p className={cn("mt-0.5 text-[10.5px] text-mist-500", index !== undefined && "pl-[26px]")}>{subtitle}</p>}
    </div>
  );
}

/** Plain text with **bold** spans and preserved line breaks. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className={cn("whitespace-pre-line", className)}>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold text-ink-900">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </span>
  );
}

export function PartyBlock({ eyebrow, client }: { eyebrow: string; client: ClientInfo }) {
  const empty = !client.name && !client.company;
  return (
    <div className="border border-mist-200 px-4 py-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-700">{eyebrow}</p>
      {empty ? (
        <p className="mt-1.5 text-[12px] italic text-mist-400">Client details</p>
      ) : (
        <div className="mt-1.5 space-y-0.5 text-[11px] leading-snug text-mist-700">
          {client.name && <p className="text-[13px] font-semibold text-ink-900">{client.name}</p>}
          {client.company && <p className="font-medium text-ink-800">{client.company}</p>}
          {client.address && <p>{client.address}</p>}
          {(client.phone || client.email) && <p>{[client.phone, client.email].filter(Boolean).join("  ·  ")}</p>}
          {client.website && <p className="text-brand-700">{client.website}</p>}
        </div>
      )}
    </div>
  );
}

export function CompanyBlock({ eyebrow, company }: { eyebrow: string; company: CompanyProfile }) {
  return (
    <div className="border border-mist-200 px-4 py-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-700">{eyebrow}</p>
      <div className="mt-1.5 space-y-0.5 text-[11px] leading-snug text-mist-700">
        <p className="text-[13px] font-semibold text-ink-900">{company.name}</p>
        <p>{company.address}</p>
        <p>{[company.phone, company.email].filter(Boolean).join("  ·  ")}</p>
        <p className="text-brand-700">{company.website}</p>
      </div>
    </div>
  );
}

/** Dark closing bar with the full company contact line. */
export function ContactBar({ company }: { company: CompanyProfile }) {
  const items = [
    { I: MapPin, v: company.address },
    { I: Phone, v: company.phone },
    { I: Mail, v: company.email },
    { I: Globe, v: company.website },
  ].filter((x) => x.v);
  return (
    <div className="billing-keep flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 bg-ink-900 px-4 py-3 text-[10px] text-white/80">
      {items.map(({ I, v }) => (
        <span key={v} className="inline-flex items-center gap-1.5">
          <I className="size-3 text-brand-300" aria-hidden />
          {v}
        </span>
      ))}
    </div>
  );
}
