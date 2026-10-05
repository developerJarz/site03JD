import { abs, faqSchema, SITE_URL } from "@/lib/seo";
import { cityPath, placeOf, type CountrySite } from "@/content/country-sites";
import type { City, Faq } from "@/content/country-sites/site/content";
import type { SiteData } from "@/content/country-sites/site/sitedata";

/**
 * Structured data for a country page, ported from the source's site/seo.ts. The site layout already
 * emits Organization and WebSite, office LocalBusiness markup lives on /locations, and <Breadcrumbs>
 * emits the BreadcrumbList, so this adds only the regional unit, the service catalogue and the FAQ.
 */
const ORG_ID = `${SITE_URL}/#organization`;
const KNOWS = ["Local SEO", "Google Ads", "Local Services Ads", "AI SEO", "Generative engine optimization", "ChatGPT SEO", "AI agents", "AI receptionist", "Business automation", "Website design", "Web application development"];

const unitId = (site: CountrySite) => `${abs(site.path)}#${site.data.market}`;
const providerId = (site: CountrySite) => (site.data.regional ? unitId(site) : ORG_ID);

function regionalOrg(site: CountrySite) {
  const D = site.data;
  const r = D.regional!;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": unitId(site),
    name: r.name,
    parentOrganization: { "@id": ORG_ID },
    url: abs(site.path),
    ...(r.locality ? { location: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: r.locality, ...(r.region ? { addressRegion: r.region } : {}), addressCountry: D.geoCountry } } } : {}),
    areaServed: [...D.cities.map((c) => (c.display ? { "@type": "State", name: c.name } : { "@type": "City", name: c.stateCode ? `${c.name}, ${c.stateCode}` : c.name })), { "@type": "Country", name: r.countryName }],
    knowsAbout: KNOWS,
  };
}

const catalog = (site: CountrySite, D: SiteData, area: unknown) => ({
  "@type": "OfferCatalog",
  name: "Digital marketing services",
  itemListElement: D.services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.name, description: s.tagline, provider: { "@id": providerId(site) }, areaServed: area } })),
});

const faq = (faqs: Faq[]) => faqSchema(faqs.map((f) => ({ question: f.q, answer: f.a })));

export function countrySchema(site: CountrySite, city?: City) {
  const D = site.data;
  const country = D.regional?.countryName ?? "United States";
  const area = !city
    ? { "@type": "Country", name: country }
    : city.display
      ? { "@type": "State", name: city.name, containedInPlace: { "@type": "Country", name: country } }
      : { "@type": "City", name: placeOf(city), containedInPlace: { "@type": city.state === city.name ? "Country" : "State", name: city.state } };
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: city ? `Local SEO and Google Ads in ${placeOf(city)}` : `Local SEO, Google Ads and web design for businesses in ${D.market === "us" ? "the United States" : country}`,
    ...(city ? { serviceType: ["Local SEO", "Google Ads management", "AI SEO", "AI receptionist", "Website design"] } : {}),
    url: abs(city ? cityPath(site, city) : site.path),
    provider: { "@id": providerId(site) },
    areaServed: area,
    hasOfferCatalog: catalog(site, D, area),
  };
  return [...(D.regional ? [regionalOrg(site)] : []), service, faq(D.faqsFor(city ? city.id : D.homeId))];
}
