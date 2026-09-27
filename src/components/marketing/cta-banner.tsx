import Link from "next/link";
import { Magnetic } from "@/components/animations";
import { Reveal } from "@/components/animations/reveal";
import { ButtonLink } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/marketing/whatsapp";
import { getSiteSettings } from "@/lib/data/public";

/**
 * The closing call-to-action above the footer on every marketing page.
 * Main button: WhatsApp with a message saying what the visitor wants and
 * which page they came from. Second button: the contact form. `secondary`
 * renders as a quieter text link (e.g. to the related service).
 */
export async function CtaBanner({
  eyebrow = "Let’s build what’s next",
  title = "Ready to grow your business online?",
  description = "Whether you want to dominate search results, launch a new website or hand off your entire digital presence — tell us where you want to go. We respond within 24 hours.",
  whatsapp = { intent: "I’d like to start a project.", from: "Jarz Digital website" },
  primary = { label: "Send a Request", href: "/contact#contact-form" },
  secondary = null,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  /** What the visitor wants and where they are — becomes the WhatsApp message. */
  whatsapp?: { intent: string; from: string; path?: string };
  /** The contact-form button. */
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string } | null;
}) {
  const { contact } = await getSiteSettings();
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
              <WhatsAppButton number={contact.whatsapp} {...whatsapp}>
                Start a Project
              </WhatsAppButton>
            </Magnetic>
            <ButtonLink href={primary.href} size="lg" variant="outline-light" arrow>
              {primary.label}
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-white/60">
            WhatsApp or call{" "}
            <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`} className="font-medium text-white underline-offset-4 hover:underline">
              {contact.phone}
            </a>
            {secondary && (
              <>
                {" · "}
                <Link href={secondary.href} className="font-medium text-brand-300 underline-offset-4 hover:underline">
                  {secondary.label}
                </Link>
              </>
            )}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
