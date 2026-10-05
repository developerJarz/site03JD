import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/marketing/json-ld";
import { publicUrl, whatsappDisplay, whatsappLink, whatsappMessage } from "@/config/contact";
import { cityPath, countryImage, placeOf, type CountrySite } from "@/content/country-sites";
import { FACEBOOK, type City, type Faq } from "@/content/country-sites/site/content";
import type { LongSection } from "@/content/country-sites/site/longform";
import type { CityWords, SiteData } from "@/content/country-sites/site/sitedata";
import { getSiteSettings } from "@/lib/data/public";
import { breadcrumbSchema } from "@/lib/seo";
import { CountryCalculator } from "./calculator/country-calculator";
import { CompareSection } from "./compare-section";
import { CountryShell, type ShellSection } from "./country-shell";
import { HeroDashboard } from "./hero-dashboard";
import { countrySchema } from "./schema";

/**
 * A country homepage (/usa, /canada) or one of its city pages, inside the proposal page's reading
 * shell. Markup and class names follow the source build's Site.tsx (styles: country.css); every word
 * of copy comes from the country's SiteData bundle in src/content/country-sites.
 */

type CW = CityWords | undefined;
interface Contact {
  href: (intent: string, from: string) => string;
  display: string;
  email: string;
  facebook: string;
}

export async function CountryPage({ site, city }: { site: CountrySite; city?: City }) {
  const { contact, socials } = await getSiteSettings();
  const path = city ? cityPath(site, city) : site.path;
  const c: Contact = {
    href: (intent, from) => whatsappLink(contact.whatsapp, whatsappMessage({ intent, from: `${from} — ${publicUrl(path)}` })),
    display: whatsappDisplay(contact),
    email: contact.email,
    facebook: socials.facebook || FACEBOOK,
  };
  const D = site.data;
  const place = city ? placeOf(city) : site.name;
  const crumbs = [{ name: "Home", path: "/" }, { name: site.name, path: site.path }, ...(city ? [{ name: placeOf(city), path }] : [])];

  return (
    <>
      <JsonLd data={[...countrySchema(site, city), breadcrumbSchema(crumbs)]} />
      <CountryShell
        kicker={D.regional?.name ?? `Jarz Digital ${site.name}`}
        title={city ? `${place} growth guide` : `${site.name} growth guide`}
        sections={city ? citySections(city) : HOME_SECTIONS}
        whatsappHref={c.href(intentFor(D, city), `${place} page — sidebar`)}
      >
        {city ? <CityPage site={site} city={city} c={c} /> : <HomePage site={site} c={c} />}
      </CountryShell>
    </>
  );
}

const HOME_SECTIONS: ShellSection[] = [
  { id: "top", label: "Overview", icon: "home" },
  { id: "services", label: "Services", icon: "grid" },
  { id: "calculator", label: "Ads calculator", icon: "calc", hot: true },
  { id: "growth-plans", label: "Growth plans", icon: "trend" },
  { id: "results", label: "Results", icon: "chart" },
  { id: "about", label: "About us", icon: "person" },
  { id: "why-jarz", label: "Why Jarz Digital", icon: "star" },
  { id: "process", label: "Our process", icon: "steps" },
  { id: "pricing", label: "Pricing", icon: "tag" },
  { id: "locations", label: "Locations", icon: "pin" },
  { id: "faq", label: "Questions", icon: "ask" },
  { id: "contact", label: "Get started", icon: "go" },
];

const citySections = (city: City): ShellSection[] => [
  { id: "top", label: "Overview", icon: "home" },
  { id: "market", label: `${city.name} market`, icon: "globe" },
  { id: "services", label: "Services", icon: "grid" },
  { id: "calculator", label: "Ads calculator", icon: "calc", hot: true },
  { id: "growth-plans", label: "Growth plans", icon: "trend" },
  { id: "results", label: "Results", icon: "chart" },
  { id: "about", label: "About us", icon: "person" },
  { id: "process", label: "Our process", icon: "steps" },
  { id: "pricing", label: "Pricing", icon: "tag" },
  { id: "service-area", label: "Service area", icon: "pin" },
  { id: "faq", label: "Questions", icon: "ask" },
  { id: "contact", label: "Get started", icon: "go" },
];

/** The site's WhatsApp message (“Hi Jarz Digital! …”) with this country's request and the visitor's city. */
function intentFor(D: SiteData, city?: City) {
  const ask = D.waMessage.replace(/^Hi Jarz Digital,\s*/i, "");
  return city ? `${ask} We are in ${placeOf(city)}.` : ask;
}

