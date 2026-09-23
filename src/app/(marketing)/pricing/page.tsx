import type { Metadata } from "next";
import Link from "next/link";
import { PricingPlans } from "@/components/marketing/cards";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { Icon } from "@/components/ui/icon";
import { Section } from "@/components/ui/section";
import { getServices } from "@/lib/data/public";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Pricing — Transparent Plans for Web, SEO, Social & Ads",
  description: "Transparent pricing for Jarz Digital services: Local SEO and SEO from $40/month, websites from $50/month, ad management from $200/month, full business management $1,000/month.",
  path: "/pricing",
});

export default async function PricingPage() {
  const services = (await getServices()).filter((s) => s.plans.length);
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Transparent plans. No surprises."
        titleLines={["Transparent plans.", "No surprises."]}
        description="Every plan includes free graphics and SEO-optimized content. Monthly plans have no long-term contract — cancel with 30 days’ notice."
        crumbs={[{ name: "Pricing", path: "/pricing" }]}
      >
        <nav aria-label="Jump to a service" className="mt-12 flex flex-wrap gap-2">
          {services.map((s) => (
            <Link key={s.slug} href={`#${s.slug}`} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 transition-colors hover:border-white hover:text-white">
              <Icon name={s.icon} className="size-4 text-brand-300" />
              {s.shortTitle}
            </Link>
          ))}
        </nav>
      </PageHero>

      {services.map((s, i) => (
        <Section key={s.slug} id={s.slug} tone={i % 2 ? "mist" : "light"} aria-labelledby={`${s.slug}-heading`} className="py-20 md:py-28">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-brand-700">{String(i + 1).padStart(2, "0")} · {s.category?.title}</p>
              <h2 id={`${s.slug}-heading`} className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900">
                {s.title}
              </h2>
              <p className="mt-2 max-w-2xl text-mist-600">{s.tagline}</p>
            </div>
            <Link href={`/services/${s.slug}`} className="link-underline shrink-0 text-sm font-medium text-ink-900">
              Service details →
            </Link>
          </div>
          <PricingPlans plans={s.plans} serviceSlug={s.slug} note={s.planNote} />
        </Section>
      ))}

      <CtaBanner title="Need a custom package?" description="Combine services or scale a plan to fit your goals. Tell us what you need and we’ll put together a tailored quote." primary={{ label: "Request a Quote", href: "/contact?intent=project" }} secondary={{ label: "Talk to Our Team", href: "/contact" }} />
    </>
  );
}
