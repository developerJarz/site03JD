import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { SOCIAL_ICONS, WhatsappIcon } from "@/components/ui/brand-icons";
import { Logo } from "@/components/ui/logo";
import type { Industry, Service, SiteSettings } from "@/types/content";
import { NewsletterForm } from "./newsletter-form";

export function Footer({ settings, services, industries }: { settings: SiteSettings; services: Service[]; industries: Industry[] }) {
  const { contact, offices, socials, general } = settings;
  const socialEntries = (Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[]).filter((k) => socials[k]);
  const year = new Date().getFullYear();

  const columns: { title: string; links: { label: string; href: string }[] }[] = [
    { title: "Services", links: services.map((s) => ({ label: s.shortTitle || s.title, href: `/services/${s.slug}` })) },
    {
      title: "Industries",
      links: [...industries.slice(0, 7).map((i) => ({ label: i.name, href: `/industries/${i.slug}` })), { label: "All industries →", href: "/industries" }],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Our work", href: "/work" },
        { label: "Team", href: "/about#team" },
        { label: "Pricing", href: "/pricing" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Insights", href: "/blog" },
        { label: "Before & after", href: "/work#before-after" },
        { label: "FAQ", href: "/contact#faq" },
        { label: "Client dashboard", href: "/dashboard" },
      ],
    },
  ];

  return (
    <footer className="theme-dark relative overflow-hidden bg-ink-950 text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />

      <div className="container-page pb-10 pt-20 md:pt-24">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo tone="dark" />
            <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-white/60">
              {general.tagline.charAt(0).toUpperCase() + general.tagline.slice(1)}. Web design, Local SEO, ads and business management for brands across the USA, Canada and Europe.
            </p>

            <div className="mt-8 max-w-sm">
              <p className="text-sm font-medium text-white">Get growth insights in your inbox</p>
              <p className="mt-1 text-sm text-white/50">Occasional guides on local SEO and digital growth. No spam.</p>
              <NewsletterForm />
            </div>

            {socialEntries.length > 0 && (
              <ul className="mt-8 flex gap-2" aria-label="Social media">
                {socialEntries.map((key) => {
                  const { Icon, label } = SOCIAL_ICONS[key];
                  return (
                    <li key={key}>
                      <a
                        href={socials[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-brand-400 hover:text-brand-300"
                      >
                        <Icon className="size-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="eyebrow text-white/40">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link href={l.href} className="link-underline text-[0.92rem] text-white/70 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 grid gap-8 border-t border-white/[0.08] pt-10 md:grid-cols-2 lg:grid-cols-4">
          {offices
            .filter((o) => o.image)
            .map((o) => (
              <div key={o.code}>
                <p className="font-display text-3xl font-semibold tracking-tight text-white/90">{o.code}</p>
                <p className="mt-2 flex items-start gap-2 text-sm text-white/55">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  {o.address}
                </p>
              </div>
            ))}
          <div className="space-y-2.5 text-sm">
            <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-white/70 hover:text-white">
              <Mail className="size-3.5" aria-hidden /> {contact.email}
            </a>
            <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2 text-white/70 hover:text-white">
              <Phone className="size-3.5" aria-hidden /> {contact.phone}
            </a>
            <a
              href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/70 hover:text-white"
            >
              <WhatsappIcon className="size-3.5" /> WhatsApp {contact.whatsapp}
            </a>
            <p className="text-white/45">{contact.mailingAddress}</p>
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse gap-4 border-t border-white/[0.08] pt-8 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {general.siteName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="hover:text-white">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/sitemap.xml" className="hover:text-white">
                Sitemap
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <p aria-hidden className="pointer-events-none select-none overflow-hidden whitespace-nowrap px-4 text-center font-display text-[20vw] font-semibold leading-[0.8] tracking-[-0.06em] text-white/[0.035]">
        Jarz Digital
      </p>
    </footer>
  );
}
