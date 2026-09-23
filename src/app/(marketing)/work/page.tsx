import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { Marquee } from "@/components/animations/marquee";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { BeforeAfterShowcase } from "@/components/sections/before-after";
import { WorkExplorer } from "@/components/sections/work-explorer";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { beforeAfterShowcase } from "@/content/seed";
import { getIndustries, getProjects } from "@/lib/data/public";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Our Work — Web Design, Local SEO & Business Management Portfolio",
  description: "Recent Jarz Digital projects in web design & development, local SEO, business management and social media marketing across the USA and Canada.",
  path: "/work",
});

const CLIENT_LOGOS = [
  { src: "/images/clients/client-27.png", alt: "Honest Abe Roofing logo" },
  { src: "/images/clients/client-12.png", alt: "Cashing Carz logo" },
  { src: "/images/clients/client-06.png", alt: "Doorstep Spa logo" },
  { src: "/images/clients/client-18.png", alt: "SORS logo" },
];

export default async function WorkPage() {
  const [projects, industries] = await Promise.all([getProjects(), getIndustries()]);

  return (
    <>
      <PageHero
        eyebrow="Our work"
        title="Websites and growth systems for real businesses."
        titleLines={["Websites and growth", "systems for real businesses."]}
        description="Our recent projects in web design & development, Local SEO, business management and social media marketing — for clients across all business categories."
        crumbs={[{ name: "Work", path: "/work" }]}
        actions={
          <ButtonLink href="/contact?intent=project" size="lg" arrow>
            Start a Project
          </ButtonLink>
        }
      />

      <Section tone="light" aria-label="Projects" className="pt-16 md:pt-20">
        <Suspense fallback={<div className="h-96 skeleton" />}>
          <WorkExplorer projects={projects} industries={industries.map((i) => ({ slug: i.slug, name: i.name }))} />
        </Suspense>
      </Section>

      <section aria-label="Client logos" className="border-y border-mist-200 bg-white py-12">
        <p className="eyebrow mb-8 text-center text-mist-500">Clients across all business categories</p>
        <Marquee duration={30}>
          {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((l, i) => (
            <Image key={i} src={l.src} alt={i < CLIENT_LOGOS.length ? l.alt : ""} width={240} height={72} className="mx-10 h-14 w-auto object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0" />
          ))}
        </Marquee>
      </section>

      <Section tone="mist" id="before-after" aria-labelledby="ba-heading">
        <SectionHeader eyebrow="Before & after" title={<span id="ba-heading">Featured website redesigns.</span>} description="Our web design team reimagines digital experiences for brands of all sizes and across industries." />
        <BeforeAfterShowcase items={beforeAfterShowcase} projectSlugs={projects.map((p) => p.slug)} />
      </Section>

      <CtaBanner title="Your project could be next." primary={{ label: "Start a Project", href: "/contact?intent=project" }} secondary={{ label: "Explore Our Services", href: "/services" }} />
    </>
  );
}
