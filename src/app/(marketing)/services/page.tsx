import type { Metadata } from "next";
import { Stagger, StaggerItem } from "@/components/animations/reveal";
import { ServiceCard } from "@/components/marketing/cards";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { brandFacts } from "@/content/seed";
import { getServices } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo/page";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/services");
}

export default async function ServicesPage() {
  const services = await getServices();
  const groups = Array.from(new Set(services.map((s) => s.category?.title ?? "Services")));

  return (
    <>
      <PageHero
        eyebrow="Web design, SEO & marketing services"
        eyebrowInTitle
        title="Everything your business needs to grow online."
        titleLines={["Everything your business", "needs to grow online."]}
        description="A 360° solution for developing businesses — design, development, search, social and advertising, delivered by one team. Every service includes free graphics and SEO-optimized content."
        crumbs={[{ name: "Services", path: "/services" }]}
        actions={
          <>
            <ButtonLink href="/contact?intent=project" arrow size="lg">
              Start a Project
            </ButtonLink>
            <ButtonLink href="/pricing" variant="outline-light" size="lg">
              Compare pricing
            </ButtonLink>
          </>
        }
      />

      {groups.map((group, gi) => (
        <Section key={group} tone={gi % 2 ? "mist" : "light"} aria-labelledby={`group-${gi}`}>
          <SectionHeader
            index={String(gi + 1).padStart(2, "0")}
            eyebrow={group}
            title={<span id={`group-${gi}`}>{services.find((s) => s.category?.title === group) ? groupTitle(group) : group}</span>}
          />
          <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services
              .filter((s) => (s.category?.title ?? "Services") === group)
              .map((s, i) => (
                <StaggerItem key={s.slug}>
                  <ServiceCard service={s} index={i} />
                </StaggerItem>
              ))}
          </Stagger>
        </Section>
      ))}

      <Section tone="dark" aria-labelledby="diff-heading">
        <SectionHeader eyebrow="The Jarz difference" title={<span id="diff-heading">More than marketing — complete business support.</span>} />
        <div className="grid gap-px overflow-hidden rounded-[28px] bg-white/10 md:grid-cols-2 lg:grid-cols-4">
          {brandFacts.differentiators.map((d) => (
            <div key={d.title} className="bg-ink-900 p-8">
              <h3 className="font-display text-lg font-semibold text-white">{d.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{d.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBanner title="Not sure which service fits?" description="Tell us about your business and goals. We’ll recommend the right mix — and you’ll hear back within 24 hours." primary={{ label: "Get a Free Consultation", href: "/contact" }} secondary={{ label: "View Our Work", href: "/work" }} />
    </>
  );
}

function groupTitle(group: string) {
  if (/growth|marketing/i.test(group)) return "Search, social, ads & ongoing management.";
  if (/design|development/i.test(group)) return "Websites, web applications & custom software.";
  return group;
}
