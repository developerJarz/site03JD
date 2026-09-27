import { WhatsAppButton } from "@/components/marketing/whatsapp";
import type { Metadata } from "next";
import Link from "next/link";
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
            <WhatsAppButton intent="I’d like to start a project." from="Services page" path="/services">
              Start a Project
            </WhatsAppButton>
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

      {/* Which service do you need? — maps common goals to services (keyword-rich, links every service) */}
      <Section tone={groups.length % 2 ? "mist" : "light"} aria-labelledby="choose-heading">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader eyebrow="How to choose" title={<span id="choose-heading">Which digital marketing service do you need?</span>} className="mb-0 md:mb-0" />
            <div className="mt-8 space-y-4 text-lg leading-relaxed text-mist-600">
              <p>
                Most businesses come to us with one goal: more customers from the internet. The right service depends on where those customers are looking and what is holding you back today — an
                outdated website, not showing up on Google, or no steady flow of leads.
              </p>
              <p>
                Start with the goal that sounds most like yours. Not sure? Send us a WhatsApp message with your website and we’ll recommend the right mix in a free consultation — many clients combine
                a website, local SEO and ads, or hand everything to one team with our business management package.
              </p>
            </div>
          </div>
          <ul className="space-y-3 lg:col-span-7">
            {CHOOSER.map(({ goal, slug, why }) => {
              const s = services.find((x) => x.slug === slug);
              if (!s) return null;
              return (
                <li key={slug}>
                  <Link href={`/services/${slug}`} className="group flex items-start justify-between gap-6 rounded-3xl border border-mist-200 bg-white p-6 transition-colors hover:border-ink-900">
                    <span>
                      <span className="block text-sm text-mist-600">{goal}</span>
                      <span className="mt-1 block font-display text-xl font-semibold tracking-tight text-ink-900">{s.title}</span>
                      <span className="mt-1.5 block leading-relaxed text-mist-600">{why}</span>
                    </span>
                    {s.startingPrice && <span className="shrink-0 text-right text-sm text-mist-600">from<span className="block font-display text-xl font-semibold text-ink-900">{s.startingPrice}</span></span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

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

      <CtaBanner title="Not sure which service fits?" description="Tell us about your business and goals. We’ll recommend the right mix — and you’ll hear back within 24 hours." whatsapp={{ intent: "I’m not sure which service fits my business — can you recommend one?", from: "Services page", path: "/services" }} primary={{ label: "Get a Free Consultation", href: "/contact#contact-form" }} secondary={{ label: "View Our Work", href: "/work" }} />
    </>
  );
}

/** Common goals → the service that solves them (copy for the "How to choose" section). */
const CHOOSER = [
  { goal: "“My website is outdated, slow or broken.”", slug: "website-development", why: "A fast, mobile-friendly website built to rank on Google and turn visitors into calls, bookings and sales." },
  { goal: "“Customers nearby can’t find us on Google Maps.”", slug: "local-seo", why: "Google Business Profile optimization, map citations and reviews to get you into the local map pack." },
  { goal: "“We don’t show up on Google for what we sell.”", slug: "seo", why: "Keyword research, technical fixes, on-page SEO and content that grow your organic traffic month after month." },
  { goal: "“We need leads this month, not next year.”", slug: "google-ads", why: "Google Ads, Meta Ads and shopping campaigns that put you in front of buyers who are searching right now." },
  { goal: "“Our social media pages have gone quiet.”", slug: "social-media-marketing", why: "Regular branded posts, custom graphics and community management on Facebook, Instagram, TikTok and more." },
  { goal: "“We want one team to handle everything.”", slug: "business-management", why: "Local SEO, website SEO, social media and Google Ads managed together in one monthly package." },
  { goal: "“We need a portal, dashboard or custom system.”", slug: "web-application-development", why: "Secure Laravel web applications — e-commerce, inventory, marketplaces and admin dashboards." },
];

function groupTitle(group: string) {
  if (/growth|marketing/i.test(group)) return "Search, social, ads & ongoing management.";
  if (/design|development/i.test(group)) return "Websites, web applications & custom software.";
  return group;
}
