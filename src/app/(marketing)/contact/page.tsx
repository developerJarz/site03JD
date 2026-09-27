import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone, Video } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { ContactChannels } from "@/components/marketing/contact-channels";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { WhatsAppButton } from "@/components/marketing/whatsapp";
import { Accordion } from "@/components/ui/accordion";
import { WhatsappIcon } from "@/components/ui/brand-icons";
import { Section, SectionHeader } from "@/components/ui/section";
import { publicUrl, telHref, whatsappDisplay, whatsappLink, whatsappMessage } from "@/config/contact";
import { getFaqs, getServices, getSiteSettings } from "@/lib/data/public";
import { faqSchema } from "@/lib/seo";
import { officePath } from "@/lib/seo/locations";
import { pageMetadata } from "@/lib/seo/page";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/contact");
}

const FROM = "Contact page";

export default async function ContactPage() {
  const [settings, services, faqs] = await Promise.all([getSiteSettings(), getServices(), getFaqs("contact")]);
  const { contact, offices } = settings;
  const waHref = whatsappLink(contact.whatsapp, whatsappMessage({ intent: "I’d like to talk about a project.", from: `${FROM} — ${publicUrl("/contact")}` }));

  const channels = [
    { Icon: Phone, title: "Phone", value: contact.phone, href: telHref(contact.phone), note: "Available 24/7 for urgent matters" },
    { Icon: Mail, title: "Email", value: contact.email, href: `mailto:${contact.email}`, note: contact.responseTime },
    { Icon: WhatsappIcon, title: "WhatsApp", value: whatsappDisplay(contact), href: waHref, note: "Message our team directly" },
    { Icon: Video, title: "Video call", value: "Zoom, Google Meet or Teams", href: "#contact-form", note: "Schedule a consultation" },
  ];

  const steps = [
    { title: "Tell us what you need", text: "Send a WhatsApp message, call, email or use the form. A few lines about your business, your goals and your website (if you have one) is enough to start." },
    { title: "Free consultation", text: "We review your website, Google Business Profile and competitors, then talk through what will move the needle — a new website, local SEO, Google Ads or a full monthly package." },
    { title: "A clear plan and price", text: "You get a written plan with the work, timeline and monthly or one-time price. Monthly plans such as Local SEO and business management have no long-term contract." },
    { title: "We get to work", text: "Your dedicated team builds, optimises and reports on progress, and stays one WhatsApp message away for questions." },
  ];

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <PageHero
        eyebrow="Contact Jarz Digital"
        eyebrowInTitle
        title="Let’s start your digital journey."
        titleLines={["Let’s start your", "digital journey."]}
        description="Ready to grow your business with expert web design, local SEO and digital marketing? Message us on WhatsApp, call, email or send a request — the first consultation is free."
        crumbs={[{ name: "Contact", path: "/contact" }]}
        actions={
          <>
            <WhatsAppButton number={contact.whatsapp} intent="I’d like a free consultation." from={FROM} path="/contact" showNumber={contact.phone}>
              WhatsApp us
            </WhatsAppButton>
            <a href={telHref(contact.phone)} className="inline-flex h-14 items-center gap-2 rounded-full border border-white/20 px-7 font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-ink-900">
              <Phone className="size-4" aria-hidden /> Call {contact.phone}
            </a>
          </>
        }
      >
        <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
          {[
            ["24hrs", "Response time"],
            [String(offices.length), "Office locations"],
            ["24/7", "Support available"],
            ["Free", "Initial consultation"],
          ].map(([v, l]) => (
            <div key={l}>
              <dd className="font-display text-3xl font-semibold tracking-tight text-white">{v}</dd>
              <dt className="mt-1 text-sm text-white/60">{l}</dt>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Order | Send request | Facebook | WhatsApp */}
      <Section tone="light" aria-labelledby="start-heading" className="py-16 md:py-20">
        <SectionHeader eyebrow="Ways to start" title={<span id="start-heading">Choose how you’d like to start.</span>} className="mb-10 md:mb-12" />
        <ContactChannels settings={settings} from={FROM} path="/contact" />
      </Section>

      <Section tone="mist" id="contact-form" aria-labelledby="form-heading">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 id="form-heading" className="font-display text-display-sm font-semibold tracking-display text-ink-900">
              Send us a request
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
              <p className="mt-5 flex items-center gap-2 text-xs text-white/60">
                <MessageCircle className="size-3.5" aria-hidden /> Emergency support available 24/7 for existing clients
              </p>
            </div>
          </aside>
        </div>
      </Section>

      {/* What happens next — plain-language answer to "how do I hire a web design / SEO agency" */}
      <Section tone="light" aria-labelledby="next-heading">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader eyebrow="What happens next" title={<span id="next-heading">From first message to a growing business.</span>} className="mb-0 md:mb-0" />
            <div className="mt-8 space-y-4 text-lg leading-relaxed text-mist-600">
              <p>
                Whether you need a{" "}
                <Link href="/services/website-development" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">
                  new website
                </Link>
                , want to{" "}
                <Link href="/services/local-seo" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">
                  rank on Google Maps with local SEO
                </Link>
                , or need{" "}
                <Link href="/services/google-ads" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">
                  Google Ads
                </Link>{" "}
                and{" "}
                <Link href="/services/social-media-marketing" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">
                  social media marketing
                </Link>{" "}
                that bring in real customers, the first step is the same: a short conversation about your business.
              </p>
              <p>
                Prefer one team to handle everything? Our{" "}
                <Link href="/services/business-management" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">
                  monthly business management package
                </Link>{" "}
                combines website care, SEO, social media and ads. See all{" "}
                <Link href="/pricing" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">
                  plans and prices
                </Link>
                .
              </p>
            </div>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-3xl border border-mist-200 p-6">
                <span aria-hidden className="font-mono text-sm text-brand-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink-900">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-mist-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="mist" aria-labelledby="offices-heading">
        <SectionHeader
          eyebrow="Our office locations"
          title={<span id="offices-heading">Offices in Bangladesh, the USA, Canada and Ireland.</span>}
          description="Visit us, find us on Google Maps, or connect virtually from anywhere in the world."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {offices.map((o) => (
            <div key={o.code} className="flex flex-col rounded-3xl border border-mist-200 bg-white p-6">
              <p className="font-mono text-sm text-brand-700">{o.code}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">{o.city}</h3>
              <p className="text-sm text-mist-500">{o.country}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-mist-700">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  {o.address}
                </li>
                <li>
                  <a href={telHref(o.phone)} className="flex items-center gap-2 hover:text-ink-900">
                    <Phone className="size-4 text-brand-600" aria-hidden /> {o.phone}
                  </a>
                </li>
                {o.email && (
                  <li>
                    <a href={`mailto:${o.email}`} className="flex items-center gap-2 break-all hover:text-ink-900">
                      <Mail className="size-4 shrink-0 text-brand-600" aria-hidden /> {o.email}
                    </a>
                  </li>
                )}
              </ul>
              <WhatsAppButton size="md" intent={`I’d like to contact your ${o.city} office.`} from={`${FROM} — ${o.city} office`} path="/contact" className="mt-5 w-full">
                WhatsApp {o.city}
              </WhatsAppButton>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
                {!o.hidePage && (
                  <Link href={officePath(o)} className="text-ink-900 underline-offset-4 hover:underline">
                    Office details →
                  </Link>
                )}
                {(o.gbpUrl || o.mapQuery) && (
                  <a
                    href={o.gbpUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.mapQuery!)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-700 underline-offset-4 hover:underline"
                  >
                    Google Maps →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* The same four ways to start, once more before the FAQ */}
      <Section tone="dark" aria-labelledby="start-again-heading" className="py-16 md:py-20">
        <SectionHeader eyebrow="Ready when you are" title={<span id="start-again-heading">Order, send a request or just say hello.</span>} className="mb-10 md:mb-12" />
        <ContactChannels settings={settings} from={`${FROM} (before FAQ)`} path="/contact" tone="dark" />
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
