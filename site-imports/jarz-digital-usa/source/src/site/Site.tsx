// Jarz Digital website: country homepages (USA at /, Canada at /ca/) and city landing pages, rendered to static HTML at
// build time and hydrated in the browser. Every word of copy comes from the country's SiteData bundle.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CalculatorSection, useUsCalc } from '../us/UsAdsPage'
import { CompareSection } from '../us/WhyJarz'
import PlanSection from '../us/PlanSection'
import Growth360 from '../us/Growth360'
import { money, setMoney } from '../us/money'
import { fromCategory, growth360 } from '../us/model'
import { Reveal } from '../components/ui'
import { EMAIL, FACEBOOK, PHONE_DISPLAY, WHATSAPP, type City, type Faq } from './content'
import type { LongSection } from './longform'
import { SiteCtx, useSite, type CityWords } from './sitedata'
import { dataFor } from './sites'
import logo from '../assets/logo-full-dark.png'
import '../styles.css'

const img = (x: unknown) => (typeof x === 'string' ? x : (x as { src: string }).src)
const placeOf = (c: City) => c.display ?? `${c.name}, ${c.stateCode}`

export type PageId = string

export { dataFor }

export function SitePage({ page }: { page: PageId }) {
  const D = dataFor(page)
  setMoney(D.calc.symbol, D.calc.locale)
  const city = D.cities.find((c) => c.id === page)
  return (
    <SiteCtx.Provider value={D}>
      <div className="jdp site">
        <main className="main">{city ? <CityPage city={city} /> : <HomePage />}</main>
        <Footer />
        <MobileBar />
      </div>
    </SiteCtx.Provider>
  )
}

/* ---------------- layout ---------------- */
function Footer() {
  const D = useSite()
  return (
    <footer className="site-foot">
      <div className="foot-grid">
        <div>
          <img src={img(logo)} alt="Jarz Digital" width={150} height={35} loading="lazy" />
          <p>{D.footer.tag}</p>
          <address>
            {D.footer.address.map((l) => <span key={l}>{l}<br /></span>)}
            WhatsApp <a href={WHATSAPP} rel="noopener">{PHONE_DISPLAY}</a><br /><a href={`mailto:${EMAIL}`}>{EMAIL}</a> · <a href={FACEBOOK} rel="noopener">Facebook</a>
          </address>
        </div>
        <nav aria-label="Services">
          <h3>Services</h3>
          {D.services.slice(0, 8).map((s) => <a key={s.id} href={`${D.root}#svc-${s.id}`}>{s.name}</a>)}
        </nav>
        <nav aria-label="Locations">
          <h3>Locations</h3>
          {D.cities.map((c) => <a key={c.id} href={`${D.root}${c.slug}/`}>SEO & Google Ads in {placeOf(c)}</a>)}
          <a href={`${D.root}#locations`}>{D.allLabel}</a>
        </nav>
      </div>
      <p className="copy">© {new Date().getFullYear()} Jarz Digital. {D.footer.copy}</p>
    </footer>
  )
}

const TABS: [string, string, ReactNode][] = [
  ['top', 'Home', <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />],
  ['services', 'Services', <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>],
  ['calculator', 'Calculator', <><rect x="5" y="2.5" width="14" height="19" rx="2.5" /><path d="M8 6.5h8M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h3.5" /></>],
  ['results', 'Results', <path d="M4 20V10m6 10V4m6 16v-7m6 7H2" />],
]

