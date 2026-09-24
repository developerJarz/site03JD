import type { Metadata } from "next";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { IndustriesGrid } from "@/components/sections/industries-grid";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { getIndustries } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo/page";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/industries");
}

export default async function IndustriesPage() {
  const industries = await getIndustries();
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Web design and growth, tailored to your industry."
        titleLines={["Web design and growth,", "tailored to your industry."]}
        description="Every market buys differently. We shape websites, local search and campaigns around how customers in your industry actually search, compare and decide."
        crumbs={[{ name: "Industries", path: "/industries" }]}
        actions={
          <ButtonLink href="/contact?intent=project" size="lg" arrow>
            Talk to Our Team
          </ButtonLink>
        }
      />
      <Section tone="mist" aria-label="Industries we serve">
        <IndustriesGrid industries={industries} variant="detailed" />
      </Section>
      <CtaBanner title="Don’t see your industry?" description="We work with businesses in all categories. Tell us about yours and we’ll show you how we’d approach it." primary={{ label: "Get a Free Consultation", href: "/contact" }} secondary={{ label: "View Our Work", href: "/work" }} />
    </>
  );
}
