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

const US_STATES: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT", Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
};
const CA_PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];

/** Country of a project location such as "Dallas, TX", "Richmond Hill, ON" or "Bangladesh". */
function countryOf(location: string): string | undefined {
  const code = location.match(/,\s*([A-Z]{2})\s*$/)?.[1];
  if (code && CA_PROVINCES.includes(code)) return "Canada";
  if (code && Object.values(US_STATES).includes(code)) return "United States";
  return ["Canada", "Bangladesh", "United States"].find((c) => location.toLowerCase().includes(c.toLowerCase()));
}

/**
 * Where an office’s "local work" may come from: the state for US offices
 * (a Dallas page shouldn’t list Miami clients), the whole country elsewhere.
 */
export function officeArea(o: Office): { label: string; matches: (location?: string) => boolean } {
  const city = o.city.toLowerCase();
  if (countryCode(o.country) === "US") {
    const state = US_STATES[o.region] ?? o.region;
    return {
      label: o.region,
      matches: (loc) => !!loc && (loc.toLowerCase().includes(city) || new RegExp(`,\\s*(${state}|${o.region})\\s*$`, "i").test(loc)),
    };
  }
  return { label: o.country, matches: (loc) => !!loc && (loc.toLowerCase().includes(city) || countryOf(loc) === o.country) };
}
