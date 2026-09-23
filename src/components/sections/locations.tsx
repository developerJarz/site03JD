import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/animations";
import type { Office } from "@/types/content";

export function Locations({ offices }: { offices: Office[] }) {
  return (
    <Stagger className={`grid gap-5 md:grid-cols-2 ${offices.length >= 4 ? "xl:grid-cols-4" : "lg:grid-cols-3"}`} stagger={0.1}>
      {offices.map((o) => (
        <StaggerItem key={o.code} as="article" className="group flex flex-col overflow-hidden rounded-[28px] border border-mist-200 bg-white">
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
              <h3 className="font-display text-3xl font-semibold tracking-tight text-white">{o.city}</h3>
              <span className="font-mono text-sm text-white/70">{o.code}</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <p className="text-[0.95rem] leading-relaxed text-mist-600">{o.description}</p>
            <ul className="mt-auto space-y-2 border-t border-mist-100 pt-5 text-sm text-mist-700">
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
