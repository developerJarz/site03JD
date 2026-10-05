// 12-month comparison of the three growth plans: Ads only · Ads + SEO · Ads + SEO + business management.
// Shares plan, range and fee state with the calculator, so a change in either place updates both.
import { useMemo } from 'react'
import { useNarrow } from '../components/ui'
import { allPlans, PLANS, RANGE_VALUES, RANGES, type PlanId } from './plans'
import type { UsCalc } from './UsAdsPage'

const $ = (n: number) => (n < 0 ? '-$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US')
const n0 = (n: number) => Math.round(n).toLocaleString('en-US')
const pct = (n: number) => `${Math.round(n * 100)}%`
const COLOR: Record<PlanId, string> = { ads: '#F2A33A', seo: '#52D4DC', full: '#3DDC97' }

export default function PlanSection({ calc, place }: { calc: UsCalc; place?: string }) {
  const { inp, cat, plan, setPlan, range, setRange, fees, market } = calc
  const plans = useMemo(() => allPlans(inp, range, undefined, fees), [inp, range, fees])
  const ads = plans.ads
  const V = RANGE_VALUES
  return (
    <section id="growth-plans" className="anchor block plans">
      <header className="sec-head"><p className="eyebrow">Growth plans</p>
        <h2>{place ? `Ads, SEO and business management in ${place}: 12-month comparison` : 'Ads only, Ads + SEO, or Ads + SEO + business management'}</h2>
        <p className="lead">For <b>{cat.name}</b> with a <b>{$(inp.budget)}</b> monthly ad budget{market.id === 'ca' ? ' (CAD)' : ''}. Ads bring customers from the first month. SEO adds free leads that compound, and business management makes sure more of every lead becomes a paying, returning customer. Change the plan or range here or in the calculator above.</p></header>

      <div className="range-pick" role="radiogroup" aria-label="SEO and management results">
        <span>Results range</span>
        {RANGES.map((r) => <button key={r.id} role="radio" aria-checked={range === r.id} className={`chip ${range === r.id ? 'on' : ''}`} onClick={() => setRange(r.id)}>{r.name}</button>)}
      </div>

      <div className="plan-cards">
        {PLANS.map((p) => {
          const r = plans[p.id]
          const lift = ads.yearRevenue ? r.yearRevenue / ads.yearRevenue - 1 : 0
          return (
            <button key={p.id} className={`card plan-card ${plan === p.id ? 'on' : ''}`} onClick={() => setPlan(p.id)} aria-pressed={plan === p.id} style={{ ['--pc' as string]: COLOR[p.id] }}>
              <span className="pc-name"><i />{p.name}</span>
              <b className="pc-big">{$(r.m12Revenue)}<small> / month by Month 12</small></b>
              <span className="pc-row"><span>Revenue, year 1</span><b>{$(r.yearRevenue)}</b></span>
              <span className="pc-row"><span>Leads, year 1</span><b>{n0(r.yearLeads)}</b></span>
              <span className="pc-row"><span>Profit, year 1</span><b className={r.yearProfit >= 0 ? 'pos' : 'neg'}>{$(r.yearProfit)}</b></span>
              <span className="pc-lift">{p.id === 'ads' ? 'Baseline' : `+${pct(lift)} revenue vs ads only`}</span>
              <ul className="check">{p.adds.map((a) => <li key={a}>{a}</li>)}</ul>
            </button>
          )
        })}
      </div>

      <div className="card chart-card">
        <div className="legend">{PLANS.map((p) => <span key={p.id} className="lg"><i style={{ background: COLOR[p.id] }} />{p.short}</span>)}</div>
        <PlanChart plans={plans} selected={plan} />
      </div>

      <div className="tbl-wrap"><table className="tbl num plan-tbl">
        <thead><tr><th scope="col">Month</th>{PLANS.map((p) => <th key={p.id} scope="col">{p.short}</th>)}</tr></thead>
        <tbody>
          {[1, 3, 6, 9, 12].map((mo) => (
            <tr key={mo}><td data-label="Month">Month {mo}</td>{PLANS.map((p) => { const x = plans[p.id].months[mo - 1]; return <td key={p.id} data-label={p.short}>{$(x.revenue)}<small> · {n0(x.leads)} leads</small></td> })}</tr>
          ))}
          <tr className="hl"><td data-label="Total">Year 1</td>{PLANS.map((p) => <td key={p.id} data-label={p.short}>{$(plans[p.id].yearRevenue)}<small> · {n0(plans[p.id].yearLeads)} leads</small></td>)}</tr>
        </tbody>
      </table></div>

      <div className="long-grid plan-notes">
        <div className="long-item"><h3>What SEO adds</h3><p>Organic visitors from Google Search and Maps grow to about {V.seoVisitorsX[range]}× today by Month 12 in the {RANGES.find((r) => r.id === range)!.name.toLowerCase()} range, and {pct(V.orgLeadRate[range])} of the extra visitors become leads. Results are slow for the first three months, then compound as rankings, map positions and reviews build.</p></div>
        <div className="long-item"><h3>What business management adds</h3><p>Every call and message answered within seconds, landing-page and offer testing, steady reviews, Google profile and social upkeep, and reminders that bring customers back. Modelled as {pct(V.mgmtConversion[range])} more ad conversions, {pct(V.mgmtClose[range])} more leads closed, {pct(V.mgmtRepeat[range])} more repeat business and a {pct(V.mgmtOrganic[range] - 1)} stronger organic lift.</p></div>
        <div className="long-item"><h3>Why these gains are realistic</h3><p>Replying within five minutes makes a lead 21× more likely to qualify than replying in 30 (Lead Response Management Study). Six in ten calls to small businesses go unanswered (411 Locals). The first Google Maps result takes 14.8% of clicks (First Page Sage, 2026). Management closes those gaps; SEO moves you up the map.</p></div>
        <div className="long-item"><h3>How to read the numbers</h3><p>Every plan uses your calculator inputs and our managed ads. Profit is after ad spend and any management, SEO or business management investment you enter in the calculator. These are planning estimates, not guarantees; real results depend on your market, competition and how quickly your team follows up.</p></div>
      </div>
    </section>
  )
}

