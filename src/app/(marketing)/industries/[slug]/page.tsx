import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/animations";
import { ProjectCard } from "@/components/marketing/cards";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Section, SectionHeader } from "@/components/ui/section";
import { getIndustries, getIndustryBySlug, getProjects, getServices } from "@/lib/data/public";
import { lowerTitle } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const industries = await getIndustries();
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/industries/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) return {};
  return buildMetadata({
    title: industry.seo.title || `${industry.headline} & Local SEO`,
    description: industry.seo.description || industry.intro,
    path: `/industries/${industry.slug}`,
    seo: industry.seo,
  });
}

export default async function IndustryPage({ params }: PageProps<"/industries/[slug]">) {
  const { slug } = await params;
  const [industry, projects, services, all] = await Promise.all([getIndustryBySlug(slug), getProjects(), getServices(), getIndustries()]);
  if (!industry) notFound();

  const examples = projects.filter((p) => p.industry?.slug === industry.slug);
  const relevant = services.filter((s) => industry.services.some((r) => r.slug === s.slug));
  const others = all.filter((i) => i.slug !== industry.slug).slice(0, 8);

  return (
    <>
      <PageHero
        eyebrow={industry.name}
        title={industry.headline}
        description={industry.intro}
        crumbs={[
          { name: "Industries", path: "/industries" },
          { name: industry.name, path: `/industries/${industry.slug}` },
        ]}
        actions={
          <>
            <ButtonLink href={`/contact?intent=project&industry=${industry.slug}`} size="lg" arrow>
              Start a Project
            </ButtonLink>
            <ButtonLink href="/work" size="lg" variant="outline-light">
              View Our Work
            </ButtonLink>
          </>
        }
        aside={
          <div className="flex aspect-square max-w-sm items-center justify-center rounded-[40px] border border-white/10 bg-gradient-to-br from-brand-500/20 via-ink-900 to-ink-950 lg:ml-auto">
            <Icon name={industry.icon} className="size-28 text-brand-300" strokeWidth={1} />
          </div>
        }
      />

      {(industry.challenges.length > 0 || industry.solutions.length > 0) && (
        <Section tone="light" aria-labelledby="challenges-heading">
          <div className="grid gap-16 lg:grid-cols-2">
            {industry.challenges.length > 0 && (
              <div>
                <SectionHeader index="01" eyebrow="Industry challenges" title={<span id="challenges-heading">What makes {lowerTitle(industry.name)} marketing hard.</span>} className="mb-10 md:mb-12" />
                <Stagger className="space-y-4">
                  {industry.challenges.map((c) => (
                    <StaggerItem key={c.title} className="rounded-3xl border border-mist-200 p-6">
                      <h3 className="font-display text-lg font-semibold tracking-tight text-ink-900">{c.title}</h3>
                      <p className="mt-1.5 leading-relaxed text-mist-600">{c.description}</p>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            )}
            {industry.solutions.length > 0 && (
              <div>
                <SectionHeader index="02" eyebrow="Our solutions" title="How Jarz Digital helps." className="mb-10 md:mb-12" />
                <Stagger className="space-y-4">
                  {industry.solutions.map((s) => (
                    <StaggerItem key={s.title} className="theme-dark rounded-3xl bg-ink-900 p-6">
                      <h3 className="font-display text-lg font-semibold tracking-tight text-white">{s.title}</h3>
                      <p className="mt-1.5 leading-relaxed text-white/60">{s.description}</p>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            )}
          </div>
        </Section>
      )}

      {relevant.length > 0 && (
        <Section tone="mist" aria-labelledby="relevant-heading">
          <SectionHeader index="03" eyebrow="Relevant services" title={<span id="relevant-heading">Services for {lowerTitle(industry.name)} businesses.</span>} />
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {relevant.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="group flex h-full flex-col rounded-3xl border border-mist-200 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-ink-900 hover:shadow-lift">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-ink-900 text-brand-300">
                    <Icon name={s.icon} className="size-5" />
                  </span>
                  <span className="mt-8 font-display text-lg font-semibold tracking-tight text-ink-900">{s.title}</span>
                  <span className="mt-1.5 flex-1 text-sm leading-relaxed text-mist-600">{s.tagline}</span>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-ink-900">
                    Learn more <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {examples.length > 0 && (
        <Section tone="light" aria-labelledby="examples-heading">
          <SectionHeader index="04" eyebrow="Portfolio" title={<span id="examples-heading">{industry.name} projects.</span>} />
          <div className="grid gap-10 md:grid-cols-2">
            {examples.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </Section>
      )}

      <Section tone={examples.length ? "mist" : "light"} aria-labelledby="other-industries" className="py-20 md:py-24">
        <SectionHeader eyebrow="More industries" title={<span id="other-industries">Explore other industries.</span>} className="mb-10 md:mb-12" />
        <ul className="flex flex-wrap gap-2">
          {others.map((i) => (
            <li key={i.slug}>
              <Link href={`/industries/${i.slug}`} className="inline-flex items-center gap-2 rounded-full border border-mist-200 bg-white px-4 py-2 text-sm text-mist-700 transition-colors hover:border-ink-900 hover:text-ink-900">
                <Icon name={i.icon} className="size-4 text-brand-600" />
                {i.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/industries" className="inline-flex rounded-full px-4 py-2 text-sm font-medium text-brand-700">
              All industries →
            </Link>
          </li>
        </ul>
      </Section>

      <CtaBanner title={`Grow your ${lowerTitle(industry.name)} business online.`} primary={{ label: "Get a Free Consultation", href: `/contact?industry=${industry.slug}` }} secondary={{ label: "Explore Services", href: "/services" }} />
    </>
  );
}