/** App-style bottom navigation for phones, with the section in view highlighted. */
function MobileBar() {
  const D = useSite()
  const [active, setActive] = useState('top')
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((es) => {
      const v = es.filter((e) => e.isIntersecting).sort((x, y) => x.boundingClientRect.top - y.boundingClientRect.top)[0]
      if (v) setActive(v.target.id)
    }, { rootMargin: '-40% 0px -55% 0px' })
    ;['top', 'services', 'calculator', 'results', 'contact'].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  // reading-progress line at the top of the screen, updated once per frame without re-rendering React
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const draw = () => { raf = 0; const h = document.documentElement; const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight); if (bar.current) bar.current.style.transform = `scaleX(${p})` }
    const on = () => { if (!raf) raf = requestAnimationFrame(draw) }
    window.addEventListener('scroll', on, { passive: true }); draw()
    return () => { window.removeEventListener('scroll', on); if (raf) cancelAnimationFrame(raf) }
  }, [])
  return (
    <>
    <div ref={bar} className="scroll-progress" aria-hidden />
    <nav className="appbar" aria-label="Quick navigation">
      {TABS.map(([id, label, icon]) => (
        <a key={id} href={`#${id}`} className={active === id ? 'on' : ''} aria-current={active === id ? 'true' : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden>{icon}</svg><span>{label}</span>
        </a>
      ))}
      <a className={`wa-tab ${active === 'contact' ? 'on' : ''}`} href={`${WHATSAPP}?text=${encodeURIComponent(D.waMessage)}`} target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" aria-hidden><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" /></svg><span>WhatsApp</span>
      </a>
    </nav>
    </>
  )
}

/* ---------------- homepage ---------------- */
function HomePage() {
  const D = useSite()
  const L = D.long
  const calc = useUsCalc(D.calcDefault, `jd-site-calc-${D.market}`, D.calc)
  return (
    <>
      <Hero eyebrow={D.home.eyebrow} h1={<>{D.home.h1}<em>{D.home.h1em}</em></>} sub={D.home.sub} />
      <TrustBar />
      <ServicesOverview />
      <section id="calculator" className="anchor"><CalculatorSection calc={calc} title={D.home.calcTitle} lead={D.home.calcLead} /></section>
      {D.video && <CalculatorGuide />}
      <PlanSection calc={calc} />
      <Growth360 inp={calc.inp} catName={calc.cat.name} avg={D.calc.avg} />
      <ServiceDetailsSection c={undefined} />
      <Long s={L.opportunity()} />
      <Results />
      <CasesSection />
      <AboutSection c={undefined} />
      <CompareSection title={D.home.compareTitle} />
      <Long s={L.aiSearch()} accent />
      <Long s={L.aiDeep()} />
      <Long s={L.automationDeep()} />
      <Long s={L.whyHire()} />
      <Long s={L.howWeGrow()} />
      <Long s={L.whyBest()} accent />
      <QualitySection />
      <ProcessSection c={undefined} />
      <Playbooks />
      <Long s={L.adsCostGuide()} />
      <Long s={L.seoGuide()} />
      <PricingSection />
      <AuditSection />
      <GlossarySection />
      <Locations />
      <Industries />
      <FaqSection faqs={D.faqsFor(D.homeId)} title={D.home.faqTitle} />
      <Contact />
    </>
  )
}

function Hero({ eyebrow, h1, sub, crumbs }: { eyebrow: string; h1: ReactNode; sub: string; crumbs?: ReactNode }) {
  return (
    <section id="top" className="hero site-hero">
      <div className="hero-glow" aria-hidden />
      <div className="hero-grid">
        <div className="hero-copy">
          {crumbs}
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="hero-title">{h1}</h1>
          <p className="hero-sub">{sub}</p>
          <div className="hero-cta">
            <a className="btn primary" href="#contact">Request a free growth audit</a>
            <a className="btn ghost" href="#calculator">Estimate your ad revenue</a>
          </div>
          <ul className="hero-proof">
            <li><b>500+</b> websites built</li>
            <li><b>500+</b> clients served</li>
            <li><b>4.9★</b> from 130+ reviews</li>
            <li><b>10+</b> years in SEO</li>
          </ul>
        </div>
        <HeroDashboard />
      </div>
    </section>
  )
}

