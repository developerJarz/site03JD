'use client'
// 360° growth dashboard: rankings, visitors, calls, leads, reviews and revenue over 12 months.
import { useMemo, useState } from 'react'
import { useNarrow } from './use-narrow'
import { int, money, MONEY } from '@/content/country-sites/us/money'
import { G360, growth360, TODAY_DEFAULT, type Point360, type Today, type UsInputs } from '@/content/country-sites/us/model'

const n0 = int
const $ = money
const up = (a: number, b: number) => (a > 0 ? `+${Math.round(((b - a) / a) * 100)}%` : `+${n0(b - a)}`)

type Tab = 'rankings' | 'visitors' | 'calls' | 'leads' | 'revenue'
const TABS: [Tab, string][] = [['rankings', 'Google rankings'], ['visitors', 'Website visitors'], ['calls', 'Phone calls'], ['leads', 'Leads'], ['revenue', 'Revenue']]

export default function Growth360({ inp, catName, avg = 'US average', place }: { inp: UsInputs; catName: string; avg?: string; place?: string }) {
  const [today, setToday] = useState<Today>(TODAY_DEFAULT)
  const [tab, setTab] = useState<Tab>('rankings')
  const pts = useMemo(() => growth360(inp, today), [inp, today])
  const m0 = pts[0], m12 = pts[11]
  const visitorsNow = today.visitors + inp.budget / (inp.cpc || 1) // ads already running at average performance
  const startCalls = m0.callsTyp, startLeads = m0.leadsTyp, startRev = m0.revenueTyp

  const cards: { label: string; before: string; after: string; gain: string; spark: number[] }[] = [
    { label: 'Keywords on Google page 1', before: n0(today.keywords), after: n0(m12.keywords), gain: up(today.keywords, m12.keywords), spark: pts.map((p) => p.keywords) },
    { label: 'Top-3 spots on Google Maps', before: n0(today.mapTop3), after: n0(m12.mapTop3), gain: up(today.mapTop3, m12.mapTop3), spark: pts.map((p) => p.mapTop3) },
    { label: 'Website visitors a month', before: n0(visitorsNow), after: n0(m12.visitorsPaid + m12.visitorsOrganic), gain: up(visitorsNow, m12.visitorsPaid + m12.visitorsOrganic), spark: pts.map((p) => p.visitorsPaid + p.visitorsOrganic) },
    { label: 'Free organic visitors a month', before: n0(today.visitors), after: n0(m12.visitorsOrganic), gain: up(today.visitors, m12.visitorsOrganic), spark: pts.map((p) => p.visitorsOrganic) },
    { label: 'Phone calls a month', before: n0(startCalls), after: n0(m12.callsAds + m12.callsOrganic), gain: up(startCalls, m12.callsAds + m12.callsOrganic), spark: pts.map((p) => p.callsAds + p.callsOrganic) },
    { label: 'Leads a month', before: n0(startLeads), after: n0(m12.leads), gain: up(startLeads, m12.leads), spark: pts.map((p) => p.leads) },
    { label: 'Google reviews', before: n0(today.reviews), after: n0(m12.reviews), gain: up(today.reviews, m12.reviews), spark: pts.map((p) => p.reviews) },
    { label: 'Monthly revenue', before: $(startRev), after: $(m12.revenue), gain: up(startRev, m12.revenue), spark: pts.map((p) => p.revenue) },
  ]

  return (
    <section id="jdp-360" className="anchor block">
      <header className="sec-head"><div className="eyebrow">360° growth</div><h2>{place ? `How ${place} businesses grow: rankings, visitors, calls and revenue` : 'Integrated growth: rankings, visitors, calls and revenue'}</h2>
        <p className="lead">Ads bring customers from the first month. SEO, Google Maps, reviews and AI replies keep adding more every month. Here is what the first 12 months look like for <b>{catName}</b>.</p></header>

      <div className="today">
        <span>Your business today:</span>
        <label>Website visitors a month<input type="number" min={0} value={today.visitors} onChange={(e) => setToday({ ...today, visitors: Math.max(0, +e.target.value) })} /></label>
        <label>Keywords on page 1<input type="number" min={0} value={today.keywords} onChange={(e) => setToday({ ...today, keywords: Math.max(0, +e.target.value) })} /></label>
        <label>Google reviews<input type="number" min={0} value={today.reviews} onChange={(e) => setToday({ ...today, reviews: Math.max(0, +e.target.value) })} /></label>
      </div>

      <div className="g360">
        {cards.map((c) => (
          <div key={c.label} className="card g360-card">
            <span className="g-l">{c.label}</span>
            <div className="g-ba"><span className="g-b">{c.before}</span><i aria-hidden>→</i><b>{c.after}</b></div>
            <div className="g-foot"><span className="pill green">{c.gain}</span><Spark data={c.spark} /></div>
          </div>
        ))}
      </div>
      <p className="src">Today → Month 12 with Jarz Digital. “Today” assumes your ads already run at {avg} results.</p>

      <div className="card chart-card">
        <div className="tabs360" role="tablist">{TABS.map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} className={`chip ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>{l}</button>)}</div>
        <Chart360 pts={pts} tab={tab} />
      </div>
      <p className="src">Typical agency = ads only at {avg} results, so organic numbers stay flat. Jarz Digital adds about {G360.keywordsGain} page-1 keywords, {G360.mapTop3Gain} top-3 map spots, {G360.organicVisitorsX}× organic visitors and {G360.reviewsPerMonth} new reviews a month by Month 12. About {Math.round(G360.callShare * 100)}% of local leads are phone calls. These are typical results from local SEO campaigns, not a guarantee; they depend on your market and competition.</p>
    </section>
  )
}

function Spark({ data }: { data: number[] }) {
  const max = Math.max(...data), min = Math.min(...data)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`).join(' ')
  return <svg className="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden><polyline points={pts} /></svg>
}

const SERIES: Record<Tab, { title: string; unit: '' | '$'; lines: { k: (p: Point360) => number; label: string; cls: string; area?: boolean }[] }> = {
  rankings: { title: 'Keywords ranking on Google page 1', unit: '', lines: [
    { k: (p) => p.keywords, label: 'Jarz Digital: page 1 keywords', cls: 'seo', area: true },
    { k: (p) => p.mapTop3, label: 'Jarz Digital: top-3 Maps spots', cls: 'jz' },
    { k: (p) => p.keywordsTyp, label: 'Typical agency', cls: 'typ' }] },
  visitors: { title: 'Website visitors a month', unit: '', lines: [
    { k: (p) => p.visitorsPaid + p.visitorsOrganic, label: 'Jarz Digital: total visitors', cls: 'seo', area: true },
    { k: (p) => p.visitorsOrganic, label: 'Free organic visitors', cls: 'jz' },
    { k: (p) => p.visitorsTyp, label: 'Typical agency', cls: 'typ' }] },
  calls: { title: 'Phone calls a month', unit: '', lines: [
    { k: (p) => p.callsAds + p.callsOrganic, label: 'Jarz Digital: total calls', cls: 'seo', area: true },
    { k: (p) => p.callsOrganic, label: 'Free organic calls (Maps + website)', cls: 'jz' },
    { k: (p) => p.callsTyp, label: 'Typical agency', cls: 'typ' }] },
  leads: { title: 'Leads a month (calls, forms, bookings)', unit: '', lines: [
    { k: (p) => p.leads, label: 'Jarz Digital', cls: 'seo', area: true },
    { k: (p) => p.leadsTyp, label: 'Typical agency', cls: 'typ' }] },
  revenue: { title: 'Revenue a month', unit: '$', lines: [
    { k: (p) => p.revenue, label: 'Jarz Digital', cls: 'seo', area: true },
    { k: (p) => p.revenueTyp, label: 'Typical agency', cls: 'typ' }] },
}

function Chart360({ pts, tab }: { pts: Point360[]; tab: Tab }) {
  const S = SERIES[tab]
  const n = useNarrow()
  const W = n ? 360 : 720, H = n ? 270 : 290, L = n ? 42 : 60, R = n ? 54 : 78, T = 16, B = 30, ph = H - T - B
  const max = Math.max(...S.lines.flatMap((l) => pts.map(l.k))) * 1.1 || 1
  const x = (i: number) => L + (i * (W - L - R)) / 11
  const y = (v: number) => T + ph - (v / max) * ph
  const fmt = (v: number) => (S.unit === '$' ? MONEY.sym : '') + (v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e4 ? Math.round(v / 1e3) + 'K' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'K' : Math.round(v))
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max)
  const color: Record<string, string> = { seo: '#3DDC97', jz: '#52D4DC', typ: '#F2A33A' }
  return (
    <div>
      <h3 className="c360-t">{S.title}</h3>
      <div className="legend">{S.lines.map((l) => <span key={l.label} className="lg"><i style={{ background: color[l.cls] }} />{l.label}</span>)}</div>
      <svg key={tab + (n ? 'n' : '')} className={`chart draw${n ? ' narrow' : ''}`} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={S.title}>
        {ticks.map((t) => <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="grid" /><text x={L - 8} y={y(t) + 4} className="axis" textAnchor="end">{fmt(t)}</text></g>)}
        {pts.map((p, i) => (n ? i % 3 === 0 || i === 11 : i % 2 === 0 || i === 11) && <text key={i} x={x(i)} y={H - 8} className="lbl" textAnchor="middle">M{p.month}</text>)}
        {S.lines.map((l) => {
          const line = pts.map((p, i) => `${x(i)},${y(l.k(p))}`).join(' ')
          return <g key={l.label}>
            {l.area && <polygon points={`${line} ${x(11)},${y(0)} ${x(0)},${y(0)}`} fill="rgba(61,220,151,.09)" />}
            <polyline className={`gl ${l.cls}`} points={line} pathLength={l.cls === 'typ' ? undefined : 1} />
            <circle cx={x(11)} cy={y(l.k(pts[11]))} r={5} fill={color[l.cls]} />
            <text x={x(11) + 9} y={y(l.k(pts[11])) + 4} className="val" fill={color[l.cls]}>{fmt(l.k(pts[11]))}</text>
          </g>
        })}
      </svg>
    </div>
  )
}
