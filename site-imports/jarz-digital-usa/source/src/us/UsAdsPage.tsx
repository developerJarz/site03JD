'use client'
// Jarz Digital — Google Ads revenue calculator for US local businesses, with a benchmark explorer for every local category.
// Styles are scoped under .jdp so the page can sit inside any website.
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react'
import { ALL_INDUSTRY, CATEGORIES, GROUPS, SOURCES, type Category, type Group } from './data'
import { breakEven, forecast, fromCategory, leadValue, returnIndex, steady, US_BUDGETS, type Channel, type UsInputs, type UsMonth } from './model'
import WhyJarz from './WhyJarz'
import { US_MARKET, type CalcMarket } from './market'
import { int, money, money2, moneyShort } from './money'
import { allPlans, PLANS, RANGES, type PlanId, type RangeId } from './plans'
import { useNarrow } from '../components/ui'
import logoSrc from '../assets/logo-full-dark.png'
import '../styles.css'

const img = (x: unknown) => (typeof x === 'string' ? x : (x as { src: string }).src)
const $ = money
const $2 = money2
const n0 = int
const n1 = (n: number) => (n < 10 ? n.toFixed(1) : int(n))
const x1 = (n: number) => (Number.isFinite(n) ? n.toFixed(1) + '×' : '—')

const CHANNELS: { id: Channel; name: string; desc: string }[] = [
  { id: 'search', name: 'Google Search Ads', desc: 'Pay per click. Shows when people search for your service.' },
  { id: 'lsa', name: 'Local Services Ads', desc: 'Pay per lead. "Google Verified" badge at the very top.' },
  { id: 'microsoft', name: 'Microsoft (Bing) Ads', desc: 'Cheaper clicks, about 20× fewer searches.' },
  { id: 'meta', name: 'Facebook & Instagram', desc: 'Cheap leads, but people are less ready to buy.' },
]
const KEY = 'jd-us-calc-v1'

export default function UsAdsPage() {
  const calc = useUsCalc()
  const { cat, inp, catId, pick } = calc

  return (
    <div className="jdp us">
      <header className="top"><div className="top-in">
        <a className="brand" href="https://jarzdigital.com" aria-label="Jarz Digital"><img src={img(logoSrc)} alt="Jarz Digital" /></a>
        <nav className="snav us-nav" aria-label="Page sections">
          {[['calc', 'Calculator'], ['why', 'Why Jarz'], ['growth', 'Your growth'], ['360', '360° results'], ['services', 'Services'], ['explore', 'All categories'], ['insights', 'Insights']].map(([id, l]) => (
            <button key={id} className={id === 'calc' ? 'cta' : ''} onClick={() => document.getElementById('jdp-' + id)?.scrollIntoView({ behavior: 'smooth' })}>{l}</button>
          ))}
        </nav>
      </div></header>

      <main className="main">
        <section className="hero us-hero">
          <div className="hero-glow" aria-hidden />
          <div className="eyebrow">USA · Local business · Google Ads</div>
          <h1 className="hero-title">What can Google Ads earn your local business?</h1>
          <p className="hero-sub">Pick your business type and budget. See your clicks, leads, customers, revenue and profit, built on 2025 US benchmark data for {CATEGORIES.length} local business categories.</p>
          <div className="strip us-strip">
            <div><b>{$2(ALL_INDUSTRY.cpc)}</b><span>average cost per click</span></div>
            <div><b>{ALL_INDUSTRY.ctr}%</b><span>average click rate</span></div>
            <div><b>{ALL_INDUSTRY.cvr}%</b><span>average conversion rate</span></div>
            <div><b>{$2(ALL_INDUSTRY.cpl)}</b><span>average cost per lead</span></div>
          </div>
          <p className="src">All US industries, Google Search, 2025 (WordStream / LocaliQ).</p>
        </section>

        <CalculatorSection calc={calc} />

        <WhyJarz inp={inp} catName={cat.name} onCalc={() => document.getElementById('jdp-calc')?.scrollIntoView({ behavior: 'smooth' })} />
        <Explorer onPick={(id) => pick(id, true)} current={catId} />
        <Insights />
        <Platforms />

        <section id="jdp-sources" className="anchor block">
          <header className="sec-head"><div className="eyebrow">Sources</div><h2>Where the numbers come from</h2></header>
          <ul className="check">{Object.values(SOURCES).map((s) => <li key={s}>{s}</li>)}</ul>
          <p className="src">Job values, close rates and margins without a source are typical estimates. Every value can be changed in the calculator.</p>
        </section>

        <section className="cta-final">
          <h2>Want these numbers for your business?</h2>
          <p>Jarz Digital sets up and manages Google Ads, Local Services Ads and SEO for local businesses in the USA. Book a free call and we will check your market and costs.</p>
          <div className="cta-row">
            <a className="btn primary" href="https://wa.me/8801677248045" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
            <a className="btn ghost" href="https://jarzdigital.com" target="_blank" rel="noopener noreferrer">Visit jarzdigital.com</a>
          </div>
          <p className="contact-line">jarzdigital36@gmail.com · Dallas · Dhaka · Calgary · Cork</p>
        </section>
        <footer className="foot"><b>Jarz Digital</b> · jarzdigital.com</footer>
      </main>
    </div>
  )
}


