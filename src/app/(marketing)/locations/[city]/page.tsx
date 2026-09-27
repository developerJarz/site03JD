import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/animations/reveal";
import { ProjectCard } from "@/components/marketing/cards";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { WhatsAppButton } from "@/components/marketing/whatsapp";
import { Accordion } from "@/components/ui/accordion";
import { WhatsappIcon } from "@/components/ui/brand-icons";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Section, SectionHeader } from "@/components/ui/section";
import { getPosts, getProjects, getServices, getSiteSettings } from "@/lib/data/public";
import { postsForOffice } from "@/lib/content/links";
import { PostCard } from "@/components/blog/post-card";
import { faqSchema, isPhysicalOffice, localBusinessSchema } from "@/lib/seo";
import { publicUrl, whatsappDisplay, whatsappLink, whatsappMessage } from "@/config/contact";
import { brandFacts } from "@/content/seed";
import { locationOffices, officeArea, officePath, officeSlug } from "@/lib/seo/locations";
import { pageMetadata } from "@/lib/seo/page";
import { locationPageSeo, officePlace } from "@/lib/seo/pages";
import type { Office, Project, Service, SiteSettings } from "@/types/content";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const settings = await getSiteSettings();
  return locationOffices(settings).map((o) => ({ city: officeSlug(o) }));
}

async function findOffice(city: string) {
  const settings = await getSiteSettings();
  return { settings, office: locationOffices(settings).find((o) => officeSlug(o) === city) };
}

export async function generateMetadata({ params }: PageProps<"/locations/[city]">): Promise<Metadata> {
  const { city } = await params;
  const { office } = await findOffice(city);
  if (!office) return {};
  const { title, description } = locationPageSeo(office);
  return pageMetadata(officePath(office), { title, description, image: office.image?.src });
}

const tel = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;
const mapsLink = (o: Office) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.mapQuery || o.address)}`;
const mapsEmbed = (o: Office) => `https://www.google.com/maps?q=${encodeURIComponent(o.mapQuery || o.address)}&output=embed`;

/** Projects for clients in this office’s area — its state (US) or country. Never out-of-area work. */
function localProjects(o: Office, projects: Project[]) {
  const area = officeArea(o);
  return projects.filter((p) => area.matches(p.location));
}

/** Questions answered only from the office’s own details — nothing invented. */
function locationFaqs(o: Office, services: Service[], settings: SiteSettings, local: Project[]) {
  const place = officePlace(o);
  const physical = isPhysicalOffice(o);
  const faqs = [
    {
      question: `Where is the Jarz Digital ${o.city} office?`,
      answer: physical
        ? `Our ${o.city} office address is: ${o.address}.`
        : `Our ${o.city} branch is service-based (${o.address}) — we work with ${o.city} businesses online, by phone and by video call.`,
    },
    {
      question: `How can I contact Jarz Digital in ${o.city}?`,
      answer: `Message us on WhatsApp or call ${o.phone}${o.email ? `, email ${o.email}` : ""}, or send a request through our contact form. ${settings.contact.responseTime}.`,
    },
    {
      question: `Which services do you offer in ${place}?`,
      answer: `${services.map((s) => s.title).join(", ")}. Every service is available to businesses in ${o.city} and across ${o.country}.`,
    },
  ];
  const bySlug = (slug: string) => services.find((s) => s.slug === slug);
  const web = bySlug("website-development");
  const local_ = bySlug("local-seo");
  if (web?.startingPrice) {
    faqs.push({
      question: `How much does a website cost in ${o.city}?`,
      answer: `Website development plans start from ${web.startingPrice}. The final price depends on the number of pages, features such as online booking or e-commerce, and whether you want ongoing care. Every plan includes a mobile-friendly, SEO-ready build — see the plans on our ${web.title} page or ask for a quote on WhatsApp.`,
    });
  }
  if (local_?.startingPrice) {
    faqs.push({
      question: `How much does local SEO cost in ${o.city}?`,
      answer: `Local SEO plans start from ${local_.startingPrice}. They cover Google Business Profile optimization, local citations, review strategy and local keyword targeting, with regular reporting so you can see your map rankings move.`,
    });
  }
  faqs.push(
    {
      question: `Can you help my ${o.city} business rank on Google Maps?`,
      answer: `Yes. Ranking in the Google Map Pack comes down to a complete, active Google Business Profile, consistent business details across the web, genuine reviews and a website that matches what people in ${o.city} search for. Our local SEO work covers all four, done manually, with detailed reporting.`,
    },
    {
      question: "How long does local SEO take to show results?",
      answer: "It depends on your competition, but most clients see local ranking improvements within about three months. Website fixes and Google Business Profile updates often help sooner; strong, lasting rankings build over the following months.",
    },
    {
      question: `Do you only work with businesses in ${o.city}?`,
      answer: `No. Our ${o.city} team works with businesses across ${o.country}, and the wider Jarz Digital team serves clients worldwide from our offices in ${settings.offices.map((x) => x.city).join(", ")}.`,
    },
  );
  if (local.length > 0) {
    faqs.push({
      question: `Have you worked with businesses in ${officeArea(o).label}?`,
      answer: `Yes — including ${local.map((p) => p.client).join(", ")}. See our portfolio for the full projects.`,
    });
  }
  return faqs;
}

