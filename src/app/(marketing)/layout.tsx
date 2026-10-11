import { Analytics } from "@/components/analytics/analytics";
import { WhatsAppFloat } from "@/components/marketing/whatsapp-float";
import { JsonLd } from "@/components/marketing/json-ld";
import { Footer } from "@/components/navigation/footer";
import { Navbar } from "@/components/navigation/navbar";
import { getIndustries, getServices, getSiteSettings, getTeam } from "@/lib/data/public";
import { isFounder, organizationSchema, websiteSchema } from "@/lib/seo";
import { locationOffices, officePath } from "@/lib/seo/locations";
import { WHATSAPP_INTERNATIONAL, whatsappFor } from "@/config/contact";
import { COUNTRY_SITES } from "@/content/country-sites";
import { BUILDER_NAV, withBuilderLink } from "@/lib/ecommerce-builder/constants";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [settings, services, industries, team] = await Promise.all([getSiteSettings(), getServices(), getIndustries(), getTeam()]);

  // USA/Canada pages and the offices outside Bangladesh use the international WhatsApp line.
  const intlPaths = [...Object.values(COUNTRY_SITES).map((s) => s.path), ...locationOffices(settings).filter((o) => whatsappFor(o.country) === WHATSAPP_INTERNATIONAL).map(officePath)];

  const navData = {
    services: withBuilderLink(
      services.map((s) => ({ slug: s.slug, title: s.title, tagline: s.tagline, icon: s.icon, group: s.category?.title ?? "Services" })),
      (web) => ({ slug: BUILDER_NAV.slug, title: BUILDER_NAV.title, tagline: BUILDER_NAV.tagline, icon: BUILDER_NAV.icon, group: web?.group ?? "Services" }),
    ),
    industries: industries.map((i) => ({ slug: i.slug, name: i.name, icon: i.icon })),
    phone: settings.contact.phone,
    email: settings.contact.email,
    whatsapp: settings.contact.whatsapp,
    intlPaths,
  };

  return (
    <>
      {/* Site-wide entities only; each office’s LocalBusiness markup lives on its own /locations page. */}
      <JsonLd data={[organizationSchema(settings, team.find(isFounder)), websiteSchema(settings)]} />
      <Navbar data={navData} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer settings={settings} services={services} industries={industries} />
      <WhatsAppFloat number={settings.contact.whatsapp} intlPaths={intlPaths} />
      <Analytics />
    </>
  );
}
