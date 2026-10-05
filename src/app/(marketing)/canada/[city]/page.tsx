import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CountryPage } from "@/components/country-site/country-page";
import { cityParams, countryMetadata } from "@/components/country-site/route";
import { COUNTRY_SITES, findCity } from "@/content/country-sites";

export const revalidate = 3600;
export const dynamicParams = false;

const site = COUNTRY_SITES.canada;

export function generateStaticParams() {
  return cityParams(site);
}

export async function generateMetadata({ params }: PageProps<"/canada/[city]">): Promise<Metadata> {
  return countryMetadata(site, (await params).city);
}

export default async function Page({ params }: PageProps<"/canada/[city]">) {
  const city = findCity(site, (await params).city);
  if (!city) notFound();
  return <CountryPage site={site} city={city} />;
}
