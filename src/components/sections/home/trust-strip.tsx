import { Counter } from "@/components/animations";
import { Marquee } from "@/components/animations/marquee";
import type { Stat } from "@/types/content";

/**
 * Credibility strip: the headline claims published on the original site,
 * followed by a typographic marquee of real client names from the portfolio.
 */
export function TrustStrip({ stats, clients }: { stats: Stat[]; clients: string[] }) {
  return (
    <section aria-label="Credibility" className="theme-dark relative border-y border-white/[0.07] bg-ink-950">
      <div className="container-page grid grid-cols-2 divide-white/[0.07] md:grid-cols-4 md:divide-x">
        {stats.map((s, i) => (
          <div key={s.label} className={`px-2 py-10 md:px-8 ${i % 2 === 1 ? "border-l border-white/[0.07] md:border-l-0" : ""} ${i > 1 ? "border-t border-white/[0.07] md:border-t-0" : ""}`}>
            <p className="font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
              <Counter value={s.value} />
            </p>
            <p className="mt-2 text-sm text-white/50">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.07] py-7">
        <p className="sr-only">Clients include: {clients.join(", ")}</p>
        <Marquee duration={45} className="text-white/35" pauseOnHover={false}>
          {clients.map((c) => (
            <span key={c} aria-hidden className="mx-8 flex items-center gap-8 whitespace-nowrap font-display text-2xl font-medium tracking-tight md:text-3xl">
              {c}
              <span className="size-1.5 rounded-full bg-brand-500/60" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