function PlanChart({ plans, selected }: { plans: ReturnType<typeof allPlans>; selected: PlanId }) {
  const n = useNarrow()
  const W = n ? 360 : 720, H = n ? 270 : 290, L = n ? 46 : 62, R = n ? 54 : 78, T = 16, B = 30, ph = H - T - B
  const max = Math.max(...PLANS.flatMap((p) => plans[p.id].months.map((x) => x.revenue))) * 1.1 || 1
  const x = (i: number) => L + (i * (W - L - R)) / 11
  const y = (v: number) => T + ph - (v / max) * ph
  const lab = (v: number) => '$' + (v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? Math.round(v / 1e3) + 'K' : Math.round(v))
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max)
  return (
    <svg className={`chart${n ? ' narrow' : ''}`} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Monthly revenue over 12 months for each growth plan">
      {ticks.map((t) => <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="grid" /><text x={L - 8} y={y(t) + 4} className="axis" textAnchor="end">{lab(t)}</text></g>)}
      {plans.ads.months.map((p, i) => (n ? i % 3 === 0 || i === 11 : i % 2 === 0 || i === 11) && <text key={i} x={x(i)} y={H - 8} className="lbl" textAnchor="middle">M{p.month}</text>)}
      {PLANS.map((p) => {
        const pts = plans[p.id].months.map((m, i) => `${x(i)},${y(m.revenue)}`).join(' ')
        const last = plans[p.id].months[11].revenue
        return <g key={p.id} opacity={selected === p.id ? 1 : 0.55}>
          <polyline points={pts} fill="none" stroke={COLOR[p.id]} strokeWidth={selected === p.id ? 3.5 : 2} strokeLinejoin="round" strokeDasharray={p.id === 'ads' ? '6 5' : undefined} />
          <circle cx={x(11)} cy={y(last)} r={5} fill={COLOR[p.id]} />
          <text x={x(11) + 9} y={y(last) + 4} className="val" fill={COLOR[p.id]}>{lab(last)}</text>
        </g>
      })}
    </svg>
  )
}
