import type { Metadata } from "next";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { Locations } from "@/components/sections/locations";
import { Section, SectionHeader } from "@/components/ui/section";
import { getSiteSettings } from "@/lib/data/public";
import { officeCountries } from "@/lib/seo/locations";
import { pageMetadata } from "@/lib/seo/page";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/locations");
}

export default async function LocationsPage() {
  const settings = await getSiteSettings();
  const countries = officeCountries(settings);
  const list = (items: string[]) => (items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : items[0]);

  return (
    <>
      <PageHero
        eyebrow="Our offices"
        title={`${settings.offices.length} offices. One team.`}
        description={`Jarz Digital works from ${list(settings.offices.map((o) => o.city))} — serving businesses in ${list(countries)} and clients worldwide.`}
        crumbs={[{ name: "Locations", path: "/locations" }]}
      />
      <Section tone="light" aria-labelledby="offices-heading">
        <SectionHeader eyebrow="Locations" title={<span id="offices-heading">Find the office nearest you.</span>} description="Each office page lists the address, direct contacts and the services available to local businesses." />
        <Locations offices={settings.offices} />
      </Section>
      <CtaBanner />
    </>
  );
}
