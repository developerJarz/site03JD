// "Why Jarz Digital" sections for the US calculator page: comparison, growth chart, services, steps.
import { useMemo } from 'react'
import { G360, growth12, JARZ, ORG_LEAD_RATE, TODAY_DEFAULT, type UsInputs } from './model'
import Growth360 from './Growth360'
import { int, money, moneyShort } from './money'
import { useNarrow } from '../components/ui'

const $ = money
const n1 = (n: number) => (n < 10 ? n.toFixed(1) : int(n))

const COMPARE: [string, string, string][] = [
  ['Where ads send people', 'Your homepage', 'A landing page built to get calls and bookings'],
  ['Tracking', 'Clicks and impressions', 'Every call, form and booking, so we know what makes money'],
  ['Keywords', 'Broad keywords that waste budget', 'Buyer keywords only, with wasted searches blocked every week'],
  ['Answering leads', 'Up to you, often hours later', 'AI replies in seconds, day and night, with follow-ups'],
  ['Google Maps & SEO', 'Not included', 'Local SEO brings free leads that grow every month'],
  ['Website', 'Separate project with another company', 'Fast website or web app built by our own developers'],
  ['AI search', 'Not offered', 'Optimized to appear in ChatGPT and Google AI answers'],
  ['Reporting', 'Clicks and impressions', 'Leads, customers, revenue and cost per customer'],
]

const SERVICES: [string, string, string[]][] = [
  ['Google Ads & Local Services Ads', 'Ads that bring calls, not just clicks.', ['Search, Maps and Local Services Ads', 'Landing pages and call tracking', 'Weekly testing and budget control']],
  ['Local SEO', 'Rank on Google Maps and get free leads every month.', ['Google Business Profile optimization', 'Reviews, citations and local pages', 'Top-3 map ranking for your services']],
  ['Website development', 'A fast website that turns visitors into customers.', ['Mobile-first design, built to rank', 'Click-to-call, booking and quote forms', 'Speed, security and hosting handled']],
  ['Web app development', 'Custom tools that save hours every week.', ['Online booking and customer portals', 'Quote calculators and dashboards', 'Custom systems for your business']],
  ['AI integration & optimization', 'Answer every lead and show up in AI search.', ['AI chat and instant replies 24/7', 'Automatic follow-ups and reminders', 'Visibility in ChatGPT and Google AI answers']],
]

export function CompareSection({ title = 'Most agencies run ads. We build a system that brings customers.' }: { title?: string }) {
  return (
    <>
      <section id="jdp-why" className="anchor block">
        <header className="sec-head"><div className="eyebrow">Why Jarz Digital</div><h2>{title}</h2>
          <p className="lead">The same ad budget can bring very different results. What changes the result is everything around the ads: the website, the tracking, how fast leads get an answer, and free traffic from SEO.</p></header>
        <div className="tbl-wrap"><table className="tbl why">
          <thead><tr><th scope="col">What matters</th><th scope="col">Typical agency</th><th scope="col">Jarz Digital</th></tr></thead>
          <tbody>{COMPARE.map(([a, b, c]) => (
            <tr key={a}><td data-label=""><b>{a}</b></td><td data-label="Typical agency" className="muted">{b}</td><td data-label="Jarz Digital" className="good">{c}</td></tr>
          ))}</tbody>
        </table></div>
      </section>

    </>
  )
}

export function GrowthSection({ inp, catName, onCalc, avg = 'US average', place }: { inp: UsInputs; catName: string; onCalc: () => void; avg?: string; place?: string }) {
  const g = useMemo(() => growth12(inp), [inp])
  const last = g[11]
  const sum = (k: 'typical' | 'jarz' | 'jarzSeo') => g.reduce((a, p) => a + p[k], 0)
  const yT = sum('typical'), yJ = sum('jarz'), yS = sum('jarzSeo')
  const extra = yS - yT
  const multiple = last.typical ? last.jarzSeo / last.typical : 0
  return (
    <>
      <section id="jdp-growth" className="anchor block">
        <header className="sec-head"><div className="eyebrow">Your growth</div><h2>{place ? `Your first 12 months in ${place}: advertising, then advertising with SEO` : 'Your first 12 months: advertising, then advertising with SEO'}</h2>
          <p className="lead">For <b>{catName}</b> with a <b>{$(inp.budget)}</b> monthly ad budget. Change the business type or budget in the calculator and this updates.</p></header>

        <div className="grid g3 growth-kpis">
          <div className="card"><span className="pill amber">Typical agency</span><b className="big">{$(last.typical)}</b><p>monthly revenue by Month 12 · {n1(last.leadsTypical)} leads a month</p></div>
          <div className="card"><span className="pill">Jarz Digital ads</span><b className="big">{$(last.jarz)}</b><p>monthly revenue by Month 12 · {n1(last.leadsJarz)} leads a month</p></div>
          <div className="card accent"><span className="pill green">Jarz ads + SEO</span><b className="big">{$(last.jarzSeo)}</b><p>monthly revenue by Month 12 · {n1(last.leadsSeo)} leads a month</p></div>
        </div>

        <div className="card chart-card">
          <div className="legend"><span className="lg"><i className="l-typ" />Typical agency</span><span className="lg"><i className="l-ads" />Jarz Digital ads</span><span className="lg"><i className="l-seo" />Jarz ads + SEO</span></div>
          <GrowthChart points={g} />
        </div>

        <div className="strip">
          <div><b>{$(extra)}</b><span>extra revenue in year 1 vs a typical agency</span></div>
          <div><b>{multiple.toFixed(1)}×</b><span>monthly revenue by Month 12</span></div>
          <div><b>{$(yS)}</b><span>total revenue in year 1 with ads + SEO</span></div>
        </div>
        <p className="src">Same budget in all three. Typical agency = {avg} results for this category. Jarz Digital = {Math.round((JARZ.cvr - 1) * 100)}% more leads per click, {Math.round((1 - JARZ.cpc) * 100)}% cheaper clicks and {Math.round((JARZ.close - 1) * 100)}% more leads closed, reached by Month 3. SEO grows free website visitors from {TODAY_DEFAULT.visitors} to {TODAY_DEFAULT.visitors * G360.organicVisitorsX} a month by Month 12, and about {Math.round(ORG_LEAD_RATE * 100)}% of them become leads. These are typical improvements from our account work, not a guarantee; results depend on your market and competition. Year-1 totals {$(yT)} · {$(yJ)} · {$(yS)}.</p>
        <button className="btn primary" onClick={onCalc}>Try your own numbers →</button>
      </section>

    </>
  )
}

