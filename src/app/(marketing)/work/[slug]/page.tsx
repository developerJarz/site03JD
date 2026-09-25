import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { ImageReveal, Reveal } from "@/components/animations/reveal";
import { ProjectCard, categoryLabel } from "@/components/marketing/cards";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ViewTracker } from "@/components/marketing/view-tracker";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { getProjectBySlug, getProjects } from "@/lib/data/public";
import { sanitizeRichText } from "@/lib/security/sanitize";
import { buildMetadata, projectSchema } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return buildMetadata({
    title: project.seo.title || `${project.client} — Case Study`,
    description: project.seo.description || project.summary,
    path: `/work/${project.slug}`,
    image: project.coverImage.src,
    seo: project.seo,
  });
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const [project, all] = await Promise.all([getProjectBySlug(slug), getProjects()]);
  if (!project) notFound();

  const related = all
    .filter((p) => p.slug !== project.slug)
    .map((p) => ({ p, score: p.categories.filter((c) => project.categories.includes(c)).length + (p.industry?.slug && p.industry.slug === project.industry?.slug ? 2 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((x) => x.p);

  const facts = [
    { label: "Client", value: project.client },
    project.location && { label: "Location", value: project.location },
    project.industry && { label: "Industry", value: <Link href={`/industries/${project.industry.slug}`} className="link-underline">{project.industry.title}</Link> },
    project.year && { label: "Year", value: String(project.year) },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <>
      <JsonLd data={projectSchema(project)} />
      <ViewTracker type="project" slug={project.slug} />

      <PageHero
        eyebrow={project.categories.map(categoryLabel).join(" · ")}
        title={project.client}
        description={project.summary}
        crumbs={[
          { name: "Work", path: "/work" },
          { name: project.client, path: `/work/${project.slug}` },
        ]}
      >
        <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="eyebrow text-white/55">{f.label}</dt>
              <dd className="mt-2 text-white/85">{f.value}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      <section className="bg-ink-950 pb-16" aria-label="Project cover">
        <div className="container-page">
          <ImageReveal className="relative aspect-[1137/798] rounded-[28px] bg-ink-900">
            <Image src={project.coverImage.src} alt={project.coverImage.alt} fill loading="eager" fetchPriority="high" sizes="(min-width: 1320px) 1240px, 100vw" className="object-cover" />
          </ImageReveal>
        </div>
      </section>

      <Section tone="light" aria-labelledby="about-project">
        <div className="grid gap-14 lg:grid-cols-12">
          <aside className="space-y-8 lg:col-span-4">
            <div>
              <p className="eyebrow text-mist-500">Services</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.services.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className="inline-flex rounded-full border border-mist-200 px-3.5 py-1.5 text-sm text-mist-700 transition-colors hover:border-ink-900 hover:text-ink-900">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {project.technologies.length > 0 && (
              <div>
                <p className="eyebrow text-mist-500">Technologies & platforms</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.technologies.map((t) => (
                    <li key={t} className="rounded-full bg-mist-50 px-3.5 py-1.5 text-sm text-mist-700">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.websiteUrl && (
              <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-brand-700">
                Visit website <ExternalLink className="size-4" aria-hidden />
              </a>
            )}
          </aside>
          <div className="lg:col-span-7 lg:col-start-6">
            <h2 id="about-project" className="font-display text-display-sm font-semibold tracking-display text-ink-900">
              About the project
            </h2>
            <div className="prose-jarz mt-8" dangerouslySetInnerHTML={{ __html: sanitizeRichText(project.description) }} />
            {project.results.length > 0 && (
              <dl className="mt-12 grid grid-cols-2 gap-4">
                {project.results.map((r) => (
                  <div key={r.label} className="rounded-3xl bg-mist-50 p-6">
                    <dd className="font-display text-4xl font-semibold tracking-tight text-ink-900">{r.value}</dd>
                    <dt className="mt-1 text-sm text-mist-600">{r.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </Section>

      {project.gallery.length > 0 && (
        <Section tone="mist" aria-labelledby="gallery-heading">
          <SectionHeader eyebrow="Gallery" title={<span id="gallery-heading">Across every channel.</span>} />
          <div className="grid gap-6 md:grid-cols-2">
            {project.gallery.map((img, i) => (
              <Reveal key={img.src} delay={(i % 2) * 0.1} className={i === 0 && project.gallery.length % 2 === 1 ? "md:col-span-2" : ""}>
                <figure className="overflow-hidden rounded-[28px] bg-white ring-1 ring-mist-200">
                  <Image src={img.src} alt={img.alt} width={img.width ?? 1600} height={img.height ?? 1123} sizes="(min-width: 768px) 50vw, 100vw" className="h-auto w-full" />
                  <figcaption className="px-6 py-4 text-sm text-mist-600">{img.alt}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {project.beforeAfter && project.beforeAfter.src !== project.coverImage.src && (
        <Section tone="light" aria-labelledby="ba-heading">
          <SectionHeader eyebrow="Before & after" title={<span id="ba-heading">The redesign.</span>} description="Previous website on the left, the Jarz Digital redesign on the right." />
          <div className="overflow-hidden rounded-[28px] border border-mist-200 bg-gradient-to-br from-mist-50 to-white">
            <Image src={project.beforeAfter.src} alt={project.beforeAfter.alt} width={1600} height={900} sizes="100vw" className="h-auto w-full" />
          </div>
        </Section>
      )}

      {related.length > 0 && (
        <Section tone="light" aria-labelledby="more-work" className="border-t border-mist-200">
          <SectionHeader
            eyebrow="More work"
            title={<span id="more-work">Related projects.</span>}
            action={
              <ButtonLink href="/work" variant="outline" arrow>
                All projects
              </ButtonLink>
            }
          />
          <div className="grid gap-10 md:grid-cols-2">
            {related.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </Section>
      )}

      <CtaBanner title="Want results like this for your business?" primary={{ label: "Start a Project", href: "/contact?intent=project" }} secondary={{ label: "Explore services", href: "/services" }} />
    </>
  );
}