/** Animated "results" card built from the same model as the calculator. */
function HeroDashboard() {
  const D = useSite()
  const pts = useMemo(() => growth360(fromCategory(D.calc.categories.find((c) => c.id === D.heroExample.cat)!, 1500)), [D])
  const a = pts[0], z = pts[11]
  const line = (vals: number[]) => { const mx = Math.max(...vals), mn = Math.min(...vals); return vals.map((v, i) => `${(i / 11) * 300},${110 - ((v - mn) / (mx - mn || 1)) * 96}`).join(' ') }
  const rows: [string, string, string][] = [
    ['Calls a month', String(Math.round(a.callsTyp)), String(Math.round(z.callsAds + z.callsOrganic))],
    ['Page-1 keywords', String(Math.round(a.keywords)), String(Math.round(z.keywords))],
    ['Google reviews', String(Math.round(a.reviews)), String(Math.round(z.reviews))],
  ]
  return (
    <div className="hero-dash" aria-label={`${D.heroExample.label}: growth after 12 months with Jarz Digital`}>
      <div className="hd-top"><span className="dot" />{D.heroExample.label}</div>
      <div className="hd-big"><span>Monthly revenue</span><b>{money(z.revenue)}</b><em>+{Math.round((z.revenue / a.revenueTyp - 1) * 100)}% in 12 months</em></div>
      <svg viewBox="0 0 300 116" className="hd-chart" aria-hidden><polyline points={line(pts.map((p) => p.revenue))} pathLength={1} /></svg>
      <ul>{rows.map(([l, b, c]) => <li key={l}><span>{l}</span><s>{b}</s><b>{c}</b></li>)}</ul>
      <p className="hd-note">Illustration from our calculator. Your numbers depend on your market.</p>
    </div>
  )
}

function TrustBar({ current }: { current?: string }) {
  const D = useSite()
  return (
    <nav className="citynav" aria-label="Locations">
      <p className="citynav-label">{current ? 'Our locations' : 'Choose your city'}</p>
      <div className="citynav-grid">
        {D.cities.map((c) => (
          <a key={c.id} href={`${D.root}${c.slug}/`} className={`city-btn${c.id === current ? ' on' : ''}`} aria-current={c.id === current ? 'page' : undefined}>
            <svg viewBox="0 0 24 24" aria-hidden><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
            <span><b>{placeOf(c)}</b><small>SEO · Ads · AI</small></span>
          </a>
        ))}
        <a href={D.root} className={`city-btn usa${current ? '' : ' on'}`} aria-current={current ? undefined : 'page'}>
          <svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" /></svg>
          <span><b>{D.allLabel}</b><small>{D.allSub}</small></span>
        </a>
      </div>
    </nav>
  )
}

const ICON: Record<string, ReactNode> = {
  bot: <><rect x="4" y="7" width="16" height="12" rx="3" /><path d="M12 3v4M9 12h.01M15 12h.01M9.5 15.5h5" /></>,
  flow: <><circle cx="5" cy="6" r="2.5" /><circle cx="19" cy="6" r="2.5" /><circle cx="12" cy="18" r="2.5" /><path d="M7.5 6h9M6.3 8.2l4.4 7.6M17.7 8.2l-4.4 7.6" /></>,
  pin: <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zm0-9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
  ads: <path d="M4 15V9l11-5v16L4 15zm0 0 2 5h3l-1.5-4M18 9a3 3 0 0 1 0 6" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.8-4.8" /></>,
  browser: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M7 6.5h.01M10 6.5h.01" /></>,
  app: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
  chat: <path d="M4 5h16v11H8l-4 4V5z" />,
  chart: <path d="M4 20V10m6 10V4m6 16v-7m6 7H2" />,
  code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" />,
  brush: <path d="M14 4l6 6-9 9H5v-6l9-9zM12 6l6 6" />,
}

