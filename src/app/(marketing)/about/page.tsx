import { WhatsAppButton } from "@/components/marketing/whatsapp";
import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Counter } from "@/components/animations";
import { Reveal, Stagger, StaggerItem } from "@/components/animations/reveal";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { Locations } from "@/components/sections/locations";
import { TeamGrid } from "@/components/sections/team-grid";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Section, SectionHeader } from "@/components/ui/section";
import { brandFacts } from "@/content/seed";
import { getServices, getSiteSettings, getTeam } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo/page";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/about");
}

export default async function AboutPage() {
  const [settings, team, services] = await Promise.all([getSiteSettings(), getTeam(), getServices()]);
  const cities = settings.offices.map((o) => o.city);
  const officeList = cities.length > 1 ? `${cities.slice(0, -1).join(", ")} and ${cities.at(-1)}` : cities.join("");

  return (
    <>
      <PageHero
        eyebrow="About Jarz Digital"
        eyebrowInTitle
        title="Empowering businesses through digital excellence."
        titleLines={["Empowering businesses", "through digital excellence."]}
        description="We are a passionate team of digital marketing experts dedicated to helping businesses thrive in the digital landscape. With years of experience and a commitment to innovation, we deliver results that matter."
        crumbs={[{ name: "About", path: "/about" }]}
        actions={
          <>
            <WhatsAppButton intent="I’d like to work with Jarz Digital." from="About page" path="/about">
              Work With Us
            </WhatsAppButton>
            <ButtonLink href="/contact" size="lg" variant="outline-light">
              Get In Touch
            </ButtonLink>
          </>
        }
      >
        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 md:grid-cols-4">
          {settings.stats.map((s) => (
            <div key={s.label} className="bg-ink-950 p-6 md:p-8">
              <dd className="font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
                <Counter value={s.value} />
              </dd>
              <dt className="mt-2 text-sm text-white/50">{s.label}</dt>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Who we are — plain-language, keyword-rich summary of the agency (facts from the original site + settings) */}
      <Section tone="light" aria-labelledby="who-heading">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader index="01" eyebrow="Who we are" title={<span id="who-heading">A web design, SEO & digital marketing agency for growing businesses.</span>} className="mb-0 md:mb-0" />
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-mist-600 lg:col-span-7">
            <p>
              Jarz Digital is a <strong className="font-semibold text-ink-900">digital marketing agency founded in Dallas in {settings.general.foundedYear}</strong>. We help small and growing businesses get found on Google,
              look professional online and turn visitors into customers — with{" "}
              <Link href="/services/website-development" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">custom website design and development</Link>,{" "}
              <Link href="/services/local-seo" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">local SEO and Google Maps ranking</Link>,{" "}
              <Link href="/services/seo" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">search engine optimization</Link>,{" "}
              <Link href="/services/google-ads" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">Google Ads</Link> and{" "}
              <Link href="/services/social-media-marketing" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">social media marketing</Link>.
            </p>
            <p>
              Today our team works from offices in {officeList}, serving clients across the United States, Canada, Europe and Bangladesh. Businesses that want everything handled by one team choose our{" "}
              <Link href="/services/business-management" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">monthly business management package</Link>, and companies with bigger
              ideas work with us on{" "}
              <Link href="/services/web-application-development" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">web applications</Link> and{" "}
              <Link href="/services/software-development" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">custom software</Link>.
            </p>
            <ul className="grid gap-3 pt-2 sm:grid-cols-2">
              {brandFacts.differentiators.map((d) => (
                <li key={d.title} className="flex items-start gap-3 rounded-2xl bg-mist-50 p-4 text-base">
                  <Check className="mt-1 size-4 shrink-0 text-brand-600" aria-hidden />
                  <span>
                    <span className="block font-medium text-ink-900">{d.title}</span>
                    <span className="text-mist-600">{d.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Story + timeline */}
      <Section tone="mist" aria-labelledby="story-heading">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeader index="02" eyebrow="Our story" title={<span id="story-heading">Founded in Dallas in {settings.general.foundedYear}, built to help businesses grow.</span>} className="mb-8 md:mb-10" />
            <div className="space-y-5 text-lg leading-relaxed text-mist-600">
              {brandFacts.story.map((p) => (
                <Reveal key={p}>
                  <p>{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="eyebrow mb-8 text-mist-500">Our milestones</p>
            <ol className="relative space-y-10 border-l border-mist-200 pl-8">
              {brandFacts.milestones.map((m) => (
                <Reveal as="li" key={m.year} className="relative">
                    <span aria-hidden className="absolute -left-[41px] top-1.5 flex size-4 items-center justify-center rounded-full bg-white ring-1 ring-mist-300">
                      <span className="size-1.5 rounded-full bg-brand-500" />
                    </span>
                    <p className="font-mono text-sm text-brand-700">{m.year}</p>
                    <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-ink-900">{m.title}</h3>
                    <p className="mt-1 text-mist-600">{m.description}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* Mission & vision */}
      <Section tone="dark" aria-labelledby="mission-heading">
        <SectionHeader
          index="03"
          eyebrow="Mission & vision"
          title={<span id="mission-heading">Driven by purpose, guided by vision.</span>}
          description="We’re committed to transforming how businesses connect with their audiences in the digital world."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {[
            { title: "Our mission", text: brandFacts.mission, points: brandFacts.missionPoints },
            { title: "Our vision", text: brandFacts.vision, points: brandFacts.visionPoints },
          ].map((b) => (
            <Reveal key={b.title} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8 md:p-10">
              <h3 className="font-display text-2xl font-semibold tracking-tight text-white">{b.title}</h3>
              <p className="mt-4 text-lg leading-relaxed text-white/65">{b.text}</p>
              <ul className="mt-8 space-y-3 border-t border-white/10 pt-8">
                {b.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-white/80">
                    <Check className="size-4 text-brand-300" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Values */}
      <Section tone="light" aria-labelledby="values-heading">
        <SectionHeader index="04" eyebrow="Core values" title={<span id="values-heading">The principles behind every project.</span>} />
        <Stagger className="grid gap-px overflow-hidden rounded-[28px] bg-mist-200 md:grid-cols-2 lg:grid-cols-3">
          {brandFacts.values.map((v, i) => (
            <StaggerItem key={v.title} className="bg-white p-8 md:p-10">
              <span className="font-mono text-sm text-brand-700">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-ink-900">{v.title}</h3>
              <p className="mt-2 leading-relaxed text-mist-600">{v.description}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* Team */}
      <Section tone="mist" id="team" aria-labelledby="team-heading">
        <SectionHeader
          index="05"
          eyebrow="Team"
          title={<span id="team-heading">Meet the web design, SEO and marketing team.</span>}
          description="Our diverse team of digital marketing professionals brings together years of experience, creativity, and technical expertise to deliver exceptional results for our clients."
        />
        <TeamGrid team={team} />
      </Section>

      {/* Capabilities */}
      <Section tone="light" aria-labelledby="capabilities-heading">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader index="06" eyebrow="Capabilities" title={<span id="capabilities-heading">Web design, SEO & digital marketing services — a 360° solution.</span>} className="mb-0 md:mb-0" />
            <p className="mt-6 text-lg leading-relaxed text-mist-600">Every service is available on its own or combined, and each includes free graphics and SEO-optimized content.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="group flex items-center gap-4 rounded-2xl border border-mist-200 p-4 transition-colors hover:border-ink-900">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-mist-50 text-brand-700 transition-colors group-hover:bg-ink-900 group-hover:text-brand-300">
                    <Icon name={s.icon} className="size-5" />
                  </span>
                  <span>
                    <span className="block font-medium text-ink-900">{s.title}</span>
                    <span className="line-clamp-2 text-sm text-mist-600">{s.tagline}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Global presence */}
      <Section tone="mist" aria-labelledby="presence-heading">
        <SectionHeader
          index="07"
          eyebrow="Global presence"
          title={<span id="presence-heading">Offices in {officeList} — serving clients worldwide.</span>}
          description={`${brandFacts.regions} ${brandFacts.rankedRegions}`}
        />
        <Locations offices={settings.offices} from="About page locations section" path="/about" />
      </Section>

      <CtaBanner title="Ready to partner with Jarz Digital?" description="Join hundreds of businesses that trust us to drive their digital growth. Let's work together to achieve your business goals." whatsapp={{ intent: "I’d like to start a project with Jarz Digital.", from: "About page", path: "/about" }} primary={{ label: "Send a Request", href: "/contact#contact-form" }} />
    </>
  );
}
