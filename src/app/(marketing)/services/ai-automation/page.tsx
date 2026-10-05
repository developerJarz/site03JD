import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { WhatsAppButton } from "@/components/marketing/whatsapp";
import { RunLog } from "@/components/sections/ai-automation/run-log";
import { SectionRail, type RailSection } from "@/components/sections/ai-automation/section-rail";
import { WorkflowFinder } from "@/components/sections/ai-automation/workflow-finder";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { guide, industryExamples, readiness } from "@/content/ai-automation";
import { getIndustries, getServiceBySlug, getServices, getSiteSettings } from "@/lib/data/public";
import { seedStore } from "@/lib/data/seed-store";
import { buildMetadata, faqSchema, serviceSchema } from "@/lib/seo";
import { officeCountries } from "@/lib/seo/locations";

export const revalidate = 3600;

const SLUG = "ai-automation";
const PATH = `/services/${SLUG}`;

/** The service record from the CMS; the seed copy keeps the page working until it's added there. */
async function getService() {
  return (await getServiceBySlug(SLUG)) ?? seedStore.services.find((s) => s.slug === SLUG)!;
}

export async function generateMetadata(): Promise<Metadata> {
  const service = await getService();
  return buildMetadata({
    title: service.seo.title || `${service.title} Services`,
    description: service.seo.description || service.summary,
    path: PATH,
    image: service.image?.src,
    seo: service.seo,
  });
}

const SECTIONS: RailSection[] = [
  { id: "why", label: "Why automate" },
  { id: "workflows", label: "What we automate" },
  { id: "included", label: "What’s included" },
  { id: "process", label: "How it works" },
  { id: "explained", label: "AI automation explained" },
  { id: "tools", label: "Tools" },
  { id: "industries", label: "Industries" },
  { id: "faq", label: "FAQ" },
];

/** Shared heading for the body sections: the side rail already names each one, so no eyebrow. */
function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={`${id}-heading`} className="max-w-3xl font-display text-[clamp(1.85rem,1.4rem+1.6vw,2.75rem)] font-semibold leading-[1.08] tracking-display text-ink-900">
      {children}
    </h2>
  );
}

const sectionClass = "scroll-mt-16 border-t border-mist-200 py-16 first:border-t-0 first:pt-0 md:py-20 lg:scroll-mt-0";