function ServicesOverview() {
  const D = useSite()
  return (
    <section id="services" className="anchor block">
      <header className="sec-head"><p className="eyebrow">Our services</p><h2>{D.servicesTitle ?? 'Twelve services, one team, one growth plan'}</h2>
        <p className="lead">{D.home.servicesLead}</p></header>
      <p className="swipe-hint">Swipe to see all 12 services →</p>
      <div className="svc-grid">
        {D.services.map((s, i) => (
          <Reveal key={s.id} delay={(i % 3) * 70} className={`card svc-card ${i < 2 || s.id === 'ai' || s.id === 'ai-agents' ? 'lead-svc' : ''}`}>
            <article id={`svc-${s.id}`}>
              <svg className="svc-ico" viewBox="0 0 24 24" aria-hidden>{ICON[s.icon]}</svg>
              <h3>{s.name}</h3>
              <p className="svc-tag">{s.tagline}</p>
              <p>{s.body}</p>
              <ul className="check">{s.includes.map((t) => <li key={t}>{t}</li>)}</ul>
              <p className="svc-result"><b>Result:</b> {s.result}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Results() {
  const D = useSite()
  const R = D.results
  return (
    <section id="results" className="anchor block">
      <header className="sec-head"><p className="eyebrow">Proven results</p><h2>{R.title}</h2><p className="lead">{R.lead}</p></header>
      <p className="swipe-hint">Swipe for more results →</p>
      <div className="proof-grid">
        {R.proof.map((p) => (
          <figure key={p.img} className="card proof">
            <img src={p.img} srcSet={`${p.img.replace(/\.(jpg|webp)$/, '-800.$1')} 800w, ${p.img} ${p.width}w`} sizes="(max-width: 700px) 100vw, 33vw" alt={p.alt} width={p.width} height={p.height} loading="lazy" decoding="async" />
            <figcaption><span className="pill green">{p.badge ?? `#1 · ${p.city}`}</span><b>“{p.search}”</b><span>{p.note}</span></figcaption>
          </figure>
        ))}
      </div>
      <div className="strip case-strip">
        {R.strip.map(([n, t]) => <div key={t}><b>{n}</b><span>{t}</span></div>)}
      </div>
    </section>
  )
}

function Locations() {
  const D = useSite()
  return (
    <section id="locations" className="anchor block">
      <header className="sec-head"><p className="eyebrow">Locations</p><h2>{D.locations.title}</h2><p className="lead">{D.locations.lead}</p></header>
      <div className="loc-list">
        {D.cities.map((c) => (
          <article key={c.id} className="card loc">
            <div className="loc-head"><span className="pill">{c.region}</span><h3>{c.display ?? `${c.name}, ${c.state}`}</h3></div>
            <p>{D.cityExtra[c.id].market}</p>
            <p className="loc-areas">{D.cityExtra[c.id].neighborhoods}</p>
            <a className="more" href={`${D.root}${c.slug}/`}>SEO, Google Ads and AI services in {c.name} →</a>
          </article>
        ))}
      </div>
      <p className="lead nation">{D.locations.nationwide}</p>
    </section>
  )
}

function PricingSection({ place }: { place?: string }) {
  const { pricing } = useSite()
  return (
    <section id="pricing" className="anchor block">
      <header className="sec-head"><p className="eyebrow">Pricing</p><h2>{place ? `How our pricing works for ${place} businesses` : pricing.title}</h2><p className="lead">{pricing.intro}</p></header>
      <div className="long-grid">{pricing.blocks.map(([h, p]) => <div key={h} className="long-item"><h3>{h}</h3><p>{p}</p></div>)}</div>
    </section>
  )
}

function AuditSection({ place }: { place?: string }) {
  const { audit } = useSite()
  return (
    <section id="audit" className="anchor block">
      <header className="sec-head"><p className="eyebrow">Free growth audit</p><h2>{place ? `What the free ${place} growth audit includes` : audit.title}</h2>
        <p className="lead">The audit is free, takes no commitment and gives you a clear picture of where your business stands online, whether or not you decide to work with us.</p></header>
      <ul className="check audit-list">{audit.items.map((t) => <li key={t}>{t}</li>)}</ul>
    </section>
  )
}

function Industries({ c }: { c?: CW }) {
  const D = useSite()
  return (
    <section id="who-we-serve" className="anchor block">
      <header className="sec-head"><p className="eyebrow">Who we work with</p><h2>{c ? `Businesses we help grow in ${c.name}` : D.whoTitle}</h2>
        <p className="lead">Our methods are proven across many local industries. Each plan is adapted to the way your customers search, compare and buy.</p></header>
      <div className="long-grid">{D.who.map(([h, p]) => <div key={h} className="long-item"><h3>{h}</h3><p>{p}</p></div>)}</div>
      <ul className="ind-chips who-chips">{D.industries.map((i) => <li key={i}>{i}</li>)}</ul>
    </section>
  )
}

function FaqSection({ faqs, title }: { faqs: Faq[]; title: string }) {
  // first question open; the rest collapse so the long list stays easy to scan
  return (
    <section id="faq" className="anchor block">
      <header className="sec-head"><p className="eyebrow">FAQ</p><h2>{title}</h2></header>
      <div className="faq">{faqs.map((f, i) => (
        <details key={f.q} open={i === 0}><summary><h3>{f.q}</h3><i aria-hidden>+</i></summary><p>{f.a}</p></details>
      ))}</div>
    </section>
  )
}

function Contact({ cityName, place }: { cityName?: string; place?: string }) {
  const D = useSite()
  const msg = cityName ? `${D.waMessage} We are in ${cityName}.` : D.waMessage
  return (
    <section id="contact" className="anchor cta-final contact">
      <h2>{place ? `Request your free ${place} growth plan` : 'Request your free growth plan'}</h2>
      <p>Tell us about your business. We will review your Google rankings, advertising and website, then send a clear plan with projected results. There is no obligation and no long-term contract.</p>
      <div className="contact-cards">
        <a className="ccard wa" href={`${WHATSAPP}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3zm4.6 12.7c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 1.9 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.6-.1 1.2z" /></svg>
          <b>WhatsApp</b><span>{PHONE_DISPLAY}</span><em>Fastest response →</em>
        </a>
        <a className="ccard fb" href={FACEBOOK} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden><path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v7h4v-7h3l.5-4H14V8.6c0-.4.2-.6.6-.6H14z" /></svg>
          <b>Facebook</b><span>Jarz Digital page</span><em>Send a message →</em>
        </a>
        <a className="ccard em" href={`mailto:${EMAIL}?subject=${encodeURIComponent('Free growth plan')}`}>
          <svg viewBox="0 0 24 24" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6 8.5 7 8.5-7" /></svg>
          <b>Email</b><span>{EMAIL}</span><em>Write to us →</em>
        </a>
      </div>
    </section>
  )
}

/* ---------------- calculator video guide (Canada pages) ---------------- */
export const GUIDE_TRANSCRIPT = [
  'This short guide shows how to use the Jarz Digital Google Ads calculator to estimate calls, customers and revenue.',
  'First, choose your business type. Costs load in Canadian dollars, adjusted for your city.',
  'Next, select an ad platform: Search, Local Services, Microsoft, or Facebook and Instagram.',
  'Then pick a growth plan: Ads only, Ads plus SEO, or Ads plus SEO plus business management, which answers every lead and brings customers back.',
  'Choose a results range: Conservative, Expected or Strong.',
  "The summary bar shows this month's profit, revenue and ad return, plus Month 12 revenue for your plan.",
  'Set your monthly ad budget, an optional management fee, and whether the budget rises when ads are profitable.',
  'Adjust cost per click and conversion, then your close rate, job value, margin and repeat jobs.',
  'For SEO plans, add your monthly investment to see profit after fees.',
  'The 12-month plan tab shows revenue, profit, leads and cost per customer.',
  'This month shows the path from ad spend to customers, and the forecast charts the next six months.',
  'Health check shows the most you can pay per lead. Platforms and budgets compare every option.',
  'Finally, compare all three plans with cards, a chart and a month-by-month table.',
  'Want numbers for your own business? Request a free growth audit from Jarz Digital.',
]

function CalculatorGuide({ place }: { place?: string }) {
  return (
    <section id="calculator-guide" className="anchor guide-compact" aria-labelledby="guide-title">
      <div className="guide-card">
        <div className="guide-video">
          <video controls playsInline preload="none" poster="/video/calculator-guide-poster.jpg" width={1280} height={720} aria-label="How-to-use tutorial: the Jarz Digital Google Ads calculator">
            <source src="/video/calculator-guide.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="guide-text">
          <p className="eyebrow">How-to-use tutorial</p>
          <h2 id="guide-title" className="h3">{place ? `How to use the ${place} Google Ads calculator` : 'How to use the Google Ads calculator'}</h2>
          <p>A short video that walks through every function: business type, ad platforms, growth plans, results range, inputs, result tabs and the plan comparison.</p>
          <ul className="guide-meta"><li>1:35</li><li>Captions</li><li>All functions</li></ul>
        </div>
      </div>
      <details className="guide-transcript"><summary>Read the tutorial transcript</summary><ol>{GUIDE_TRANSCRIPT.map((l) => <li key={l}>{l}</li>)}</ol></details>
    </section>
  )
}

/* ---------------- explanatory sections ---------------- */
type CW = CityWords | undefined

function AboutSection({ c }: { c: CW }) {
  const a = useSite().about(c)
  return (
    <section id="about" className="anchor block">
      <header className="sec-head"><p className="eyebrow">About us</p><h2>{a.title}</h2></header>
      <div className="about-grid">
        <div className="about-text">{a.paras.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}</div>
        <div className="about-vals">{a.values.map(([h, p]) => <div key={h} className="card"><h3 className="h3c">{h}</h3><p>{p}</p></div>)}</div>
      </div>
    </section>
  )
}

function ServiceDetailsSection({ c }: { c: CW }) {
  const D = useSite()
  const name = (id: string) => D.services.find((s) => s.id === id)!.name
  return (
    <section id="service-details" className="anchor block">
      <header className="sec-head"><p className="eyebrow">Service details</p><h2>{c ? `How each service works for ${c.name} businesses` : 'How each service works, in detail'}</h2>
        <p className="lead">Who each service is for, exactly what we do and what you receive every month.</p></header>
      <div className="faq sd">{D.details.map((d, i) => (
        <details key={d.id} open={i === 0}>
          <summary><h3>{name(d.id)}: how it works{c ? ` in ${c.name}` : ''}</h3><i aria-hidden>+</i></summary>
          <div className="sd-body">
            <p><b>Who it is for:</b> {d.who}</p>
            <ol>{d.how.map((h) => <li key={h}>{h}</li>)}</ol>
            <p><b>What you receive:</b> {d.deliver}</p>
          </div>
        </details>
      ))}</div>
    </section>
  )
}

function QualitySection({ place }: { place?: string }) {
  const { quality } = useSite()
  return (
    <section id="quality" className="anchor block">
      <header className="sec-head"><p className="eyebrow">Our standards</p><h2>{place ? `Quality standards for every ${place} project` : 'The quality standards behind every project'}</h2>
        <p className="lead">Strong results come from doing the fundamentals properly, every time. These standards apply to every client, whatever the size of the project.</p></header>
      <div className="grid g4 q-grid">{quality.map(([h, p]) => <Reveal key={h} className="card"><h3 className="h3c">{h}</h3><p>{p}</p></Reveal>)}</div>
    </section>
  )
}

function ProcessSection({ c }: { c: CW }) {
  const { process } = useSite()
  return (
    <section id="process" className="anchor block">
      <header className="sec-head"><p className="eyebrow">Our process</p><h2>{c ? `How we work with ${c.name} businesses, step by step` : 'How we work, step by step'}</h2></header>
      <ol className="flow proc">{process.map(([h, p]) => <li key={h}><b>{h}</b><span>{p}</span></li>)}</ol>
    </section>
  )
}

function CasesSection({ id = 'case-studies', place }: { id?: string; place?: string }) {
  const { cases } = useSite()
  return (
    <section id={id} className="anchor block">
      <header className="sec-head"><p className="eyebrow">Case studies</p><h2>{place ? `Client results that matter to ${place} businesses` : 'Results our clients have achieved'}</h2>
        <p className="lead">Client names are kept private. The outcomes are taken from live Google results and the clients' own sales dashboards.</p></header>
      <div className="grid g2">{cases.map((x) => <Reveal key={x.h} className="card case"><h3 className="h3c">{x.h}</h3><p>{x.p}</p></Reveal>)}</div>
    </section>
  )
}

function GlossarySection({ place }: { place?: string }) {
  const { glossary } = useSite()
  return (
    <section id="glossary" className="anchor block">
      <header className="sec-head"><p className="eyebrow">Glossary</p><h2>{place ? `Digital marketing terms for ${place} business owners` : 'Digital marketing terms, explained simply'}</h2></header>
      <dl className="gloss">{glossary.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}</dl>
    </section>
  )
}

/* ---------------- long-form sections ---------------- */
function Long({ s, accent }: { s: LongSection; accent?: boolean }) {
  return (
    <section id={s.id} className={`anchor block long ${accent ? 'long-accent' : ''}`}>
      <header className="sec-head"><p className="eyebrow">{s.eyebrow}</p><h2>{s.title}</h2><p className="lead">{s.intro}</p></header>
      {s.stats && <div className="opp-stats">{s.stats.map(([n, t, src]) => <Reveal key={t} className="card opp"><b>{n}</b><span>{t}</span><small>{src}</small></Reveal>)}</div>}
      <div className="long-grid">{s.blocks.map((b) => <Reveal key={b.h} className="long-item"><h3>{b.h}</h3><p>{b.p}</p></Reveal>)}</div>
    </section>
  )
}

function Playbooks({ city, cityName }: { city?: string; cityName?: string }) {
  const D = useSite()
  return (
    <section id="industries" className="anchor block">
      <header className="sec-head"><p className="eyebrow">Industry playbooks</p><h2>{cityName ? `Marketing playbooks for ${cityName} industries` : 'Marketing playbooks by industry'}</h2>
        <p className="lead">{D.playbooksLead}</p></header>
      <div className="pb-grid">{D.playbooks.map((p) => (
        <Reveal key={p.id} className="card pb">
          <h3>{cityName ? `${p.kw.charAt(0).toUpperCase() + p.kw.slice(1)} in ${cityName}` : p.name}</h3>
          <span className="pb-data">{p.data}</span>
          <p>{p.base}</p>
          {city && p.city[city] && <p className="pb-city"><b>{cityName}:</b> {p.city[city]}</p>}
          {!city && <p className="pb-kw">{p.kw}</p>}
        </Reveal>
      ))}</div>
    </section>
  )
}

/* ---------------- city pages ---------------- */
function CityPage({ city }: { city: City }) {
  const D = useSite()
  const L = D.long
  const market = useMemo(() => (D.cityMarket ? D.cityMarket(city.id, city.name) : D.calc), [D, city])
  const calc = useUsCalc(city.calcCat, `jd-site-calc-${city.id}`, market)
  const x = D.cityExtra[city.id]
  const cw = { name: city.name, state: city.state }
  const u = D.cityUnique[city.id]
  const loc = placeOf(city)
  const uSeo: LongSection = { id: 'local-seo-city', eyebrow: `${city.name} SEO`, title: `Local SEO services in ${loc}: what works in this market`, intro: `Every city ranks differently. As a ${city.name} SEO company, we combine local SEO services, web design in ${loc} and AI search optimization around the way people in ${city.name} actually search.`, blocks: u.seo }
  const uAds: LongSection = { id: 'google-ads-city', eyebrow: `${city.name} Google Ads`, title: `Google Ads agency in ${city.name}: how we manage your budget`, intro: `As your Google Ads agency in ${city.name}, we plan campaigns around local seasons, ${D.market === 'us' ? 'neighborhoods' : 'neighbourhoods'} and competitors, so every dollar goes where it brings booked customers.`, blocks: u.ads }
  const uAi: LongSection = { id: 'ai-city', eyebrow: `AI in ${city.name}`, title: `AI agents, AI SEO and ChatGPT visibility for ${city.name} businesses`, intro: `AI is changing how ${city.name} customers find and contact businesses. We help you appear in ChatGPT, Claude, Gemini and Google AI Overviews, and answer every enquiry instantly.`, blocks: u.ai }
  return (
    <>
      <Hero
        crumbs={<nav className="crumbs" aria-label="Breadcrumb"><a href={D.root}>{D.crumbHome}</a> › <span>{loc}</span></nav>}
        eyebrow={city.kicker}
        h1={city.h1}
        sub={city.intro[0]}
      />
      <TrustBar current={city.id} />
      <section className="block city-intro">
        <p className="lead">{city.intro[1]}</p>
        {city.proof && (
          <figure className="card proof city-proof">
            <img src={city.proof.img} srcSet={`${city.proof.img.replace(/\.(jpg|webp)$/, '-800.$1')} 800w, ${city.proof.img} ${city.proof.width}w`} sizes="(max-width: 900px) 100vw, 900px" alt={city.proof.alt} width={city.proof.width} height={city.proof.height} loading="lazy" decoding="async" />
            <figcaption>{city.proof.caption}</figcaption>
          </figure>
        )}
      </section>
      <section className="anchor block">
        <header className="sec-head"><p className="eyebrow">{city.name} market</p><h2>{city.brand ? `How our ${city.brand} grows local businesses` : `How we grow ${city.name} businesses`}</h2><p className="lead">{x.market}</p></header>
        <div className="grid g3">{city.market.map((m) => <Reveal key={m.h} className="card"><h3 className="h3c">{m.h}</h3><p>{m.p}</p></Reveal>)}</div>
      </section>
      <Long s={L.opportunity(cw)} />
      <Long s={uSeo} />
      <Long s={uAds} />
      <section id="services" className="anchor block">
        <header className="sec-head"><p className="eyebrow">Services in {city.name}</p><h2>Local SEO, Google Ads, AI and web design for {city.name} businesses</h2>
          <p className="lead">Twelve services from one team, planned around the {city.name} market and your competitors.</p></header>
        <div className="grid g3 svc-mini">{D.services.map((s) => (
          <div key={s.id} className="card"><svg className="svc-ico" viewBox="0 0 24 24" aria-hidden>{ICON[s.icon]}</svg><h3 className="h3c">{s.name} in {city.name}</h3><p>{s.tagline} {u.services[s.id] ?? s.result}</p></div>
        ))}</div>
      </section>
      <section id="calculator" className="anchor"><CalculatorSection calc={calc} title={`Google Ads calculator for ${city.name} businesses`} lead={D.calcCityLead(city.name)} /></section>
      {D.video && <CalculatorGuide place={city.name} />}
      <PlanSection calc={calc} place={city.name} />
      <Growth360 inp={calc.inp} catName={calc.cat.name} avg={market.avg} place={city.name} />
      <ServiceDetailsSection c={cw} />
      <CasesSection id="results" place={city.name} />
      <AboutSection c={cw} />
      <Long s={L.aiSearch(cw)} accent />
      <Long s={uAi} />
      <Long s={L.aiDeep(cw)} />
      <Long s={L.automationDeep(cw)} />
      <Long s={L.whyHire(cw)} />
      <Long s={L.howWeGrow(cw)} />
      <Long s={L.whyBest(cw)} accent />
      <QualitySection place={city.name} />
      <ProcessSection c={cw} />
      <Industries c={cw} />
      <Playbooks city={city.id} cityName={city.name} />
      <Long s={L.adsCostGuide(cw)} />
      <Long s={L.seoGuide(cw)} />
      <PricingSection place={city.name} />
      <AuditSection place={city.name} />
      <GlossarySection place={city.name} />
      <section className="anchor block">
        <header className="sec-head"><p className="eyebrow">Service area</p><h2>{city.display ? `Areas we serve across ${city.name}` : `Areas we serve around ${city.name}`}</h2><p className="lead">{x.neighborhoods}</p></header>
        <ul className="ind-chips">{city.areas.map((a) => <li key={a}>{a}</li>)}</ul>
        <p className="src kw-line">Local searches we target in {city.name}: {x.keywords.join(' · ')}</p>
      </section>
      <FaqSection faqs={D.faqsFor(city.id)} title={`SEO, Google Ads and AI in ${city.name}: common questions`} />
      <Contact cityName={loc} place={city.name} />
    </>
  )
}
