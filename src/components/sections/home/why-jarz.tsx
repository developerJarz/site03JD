import { Award, FileBarChart, Hand, Palette } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/animations";
import { Eyebrow } from "@/components/ui/section";

const ICONS = [Award, Palette, Hand, FileBarChart];

export function WhyJarz({
  text,
  differentiators,
  founderRecognition,
}: {
  text: string;
  differentiators: { title: string; description: string }[];
  founderRecognition: string;
}) {
  return (
    <section className="theme-dark relative overflow-hidden bg-ink-900 py-24 md:py-36" aria-labelledby="why-heading">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" />
      <div aria-hidden className="absolute -left-60 top-1/3 h-[600px] w-[600px] rounded-full bg-[radial-gradient(closest-side,rgb(0_175_185/0.18),transparent)] blur-2xl" />

      <div className="container-page relative grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Eyebrow index="06" className="mb-6">
            Why Jarz Digital
          </Eyebrow>
          <Reveal>
            <h2 id="why-heading" className="font-display text-display-md font-semibold tracking-display text-white">
              Not only ranking —<br />
              <span className="text-white/40">we drive sales.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/65">{text}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <figure className="mt-10 flex max-w-xl items-center gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 font-display text-lg font-bold text-ink-950">#1</span>
              <figcaption className="text-[0.95rem] leading-relaxed text-white/75">{founderRecognition}</figcaption>
            </figure>
          </Reveal>
        </div>

        <Stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-6 lg:self-end">
          {differentiators.map((d, i) => {
            const I = ICONS[i % ICONS.length];
            return (
              <StaggerItem
                key={d.title}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-7 transition-colors duration-500 hover:border-brand-400/40"
              >
                <div aria-hidden className="absolute -right-10 -top-10 size-32 rounded-full bg-brand-400/0 blur-2xl transition-colors duration-700 group-hover:bg-brand-400/20" />
                <I className="size-6 text-brand-300" strokeWidth={1.6} aria-hidden />
                <h3 className="mt-10 font-display text-xl font-semibold tracking-tight text-white">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{d.description}</p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