export function useUsCalc(defaultCat = 'plumbing', storageKey = KEY, market: CalcMarket = US_MARKET) {
  const CATS = market.categories
  const [catId, setCatId] = useState(defaultCat)
  const cat = CATS.find((c) => c.id === catId) ?? CATS[0]
  const [inp, setInp] = useState<UsInputs>(() => fromCategory(cat, 1500))
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(storageKey) || 'null'); if (v?.catId && v?.inp && CATS.some((c) => c.id === v.catId)) { setCatId(v.catId); setInp(v.inp) } } catch { /* storage unavailable */ } }, [storageKey])
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify({ catId, inp })) } catch { /* ignore */ } }, [catId, inp, storageKey])
  const pick = (id: string, scroll = false) => {
    const c = CATS.find((x) => x.id === id)!
    setCatId(id); setInp((p) => ({ ...fromCategory(c, p.budget, p.fee, c.lsa === null && p.channel === 'lsa' ? 'search' : p.channel, p.autoScale) }))
    if (scroll) document.getElementById('jdp-calc')?.scrollIntoView({ behavior: 'smooth' })
  }
  const set = (k: keyof UsInputs, v: number | boolean | Channel) => setInp((p) => ({ ...p, [k]: v }))
  // growth plan shared by the calculator, the plan comparison and the 360° section
  const [plan, setPlan] = useState<PlanId>('full')
  const [range, setRange] = useState<RangeId>('mid')
  const [fees, setFees] = useState({ seo: 0, mgmt: 0 })
  return { catId, cat, inp, pick, set, market, plan, setPlan, range, setRange, fees, setFees }
}
export type UsCalc = ReturnType<typeof useUsCalc>