/* ---------------- country homepage ---------------- */
function HomePage({ site, c }: { site: CountrySite; c: Contact }) {
  const D = site.data;
  const L = D.long;
  return (
    <>
      <Hero
        site={site}
        c={c}
        eyebrow={D.home.eyebrow}
        h1={
          <>
            {D.home.h1}
            <em>{D.home.h1em}</em>
          </>
        }
        sub={D.home.sub}
      />
      <Stats />
      <CityNav site={site} />
      <ServicesOverview data={D} />
      <CountryCalculator market={D.market === "ca" ? "ca" : "us"} defaultCat={D.calcDefault} title={D.home.calcTitle} lead={D.home.calcLead} />
      <ServiceDetailsSection data={D} c={undefined} />
      <Long s={L.opportunity()} />
      <Results data={D} />
      <CasesSection data={D} />
      <AboutSection data={D} c={undefined} />
      <CompareSection title={D.home.compareTitle} />
      <Long s={L.aiSearch()} accent />
      <Long s={L.aiDeep()} />
      <Long s={L.automationDeep()} />
      <Long s={L.whyHire()} />
      <Long s={L.howWeGrow()} />
      <Long s={L.whyBest()} accent />
      <QualitySection data={D} />
      <ProcessSection data={D} c={undefined} />
      <Playbooks data={D} />
      <Long s={L.adsCostGuide()} />
      <Long s={L.seoGuide()} />
      <PricingSection data={D} />
      <AuditSection data={D} />
      <GlossarySection data={D} />
      <Locations site={site} />
      <Industries data={D} />
      <FaqSection faqs={D.faqsFor(D.homeId)} title={D.home.faqTitle} />
      <ContactSection data={D} c={c} />
    </>
  );
}

