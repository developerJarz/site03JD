import { Analytics } from "@/components/analytics/analytics";
import { JsonLd } from "@/components/marketing/json-ld";
import { Footer } from "@/components/navigation/footer";
import { Navbar } from "@/components/navigation/navbar";
import { getIndustries, getServices, getSiteSettings, getTeam } from "@/lib/data/public";
import { isFounder, organizationSchema, websiteSchema } from "@/lib/seo";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [settings, services, industries, team] = await Promise.all([getSiteSettings(), getServices(), getIndustries(), getTeam()]);

  const navData = {
    services: services.map((s) => ({ slug: s.slug, title: s.title, tagline: s.tagline, icon: s.icon, group: s.category?.title ?? "Services" })),
    industries: industries.map((i) => ({ slug: i.slug, name: i.name, icon: i.icon })),
    phone: settings.contact.phone,
    email: settings.contact.email,
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
      <Analytics />
    </>
  );
}
