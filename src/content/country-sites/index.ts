/**
 * Country sites (USA, Canada; UK next): long-form landing pages with the Google Ads
 * calculator, ported from the standalone build in site-imports/jarz-digital-usa.
 *
 * Everything under site/, us/ and ca/ is copied from that build's source/src and kept
 * as close to verbatim as possible, so a new version can be dropped in file by file.
 * This module is the only bridge to the Next app: routes, paths and image locations.
 */
import type { City } from "./site/content";
import type { SiteData } from "./site/sitedata";
import { CA_DATA } from "./site/ca";
import { US_DATA } from "./site/us-data";

export type CountryKey = "usa" | "canada";

export interface CountrySite {
  key: CountryKey;
  /** Route of the country homepage; city pages live at `${path}/${city.slug}`. */
  path: string;
  /** Short name for breadcrumbs and the homepage location row. */
  name: string;
  data: SiteData;
}

export const COUNTRY_SITES: Record<CountryKey, CountrySite> = {
  usa: { key: "usa", path: "/usa", name: "USA", data: US_DATA },
  canada: { key: "canada", path: "/canada", name: "Canada", data: CA_DATA },
};

export const cityPath = (site: CountrySite, city: City) => `${site.path}/${city.slug}`;
export const findCity = (site: CountrySite, slug: string) => site.data.cities.find((c) => c.slug === slug);

/** “Dallas, TX”, or the city’s own display name (“Alberta”). */
export const placeOf = (c: City) => c.display ?? `${c.name}, ${c.stateCode}`;

/** The source serves proof screenshots from /img/…; here they live in public/images/country/. */
export const countryImage = (src: string) => src.replace(/^\/img\//, "/images/country/");

/** Source titles end in “| Jarz Digital”; the site's title template adds that itself. */
export const pageTitle = (title: string) => title.replace(/\s*\|\s*Jarz Digital$/, "");

/** Every country page with its default SEO, for the sitemap and Admin → SEO → Page SEO. */
export const COUNTRY_PAGES = Object.values(COUNTRY_SITES).flatMap((site) => [
  { path: site.path, label: `${site.name} (country page)`, title: pageTitle(site.data.home.title), description: site.data.home.description },
  ...site.data.cities.map((c) => ({ path: cityPath(site, c), label: `${site.name} · ${placeOf(c)}`, title: pageTitle(c.title), description: c.description })),
]);
