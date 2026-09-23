import { Magnetic, Reveal } from "@/components/animations";
import { ButtonLink } from "@/components/ui/button";

/** The strong closing call-to-action that sits above the footer on every marketing page. */
export function CtaBanner({
  eyebrow = "Let’s build what’s next",
  title = "Ready to grow your business online?",
  description = "Whether you want to dominate search results, launch a new website or hand off your entire digital presence — tell us where you want to go. We respond within 24 hours.",
  primary = { label: "Start a Project", href: "/contact?intent=project" },
  secondary = { label: "Get a Free Consultation", href: "/contact" },
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string } | null;
}) {
  return (
    <section className="theme-dark relative overflow-hidden bg-ink-950 py-28 md:py-40">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-50 mask-radial" />
      <div aria-hidden className="absolute left-1/2 top-1/2 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(0_175_185/0.32),rgb(47_123_255/0.12)_55%,transparent)] blur-2xl" />
      <div className="container-page relative text-center">
        <Reveal>
          <p className="eyebrow text-brand-300">{eyebrow}</p>
          <h2 className="mx-auto mt-6 max-w-4xl font-display text-display-md font-semibold tracking-display text-white">{title}</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/65">{description}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Magnetic>
              <ButtonLink href={primary.href} size="lg" arrow>
                {primary.label}
              </ButtonLink>
            </Magnetic>
            {secondary && (
              <ButtonLink href={secondary.href} size="lg" variant="outline-light">
                {secondary.label}
              </ButtonLink>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