export function ServicesSection() {
  return (
    <>
      <section id="jdp-services" className="anchor block">
        <header className="sec-head"><div className="eyebrow">What we build</div><h2>Everything your business needs to grow, in one team</h2></header>
        <div className="grid g3 svc-cards">{SERVICES.map(([h, p, items], i) => (
          <div key={h} className={`card ${i === 4 ? 'accent' : ''}`}><h4>{h}</h4><p>{p}</p><ul className="check">{items.map((t) => <li key={t}>{t}</li>)}</ul></div>
        ))}
          <div className="card result-card"><h4>The result</h4><p>More people find you on Google and Maps, more of them call, and every lead gets an answer fast. Ads bring customers from day one, and SEO keeps adding free customers every month.</p></div>
        </div>
      </section>

    </>
  )
}

export function StepsSection() {
  return (
    <>
      <section className="anchor block">
        <header className="sec-head"><div className="eyebrow">How it works</div><h2>Fast growth for any local business, in 3 steps</h2></header>
        <ol className="flow steps3">
          <li><b>Build</b><span>Website or web app, Google Business Profile, tracking and AI lead replies. Ready in 2–4 weeks.</span></li>
          <li><b>Launch</b><span>Google Ads and Local Services Ads bring calls from the first month while SEO starts working.</span></li>
          <li><b>Grow</b><span>We cut waste every week, scale what works, and SEO adds more free leads every month.</span></li>
        </ol>
      </section>
    </>
  )
}

export default function WhyJarz({ inp, catName, onCalc }: { inp: UsInputs; catName: string; onCalc: () => void }) {
  return (
    <>
      <CompareSection />
      <GrowthSection inp={inp} catName={catName} onCalc={onCalc} />
      <Growth360 inp={inp} catName={catName} />
      <ServicesSection />
      <StepsSection />
    </>
  )
}

function GrowthChart({ points }: { points: ReturnType<typeof growth12> }) {
  const n = useNarrow()
  const W = n ? 360 : 720, H = n ? 280 : 300, L = n ? 42 : 60, R = n ? 50 : 70, T = 16, B = 30, ph = H - T - B
  const max = Math.max(...points.map((p) => p.jarzSeo)) * 1.08 || 1
  const x = (i: number) => L + (i * (W - L - R)) / 11
  const y = (v: number) => T + ph - (v / max) * ph
  const line = (k: 'typical' | 'jarz' | 'jarzSeo') => points.map((p, i) => `${x(i)},${y(p[k])}`).join(' ')
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max)
  const lab = moneyShort
  const ends: [string, number, string][] = [['typical', points[11].typical, '#F2A33A'], ['jarz', points[11].jarz, '#52D4DC'], ['jarzSeo', points[11].jarzSeo, '#3DDC97']]
  return (
    <svg className={`chart${n ? ' narrow' : ''}`} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Monthly revenue over 12 months">
      {ticks.map((t) => <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="grid" /><text x={L - 8} y={y(t) + 4} className="axis" textAnchor="end">{lab(t)}</text></g>)}
      {points.map((p, i) => (n ? i % 3 === 0 || i === 11 : i % 2 === 0 || i === 11) && <text key={i} x={x(i)} y={H - 8} className="lbl" textAnchor="middle">M{p.month}</text>)}
      <polygon points={`${line('jarzSeo')} ${x(11)},${y(0)} ${x(0)},${y(0)}`} fill="rgba(61,220,151,.08)" />
      <polyline className="gl typ" points={line('typical')} />
      <polyline className="gl jz" points={line('jarz')} />
      <polyline className="gl seo" points={line('jarzSeo')} />
      {ends.map(([k, v, c]) => <g key={k}><circle cx={x(11)} cy={y(v)} r={5} fill={c} /><text x={x(11) + 9} y={y(v) + 4} className="val" fill={c}>{lab(v)}</text></g>)}
    </svg>
  )
}