export default async function AiAutomationPage() {
  const [service, allServices, industries, settings] = await Promise.all([getService(), getServices(), getIndustries(), getSiteSettings()]);

  const relatedSlugs = service.related.map((r) => r.slug);
  const related = allServices.filter((s) => relatedSlugs.includes(s.slug));
  // One industry per example, so each row says something different.
  const used = new Set<string>();
  const forIndustries = industries
    .filter((i) => !i.seo?.noindex)
    .flatMap((industry) => {
      const example = industryExamples.find((e) => e.match.test(industry.slug))?.example;
      if (!example || used.has(example)) return [];
      used.add(example);
      return [{ industry, example }];
    });
  const sections = SECTIONS.filter((s) => s.id !== "industries" || forIndustries.length > 0);

  return (
    <>
      <JsonLd data={[serviceSchema(service, officeCountries(settings)), faqSchema(service.faqs)]} />

      <PageHero
        eyebrow="AI Automation Services"
        eyebrowInTitle
        title={service.heroTitle}
        description={service.heroSubtitle}
        crumbs={[
          { name: "Services", path: "/services" },
          { name: service.title, path: PATH },
        ]}
        actions={
          <>
            <WhatsAppButton number={settings.contact.whatsapp} intent="I’d like to automate part of my business with AI." from="AI Automation service page" path={PATH}>
              Talk about your workflow
            </WhatsAppButton>
            <ButtonLink href="#workflows" size="lg" variant="outline-light">
              See what we automate
            </ButtonLink>
          </>
        }
        aside={<RunLog />}
      />

      <div className="bg-white">
        <div className="container-page relative pb-8 pt-0 lg:grid lg:grid-cols-12 lg:gap-12 lg:pt-24">
          {/* `contents` on small screens lets the phone bar stick for the whole body */}
          <aside className="contents lg:col-span-3 lg:block">
            <SectionRail sections={sections}>
              <p className="text-sm leading-relaxed text-mist-600">Not sure where to start? Tell us what eats your team’s time.</p>
              <WhatsAppButton number={settings.contact.whatsapp} size="md" intent="I have a question about AI automation." from="AI Automation service page — side menu" path={PATH} className="mt-4">
                Ask on WhatsApp
              </WhatsAppButton>
            </SectionRail>
          </aside>

          <div className="pt-12 lg:col-span-9 lg:pt-0">
            {/* Why automate */}
            <section id="why" aria-labelledby="why-heading" className={sectionClass}>
              <H2 id="why">Busy work is costing you customers. AI automation gives that time back.</H2>
              <p className="mt-6 max-w-[68ch] text-lg leading-relaxed text-mist-600">{service.overview}</p>
              <ul className="mt-12 grid gap-px overflow-hidden rounded-[28px] border border-mist-200 bg-mist-200 md:grid-cols-3">
                {service.problems.map((p) => (
                  <li key={p.title} className="bg-white p-7">
                    <h3 className="font-display text-lg font-semibold tracking-tight text-ink-900">{p.title}</h3>
                    <p className="mt-2 leading-relaxed text-mist-600">{p.description}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Workflow finder */}
            <section id="workflows" aria-labelledby="workflows-heading" className={sectionClass}>
              <H2 id="workflows">What can AI automate in your business?</H2>
              <p className="mb-10 mt-6 max-w-[68ch] text-lg leading-relaxed text-mist-600">
                Pick the part of the business that takes the most time. Each example is a real workflow we can build with the tools you already use.
              </p>
              <WorkflowFinder />
            </section>

            {/* What's included */}
            <section id="included" aria-labelledby="included-heading" className={sectionClass}>
              <H2 id="included">What our AI automation services include</H2>
              <dl className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
                {service.included.map((g) => (
                  <div key={g.title} className="border-t-2 border-ink-900 pt-5">
                    <dt className="font-display text-xl font-semibold tracking-tight text-ink-900">{g.title}</dt>
                    <dd>
                      {g.description && <p className="mt-2 leading-relaxed text-mist-600">{g.description}</p>}
                      <ul className="mt-4 space-y-2">
                        {g.items.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-[0.95rem] text-mist-700">
                            <Check className="mt-1 size-4 shrink-0 text-brand-600" aria-hidden />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Process — a real sequence, so it's numbered */}
            <section id="process" aria-labelledby="process-heading" className={sectionClass}>
              <H2 id="process">How we build your first AI workflow</H2>
              <p className="mt-6 max-w-[68ch] text-lg leading-relaxed text-mist-600">
                We start small, prove the time saved, and only then automate the next thing. No big-bang software project.
              </p>
              <ol className="mt-12 space-y-0">
                {service.process.map((step, i) => (
                  <li key={step.title} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-5 md:grid-cols-[4rem_minmax(0,1fr)]">
                    <div className="flex flex-col items-center">
                      <span className="flex size-11 items-center justify-center rounded-full border-2 border-ink-900 font-display text-lg font-semibold text-ink-900 md:size-12">{i + 1}</span>
                      {i < service.process.length - 1 && <span aria-hidden className="w-0.5 flex-1 bg-mist-200" />}
                    </div>
                    <div className="pb-10 pt-2">
                      <h3 className="font-display text-xl font-semibold tracking-tight text-ink-900">{step.title}</h3>
                      <p className="mt-2 max-w-[60ch] leading-relaxed text-mist-600">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Explained — long-form copy */}
            <section id="explained" aria-labelledby="explained-heading" className={sectionClass}>
              <H2 id="explained">AI automation, explained without the jargon</H2>
              <div className="mt-10 max-w-[68ch] space-y-12">
                {guide.map((g) => (
                  <div key={g.heading}>
                    <h3 className="font-display text-2xl font-semibold tracking-tight text-ink-900">{g.heading}</h3>
                    {g.body.map((p) => (
                      <p key={p.slice(0, 32)} className="mt-4 text-[1.0625rem] leading-[1.75] text-mist-700">
                        {p}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-14 rounded-[28px] bg-ink-950 p-8 text-white md:p-10">
                <h3 className="font-display text-2xl font-semibold tracking-tight">Is your business ready for AI automation?</h3>
                <p className="mt-3 max-w-xl text-white/60">If two or more of these sound familiar, automation will pay for itself quickly.</p>
                <ul className="mt-8 grid gap-x-10 gap-y-4 md:grid-cols-2">
                  {readiness.map((r) => (
                    <li key={r} className="flex items-start gap-3 text-white/85">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-brand-400/20 text-brand-300">
                        <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <WhatsAppButton number={settings.contact.whatsapp} size="md" intent="Several of the AI automation readiness points sound like my business." from="AI Automation service page — readiness check" path={PATH}>
                    Book a free automation call
                  </WhatsAppButton>
                </div>
              </div>
            </section>

            {/* Tools */}
            <section id="tools" aria-labelledby="tools-heading" className={sectionClass}>
              <H2 id="tools">AI and automation tools we work with</H2>
              <p className="mt-6 max-w-[68ch] text-lg leading-relaxed text-mist-600">
                We pick tools for the job, not the other way round, and connect them to the software your team already knows.
              </p>
              <ul className="mt-10 flex flex-wrap gap-2">
                {service.capabilities.map((c) => (
                  <li key={c} className="rounded-full border border-mist-200 px-4 py-2 text-[0.95rem] text-mist-700">
                    {c}
                  </li>
                ))}
              </ul>
              <h3 className="mt-12 font-display text-xl font-semibold tracking-tight text-ink-900">Benefits you can expect</h3>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {service.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 rounded-2xl bg-mist-50 px-5 py-4 text-[0.95rem] font-medium text-ink-800">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-ink-950">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </section>

            {/* Industries */}
            {forIndustries.length > 0 && (
              <section id="industries" aria-labelledby="industries-heading" className={sectionClass}>
                <H2 id="industries">AI automation for your industry</H2>
                <ul className="mt-10 divide-y divide-mist-200 border-y border-mist-200">
                  {forIndustries.map(({ industry, example }) => (
                    <li key={industry.slug}>
                      <Link href={`/industries/${industry.slug}`} className="group grid gap-1 py-5 md:grid-cols-[14rem_minmax(0,1fr)_auto] md:items-center md:gap-8">
                        <span className="flex items-center gap-3 font-medium text-ink-900">
                          <Icon name={industry.icon} className="size-5 text-brand-700" />
                          {industry.name}
                        </span>
                        <span className="text-mist-600">{example}</span>
                        <ArrowUpRight className="hidden size-4 text-mist-400 transition-colors group-hover:text-ink-900 md:block" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* FAQ */}
            <section id="faq" aria-labelledby="faq-heading" className={sectionClass}>
              <H2 id="faq">AI automation questions, answered</H2>
              <div className="mt-10">
                <Accordion items={service.faqs} />
              </div>
            </section>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t border-mist-200 bg-mist-50 py-20 md:py-24">
          <div className="container-page">
            <h2 id="related-heading" className="font-display text-2xl font-semibold tracking-tight text-ink-900">
              Services that pair well with AI automation
            </h2>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/services/${r.slug}`} className="group flex items-center gap-4 rounded-3xl border border-mist-200 bg-white p-5 transition-colors hover:border-ink-900">
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
          </div>
        </section>
      )}

      <CtaBanner
        title="Tell us the task your team dreads. We’ll show you how to automate it."
        description="Book a free consultation. We’ll map one workflow with you, show what AI can take over, and quote before any work begins."
        whatsapp={{ intent: "I’d like to automate part of my business with AI.", from: "AI Automation service page", path: PATH }}
        primary={{ label: "Request a quote", href: `/contact?service=${SLUG}#contact-form` }}
      />
    </>
  );
}