export default async function LocationPage({ params }: PageProps<"/locations/[city]">) {
  const { city } = await params;
  const [{ settings, office }, services, projects, posts] = await Promise.all([findOffice(city), getServices(), getProjects(), getPosts()]);
  if (!office) notFound();
  const guides = postsForOffice(office, posts);

  const place = officePlace(office);
  const area = officeArea(office);
  const work = localProjects(office, projects).slice(0, 4);
  const faqs = locationFaqs(office, services, settings, work);
  const physical = isPhysicalOffice(office);
  const others = locationOffices(settings).filter((o) => o.code !== office.code);
  const whatsapp = settings.contact.whatsapp;
  // Light/mist alternate through the optional sections (why = light, work = mist).
  const flip = (t: "light" | "mist"): "light" | "mist" => (t === "light" ? "mist" : "light");
  const afterWork: "light" | "mist" = work.length > 0 ? "mist" : "light";
  const guidesTone = flip(afterWork);
  const faqTone = flip(guides.length > 0 ? guidesTone : afterWork);
  const tones = { guides: guidesTone, faq: faqTone, others: flip(faqTone) };

  return (
    <>
      <JsonLd data={[localBusinessSchema(office, settings), faqSchema(faqs)]} />
      <PageHero
        eyebrow={`${office.city} · ${office.country}`}
        title={`Web design, SEO & digital marketing in ${office.city}.`}
        titleLines={[`Web design, SEO & digital`, `marketing in ${office.city}.`]}
        description={office.intro || office.description}
        crumbs={[
          { name: "Locations", path: "/locations" },
          { name: office.city, path: officePath(office) },
        ]}
        actions={
          <>
            <WhatsAppButton number={settings.contact.whatsapp} intent={`I’m a business in ${office.city} and would like a free consultation.`} from={`${office.city} location page`} path={officePath(office)}>
              WhatsApp {office.city} team
            </WhatsAppButton>
            <ButtonLink href={tel(office.phone)} size="lg" variant="outline-light">
              Call {office.phone}
            </ButtonLink>
          </>
        }
        aside={
          office.image ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-white/10 lg:ml-auto lg:max-w-md">
              <Image src={office.image.src} alt={office.image.alt} fill loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 28rem, 100vw" className="object-cover" />
            </div>
          ) : (
            <div aria-hidden className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-brand-500/20 via-ink-900 to-ink-950 lg:ml-auto lg:max-w-md">
              <span className="absolute -right-4 -top-8 font-display text-[10rem] font-semibold leading-none tracking-[-0.06em] text-white/[0.06]">{office.code}</span>
              <MapPin className="size-20 text-brand-300" strokeWidth={1.2} />
            </div>
          )
        }
      />

      {/* Office details + map */}
      <Section tone="light" aria-labelledby="office-heading">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader index="01" eyebrow={`Jarz Digital ${office.city}`} title={<span id="office-heading">Visit or contact our {office.city} team.</span>} className="mb-8 md:mb-10" />
            <ul className="space-y-5 text-mist-700">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                <span>
                  <span className="block text-sm text-mist-500">Address</span>
                  <span className="font-medium text-ink-900">{office.address}</span>
                </span>
              </li>
              <li>
                <a href={tel(office.phone)} className="group flex items-start gap-3">
                  <Phone className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                  <span>
                    <span className="block text-sm text-mist-500">Phone</span>
                    <span className="font-medium text-ink-900 group-hover:text-brand-700">{office.phone}</span>
                  </span>
                </a>
              </li>
              {office.email && (
                <li>
                  <a href={`mailto:${office.email}`} className="group flex items-start gap-3">
                    <Mail className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                    <span>
                      <span className="block text-sm text-mist-500">Email</span>
                      <span className="font-medium text-ink-900 group-hover:text-brand-700">{office.email}</span>
                    </span>
                  </a>
                </li>
              )}
              {whatsapp && (
                <li>
                  <a
                    href={whatsappLink(whatsapp, whatsappMessage({ intent: `I’d like to contact your ${office.city} office.`, from: `${office.city} location page — ${publicUrl(officePath(office))}` }))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3"
                  >
                    <WhatsappIcon className="mt-0.5 size-5 shrink-0 text-brand-600" />
                    <span>
                      <span className="block text-sm text-mist-500">WhatsApp</span>
                      <span className="font-medium text-ink-900 group-hover:text-brand-700">{whatsappDisplay(settings.contact)}</span>
                    </span>
                  </a>
                </li>
              )}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <WhatsAppButton number={whatsapp} size="md" intent={`I’d like to contact your ${office.city} office.`} from={`${office.city} location page`} path={officePath(office)}>
                Contact now
              </WhatsAppButton>
              {(physical || office.gbpUrl) && (
                <a
                  href={office.gbpUrl || mapsLink(office)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-mist-200 px-5 text-sm font-medium text-ink-900 transition-colors hover:border-ink-900"
                >
                  <Navigation className="size-4 text-brand-600" aria-hidden /> {office.gbpUrl ? "View on Google Maps" : "Get directions on Google Maps"}
                </a>
              )}
            </div>
          </div>
          <div className="lg:col-span-7">
            {physical ? (
              <div className="overflow-hidden rounded-[28px] border border-mist-200 bg-mist-50">
                <iframe
                  title={`Map of the Jarz Digital ${office.city} office`}
                  src={mapsEmbed(office)}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block aspect-[4/3] w-full border-0 lg:aspect-[16/11]"
                />
              </div>
            ) : (
              // Service-area office: a city-wide map would suggest an address that doesn’t exist.
              <div className="theme-dark relative flex h-full min-h-72 flex-col justify-end overflow-hidden rounded-[28px] bg-ink-950 p-8 md:p-10">
                <span aria-hidden className="absolute -right-4 -top-10 font-display text-[11rem] font-semibold leading-none tracking-[-0.06em] text-white/[0.05]">
                  {office.code}
                </span>
                <MapPin className="size-8 text-brand-300" strokeWidth={1.5} aria-hidden />
                <p className="mt-6 font-display text-2xl font-semibold tracking-tight text-white">Service-based in {office.city}</p>
                <p className="mt-3 max-w-md leading-relaxed text-white/65">
                  We don’t see clients at a {office.city} street address — we work with {office.city} businesses online, by phone and by video call.
                </p>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Services */}
      <Section tone="mist" aria-labelledby="services-heading">
        <SectionHeader
          index="02"
          eyebrow="Services"
          title={<span id="services-heading">Digital services for businesses in {place}.</span>}
          description={`Everything Jarz Digital offers is available to ${office.city} businesses — from a new website to ongoing SEO, Google Ads and social media management. Here is what each service includes.`}
        />
        <Stagger as="ul" className="grid gap-5 md:grid-cols-2">
          {services.map((s) => {
            const points = (s.benefits.length ? s.benefits : s.included.flatMap((g) => g.items)).slice(0, 3);
            return (
              <StaggerItem as="li" key={s.slug} className="flex flex-col rounded-3xl border border-mist-200 bg-white p-7">
                <div className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-ink-900 text-brand-300">
                    <Icon name={s.icon} className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight text-ink-900">
                      {s.shortTitle || s.title} in {office.city}
                    </h3>
                    {s.startingPrice && <p className="mt-0.5 text-sm text-mist-600">Plans from {s.startingPrice}</p>}
                  </div>
                </div>
                <p className="mt-5 leading-relaxed text-mist-600">{s.summary}</p>
                {points.length > 0 && (
                  <ul className="mt-5 space-y-2 border-t border-mist-100 pt-5 text-sm text-mist-700">
                    {points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
                <Link href={`/services/${s.slug}`} className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-ink-900 underline-offset-4 hover:underline">
                  {s.title} services <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Section>

      {/* Why local businesses choose us — the differentiators published on the original site */}
      <Section tone="light" aria-labelledby="why-heading">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader eyebrow={`Why ${office.city} businesses choose us`} title={<span id="why-heading">One team for your website, search and marketing.</span>} className="mb-0 md:mb-0" />
            <p className="mt-6 text-lg leading-relaxed text-mist-600">
              Most {office.city} businesses we talk to are juggling a web designer, an SEO freelancer and someone for social media — and nobody owns the result. Jarz Digital puts your website, local SEO,
              Google Business Profile, Google Ads and social media with one team, so every part works toward the same goal: more calls, messages and customers from {place}.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {brandFacts.differentiators.map((d) => (
              <li key={d.title} className="rounded-3xl bg-mist-50 p-6">
                <h3 className="font-display text-lg font-semibold tracking-tight text-ink-900">{d.title}</h3>
                <p className="mt-2 leading-relaxed text-mist-600">{d.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Work */}
      {work.length > 0 && (
        <Section tone="mist" aria-labelledby="work-heading">
          <SectionHeader
            index="03"
            eyebrow="Portfolio"
            title={<span id="work-heading">Work for businesses in {area.label}.</span>}
          />
          <div className="grid gap-10 md:grid-cols-2">
            {work.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
          <div className="mt-12">
            <ButtonLink href="/work" variant="outline" arrow>
              View all projects
            </ButtonLink>
          </div>
        </Section>
      )}

      {/* Local guides */}
      {guides.length > 0 && (
        <Section tone={tones.guides} aria-labelledby="guides-heading">
          <SectionHeader eyebrow="Guides" title={<span id="guides-heading">Guides for {office.city} businesses.</span>} />
          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* FAQ */}
      <Section tone={tones.faq} aria-labelledby="faq-heading">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader eyebrow="FAQ" title={<span id="faq-heading">Jarz Digital in {office.city}.</span>} className="mb-0 md:mb-0" />
          </div>
          <div className="lg:col-span-8">
            <Accordion items={faqs} />
          </div>
        </div>
      </Section>

      {/* Other offices */}
      {others.length > 0 && (
        <Section tone={tones.others} aria-labelledby="other-offices" className="py-20 md:py-24">
          <SectionHeader eyebrow="More locations" title={<span id="other-offices">Our other offices.</span>} className="mb-10 md:mb-12" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((o) => (
              <li key={o.code}>
                <Link href={officePath(o)} className="group flex h-full items-start justify-between gap-4 rounded-3xl border border-mist-200 p-6 transition-colors hover:border-ink-900">
                  <span>
                    <span className="block font-display text-xl font-semibold tracking-tight text-ink-900">{o.city}</span>
                    <span className="text-sm text-mist-500">{o.country}</span>
                  </span>
                  <span className="font-mono text-sm text-brand-700">{o.code}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaBanner
        title={`Grow your ${office.city} business online.`}
        description={`Tell us about your goals — our ${office.city} team responds within 24 hours with a plan for your website, search and marketing.`}
        whatsapp={{ intent: `I’m a business in ${office.city} and would like to start a project.`, from: `${office.city} location page`, path: officePath(office) }}
        primary={{ label: "Send a Request", href: `/contact?intent=project&office=${office.code}#contact-form` }}
        secondary={{ label: "Explore Services", href: "/services" }}
      />
    </>
  );
}
