import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone, Video } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Accordion } from "@/components/ui/accordion";
import { WhatsappIcon } from "@/components/ui/brand-icons";
import { Section, SectionHeader } from "@/components/ui/section";
import { getFaqs, getServices, getSiteSettings } from "@/lib/data/public";
import { buildMetadata, faqSchema } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Contact Jarz Digital — Let’s Grow Your Business Together",
  description: "Request a quote or a free consultation. Offices in Dallas, Denver and Calgary — we respond within 24 hours. Call +1 267-766-9055 or email info@jarzdigital.com.",
  path: "/contact",
});

export default async function ContactPage() {
  const [settings, services, faqs] = await Promise.all([getSiteSettings(), getServices(), getFaqs("contact")]);
  const { contact, offices } = settings;
  const tel = contact.phone.replace(/[^+\d]/g, "");

  const channels = [
    { Icon: Phone, title: "Phone", value: contact.phone, href: `tel:${tel}`, note: "Available 24/7 for urgent matters" },
    { Icon: Mail, title: "Email", value: contact.email, href: `mailto:${contact.email}`, note: contact.responseTime },
    { Icon: WhatsappIcon, title: "WhatsApp", value: contact.whatsapp, href: `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`, note: "Message our team directly" },
    { Icon: Video, title: "Video call", value: "Zoom, Google Meet or Teams", href: "#contact-form", note: "Schedule a consultation" },
  ];

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <PageHero
        eyebrow="Get in touch"
        title="Let’s start your digital journey."
        titleLines={["Let’s start your", "digital journey."]}
        description="Ready to transform your business with expert digital marketing? Get in touch for a free consultation and discover how we can drive your success."
        crumbs={[{ name: "Contact", path: "/contact" }]}
      >
        <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
          {[
            ["24hrs", "Response time"],
            [String(offices.filter((o) => o.image).length), "Office locations"],
            ["24/7", "Support available"],
            ["Free", "Initial consultation"],
          ].map(([v, l]) => (
            <div key={l}>
              <dd className="font-display text-3xl font-semibold tracking-tight text-white">{v}</dd>
              <dt className="mt-1 text-sm text-white/50">{l}</dt>
            </div>
          ))}
        </dl>
      </PageHero>

      <Section tone="mist" id="contact-form" aria-labelledby="form-heading">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 id="form-heading" className="font-display text-display-sm font-semibold tracking-display text-ink-900">
              Send us a message
            </h2>
            <p className="mb-10 mt-4 max-w-xl text-lg text-mist-600">Fill out the form and we’ll get back to you within 24 hours with a customized strategy for your business.</p>
            <Suspense fallback={<div className="h-[720px] rounded-[28px] skeleton" />}>
              <ContactForm services={services.map((s) => ({ slug: s.slug, title: s.title }))} />
            </Suspense>
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-[28px] border border-mist-200 bg-white p-6 md:p-8">
              <h3 className="font-display text-xl font-semibold tracking-tight text-ink-900">Get in touch directly</h3>
              <ul className="mt-6 divide-y divide-mist-100">
                {channels.map(({ Icon, title, value, href, note }) => (
                  <li key={title}>
                    <a href={href} className="group flex items-start gap-4 py-4" {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-mist-50 text-brand-700 transition-colors group-hover:bg-ink-900 group-hover:text-brand-300">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span>
                        <span className="block text-sm text-mist-500">{title}</span>
                        <span className="block font-medium text-ink-900">{value}</span>
                        <span className="block text-xs text-mist-500">{note}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="theme-dark rounded-[28px] bg-ink-900 p-6 md:p-8">
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-white">
                <Clock className="size-5 text-brand-300" aria-hidden /> Business hours
              </h3>
              <dl className="mt-6 space-y-3 text-sm">
                {contact.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-4 border-b border-white/10 pb-3 last:border-0">
                    <dt className="text-white/60">{h.days}</dt>
                    <dd className="font-medium text-white">{h.hours}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 flex items-center gap-2 text-xs text-white/50">
                <MessageCircle className="size-3.5" aria-hidden /> Emergency support available 24/7 for existing clients
              </p>
            </div>
          </aside>
        </div>
      </Section>

      <Section tone="light" aria-labelledby="offices-heading">
        <SectionHeader eyebrow="Our office locations" title={<span id="offices-heading">Offices across North America — and a global team.</span>} description="Visit us or connect virtually from anywhere in the world." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {offices.map((o) => (
            <div key={o.code} className="rounded-3xl border border-mist-200 p-6">
              <p className="font-mono text-sm text-brand-700">{o.code}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">{o.city}</h3>
              <p className="text-sm text-mist-500">{o.country}</p>
              <ul className="mt-5 space-y-2 text-sm text-mist-700">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  {o.address}
                </li>
                <li>
                  <a href={`tel:${o.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2 hover:text-ink-900">
                    <Phone className="size-4 text-brand-600" aria-hidden /> {o.phone}
                  </a>
                </li>
                {o.email && (
                  <li>
                    <a href={`mailto:${o.email}`} className="flex items-center gap-2 hover:text-ink-900">
                      <Mail className="size-4 text-brand-600" aria-hidden /> {o.email}
                    </a>
                  </li>
                )}
              </ul>
              {o.mapQuery && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.mapQuery)}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-sm font-medium text-brand-700 underline-offset-4 hover:underline">
                  Get directions →
                </a>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section tone="mist" id="faq" aria-labelledby="faq-heading">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader eyebrow="FAQ" title={<span id="faq-heading">Quick answers about working with us.</span>} className="mb-0 md:mb-0" />
          </div>
          <div className="lg:col-span-8">
            <Accordion items={faqs} />
          </div>
        </div>
      </Section>
    </>
  );
}
