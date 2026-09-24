import type { Office, SiteSettings } from "@/types/content";
import { slugify } from "@/lib/utils";

/** URL segment for an office’s location page. */
export const officeSlug = (o: Office) => o.slug?.trim() || slugify(o.city);

export const officePath = (o: Office) => `/locations/${officeSlug(o)}`;

/** Offices that have a public location page. */
export const locationOffices = (s: Pick<SiteSettings, "offices">) => s.offices.filter((o) => !o.hidePage);

export const countryCode = (country: string) => (/canada/i.test(country) ? "CA" : /bangladesh/i.test(country) ? "BD" : /united states|usa/i.test(country) ? "US" : country);

/** Country names from the offices, in office order, without repeats. */
export const officeCountries = (s: Pick<SiteSettings, "offices">) => Array.from(new Set(s.offices.map((o) => o.country)));
