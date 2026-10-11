import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/animations/reveal";
import { EcommerceBuilder } from "@/components/ecommerce-builder/builder";
import { ProjectCard } from "@/components/marketing/cards";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Section, SectionHeader } from "@/components/ui/section";
import { getProjects, getServices, getSiteSettings } from "@/lib/data/public";
import { isDbConfigured } from "@/lib/db/connect";
import { BUILDER_PATH } from "@/lib/ecommerce-builder/constants";
import { formatMoney } from "@/lib/ecommerce-builder/pricing";
import { getBuilderSettings, getPublishedPricebook } from "@/lib/ecommerce-builder/server";
import { SITE_URL, abs, buildMetadata, faqSchema } from "@/lib/seo";

export const revalidate = 3600;

const CRUMBS = [
  { name: "Services", path: "/services" },
  { name: "E-commerce Website Development", path: BUILDER_PATH },
];

const RELATED = ["website-development", "web-application-development", "seo"];

export async function generateMetadata(): Promise<Metadata> {
  const [{ seo }, site] = await Promise.all([getBuilderSettings(), getSiteSettings()]);
  const globalImage = site.seo.ogImage && site.seo.ogImage !== "/opengraph-image" ? site.seo.ogImage : undefined;
  const meta = buildMetadata({
    title: seo.title,
    description: seo.description,
    path: BUILDER_PATH,
    image: seo.ogImage || globalImage,
    seo: { canonical: seo.canonical || undefined, noindex: seo.noindex },
  });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, ...(seo.ogTitle ? { title: seo.ogTitle } : {}), ...(seo.ogDescription ? { description: seo.ogDescription } : {}) },
    twitter: { ...meta.twitter, ...(seo.ogTitle ? { title: seo.ogTitle } : {}), ...(seo.ogDescription ? { description: seo.ogDescription } : {}) },
  };
}

