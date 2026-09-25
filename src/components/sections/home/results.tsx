import { Counter } from "@/components/animations";
import { Reveal } from "@/components/animations/reveal";
import { Eyebrow } from "@/components/ui/section";
import type { Stat } from "@/types/content";

/** Results & reach — figures published on the original site, animated on entry. */
export function Results({ stats, regions, rankedRegions, index }: { stats: Stat[]; regions: string; rankedRegions: string; index?: string }) {
  return (
    <section className="theme-dark relative overflow-hidden bg-ink-950 py-24 md:py-36" aria-labelledby="results-heading">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div aria-hidden className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_top_right,rgb(0_175_185/0.16),transparent_60%)]" />
      <div className="container-page relative">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow index={index} className="mb-6">
              Results & reach
            </Eyebrow>
            <h2 id="results-heading" className="font-display text-display-sm font-semibold tracking-display text-white">
              Built in Dallas. Trusted across North America.
            </h2>
          </div>
          <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.1}>
            <p className="text-lg leading-relaxed text-white/65">{regions}</p>
            <p className="mt-4 text-lg leading-relaxed text-white/60">{rankedRegions}</p>
          </Reveal>
        </div>

        <dl className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-[28px] bg-white/[0.08] lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-ink-950 p-8 md:p-10">
              <dt className="text-sm text-white/50">{s.label}</dt>
              <dd className="mt-6 font-display text-5xl font-semibold tracking-[-0.04em] text-white md:text-7xl">
                <Counter value={s.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
