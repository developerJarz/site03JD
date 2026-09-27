import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/animations/reveal";
import { WhatsAppButton } from "@/components/marketing/whatsapp";
import { telHref } from "@/config/contact";
import { officePath } from "@/lib/seo/locations";
import type { Office } from "@/types/content";

/**
 * Office cards: contact details plus direct actions — WhatsApp (message names
 * the office), the office's Google Business Profile, and a call button for the
 * Bangladesh office. `from` says which page the section is on.
 */
export function Locations({ offices, from = "Locations section", path }: { offices: Office[]; from?: string; path?: string }) {
  return (
    <Stagger className={`grid gap-5 md:grid-cols-2 ${offices.length >= 4 ? "xl:grid-cols-4" : "lg:grid-cols-3"}`} stagger={0.1}>
      {offices.map((o) => (
        <StaggerItem key={o.code} as="article" className="group relative flex flex-col overflow-hidden rounded-[28px] border border-mist-200 bg-white">
          <div className="relative aspect-[4/3] overflow-hidden">
            {o.image ? (
              <Image
                src={o.image.src}
                alt={o.image.alt}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105"
              />
            ) : (
              <CityPanel code={o.code} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent" />
            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
              <h3 className="font-display text-3xl font-semibold tracking-tight text-white">
                {o.hidePage ? (
                  o.city
                ) : (
                  <Link href={officePath(o)} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                    {o.city}
                  </Link>
                )}
              </h3>
              <span className="font-mono text-sm text-white/70">{o.code}</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <p className="text-[0.95rem] leading-relaxed text-mist-600">{o.description}</p>
            <ul className="relative z-10 mt-auto space-y-2 border-t border-mist-100 pt-5 text-sm text-mist-700">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                {o.address}
              </li>
              <li>
                <a href={`tel:${o.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2.5 hover:text-ink-900">
                  <Phone className="size-4 text-brand-600" aria-hidden /> {o.phone}
                </a>
              </li>
              {o.email && (
                <li>
                  <a href={`mailto:${o.email}`} className="flex items-center gap-2.5 hover:text-ink-900">
                    <Mail className="size-4 text-brand-600" aria-hidden /> {o.email}
                  </a>
                </li>
              )}
            </ul>
            <div className="relative z-10 mt-5 flex flex-col gap-2">
              <WhatsAppButton
                size="md"
                intent={`I’d like to contact your ${o.city} office.`}
                from={`${from} — ${o.city}`}
                path={path}
                showNumber={o.phone}
                className="h-auto w-full flex-wrap gap-x-2 gap-y-0 whitespace-normal py-2.5 text-sm"
              >
                Contact now
              </WhatsAppButton>
              <div className="flex flex-col gap-2">
                {o.gbpUrl && (
                  <a
                    href={o.gbpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-mist-200 px-3 text-sm font-medium text-ink-900 transition-colors hover:border-ink-900"
                  >
                    <MapPin className="size-4 text-brand-600" aria-hidden /> Google Maps
                  </a>
                )}
                {o.country === "Bangladesh" && (
                  <a
                    href={telHref(o.phone)}
                    className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-ink-900 px-3 text-sm font-medium text-white transition-colors hover:bg-ink-700"
                  >
                    <Phone className="size-4 text-brand-300" aria-hidden /> Call {o.phone}
                  </a>
                )}
              </div>
            </div>
            {!o.hidePage && (
              <span aria-hidden className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ink-900">
                Office details <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            )}
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/** Branded stand-in for offices without a city photograph. */
function CityPanel({ code }: { code: string }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-ink-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(0,175,185,0.35),transparent_60%)] transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-110" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <span className="absolute -right-4 -top-6 font-display text-[9rem] font-semibold leading-none tracking-[-0.06em] text-white/[0.06]">{code}</span>
      <span className="absolute left-1/2 top-[42%] flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-brand-400/40 bg-brand-500/15 text-brand-300">
        <span className="absolute inset-0 animate-ping rounded-full border border-brand-400/30 motion-reduce:hidden" />
        <MapPin className="size-6" />
      </span>
    </div>
  );
}