export default async function EcommerceBuilderPage() {
  const [settings, pb, projects, services] = await Promise.all([getBuilderSettings(), getPublishedPricebook(), getProjects(), getServices()]);
  const { content, seo, form, general } = settings;
  const startingPrice = pb.templates.length ? Math.min(...pb.templates.map((t) => t.price)) : 0;
  const portfolioProjects = content.portfolio.length ? [] : projects.filter((p) => p.categories.includes("web-development")).slice(0, 3);
  const related = RELATED.map((slug) => services.find((s) => s.slug === slug)).filter((s): s is NonNullable<typeof s> => Boolean(s));
  const s = content.sections;

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: seo.serviceName,
    serviceType: "E-commerce website development",
    description: seo.serviceDescription || seo.description,
    url: abs(BUILDER_PATH),
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: seo.areaServed.length ? seo.areaServed : ["Bangladesh"],
    ...(startingPrice > 0
      ? { offers: { "@type": "Offer", name: "Custom e-commerce website (base package)", price: (startingPrice / 100).toFixed(2), priceCurrency: pb.currency, url: abs(`${BUILDER_PATH}#templates`) } }
      : {}),
  };

  return (
    <>
      <JsonLd data={[serviceLd, faqSchema(content.faqs)]} />

      <PageHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        description={
          <>
            {content.hero.subtitle && <p className="font-display text-xl font-medium tracking-tight text-white md:text-2xl">{content.hero.subtitle}</p>}
            {content.hero.description && <p className="mt-4">{content.hero.description}</p>}
          </>
        }
        crumbs={CRUMBS}
        actions={
          <>
            <ButtonLink href="#templates" size="lg" arrow>
              {content.hero.primaryCta || "Build Your Website"}
            </ButtonLink>
            <ButtonLink href="#templates" size="lg" variant="outline-light">
              {content.hero.secondaryCta || "Explore Website Designs"}
            </ButtonLink>
          </>
        }
        aside={
          <div className="rounded-[28px] border border-white/10 bg-ink-900/80 p-6 backdrop-blur md:p-8">
            <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-6">
              <p className="text-sm text-white/60">
                Complete store
                <span className="block text-xs text-white/40">Design + admin dashboard</span>
              </p>
              <p className="text-right text-xs uppercase tracking-wider text-white/50">
                Starting at
                <span className="block font-display text-5xl font-semibold normal-case tracking-tight text-white">{formatMoney(startingPrice, pb.currency)}</span>
              </p>
            </div>
            {content.hero.highlights.length > 0 && (
              <ul className="mt-6 space-y-3">
                {content.hero.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-sm text-white/75">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-ink-950">
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            )}
            {content.hero.techStack.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technology">
                {content.hero.techStack.map((t) => (
                  <li key={t} className="rounded-full border border-white/15 px-3 py-1 font-mono text-xs text-brand-300">
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        }
      />

      <EcommerceBuilder pricebook={pb} content={content} form={form} acceptingOrders={general.acceptingOrders} closedMessage={general.closedMessage} canQuote={isDbConfigured} />

      {/* Why Jarz Digital */}
      {content.benefits.length > 0 && (
        <Section tone="mist" aria-labelledby="benefits-heading">
          <SectionHeader index="06" eyebrow={s.benefits.eyebrow} title={<span id="benefits-heading">{s.benefits.title}</span>} description={s.benefits.description || undefined} />
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {content.benefits.map((b, i) => (
              <StaggerItem key={b.title} className="flex flex-col rounded-[28px] border border-mist-200 bg-white p-7">
                <span className="font-mono text-sm text-brand-700">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-ink-900">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-600">{b.description}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      )}

      {/* Process */}
      {content.process.length > 0 && (
        <Section tone="dark" aria-labelledby="process-heading">
          <SectionHeader index="07" eyebrow={s.process.eyebrow} title={<span id="process-heading">{s.process.title}</span>} description={s.process.description || undefined} />
          <Stagger as="ol" className={`grid gap-px overflow-hidden rounded-[28px] bg-white/10 md:grid-cols-2 ${content.process.length > 4 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
            {content.process.map((step, i) => (
              <StaggerItem as="li" key={step.title} className="relative bg-ink-900 p-8">
                <span aria-hidden className="font-display text-5xl font-semibold tracking-tight text-white/10">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-8 font-display text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.description}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      )}

      {/* Portfolio — admin-curated items, or real published web projects */}
      {(content.portfolio.length > 0 || portfolioProjects.length > 0) && (
        <Section tone="light" aria-labelledby="portfolio-heading">
          <SectionHeader
            index="08"
            eyebrow={s.portfolio.eyebrow}
            title={<span id="portfolio-heading">{s.portfolio.title}</span>}
            description={s.portfolio.description || undefined}
            action={
              <ButtonLink href="/work" variant="outline" arrow>
                View all work
              </ButtonLink>
            }
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {content.portfolio.length > 0
              ? content.portfolio.map((p) => {
                  const body = (
                    <>
                      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-mist-100">
                        {p.image?.src && <Image src={p.image.src} alt={p.image.alt || p.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]" unoptimized={!p.image.src.startsWith("/")} />}
                      </div>
                      <h3 className="mt-5 flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink-900">
                        {p.title}
                        {p.url && <ArrowUpRight className="size-4 text-mist-400 transition-colors group-hover:text-ink-900" aria-hidden />}
                      </h3>
                      {p.description && <p className="mt-1.5 text-sm leading-relaxed text-mist-600">{p.description}</p>}
                    </>
                  );
                  return p.url ? (
                    <a key={p.title} href={p.url} target="_blank" rel="noopener noreferrer" className="group block">
                      {body}
                    </a>
                  ) : (
                    <div key={p.title}>{body}</div>
                  );
                })
              : portfolioProjects.map((p) => <ProjectCard key={p.slug} project={p} />)}
          </div>
        </Section>
      )}

      {/* Testimonials — only real ones entered by an admin */}
      {content.testimonials.length > 0 && (
        <Section tone="mist" aria-labelledby="testimonials-heading">
          <SectionHeader eyebrow={s.testimonials.eyebrow} title={<span id="testimonials-heading">{s.testimonials.title}</span>} />
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {content.testimonials.map((t) => (
              <li key={`${t.name}-${t.quote.slice(0, 20)}`} className="flex flex-col rounded-[28px] border border-mist-200 bg-white p-7">
                <blockquote className="flex-1 leading-relaxed text-ink-800">“{t.quote}”</blockquote>
                <p className="mt-6 text-sm font-medium text-ink-900">
                  {t.name}
                  {t.role && <span className="block font-normal text-mist-500">{t.role}</span>}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* FAQs */}
      {content.faqs.length > 0 && (
        <Section tone={content.testimonials.length ? "light" : "mist"} aria-labelledby="faq-heading">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeader index="09" eyebrow={s.faq.eyebrow} title={<span id="faq-heading">{s.faq.title}</span>} className="mb-0 md:mb-0" />
            </div>
            <div className="lg:col-span-8">
              <Accordion items={content.faqs} />
            </div>
          </div>
        </Section>
      )}

      {/* Related services (internal links) */}
      {related.length > 0 && (
        <Section tone="light" aria-labelledby="related-heading" className="py-20 md:py-24">
          <SectionHeader eyebrow="Related services" title={<span id="related-heading">Services that pair well with your online store.</span>} className="mb-10 md:mb-12" />
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

      <CtaBanner
        eyebrow={content.cta.eyebrow}
        title={content.cta.title}
        description={content.cta.description}
        whatsapp={{ intent: "I’d like an e-commerce website.", from: "E-commerce website builder page", path: BUILDER_PATH }}
        primary={{ label: content.cta.primaryLabel || "Build your website", href: "#templates" }}
      />
    </>
  );
}
