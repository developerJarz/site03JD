import type { Metadata } from "next";
import { CountryPage } from "@/components/country-site/country-page";
import { countryMetadata } from "@/components/country-site/route";
import { COUNTRY_SITES } from "@/content/country-sites";

export const revalidate = 3600;

const site = COUNTRY_SITES.canada;

export async function generateMetadata(): Promise<Metadata> {
  return countryMetadata(site);
}

export default function Page() {
  return <CountryPage site={site} />;
}