export function CalculatorSection({ calc, title = 'Google Ads revenue calculator', lead = 'Starting values are US averages for your category. Change any number to match your business.' }: { calc: UsCalc; title?: string; lead?: string }) {
  const { catId, cat, inp, pick, set, market, plan, setPlan, range, setRange, fees, setFees } = calc
  const m = useMemo(() => steady(inp), [inp])
  const plans = useMemo(() => allPlans(inp, range, undefined, fees), [inp, range, fees])
  const sel = plans[plan], adsOnly = plans.ads
  const planName = PLANS.find((p) => p.id === plan)!
  const rows = useMemo(() => forecast(inp), [inp])
  const be = breakEven(inp)
  const lsaMissing = inp.channel === 'lsa' && inp.lsaCpl === null
  const verdict = lsaMissing ? 'thin' : m.netProfit > m.revenue * 0.03 ? 'profit' : m.netLifetime > 0 ? 'thin' : 'loss'
  const cum = rows.reduce<number[]>((a, r) => [...a, (a[a.length - 1] || 0) + r.netProfit], [])
  const payback = cum.findIndex((v) => v > 0)
  const [tab, setTab] = useState<RTab>('plan')
  const on = (t: RTab) => (tab === t ? 'tab-on' : 'tab-off')
  return (
        <section id="jdp-calc" className="anchor block calc-block">
          <header className="calc-head"><div className="eyebrow">Calculator</div><h2>{title}</h2>
            <p className="lead">{lead}</p></header>

          <div className="us-pickers">
            <label className="sel"><span>Business type</span>
              <select value={catId} onChange={(e) => pick(e.target.value)}>
                {(Object.keys(GROUPS) as Group[]).map((g) => (
                  <optgroup key={g} label={GROUPS[g]}>{market.categories.filter((c) => c.group === g).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>
                ))}
              </select>
            </label>
            <div className="chan" role="radiogroup" aria-label="Ad platform">
              {CHANNELS.map((ch) => (
                <button key={ch.id} role="radio" aria-checked={inp.channel === ch.id} className={`chip ${inp.channel === ch.id ? 'on' : ''}`} onClick={() => set('channel', ch.id)}
                  disabled={ch.id === 'lsa' && inp.lsaCpl === null} title={ch.id === 'lsa' && inp.lsaCpl === null ? 'No published Local Services Ads data for this category' : ch.desc}>{ch.name}</button>
              ))}
            </div>
          </div>
          <div className="plan-pick" role="radiogroup" aria-label="Growth plan">
            {PLANS.map((p) => (
              <button key={p.id} role="radio" aria-checked={plan === p.id} className={`plan-btn ${plan === p.id ? 'on' : ''}`} onClick={() => setPlan(p.id)}>
                <b>{p.short}</b><small>{p.id === 'ads' ? 'Paid leads from month one' : p.id === 'seo' ? 'Adds free organic leads' : 'Adds answering, reviews and retention'}</small>
              </button>
            ))}
          </div>
          <div className="range-pick" role="radiogroup" aria-label="SEO and management results">
            <span>SEO and management results</span>
            {RANGES.map((r) => <button key={r.id} role="radio" aria-checked={range === r.id} className={`chip ${range === r.id ? 'on' : ''}`} onClick={() => setRange(r.id)}>{r.name}</button>)}
          </div>
          {cat.note && <p className="note">{cat.note}</p>}

          <div className={`summary ${verdict}`} aria-live="polite">
            <div><span>Profit this month</span><b>{$(m.netProfit)}</b></div>
            <div><span>Revenue</span><b>{$(m.revenue)}</b></div>
            <div className="hide-sm"><span>Customers</span><b>{n1(m.customers)}</b></div>
            <div><span>Ad return</span><b>{x1(m.roas)}</b></div>
            <div className="sum-plan"><span>Month 12 · {planName.short}</span><b>{$(sel.m12Revenue)}</b></div>
            <em className={`badge ${verdict}`}>{verdict === 'profit' ? 'Profitable' : verdict === 'thin' ? 'Profitable with repeat business' : 'Not profitable yet'}</em>
          </div>

          <div className="calc-grid">
            <aside className="inputs">
              <Group title="Budget">
                <Field id="budget" label="Monthly ad budget" value={inp.budget} min={100} max={20000} step={50} show={$(inp.budget)} onChange={(v) => set('budget', v)} hint={market.budgetHint} />
                <Field id="fee" label="Monthly management fee (optional)" value={inp.fee} min={0} max={5000} step={50} show={$(inp.fee)} onChange={(v) => set('fee', v)} hint="Leave at $0 to see results before agency fees." />
                <Toggle label="Raise budget when profitable" on={inp.autoScale} onChange={(v) => set('autoScale', v)} />
              </Group>
              <Group title="Ad performance" phoneClosed>
                {inp.channel === 'search' || inp.channel === 'microsoft' ? <>
                  <Field id="cpc" label="Cost per click (Google)" value={inp.cpc} min={0.5} max={100} step={0.05} show={$2(inp.cpc)} onChange={(v) => set('cpc', v)} hint={`${market.avg} for ${cat.name}: ${$2(cat.cpc)} ${market.currency}.`} />
                  <Field id="cvr" label="Clicks that become leads" value={inp.cvr} min={0.5} max={50} step={0.1} show={inp.cvr.toFixed(1) + '%'} onChange={(v) => set('cvr', v)} hint={`Calls, forms and bookings. Category cost per lead: ${$2(cat.cpl)}.`} />
                </> : inp.channel === 'lsa' ? (
                  <Field id="lsa" label="Cost per lead (Local Services Ads)" value={inp.lsaCpl ?? 0} min={5} max={500} step={1} show={$(inp.lsaCpl ?? 0)} onChange={(v) => set('lsaCpl', v)} hint="You pay per lead, not per click." />
                ) : <p className="sub">{market.meta}</p>}
              </Group>
              <Group title="Your business" phoneClosed>
                <Field id="close" label="Leads that become customers" value={inp.close} min={1} max={100} step={1} show={inp.close + '%'} onChange={(v) => set('close', v)} hint="Phone leads in home services book at about 40–50%." />
                <Field id="job" label="Average job value" value={inp.job} min={20} max={50000} step={10} show={$(inp.job)} onChange={(v) => set('job', v)} hint={cat.jobSrc === 'est' ? 'Typical estimate. Enter your own average.' : cat.jobSrc + '.'} />
                <Field id="margin" label="Profit margin on a job" value={inp.margin} min={5} max={95} step={1} show={inp.margin + '%'} onChange={(v) => set('margin', v)} hint="Job price minus labour and materials." />
                <Field id="repeat" label="Repeat jobs per customer in a year" value={inp.repeat} min={0} max={24} step={0.1} show={inp.repeat.toFixed(1)} onChange={(v) => set('repeat', v)} hint="Maintenance plans, return visits, recurring service." />
              </Group>
              {plan !== 'ads' && <Group title="Plan investment (optional)" phoneClosed>
                <Field id="seofee" label="Monthly SEO investment" value={fees.seo} min={0} max={10000} step={50} show={$(fees.seo)} onChange={(v) => setFees({ ...fees, seo: v })} hint="Leave at $0 to see results before fees. Pricing is agreed after the free audit." />
                {plan === 'full' && <Field id="mgmtfee" label="Monthly business management investment" value={fees.mgmt} min={0} max={10000} step={50} show={$(fees.mgmt)} onChange={(v) => setFees({ ...fees, mgmt: v })} hint="Covers the AI receptionist, reviews, profile and social upkeep, and automation." />}
              </Group>}
              <button className="btn ghost wide" onClick={() => pick(catId)}>Reset to {cat.name} averages</button>
            </aside>

            <div className="results">
              {lsaMissing && <p className="note warn">There is no published Local Services Ads cost for this category. Enter your own cost per lead, or pick another platform.</p>}
              <div className="rtabs" role="tablist" aria-label="Calculator results">
                {R_TABS.map(([t, l]) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{l}</button>)}
              </div>
              <Card cls={on('plan')} title={`${planName.name}: your first 12 months`} sub={`${RANGES.find((r) => r.id === range)!.name} range. SEO grows slowly for three months, then compounds; management gains arrive by Month 3.`}>
                <div className="kpis">
                  <Kpi big label="Revenue in Month 12" value={`${$(sel.m12Revenue)} / month`} tone="pos" />
                  <Kpi label="Revenue in year 1" value={$(sel.yearRevenue)} />
                  <Kpi label="Profit in year 1" value={$(sel.yearProfit)} tone={sel.yearProfit >= 0 ? 'pos' : 'neg'} />
                  <Kpi label="Leads in year 1" value={n0(sel.yearLeads)} />
                  <Kpi label="Leads in Month 12" value={n1(sel.m12Leads)} />
                  <Kpi label="Cost per customer" value={$(sel.costPerCustomer)} />
                  <Kpi label={plan === 'ads' ? 'In profit from' : 'Extra revenue vs ads only'} value={plan === 'ads' ? (sel.paybackMonth ? `Month ${sel.paybackMonth}` : 'Beyond Month 12') : `+${$(sel.yearRevenue - adsOnly.yearRevenue)}`} tone="pos" />
                </div>
                <div className="plan-bars" aria-label="Year-1 revenue by plan">
                  {PLANS.map((p) => { const v = plans[p.id].yearRevenue, max = plans.full.yearRevenue || 1; return (
                    <button key={p.id} className={`pb-row ${plan === p.id ? 'on' : ''}`} onClick={() => setPlan(p.id)}>
                      <span>{p.short}</span><i style={{ width: `${Math.max(6, (v / max) * 100)}%` }} /><b>{$(v)}</b>
                    </button>) })}
                </div>
                <p className="src">Year-1 revenue for each plan with your numbers. Tap a plan to compare. Planning estimates, not guarantees.</p>
              </Card>
              <Card cls={on('overview')} title="Your typical month" sub="After the first weeks of learning, with this month's new customers">
                <div className="kpis">
                  <Kpi big label="Profit from this month's jobs" value={$(m.netProfit)} tone={m.netProfit >= 0 ? 'pos' : 'neg'} />
                  <Kpi label="Revenue from new jobs" value={$(m.revenue)} />
                  <Kpi label="Leads" value={n1(m.leads)} />
                  <Kpi label="New customers" value={n1(m.customers)} />
                  <Kpi label="Cost per lead" value={$2(m.cpl)} />
                  <Kpi label="Cost per customer" value={$(m.cpa)} />
                  <Kpi label="Profit incl. 1 year of repeat jobs" value={$(m.netLifetime)} tone={m.netLifetime >= 0 ? 'pos' : 'neg'} />
                </div>
              </Card>

              <Card cls={on('overview')} title="From ad budget to customers">
                <div className="funnel">
                  {[[`Ad spend`, $(m.budget)], inp.channel === 'search' || inp.channel === 'microsoft' ? ['Clicks', `${n0(m.clicks)} · ${$2(m.cpc)} each`] : ['Leads paid for', `${$2(m.cpl)} each`],
                    ['Leads (calls & forms)', n1(m.leads)], ['Customers', n1(m.customers)], ['Revenue', $(m.revenue)], ['Repeat revenue (1 year)', $(m.repeatRevenue)]]
                    .map(([l, v], i) => <div key={l} className="f-step" style={{ ['--w' as string]: `${100 - i * 8}%` }}><span>{l}</span><b>{v}</b></div>)}
                </div>
              </Card>

              <Card cls={on('health')} title="Health check" sub="Green means your numbers are inside the safe range.">
                <div className="health">
                  <Row l="Most you can pay per lead (break-even)" v={$2(be.cpl)} ok={m.cpl <= be.cpl} />
                  <Row l="…counting a year of repeat jobs" v={$2(be.cplLifetime)} ok={m.cpl <= be.cplLifetime} />
                  {(inp.channel === 'search' || inp.channel === 'microsoft') && <Row l="Most you can pay per click" v={$2(be.cpc)} ok={m.cpc <= be.cpc} />}
                  <Row l="Ad return needed to break even" v={x1(be.roas)} ok={m.roas >= be.roas} />
                  <Row l="Value of one lead to you" v={$(inp.job * inp.close / 100)} />
                  <Row l="Return on ad spend + fee" v={Math.round(m.roi) + '%'} ok={m.roi >= 0} />
                </div>
              </Card>

              <Card cls={on('forecast')} title="6-month forecast" sub="Month 1 is the learning month. Clicks get cheaper and conversion improves as we optimise. Repeat customers start coming back.">
                <div className="legend"><i className="l-ads" />New-job revenue<i className="l-rep" />Repeat revenue<i className="l-pro" />Profit</div>
                <UsChart rows={rows} />
                <div className="tbl-wrap"><table className="tbl num">
                  <thead><tr>{['Month', 'Budget', 'Leads', 'Customers', 'Revenue', 'Profit', 'Running total'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>{rows.map((r, i) => (
                    <tr key={r.month}><td data-label="Month">{r.month}</td><td data-label="Budget">{$(r.budget)}</td><td data-label="Leads">{n1(r.leads)}</td><td data-label="Customers">{n1(r.customers)}</td>
                      <td data-label="Revenue">{$(r.total)}</td><td data-label="Profit" className={r.netProfit >= 0 ? 'pos' : 'neg'}>{$(r.netProfit)}</td><td data-label="Running total" className={cum[i] >= 0 ? 'pos' : 'neg'}>{$(cum[i])}</td></tr>
                  ))}</tbody>
                </table></div>
                <div className="tot">
                  <div><span>Total ad spend</span><b>{$(rows.reduce((a, r) => a + r.budget, 0))}</b></div>
                  <div><span>Total revenue</span><b>{$(rows.reduce((a, r) => a + r.total, 0))}</b></div>
                  <div><span>Total profit</span><b className={cum[5] >= 0 ? 'pos' : 'neg'}>{$(cum[5])}</b></div>
                  <div><span>In profit from</span><b>{payback >= 0 ? `Month ${payback + 1}` : 'Not within 6 months'}</b></div>
                </div>
              </Card>

              <Card cls={on('platforms')} title="Compare platforms" sub={`Same budget (${$(inp.budget)}) and business, on each platform`}>
                <div className="tbl-wrap"><table className="tbl num">
                  <thead><tr>{['Platform', 'Cost per lead', 'Leads', 'Customers', 'Revenue', 'Profit'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>{CHANNELS.map((ch) => {
                    const na = ch.id === 'lsa' && inp.lsaCpl === null
                    const r = steady({ ...inp, channel: ch.id })
                    return <tr key={ch.id} className={inp.channel === ch.id ? 'hl' : ''} onClick={() => !na && set('channel', ch.id)} style={{ cursor: na ? 'default' : 'pointer' }}>
                      <td data-label="Platform"><b>{ch.name}</b></td>
                      {na ? <td data-label="Cost per lead" colSpan={5}>No published data for this category</td> : <>
                        <td data-label="Cost per lead">{$2(r.cpl)}</td><td data-label="Leads">{n1(r.leads)}</td><td data-label="Customers">{n1(r.customers)}</td>
                        <td data-label="Revenue">{$(r.revenue)}</td><td data-label="Profit" className={r.netProfit >= 0 ? 'pos' : 'neg'}>{$(r.netProfit)}</td></>}
                    </tr>
                  })}</tbody>
                </table></div>
                <p className="src">Microsoft volume is limited: at bigger budgets it may not spend the full amount. Facebook & Instagram figures are estimates.</p>
              </Card>

              <Card cls={on('budgets')} title="Compare budgets" sub="Same business on the chosen platform. Clicks cost a little more once a budget outgrows local search volume.">
                <div className="tbl-wrap"><table className="tbl num">
                  <thead><tr>{['Budget', 'Leads', 'Customers', 'Revenue', 'Profit', 'ROI'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>{US_BUDGETS.map((b) => { const r = steady(inp, b); return (
                    <tr key={b} className={b === inp.budget ? 'hl' : ''} onClick={() => set('budget', b)} style={{ cursor: 'pointer' }}>
                      <td data-label="Budget">{$(b)}</td><td data-label="Leads">{n1(r.leads)}</td><td data-label="Customers">{n1(r.customers)}</td><td data-label="Revenue">{$(r.revenue)}</td>
                      <td data-label="Profit" className={r.netProfit >= 0 ? 'pos' : 'neg'}>{$(r.netProfit)}</td><td data-label="ROI">{Math.round(r.roi)}%</td></tr>) })}</tbody>
                </table></div>
              </Card>

              <details className="grp how"><summary className="grp-h"><span>How we calculate</span><i aria-hidden>⌄</i></summary>
                <ol className="grp-b how-list">
                  <li>Clicks = budget ÷ cost per click. Leads = clicks × conversion rate (so cost per lead = cost per click ÷ conversion rate).</li>
                  <li>Customers = leads × close rate. Revenue = customers × average job value.</li>
                  <li>Profit this month = revenue × margin − ad spend − management fee.</li>
                  <li>Repeat revenue = revenue × repeat jobs per year. It costs nothing in ads.</li>
                  <li>Break-even cost per lead = job value × close rate × margin. Break-even ad return = 1 ÷ margin.</li>
                  <li>Budgets above $2,500 a month pay 10% more per click for each doubling, as local search volume runs out.</li>
                  <li>Forecast: Month 1 converts at 80% of your rate and pays 10% more per click; by Month 6 it converts at 115% and pays 7% less. Repeat purchases arrive evenly over 12 months.</li>
                  <li>Microsoft: clicks 30% cheaper than Google. Local Services Ads: published cost per lead for the trade. Facebook & Instagram: {market.id === 'ca' ? 'North American average (about CA$38)' : 'US average $27.66'} scaled to the category, closing at half the search rate.</li>
                  {market.id === 'ca' && <li>Canadian values (CAD): cost per click set per category from Canadian 2026 sources (Consultus Digital, Hetman Alberta benchmarks, Brand Butter, Creative Scope Toronto, ScopeX Media Calgary); Local Services Ads lead costs from Toronto 2026 data; city pages adjust clicks for local competition (Toronto +35%, Mississauga +25%, Brampton +20%, Calgary +15%). Conversion rates are published category rates (WordStream / LocaliQ 2025).</li>}
                </ol>
              </details>
              <p className="disclaimer">Planning estimates based on {market.id === 'ca' ? 'published 2026 Canadian cost data (CAD)' : 'published US averages'}, not a guarantee. Results vary by city, competition, offer, website and how fast you answer leads.</p>
            </div>
          </div>
        </section>

  )
}

/* ---------------- benchmark explorer ---------------- */
type SortKey = 'cpl' | 'cpc' | 'cvr' | 'idx' | 'name'
export function Explorer({ onPick, current }: { onPick: (id: string) => void; current: string }) {
  const [g, setG] = useState<Group | 'all'>('all')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<SortKey>('idx')
  const list = useMemo(() => {
    const f = CATEGORIES.filter((c) => (g === 'all' || c.group === g) && c.name.toLowerCase().includes(q.toLowerCase()))
    const key: Record<SortKey, (c: Category) => number | string> = { cpl: (c) => c.cpl, cpc: (c) => -c.cpc, cvr: (c) => -c.cvr, idx: (c) => -returnIndex(c), name: (c) => c.name }
    return [...f].sort((a, b) => { const x = key[sort](a), y = key[sort](b); return typeof x === 'string' ? x.localeCompare(y as string) : (x as number) - (y as number) })
  }, [g, q, sort])
  return (
    <section id="jdp-explore" className="anchor block">
      <header className="sec-head"><div className="eyebrow">All categories</div><h2>US local business benchmarks</h2>
        <p className="lead">{CATEGORIES.length} categories side by side. "Lead return" is the expected profit for every $1 spent on leads, counting a year of repeat jobs. Above 1.0× the leads pay for themselves. Tap a row to load it into the calculator.</p></header>
      <div className="exp-ctl">
        <div className="presets">{(['all', ...Object.keys(GROUPS)] as (Group | 'all')[]).map((k) => <button key={k} className={`chip ${g === k ? 'on' : ''}`} onClick={() => setG(k)}>{k === 'all' ? 'All' : GROUPS[k]}</button>)}</div>
        <div className="exp-row">
          <input className="search" type="search" placeholder="Search a business type…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search business type" />
          <label className="sel small"><span>Sort by</span><select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="idx">Best lead return</option><option value="cpl">Cheapest leads</option><option value="cpc">Highest cost per click</option><option value="cvr">Highest conversion rate</option><option value="name">Name</option>
          </select></label>
        </div>
      </div>
      <div className="tbl-wrap"><table className="tbl num exp">
        <thead><tr>{['Business type', 'Cost per click', 'Conversion', 'Cost per lead', 'LSA lead', 'Avg job', 'Lead value', 'Lead return'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{list.map((c) => { const ri = returnIndex(c); return (
          <tr key={c.id} className={c.id === current ? 'hl' : ''} onClick={() => onPick(c.id)} style={{ cursor: 'pointer' }}>
            <td data-label=""><b>{c.name}</b><small className="grp-tag">{GROUPS[c.group]}{c.src === 'web' ? ' · trade reports' : ''}</small></td>
            <td data-label="Cost per click">{$2(c.cpc)}</td><td data-label="Conversion">{(c.cpc / c.cpl * 100).toFixed(1)}%</td><td data-label="Cost per lead">{$2(c.cpl)}</td>
            <td data-label="LSA lead">{c.lsa ? $(c.lsa) : '—'}</td><td data-label="Avg job">{$(c.job)}{c.jobSrc === 'est' ? '*' : ''}</td><td data-label="Lead value">{$(leadValue(c))}</td>
            <td data-label="Lead return"><span className={`pill ${ri >= 3 ? 'green' : ri >= 1 ? '' : 'amber'}`}>{ri.toFixed(1)}×</span></td>
          </tr>) })}</tbody>
      </table></div>
      <p className="src">* Estimated job value. Cost per click and cost per lead are US averages (2025); local markets and big cities can be much higher.</p>
    </section>
  )
}

export function Insights() {
  const byCpc = [...CATEGORIES].sort((a, b) => b.cpc - a.cpc).slice(0, 5)
  const cheap = [...CATEGORIES].sort((a, b) => a.cpl - b.cpl).slice(0, 5)
  const best = [...CATEGORIES].sort((a, b) => returnIndex(b) - returnIndex(a)).slice(0, 5)
  const lsaSave = CATEGORIES.filter((c) => c.lsa).map((c) => 1 - (c.lsa as number) / c.cpl)
  const avgSave = Math.round((lsaSave.reduce((a, v) => a + v, 0) / lsaSave.length) * 100)
  const list = (xs: Category[], f: (c: Category) => string) => <ol className="rank">{xs.map((c) => <li key={c.id}><span>{c.name}</span><b>{f(c)}</b></li>)}</ol>
  return (
    <section id="jdp-insights" className="anchor block">
      <header className="sec-head"><div className="eyebrow">Expert analysis</div><h2>What the data tells local businesses</h2></header>
      <div className="grid g3">
        <div className="card"><h4>Most expensive clicks</h4>{list(byCpc, (c) => $2(c.cpc))}</div>
        <div className="card"><h4>Cheapest leads</h4>{list(cheap, (c) => $2(c.cpl))}</div>
        <div className="card accent"><h4>Best lead return</h4>{list(best, (c) => returnIndex(c).toFixed(1) + '×')}</div>
      </div>
      <div className="grid g2" style={{ marginTop: 14 }}>
        {[
          ['Expensive leads can still win', 'Roofing leads cost about $228, the highest of any home trade, yet one $9,000 job covers 40 leads. Judge a category by profit per lead, not cost per click.'],
          [`Local Services Ads are about ${avgSave}% cheaper per lead`, 'Where they are available (HVAC, plumbing, roofing, legal and more), pay-per-lead ads beat search on cost. Run both: LSA at the top, search ads for everything LSA does not cover.'],
          ['Recurring services are worth far more', 'Cleaning, pest control, lawn care and dental patients come back. A $47 cleaning lead looks thin on the first visit and strong over a year.'],
          ['Speed decides the close rate', 'Most local leads are phone calls. Answering in minutes instead of hours is the cheapest way to lift the close rate and cut cost per customer.'],
          ['Costs keep rising', 'The average US cost per lead rose 5% in 2025 to $70.11, and 65% of industries improved their conversion rate. Strong landing pages and call tracking matter more every year.'],
          ['Watch for fake leads', 'Locksmith, towing and junk car buyers attract spam and lead-sellers. Call tracking, negative keywords and verified calls protect the budget.'],
        ].map(([h, p]) => <div key={h} className="card"><h4>{h}</h4><p>{p}</p></div>)}
      </div>
    </section>
  )
}

export function Platforms() {
  const P = [
    ['Google Search Ads', 'Highest intent: people search for the exact service. Average $5.26 per click and $70.11 per lead (2025). Best for every local business.', 'Best all-round'],
    ['Google Local Services Ads', 'Pay per lead with the Google Verified badge above all other results. Typical leads: locksmith $34, plumbing $69, HVAC $80, roofing $162, injury law $249.', 'Cheapest leads'],
    ['Microsoft (Bing) Ads', 'Clicks 20–40% cheaper with older, higher-income users, but about 20× fewer searches. A low-cost add-on, not a replacement.', 'Add-on'],
    ['Facebook & Instagram', 'Average $27.66 per lead (2025), but people are not actively searching. Good for offers, recurring services and remarketing.', 'Awareness'],
    ['Google Business Profile', 'Free map listing. Reviews and photos lift both organic and paid results. Every campaign should start here.', 'Free'],
  ]
  return (
    <section id="jdp-platforms" className="anchor block">
      <header className="sec-head"><div className="eyebrow">Platforms</div><h2>Where local ads work best</h2></header>
      <div className="grid g3">{P.map(([h, p, t]) => <div key={h} className="card"><span className="pill">{t}</span><h4 style={{ marginTop: 10 }}>{h}</h4><p>{p}</p></div>)}</div>
    </section>
  )
}

/* ---------------- small pieces ---------------- */
function UsChart({ rows }: { rows: UsMonth[] }) {
  const n = useNarrow()
  const W = n ? 360 : 720, H = n ? 260 : 280, L = n ? 46 : 58, R = n ? 6 : 12, T = 16, B = 32, ph = H - T - B
  const top = Math.max(...rows.map((r) => r.total), 1) * 1.05, low = Math.min(0, ...rows.map((r) => r.netProfit)) * 1.1
  const y = (v: number) => T + ((top - v) / (top - low)) * ph
  const bw = (W - L - R) / rows.length
  const step = niceStep((top - low) / 4)
  const ticks: number[] = []; for (let v = Math.ceil(low / step) * step; v <= top; v += step) ticks.push(v)
  const pts = rows.map((r, i) => `${L + i * bw + bw / 2},${y(r.netProfit)}`).join(' ')
  return (
    <svg className={`chart grow-y${n ? ' narrow' : ''}`} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Six-month revenue and profit">
      {ticks.map((t) => <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className={t === 0 ? 'zero' : 'grid'} /><text x={L - 8} y={y(t) + 4} className="axis" textAnchor="end">{shortUsd(t)}</text></g>)}
      {rows.map((r, i) => { const x = L + i * bw + bw * 0.2, w = bw * 0.6; return (
        <g key={i} className="bar" style={{ animationDelay: `${i * 80}ms` }}>
          <rect x={x} y={y(r.revenue)} width={w} height={Math.max(0, y(0) - y(r.revenue))} fill="#008D96" rx={2} />
          <rect x={x} y={y(r.total)} width={w} height={Math.max(0, y(r.revenue) - y(r.total))} fill="#F2A33A" rx={2} />
          <text x={x + w / 2} y={H - 9} className="lbl" textAnchor="middle">{n ? 'M' : 'Month '}{r.month}</text>
        </g>) })}
      <polyline className="pline" fill="none" points={pts} />
      {rows.map((r, i) => <circle key={i} cx={L + i * bw + bw / 2} cy={y(r.netProfit)} r={4.5} className={r.netProfit >= 0 ? 'dot pos' : 'dot neg'} />)}
    </svg>
  )
}
const niceStep = (raw: number) => { const p = Math.pow(10, Math.floor(Math.log10(raw || 1))); return [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw) || raw }
const shortUsd = moneyShort

function Group({ title, children, phoneClosed }: { title: string; children: ReactNode; phoneClosed?: boolean }) {
  const [open, setOpen] = useState(true)
  useEffect(() => { if (phoneClosed && window.matchMedia('(max-width: 640px)').matches) setOpen(false) }, [phoneClosed])
  return <section className={`grp ${open ? 'open' : ''}`}><button className="grp-h" aria-expanded={open} onClick={() => setOpen(!open)}><span>{title}</span><i aria-hidden>⌄</i></button>{open && <div className="grp-b">{children}</div>}</section>
}
function Field({ id, label, value, min, max, step, show, hint, onChange }: { id: string; label: string; value: number; min: number; max: number; step: number; show: string; hint?: string; onChange: (v: number) => void }) {
  return (
    <div className="field">
      <div className="f-top"><label htmlFor={'us-' + id}>{label}</label><output>{show}</output></div>
      <div className="f-ctl">
        <input id={'us-' + id} type="range" min={min} max={max} step={step} value={Math.min(max, value)} onChange={(e) => onChange(+e.target.value)} style={{ ['--p' as string]: `${((Math.min(max, value) - min) / (max - min)) * 100}%` }} />
        <input type="number" inputMode="decimal" min={min} max={max} step={step} value={value} aria-label={label} onChange={(e) => e.target.value !== '' && onChange(+e.target.value)} onBlur={(e) => onChange(Math.min(max, Math.max(min, +e.target.value || min)))} />
      </div>
      {hint && <small>{hint}</small>}
    </div>
  )
}
function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  const id = useId()
  return <div className="toggle"><span id={id}>{label}</span><button role="switch" aria-checked={on} aria-labelledby={`${id} ${id}s`} className={on ? 'on' : ''} onClick={() => onChange(!on)}><i /><em id={`${id}s`}>{on ? 'On' : 'Off'}</em></button></div>
}
type RTab = 'plan' | 'overview' | 'forecast' | 'health' | 'platforms' | 'budgets'
const R_TABS: [RTab, string][] = [['plan', '12-month plan'], ['overview', 'This month'], ['forecast', '6-month forecast'], ['health', 'Health check'], ['platforms', 'Platforms'], ['budgets', 'Budgets']]
function Card({ title, sub, children, cls = '' }: { title: string; sub?: string; children: ReactNode; cls?: string }) {
  return <section className={`card r-card ${cls}`}><h3>{title}</h3>{sub && <p className="sub">{sub}</p>}{children}</section>
}
function Kpi({ label, value, tone, big }: { label: string; value: string; tone?: 'pos' | 'neg'; big?: boolean }) {
  return <div className={`kpi ${big ? 'big' : ''}`}><span>{label}</span><b className={tone}>{value}</b></div>
}
function Row({ l, v, ok }: { l: string; v: string; ok?: boolean }) {
  return <div className="h-row"><span>{l}</span><b>{v}</b>{ok !== undefined && <i className={ok ? 'ok' : 'warn'} aria-hidden>{ok ? '✓' : '!'}</i>}</div>
}
