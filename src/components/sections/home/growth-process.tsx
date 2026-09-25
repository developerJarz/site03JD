import Image from "next/image";
import { Check } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { Eyebrow } from "@/components/ui/section";

export interface ProcessStep {
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  points: string[];
}

/** Sticky heading on the left; the six stages scroll past on the right. */
export function GrowthProcess({ steps, index }: { steps: ProcessStep[]; index?: string }) {
  return (
    <section className="relative bg-white py-24 md:py-36" aria-labelledby="process-heading">
      <div className="container-page grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <Eyebrow index={index} className="mb-6">
              How we work
            </Eyebrow>
            <h2 id="process-heading" className="font-display text-display-sm font-semibold tracking-display text-ink-900">
              Our digital growth process.
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-mist-600">
              We start by understanding your business, market and audience — so every next step is goal-focused and data-driven.
            </p>
            <ol className="mt-10 hidden space-y-2 text-sm lg:block" aria-label="Process stages">
              {steps.map((s, i) => (
                <li key={s.title} className="flex items-center gap-3 text-mist-500">
                  <span className="font-mono text-xs text-brand-700">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <ol className="space-y-6 lg:col-span-8">
          {steps.map((s, i) => (
            <Reveal
              as="li"
              key={s.title}
              className="group grid gap-8 rounded-[28px] border border-mist-200 bg-mist-25 p-7 transition-[border-color,box-shadow] duration-500 hover:border-mist-300 hover:shadow-soft md:grid-cols-[auto_1fr] md:p-10"
            >
                <div className="flex items-start gap-5 md:flex-col">
                  <span className="flex size-16 items-center justify-center rounded-2xl bg-ink-900 shadow-[inset_0_1px_0_rgb(255_255_255/0.1)] transition-colors duration-500 group-hover:bg-brand-700">
                    <Image src={s.icon} alt="" width={36} height={36} className="size-9" />
                  </span>
                  <span aria-hidden className="font-display text-5xl font-semibold tracking-tight text-mist-200 md:text-6xl">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div>
                  <p className="eyebrow text-brand-700">{s.subtitle}</p>
                  <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink-900 md:text-3xl">{s.title}</h3>
                  <p className="mt-4 leading-relaxed text-mist-600">{s.description}</p>
                  <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-mist-700">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
