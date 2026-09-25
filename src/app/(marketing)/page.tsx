import type { Metadata } from "next";
import Link from "next/link";
import { beforeAfterShowcase, brandFacts, growthProcess } from "@/content/seed";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { JsonLd } from "@/components/marketing/json-ld";
import { BeforeAfterShowcase } from "@/components/sections/before-after";
import { FeaturedWork } from "@/components/sections/home/featured-work";
import { GrowthProcess } from "@/components/sections/home/growth-process";
import { HomeHero } from "@/components/sections/home/hero";
import { Results } from "@/components/sections/home/results";
import { ServicesExplorer } from "@/components/sections/home/services-explorer";
import { TrustStrip } from "@/components/sections/home/trust-strip";
import { WhyJarz } from "@/components/sections/home/why-jarz";
import { IndustriesGrid } from "@/components/sections/industries-grid";
import { Locations } from "@/components/sections/locations";
import { TeamGrid } from "@/components/sections/team-grid";
import { Testimonials } from "@/components/sections/testimonials";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { getFaqs, getIndustries, getProjects, getServices, getSiteSettings, getTeam, getTestimonials } from "@/lib/data/public";
import { faqSchema } from "@/lib/seo";
import { pageMetadata } from "@/lib/seo/page";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return pageMetadata("/", { title: settings.seo.defaultTitle, description: settings.seo.defaultDescription, absoluteTitle: true });
}

export default async function HomePage() {
  const [settings, services, projects, industries, team, testimonials, faqs] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getProjects(),
    getIndustries(),
    getTeam(),
    getTestimonials(),
    getFaqs("general"),
  ]);

  const featured = projects.filter((p) => p.featured).slice(0, 6);
  // Section labels count only the sections that render, so they always run 01, 02, 03…
  const sections = [featured.length > 0 && "work", "services", "why", "process", "industries", "results", "before-after", testimonials.length > 0 && "testimonials", "team", "locations", "faq"].filter(Boolean);
  const n = (key: string) => String(sections.indexOf(key) + 1).padStart(2, "0");
  const clients = Array.from(new Set(projects.map((p) => p.client).filter((c) => !/contractor/i.test(c))));

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />

      <HomeHero trust={settings.trust} />

      <TrustStrip
        clients={clients}
        stats={[
          { value: "500+", label: "Global clients" },
          { value: "100%", label: "Client satisfaction" },
          { value: "100%", label: "5-star reviews" },
          { value: String(settings.offices.length), label: `Offices: ${settings.offices.map((o) => o.city).join(" · ")}` },
        ]}
      />

      {featured.length > 0 && <FeaturedWork projects={featured} index={n("work")} />}

      <Section tone="light" aria-labelledby="services-heading">
        <SectionHeader
          index={n("services")}
          eyebrow="What we do"
          title={<span id="services-heading">Full-service web design & local SEO agency.</span>}
          description="Custom web design, Local SEO, and business management solutions for growing brands across the USA and Canada. Every service includes free graphics and SEO-optimized content."
          action={
            <ButtonLink href="/services" variant="outline" arrow>
              All services
            </ButtonLink>
          }
        />
        <ServicesExplorer
          services={services.map((s) => ({
            slug: s.slug,
            title: s.title,
            tagline: s.tagline,
            summary: s.summary,
            icon: s.icon,
            startingPrice: s.startingPrice,
            image: s.image,
            highlights: s.benefits.length ? s.benefits : s.included.flatMap((g) => g.items),
          }))}
        />
      </Section>

      <WhyJarz index={n("why")} text={brandFacts.whyText} differentiators={brandFacts.differentiators} founderRecognition={brandFacts.founderRecognition} />

      <GrowthProcess index={n("process")} steps={growthProcess} />

      <Section tone="mist" aria-labelledby="industries-heading">
        <SectionHeader
          index={n("industries")}
          eyebrow="Industries"
          title={<span id="industries-heading">Clients across every business category.</span>}
          description="From auto repair shops and clinics to law firms and restaurants — we tailor web design, local search and growth strategy to how your customers actually buy."
          action={
            <ButtonLink href="/industries" variant="outline" arrow>
              Explore industries
            </ButtonLink>
          }
        />
        <IndustriesGrid industries={industries} />
      </Section>

      <Results index={n("results")} stats={settings.stats} regions={brandFacts.regions} rankedRegions={brandFacts.rankedRegions} />

      <Section tone="light" id="before-after" aria-labelledby="ba-heading">
        <SectionHeader
          index={n("before-after")}
          eyebrow="Before & after"
          title={<span id="ba-heading">Featured website redesigns.</span>}
          description="Our web design team reimagines digital experiences for brands of all sizes and across industries. Explore our redesign portfolio."
        />
        <BeforeAfterShowcase items={beforeAfterShowcase} projectSlugs={projects.map((p) => p.slug)} />
      </Section>

      {testimonials.length > 0 && (
        <Section tone="mist" aria-labelledby="testimonials-heading">
          <SectionHeader index={n("testimonials")} eyebrow="Testimonials" title={<span id="testimonials-heading">What our clients say.</span>} />
          <Testimonials items={testimonials} />
        </Section>
      )}

      <Section tone={testimonials.length ? "light" : "mist"} id="team" aria-labelledby="team-heading">
        <SectionHeader
          index={n("team")}
          eyebrow="Meet the team"
          title={<span id="team-heading">The people behind your growth.</span>}
          description="Our diverse team of digital marketing professionals brings together years of experience, creativity, and technical expertise to deliver exceptional results for our clients."
          action={
            <ButtonLink href="/about" variant="outline" arrow>
              About Jarz Digital
            </ButtonLink>
          }
        />
        <TeamGrid team={team} />
      </Section>

      <Section tone="light" aria-labelledby="locations-heading">
        <SectionHeader
          index={n("locations")}
          eyebrow="Locations"
          title={<span id="locations-heading">Local strategy. Global team.</span>}
          description="Service-based teams in Dallas, Denver and Calgary deliver localized strategies — backed by our global delivery team."
        />
        <Locations offices={settings.offices} />
      </Section>

      <Section tone="mist" id="faq" aria-labelledby="faq-heading">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader index={n("faq")} eyebrow="FAQ" title={<span id="faq-heading">Frequently asked questions.</span>} className="mb-0 md:mb-0" />
            <p className="mt-6 text-mist-600">
              Can’t find what you’re looking for?{" "}
              <Link href="/contact" className="font-medium text-brand-700 underline underline-offset-4">
                Talk to our team
              </Link>
              .
            </p>
          </div>
          <div className="lg:col-span-8">
            <Accordion items={faqs} />
          </div>
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
