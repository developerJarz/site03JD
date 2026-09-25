import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/animations/reveal";
import { PricingPlans, ProjectCard } from "@/components/marketing/cards";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Section, SectionHeader } from "@/components/ui/section";
import { PostCard } from "@/components/blog/post-card";
import { postsForService } from "@/lib/content/links";
import { getPosts, getProjects, getServiceBySlug, getServices, getSiteSettings } from "@/lib/data/public";
import { lowerTitle } from "@/lib/utils";
import { locationOffices, officeCountries, officePath } from "@/lib/seo/locations";
import { buildMetadata, faqSchema, serviceSchema } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return buildMetadata({
    title: service.seo.title || `${service.title} Services`,
    description: service.seo.description || service.summary,
    path: `/services/${service.slug}`,
    image: service.image?.src,
    seo: service.seo,
  });
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const [service, projects, allServices, settings, posts] = await Promise.all([getServiceBySlug(slug), getProjects(), getServices(), getSiteSettings(), getPosts()]);
  if (!service) notFound();

  const examples = projects.filter((p) => p.services.some((s) => s.slug === service.slug)).slice(0, 3);
  const guides = postsForService(service, posts, allServices);
  const offices = locationOffices(settings);
  const related = service.related.length
    ? allServices.filter((s) => service.related.some((r) => r.slug === s.slug))
    : allServices.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={[serviceSchema(service, officeCountries(settings)), faqSchema(service.faqs)]} />

      <PageHero
        eyebrow={/services?$/i.test(service.title) ? service.title : `${service.title} Services`}
        eyebrowInTitle
        title={service.heroTitle}
        description={service.heroSubtitle}
        crumbs={[
          { name: "Services", path: "/services" },
          { name: service.title, path: `/services/${service.slug}` },
        ]}
        actions={
          <>
            <ButtonLink href={`/contact?service=${service.slug}`} size="lg" arrow>
              Start a Project
            </ButtonLink>
            {service.plans.length > 0 && (
              <ButtonLink href="#pricing" size="lg" variant="outline-light">
                View pricing
              </ButtonLink>
            )}
          </>
        }
        aside={
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-ink-900">
            {service.image && (
              <div className="relative aspect-[4/3]">
                <Image src={service.image.src} alt={service.image.alt} fill loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" />
              </div>
            )}
            <div className="flex items-center justify-between gap-4 p-6">
              <span className="flex items-center gap-3 text-sm text-white/70">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
                  <Icon name={service.icon} className="size-5" />
                </span>
                {service.tagline}
              </span>
              {service.startingPrice && (
                <span className="shrink-0 text-right text-xs text-white/50">
                  From
                  <span className="block font-display text-2xl font-semibold text-white">{service.startingPrice}</span>
                </span>
              )}
            </div>
          </div>
        }
      />

      {/* Overview + problems */}
      <Section tone="light" aria-labelledby="overview-heading">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader index="01" eyebrow="Overview" title={<span id="overview-heading">{service.tagline}</span>} className="mb-0 md:mb-0" />
            <Reveal delay={0.1}>
              <p className="mt-8 text-lg leading-relaxed text-mist-600">{service.overview}</p>
            </Reveal>
          </div>
          {service.problems.length > 0 && (
            <div className="lg:col-span-6 lg:col-start-7">
              <p className="eyebrow mb-6 text-mist-500">Problems we solve</p>
              <Stagger className="space-y-4">
                {service.problems.map((p, i) => (
                  <StaggerItem key={p.title} className="flex gap-5 rounded-3xl border border-mist-200 p-6">
                    <span className="font-mono text-sm text-brand-700">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-display text-lg font-semibold tracking-tight text-ink-900">{p.title}</h3>
                      <p className="mt-1.5 leading-relaxed text-mist-600">{p.description}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          )}
        </div>
      </Section>

      {/* What's included */}
      {service.included.length > 0 && (
        <Section tone="mist" aria-labelledby="included-heading">
          <SectionHeader index="02" eyebrow="What’s included" title={<span id="included-heading">Everything that comes with {lowerTitle(service.shortTitle)}.</span>} />
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {service.included.map((g) => (
              <StaggerItem key={g.title} className="flex flex-col rounded-[28px] border border-mist-200 bg-white p-7">
                <h3 className="font-display text-xl font-semibold tracking-tight text-ink-900">{g.title}</h3>
                {g.description && <p className="mt-2 text-sm leading-relaxed text-mist-600">{g.description}</p>}
                <ul className="mt-6 space-y-2.5 border-t border-mist-100 pt-6">
                  {g.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-mist-700">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      )}

      {/* Process */}
      {service.process.length > 0 && (
        <Section tone="dark" aria-labelledby="process-heading">
          <SectionHeader index="03" eyebrow="Process" title={<span id="process-heading">How we deliver.</span>} />
          <Stagger as="ol" className={`grid gap-px overflow-hidden rounded-[28px] bg-white/10 md:grid-cols-2 ${service.process.length > 4 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
            {service.process.map((step, i) => (
              <StaggerItem as="li" key={step.title} className="relative bg-ink-900 p-8">
                <span aria-hidden className="font-display text-5xl font-semibold tracking-tight text-white/10">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-8 font-display text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.description}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      )}

      {/* Benefits + capabilities */}
      <Section tone="light" aria-labelledby="benefits-heading">
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeader index="04" eyebrow="Benefits" title={<span id="benefits-heading">What you get.</span>} className="mb-10 md:mb-10" />
            <ul className="grid gap-3 sm:grid-cols-2">
              {service.benefits.map((b) => (
                <li key={b} className="flex items-center gap-3 rounded-2xl bg-mist-50 px-5 py-4 text-[0.95rem] font-medium text-ink-800">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-ink-950">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          {service.capabilities.length > 0 && (
            <div>
              <SectionHeader index="05" eyebrow="Technology & capabilities" title="Tools and platforms we work with." className="mb-10 md:mb-10" />
              <ul className="flex flex-wrap gap-2">
                {service.capabilities.map((c) => (
                  <li key={c} className="rounded-full border border-mist-200 px-4 py-2 text-sm text-mist-700">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {/* Pricing */}
      {service.plans.length > 0 && (
        <Section tone="mist" id="pricing" aria-labelledby="pricing-heading">
          <SectionHeader align="center" eyebrow="Pricing" title={<span id="pricing-heading">Simple, transparent plans.</span>} description="Choose the plan that fits your stage. Every plan can be tailored after a free consultation." />
          <PricingPlans plans={service.plans} serviceSlug={service.slug} note={service.planNote} />
        </Section>
      )}

      {/* Portfolio examples */}
      {examples.length > 0 && (
        <Section tone="light" aria-labelledby="examples-heading">
          <SectionHeader
            eyebrow="Portfolio"
            title={<span id="examples-heading">{service.shortTitle} in action.</span>}
            action={
              <ButtonLink href="/work" variant="outline" arrow>
                View all work
              </ButtonLink>
            }
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {examples.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </Section>
      )}

      {/* FAQs */}
      {service.faqs.length > 0 && (
        <Section tone="mist" aria-labelledby="faq-heading">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeader eyebrow="FAQ" title={<span id="faq-heading">Questions about {lowerTitle(service.shortTitle)}.</span>} className="mb-0 md:mb-0" />
            </div>
            <div className="lg:col-span-8">
              <Accordion items={service.faqs} />
            </div>
          </div>
        </Section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <Section tone="light" aria-labelledby="related-heading" className="py-20 md:py-24">
          <SectionHeader eyebrow="Related services" title={<span id="related-heading">Pairs well with.</span>} className="mb-10 md:mb-12" />
          <ul className="grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/services/${r.slug}`} className="group flex items-center gap-4 rounded-3xl border border-mist-200 p-5 transition-colors hover:border-ink-900">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-mist-50 text-brand-700">
                    <Icon name={r.icon} className="size-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium text-ink-900">{r.title}</span>
                    <span className="line-clamp-1 text-sm text-mist-500">{r.tagline}</span>
                  </span>
                  <ArrowUpRight className="size-4 text-mist-400 transition-colors group-hover:text-ink-900" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Guides + locations: internal links to related articles and each office’s page */}
      <Section tone="mist" aria-labelledby="guides-heading" className="py-20 md:py-24">
        {guides.length > 0 && (
          <>
            <SectionHeader
              eyebrow="Guides"
              title={<span id="guides-heading">Learn more about {lowerTitle(service.shortTitle)}.</span>}
              action={
                <ButtonLink href="/blog" variant="outline" arrow>
                  All insights
                </ButtonLink>
              }
            />
            <ul className="mb-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((p) => (
                <li key={p.slug}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          </>
        )}
        <div className={guides.length > 0 ? "border-t border-mist-200 pt-10" : ""}>
          <h2 id={guides.length > 0 ? undefined : "guides-heading"} className="font-display text-xl font-semibold tracking-tight text-ink-900">
            {service.title} near you
          </h2>
          <p className="mt-2 text-sm text-mist-600">Available to businesses served by our offices in {offices.map((o) => o.city).join(", ")} — and to clients worldwide.</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {offices.map((o) => (
              <li key={o.code}>
                <Link href={officePath(o)} className="inline-flex items-center gap-2 rounded-full border border-mist-200 bg-white px-4 py-2 text-sm text-mist-700 transition-colors hover:border-ink-900 hover:text-ink-900">
                  <span className="font-mono text-xs text-brand-700">{o.code}</span>
                  {service.shortTitle} in {o.city}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CtaBanner
        title={`Ready to start with ${lowerTitle(service.shortTitle)}?`}
        primary={{ label: "Request a Quote", href: `/contact?service=${service.slug}` }}
        secondary={{ label: "Talk to Our Team", href: "/contact" }}
      />
    </>
  );
}