/* ---------------- city page ---------------- */
function CityPage({ site, city, c }: { site: CountrySite; city: City; c: Contact }) {
  const D = site.data;
  const L = D.long;
  const x = D.cityExtra[city.id];
  const cw = { name: city.name, state: city.state };
  const u = D.cityUnique[city.id];
  const loc = placeOf(city);
  const uSeo: LongSection = { id: "local-seo-city", eyebrow: `${city.name} SEO`, title: `Local SEO services in ${loc}: what works in this market`, intro: `Every city ranks differently. As a ${city.name} SEO company, we combine local SEO services, web design in ${loc} and AI search optimization around the way people in ${city.name} actually search.`, blocks: u.seo };
  const uAds: LongSection = { id: "google-ads-city", eyebrow: `${city.name} Google Ads`, title: `Google Ads agency in ${city.name}: how we manage your budget`, intro: `As your Google Ads agency in ${city.name}, we plan campaigns around local seasons, ${D.market === "us" ? "neighborhoods" : "neighbourhoods"} and competitors, so every dollar goes where it brings booked customers.`, blocks: u.ads };
  const uAi: LongSection = { id: "ai-city", eyebrow: `AI in ${city.name}`, title: `AI agents, AI SEO and ChatGPT visibility for ${city.name} businesses`, intro: `AI is changing how ${city.name} customers find and contact businesses. We help you appear in ChatGPT, Claude, Gemini and Google AI Overviews, and answer every enquiry instantly.`, blocks: u.ai };
  return (
    <>
      <Hero site={site} city={city} c={c} eyebrow={city.kicker} h1={city.h1} sub={city.intro[0]} />
      <Stats />
      <CityNav site={site} current={city.id} />
      <section className="block city-intro">
        <p className="lead">{city.intro[1]}</p>
        {city.proof && (
          <figure className="card proof city-proof">
            <Image src={countryImage(city.proof.img)} alt={city.proof.alt} width={city.proof.width} height={city.proof.height} sizes="(max-width: 1023px) 100vw, 900px" />
            <figcaption>{city.proof.caption}</figcaption>
          </figure>
        )}
      </section>
      <section id="market" className="anchor block">
        <header className="sec-head">
          <p className="eyebrow">{city.name} market</p>
          <h2>{city.brand ? `How our ${city.brand} grows local businesses` : `How we grow ${city.name} businesses`}</h2>
          <p className="lead">{x.market}</p>
        </header>
        <div className="grid g3">
          {city.market.map((m) => (
            <div key={m.h} className="card">
              <h3 className="h3c">{m.h}</h3>
              <p>{m.p}</p>
            </div>
          ))}
        </div>
      </section>
      <Long s={L.opportunity(cw)} />
      <Long s={uSeo} />
      <Long s={uAds} />
      <section id="services" className="anchor block">
        <header className="sec-head">
          <p className="eyebrow">Services in {city.name}</p>
          <h2>Local SEO, Google Ads, AI and web design for {city.name} businesses</h2>
          <p className="lead">Twelve services from one team, planned around the {city.name} market and your competitors.</p>
        </header>
        <div className="grid g3 svc-mini">
          {D.services.map((s) => (
            <div key={s.id} className="card">
              <svg className="svc-ico" viewBox="0 0 24 24" aria-hidden>
                {ICON[s.icon]}
              </svg>
              <h3 className="h3c">
                {s.name} in {city.name}
              </h3>
              <p>
                {s.tagline} {u.services[s.id] ?? s.result}
              </p>
            </div>
          ))}
        </div>
      </section>
      <CountryCalculator
        market={D.market === "ca" ? "ca" : "us"}
        city={{ id: city.id, name: city.name }}
        defaultCat={city.calcCat}
        title={`Google Ads calculator for ${city.name} businesses`}
        lead={D.calcCityLead(city.name)}
      />
      <ServiceDetailsSection data={D} c={cw} />
      <CasesSection data={D} id="results" place={city.name} />
      <AboutSection data={D} c={cw} />
      <Long s={L.aiSearch(cw)} accent />
      <Long s={uAi} />
      <Long s={L.aiDeep(cw)} />
      <Long s={L.automationDeep(cw)} />
      <Long s={L.whyHire(cw)} />
      <Long s={L.howWeGrow(cw)} />
      <Long s={L.whyBest(cw)} accent />
      <QualitySection data={D} place={city.name} />
      <ProcessSection data={D} c={cw} />
      <Industries data={D} c={cw} />
      <Playbooks data={D} city={city.id} cityName={city.name} />
      <Long s={L.adsCostGuide(cw)} />
      <Long s={L.seoGuide(cw)} />
      <PricingSection data={D} place={city.name} />
      <AuditSection data={D} place={city.name} />
      <GlossarySection data={D} place={city.name} />
      <section id="service-area" className="anchor block">
        <header className="sec-head">
          <p className="eyebrow">Service area</p>
          <h2>{city.display ? `Areas we serve across ${city.name}` : `Areas we serve around ${city.name}`}</h2>
          <p className="lead">{x.neighborhoods}</p>
        </header>
        <ul className="ind-chips">
          {city.areas.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p className="src kw-line">
          Local searches we target in {city.name}: {x.keywords.join(" · ")}
        </p>
      </section>
      <FaqSection faqs={D.faqsFor(city.id)} title={`SEO, Google Ads and AI in ${city.name}: common questions`} />
      <ContactSection data={D} c={c} city={city} />
    </>
  );
}

/* ---------------- hero ---------------- */
function Hero({ site, city, c, eyebrow, h1, sub }: { site: CountrySite; city?: City; c: Contact; eyebrow: string; h1: ReactNode; sub: string }) {
  const D = site.data;
  const place = city ? placeOf(city) : site.name;
  return (
    <section id="top" className="anchor hero site-hero">
      <div className="hero-glow" aria-hidden />
      <div className="hero-grid">
        <div className="hero-copy">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> › {city ? <Link href={site.path}>{site.name}</Link> : <span aria-current="page">{site.name}</span>}
            {city && (
              <>
                {" › "}
                <span aria-current="page">{place}</span>
              </>
            )}
          </nav>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="hero-title">{h1}</h1>
          <p className="hero-sub">{sub}</p>
          <div className="hero-cta">
            <a className="btn primary" href={c.href(intentFor(D, city), `${place} page — hero`)} target="_blank" rel="noopener noreferrer">
              Request a free growth audit
            </a>
            <a className="btn ghost" href="#calculator">
              Estimate your ad revenue
            </a>
          </div>
          <dl className="hero-meta">
            <div>
              <dt>Market</dt>
              <dd>{city ? place : D.regional?.countryName ?? "United States"}</dd>
            </div>
            <div>
              <dt>Calculator data</dt>
              <dd>{D.calc.benchmarks}</dd>
            </div>
          </dl>
        </div>
        <HeroDashboard data={D} />
      </div>
    </section>
  );
}

const STATS: [string, string][] = [
  ["500+", "websites built"],
  ["500+", "clients served"],
  ["4.9★", "from 130+ reviews"],
  ["10+", "years in SEO"],
];

function Stats() {
  return (
    <div className="stats">
      {STATS.map(([b, t]) => (
        <div key={t} className="stat">
          <b>{b}</b>
          <span>{t}</span>
        </div>
      ))}
    </div>
  );
}

function CityNav({ site, current }: { site: CountrySite; current?: string }) {
  const D = site.data;
  return (
    <nav className="citynav" aria-label="Locations">
      <p className="citynav-label">{current ? "Our locations" : "Choose your city"}</p>
      <div className="citynav-grid">
        {D.cities.map((c) => (
          <Link key={c.id} href={cityPath(site, c)} className={`city-btn${c.id === current ? " on" : ""}`} aria-current={c.id === current ? "page" : undefined}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            <b>{placeOf(c)}</b>
          </Link>
        ))}
        <Link href={site.path} className={`city-btn usa${current ? "" : " on"}`} aria-current={current ? undefined : "page"}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
          </svg>
          <b>{D.allLabel}</b>
        </Link>
      </div>
    </nav>
  );
}

/* ---------------- sections (source: Site.tsx) ---------------- */
const ICON: Record<string, ReactNode> = {
  bot: (
    <>
      <rect x="4" y="7" width="16" height="12" rx="3" />
      <path d="M12 3v4M9 12h.01M15 12h.01M9.5 15.5h5" />
    </>
  ),
  flow: (
    <>
      <circle cx="5" cy="6" r="2.5" />
      <circle cx="19" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M7.5 6h9M6.3 8.2l4.4 7.6M17.7 8.2l-4.4 7.6" />
    </>
  ),
  pin: <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zm0-9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
  ads: <path d="M4 15V9l11-5v16L4 15zm0 0 2 5h3l-1.5-4M18 9a3 3 0 0 1 0 6" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.8-4.8" />
    </>
  ),
  browser: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
    </>
  ),
  app: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
  chat: <path d="M4 5h16v11H8l-4 4V5z" />,
  chart: <path d="M4 20V10m6 10V4m6 16v-7m6 7H2" />,
  code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" />,
  brush: <path d="M14 4l6 6-9 9H5v-6l9-9zM12 6l6 6" />,
};

function SecHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: ReactNode }) {
  return (
    <header className="sec-head">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </header>
  );
}

function ServicesOverview({ data: D }: { data: SiteData }) {
  return (
    <section id="services" className="anchor block">
      <SecHead eyebrow="Our services" title={D.servicesTitle ?? "Twelve services, one team, one growth plan"} lead={D.home.servicesLead} />
      <p className="swipe-hint">Swipe to see all 12 services →</p>
      <div className="svc-grid">
        {D.services.map((s, i) => (
          <article key={s.id} id={`svc-${s.id}`} className={`card svc-card ${i < 2 || s.id === "ai" || s.id === "ai-agents" ? "lead-svc" : ""}`}>
            <svg className="svc-ico" viewBox="0 0 24 24" aria-hidden>
              {ICON[s.icon]}
            </svg>
            <h3>{s.name}</h3>
            <p className="svc-tag">{s.tagline}</p>
            <p>{s.body}</p>
            <ul className="check">
              {s.includes.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="svc-result">
              <b>Result:</b> {s.result}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Results({ data: D }: { data: SiteData }) {
  const R = D.results;
  return (
    <section id="results" className="anchor block">
      <SecHead eyebrow="Proven results" title={R.title} lead={R.lead} />
      <p className="swipe-hint">Swipe for more results →</p>
      <div className="proof-grid">
        {R.proof.map((p) => (
          <figure key={p.img} className="card proof">
            <Image src={countryImage(p.img)} alt={p.alt} width={p.width} height={p.height} sizes="(max-width: 700px) 100vw, 33vw" />
            <figcaption>
              <span className="pill green">{p.badge ?? `#1 · ${p.city}`}</span>
              <b>“{p.search}”</b>
              <span>{p.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="strip case-strip">
        {R.strip.map(([n, t]) => (
          <div key={t}>
            <b>{n}</b>
            <span>{t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Locations({ site }: { site: CountrySite }) {
  const D = site.data;
  return (
    <section id="locations" className="anchor block">
      <SecHead eyebrow="Locations" title={D.locations.title} lead={D.locations.lead} />
      <div className="loc-list">
        {D.cities.map((c) => (
          <article key={c.id} className="card loc">
            <div className="loc-head">
              <span className="pill">{c.region}</span>
              <h3>{c.display ?? `${c.name}, ${c.state}`}</h3>
            </div>
            <p>{D.cityExtra[c.id].market}</p>
            <p className="loc-areas">{D.cityExtra[c.id].neighborhoods}</p>
            <Link className="more" href={cityPath(site, c)}>
              SEO, Google Ads and AI services in {c.name} →
            </Link>
          </article>
        ))}
      </div>
      <p className="lead nation">{D.locations.nationwide}</p>
    </section>
  );
}

function PricingSection({ data: D, place }: { data: SiteData; place?: string }) {
  return (
    <section id="pricing" className="anchor block">
      <SecHead eyebrow="Pricing" title={place ? `How our pricing works for ${place} businesses` : D.pricing.title} lead={D.pricing.intro} />
      <div className="long-grid">
        {D.pricing.blocks.map(([h, p]) => (
          <div key={h} className="long-item">
            <h3>{h}</h3>
            <p>{p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AuditSection({ data: D, place }: { data: SiteData; place?: string }) {
  return (
    <section id="audit" className="anchor block">
      <SecHead
        eyebrow="Free growth audit"
        title={place ? `What the free ${place} growth audit includes` : D.audit.title}
        lead="The audit is free, takes no commitment and gives you a clear picture of where your business stands online, whether or not you decide to work with us."
      />
      <ul className="check audit-list">
        {D.audit.items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </section>
  );
}

function Industries({ data: D, c }: { data: SiteData; c?: CW }) {
  return (
    <section id="who-we-serve" className="anchor block">
      <SecHead
        eyebrow="Who we work with"
        title={c ? `Businesses we help grow in ${c.name}` : D.whoTitle}
        lead="Our methods are proven across many local industries. Each plan is adapted to the way your customers search, compare and buy."
      />
      <div className="long-grid">
        {D.who.map(([h, p]) => (
          <div key={h} className="long-item">
            <h3>{h}</h3>
            <p>{p}</p>
          </div>
        ))}
      </div>
      <ul className="ind-chips who-chips">
        {D.industries.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </section>
  );
}

function FaqSection({ faqs, title }: { faqs: Faq[]; title: string }) {
  // first question open; the rest collapse so the long list stays easy to scan
  return (
    <section id="faq" className="anchor block">
      <SecHead eyebrow="FAQ" title={title} />
      <div className="faq">
        {faqs.map((f, i) => (
          <details key={f.q} open={i === 0}>
            <summary>
              <h3>{f.q}</h3>
              <i aria-hidden>+</i>
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ContactSection({ data: D, c, city }: { data: SiteData; c: Contact; city?: City }) {
  const place = city ? placeOf(city) : undefined;
  return (
    <section id="contact" className="anchor cta-final contact">
      <h2>{city ? `Request your free ${city.name} growth plan` : "Request your free growth plan"}</h2>
      <p>Tell us about your business. We will review your Google rankings, advertising and website, then send a clear plan with projected results. There is no obligation and no long-term contract.</p>
      <div className="contact-cards">
        <a className="ccard wa" href={c.href(intentFor(D, city), `${place ?? "Country"} page — contact`)} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3zm4.6 12.7c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 1.9 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.6-.1 1.2z" />
          </svg>
          <b>WhatsApp</b>
          <span>{c.display}</span>
          <em>Fastest response →</em>
        </a>
        <a className="ccard fb" href={c.facebook} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v7h4v-7h3l.5-4H14V8.6c0-.4.2-.6.6-.6H14z" />
          </svg>
          <b>Facebook</b>
          <span>Jarz Digital page</span>
          <em>Send a message →</em>
        </a>
        <a className="ccard em" href={`mailto:${c.email}?subject=${encodeURIComponent("Free growth plan")}`}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3.5 6 8.5 7 8.5-7" />
          </svg>
          <b>Email</b>
          <span>{c.email}</span>
          <em>Write to us →</em>
        </a>
      </div>
    </section>
  );
}

function AboutSection({ data: D, c }: { data: SiteData; c: CW }) {
  const a = D.about(c);
  return (
    <section id="about" className="anchor block">
      <SecHead eyebrow="About us" title={a.title} />
      <div className="about-grid">
        <div className="about-text">
          {a.paras.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
        <div className="about-vals">
          {a.values.map(([h, p]) => (
            <div key={h} className="card">
              <h3 className="h3c">{h}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceDetailsSection({ data: D, c }: { data: SiteData; c: CW }) {
  const name = (id: string) => D.services.find((s) => s.id === id)?.name ?? id;
  return (
    <section id="service-details" className="anchor block">
      <SecHead
        eyebrow="Service details"
        title={c ? `How each service works for ${c.name} businesses` : "How each service works, in detail"}
        lead="Who each service is for, exactly what we do and what you receive every month."
      />
      <div className="faq sd">
        {D.details.map((d, i) => (
          <details key={d.id} open={i === 0}>
            <summary>
              <h3>
                {name(d.id)}: how it works{c ? ` in ${c.name}` : ""}
              </h3>
              <i aria-hidden>+</i>
            </summary>
            <div className="sd-body">
              <p>
                <b>Who it is for:</b> {d.who}
              </p>
              <ol>
                {d.how.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ol>
              <p>
                <b>What you receive:</b> {d.deliver}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function QualitySection({ data: D, place }: { data: SiteData; place?: string }) {
  return (
    <section id="quality" className="anchor block">
      <SecHead
        eyebrow="Our standards"
        title={place ? `Quality standards for every ${place} project` : "The quality standards behind every project"}
        lead="Strong results come from doing the fundamentals properly, every time. These standards apply to every client, whatever the size of the project."
      />
      <div className="grid g4 q-grid">
        {D.quality.map(([h, p]) => (
          <div key={h} className="card">
            <h3 className="h3c">{h}</h3>
            <p>{p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProcessSection({ data: D, c }: { data: SiteData; c: CW }) {
  return (
    <section id="process" className="anchor block">
      <SecHead eyebrow="Our process" title={c ? `How we work with ${c.name} businesses, step by step` : "How we work, step by step"} />
      <ol className="flow proc">
        {D.process.map(([h, p]) => (
          <li key={h}>
            <b>{h}</b>
            <span>{p}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function CasesSection({ data: D, id = "case-studies", place }: { data: SiteData; id?: string; place?: string }) {
  return (
    <section id={id} className="anchor block">
      <SecHead
        eyebrow="Case studies"
        title={place ? `Client results that matter to ${place} businesses` : "Results our clients have achieved"}
        lead="Client names are kept private. The outcomes are taken from live Google results and the clients' own sales dashboards."
      />
      <div className="grid g2">
        {D.cases.map((x) => (
          <div key={x.h} className="card case">
            <h3 className="h3c">{x.h}</h3>
            <p>{x.p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function GlossarySection({ data: D, place }: { data: SiteData; place?: string }) {
  return (
    <section id="glossary" className="anchor block">
      <SecHead eyebrow="Glossary" title={place ? `Digital marketing terms for ${place} business owners` : "Digital marketing terms, explained simply"} />
      <dl className="gloss">
        {D.glossary.map(([t, d]) => (
          <div key={t}>
            <dt>{t}</dt>
            <dd>{d}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Long({ s, accent }: { s: LongSection; accent?: boolean }) {
  return (
    <section id={s.id} className={`anchor block long ${accent ? "long-accent" : ""}`}>
      <SecHead eyebrow={s.eyebrow} title={s.title} lead={s.intro} />
      {s.stats && (
        <div className="opp-stats">
          {s.stats.map(([n, t, src]) => (
            <div key={t} className="card opp">
              <b>{n}</b>
              <span>{t}</span>
              <small>{src}</small>
            </div>
          ))}
        </div>
      )}
      <div className="long-grid">
        {s.blocks.map((b) => (
          <div key={b.h} className="long-item">
            <h3>{b.h}</h3>
            <p>{b.p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Playbooks({ data: D, city, cityName }: { data: SiteData; city?: string; cityName?: string }) {
  return (
    <section id="industries" className="anchor block">
      <SecHead eyebrow="Industry playbooks" title={cityName ? `Marketing playbooks for ${cityName} industries` : "Marketing playbooks by industry"} lead={D.playbooksLead} />
      <div className="pb-grid">
        {D.playbooks.map((p) => (
          <div key={p.id} className="card pb">
            <h3>{cityName ? `${p.kw.charAt(0).toUpperCase() + p.kw.slice(1)} in ${cityName}` : p.name}</h3>
            <span className="pb-data">{p.data}</span>
            <p>{p.base}</p>
            {city && p.city[city] && (
              <p className="pb-city">
                <b>{cityName}:</b> {p.city[city]}
              </p>
            )}
            {!city && <p className="pb-kw">{p.kw}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
