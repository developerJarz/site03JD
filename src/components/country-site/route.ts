import "server-only";
import type { Metadata } from "next";
import { cityPath, findCity, pageTitle, type CountrySite } from "@/content/country-sites";
import { pageMetadata } from "@/lib/seo/page";

/** Every city of a country, for generateStaticParams. */
export const cityParams = (site: CountrySite) => site.data.cities.map((c) => ({ city: c.slug }));

/**
 * Title and description from the country bundle; the site title template adds “| Jarz Digital”
 * and Admin → SEO overrides apply as on every built-in page. City pages add geo meta tags.
 */
export async function countryMetadata(site: CountrySite, citySlug?: string): Promise<Metadata> {
  const D = site.data;
  const city = citySlug ? findCity(site, citySlug) : undefined;
  if (citySlug && !city) return {};
  if (!city) return pageMetadata(site.path, { title: pageTitle(D.home.title), description: D.home.description });
  const meta = await pageMetadata(cityPath(site, city), { title: pageTitle(city.title), description: city.description });
  return {
    ...meta,
    other: {
      "geo.region": `${D.geoCountry}${city.stateCode ? `-${city.stateCode}` : ""}`,
      "geo.placename": city.name,
      "geo.position": `${city.geo.lat};${city.geo.lng}`,
    },
  };
}
