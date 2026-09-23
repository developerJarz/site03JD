import { JsonLd } from "@/components/marketing/json-ld";
import { Footer } from "@/components/navigation/footer";
import { Navbar } from "@/components/navigation/navbar";
import { getIndustries, getServices, getSiteSettings } from "@/lib/data/public";
import { localBusinessSchemas, organizationSchema, websiteSchema } from "@/lib/seo";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [settings, services, industries] = await Promise.all([getSiteSettings(), getServices(), getIndustries()]);

  const navData = {
    services: services.map((s) => ({ slug: s.slug, title: s.title, tagline: s.tagline, icon: s.icon, group: s.category?.title ?? "Services" })),
    industries: industries.map((i) => ({ slug: i.slug, name: i.name, icon: i.icon })),
    phone: settings.contact.phone,
    email: settings.contact.email,
  };

  return (
    <>
      <JsonLd data={[organizationSchema(settings), websiteSchema(settings), ...localBusinessSchemas(settings)]} />
      <Navbar data={navData} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer settings={settings} services={services} industries={industries} />
    </>
  );
}
