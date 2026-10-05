import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import type { Inputs } from '../calc/model'
import { BUDGET_STEPS, LEARNING_EVENTS_PER_WEEK, breakEven, breakEvenCvr, budgetToCoverFee, forecast, lifetimeValue, steadyMonth, totals } from '../calc/model'
import { DEFAULT_INPUTS, PRESETS, type PresetId } from '../calc/presets'
import type { Lang, Strings } from '../calc/strings'
import { dec, int, pct, tk, usd } from '../format'
import { ForecastChart } from './charts'

const KEY = 'jd-calc-v2'

type State = { inputs: Inputs; preset: PresetId }
const INITIAL: State = { inputs: DEFAULT_INPUTS, preset: 'fashion' }
const noop = () => () => {}

// Input groups: on phones and tablets (one column) the secondary groups start folded; on desktop, where
// the inputs sit beside the results, every group starts open so the column is complete at a glance.
const FOLDED: Record<string, boolean> = { budget: true, product: true, ads: false, costs: false, repeat: true, growth: false }
const ALL_OPEN: Record<string, boolean> = { budget: true, product: true, ads: true, costs: true, repeat: true, growth: true }
const TWO_COLUMNS = '(min-width: 1240px)' // matches the .calc-grid breakpoint in styles.css
const onWidth = (cb: () => void) => { const mq = window.matchMedia(TWO_COLUMNS); mq.addEventListener('change', cb); return () => mq.removeEventListener('change', cb) }

/** Saved inputs, then any ?preset=&budget= from a link (e.g. the homepage calculator) on top. */
function load(): State {
  let st = INITIAL
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) { const v = JSON.parse(raw); st = { inputs: { ...DEFAULT_INPUTS, ...v.inputs }, preset: v.preset || 'fashion' } }
  } catch { /* storage unavailable: use defaults */ }
  const q = new URLSearchParams(window.location.search)
  const p = q.get('preset')
  if (p && p in PRESETS) st = { inputs: { ...st.inputs, ...PRESETS[p as keyof typeof PRESETS] }, preset: p as PresetId }
  const b = Number(q.get('budget'))
  if (b >= 50 && b <= 5000) st = { ...st, inputs: { ...st.inputs, budgetUsd: Math.round(b) } }
  return st
}

type NumKey = { [K in keyof Inputs]: Inputs[K] extends number ? K : never }[keyof Inputs]

interface FieldSpec { k: NumKey; min: number; max: number; step: number; unit?: 'usd' | 'tk' | '%' | 'x' }

const GROUPS: { id: keyof Strings['groups']; fields: FieldSpec[] }[] = [
  { id: 'budget', fields: [{ k: 'budgetUsd', min: 50, max: 5000, step: 10, unit: 'usd' }] },
  { id: 'product', fields: [{ k: 'aov', min: 100, max: 50000, step: 50, unit: 'tk' }, { k: 'margin', min: 5, max: 90, step: 1, unit: '%' }] },
  { id: 'ads', fields: [{ k: 'cpm', min: 20, max: 600, step: 5, unit: 'tk' }, { k: 'ctr', min: 0.2, max: 6, step: 0.1, unit: '%' }, { k: 'cvr', min: 0.1, max: 10, step: 0.1, unit: '%' }] },
  { id: 'costs', fields: [{ k: 'returnRate', min: 0, max: 40, step: 1, unit: '%' }, { k: 'returnCost', min: 0, max: 500, step: 10, unit: 'tk' }, { k: 'deliveryCost', min: 0, max: 300, step: 10, unit: 'tk' }, { k: 'paymentFee', min: 0, max: 5, step: 0.1, unit: '%' }] },
  { id: 'repeat', fields: [{ k: 'repeatShare', min: 0, max: 90, step: 5, unit: '%' }, { k: 'repeatOrders', min: 0, max: 5, step: 0.1, unit: 'x' }] },
  { id: 'growth', fields: [{ k: 'seoVisitors', min: 0, max: 30000, step: 100 }, { k: 'agencyFee', min: 0, max: 300000, step: 1000, unit: 'tk' }, { k: 'scalePct', min: 5, max: 50, step: 5, unit: '%' }, { k: 'fx', min: 100, max: 150, step: 0.01 }] },
]

export default function Calculator({ s, lang }: { s: Strings; lang: Lang }) {
  // Server render and hydration use the defaults; saved/linked values take over on the client.
  const isClient = useSyncExternalStore(noop, () => true, () => false)
  const saved = useMemo(() => (isClient ? load() : INITIAL), [isClient])
  const [edited, setEdited] = useState<State | null>(null)
  const { inputs, preset } = edited ?? saved
  const setState = (next: State | ((st: State) => State)) => setEdited((e) => (typeof next === 'function' ? next(e ?? saved) : next))
  const desktop = useSyncExternalStore(onWidth, () => window.matchMedia(TWO_COLUMNS).matches, () => false)
  const [toggled, setToggled] = useState<Record<string, boolean>>({})
  const open = { ...(desktop ? ALL_OPEN : FOLDED), ...toggled }
  const [howOpen, setHowOpen] = useState(false)

  useEffect(() => {
    if (edited) try { localStorage.setItem(KEY, JSON.stringify(edited)) } catch { /* ignore */ }
  }, [edited])

  const set = (k: keyof Inputs, v: number | boolean) => setState((st) => ({ inputs: { ...st.inputs, [k]: v }, preset: ['budgetUsd', 'fx', 'agencyFee', 'seoOn', 'seoVisitors', 'autoScale', 'scalePct'].includes(k) ? st.preset : 'custom' }))
  const pick = (p: PresetId) => setState((st) => ({ inputs: p === 'custom' ? st.inputs : { ...st.inputs, ...PRESETS[p] }, preset: p }))
  const reset = () => setState(INITIAL)

  const m = useMemo(() => steadyMonth(inputs), [inputs])
  const rows = useMemo(() => forecast(inputs), [inputs])
  const tot = useMemo(() => totals(rows), [rows])
  const be = breakEven(inputs)
  const ltv = lifetimeValue(inputs)
  const cvrBE = breakEvenCvr(inputs)
  const cover = inputs.agencyFee > 0 ? budgetToCoverFee(inputs) : null
  const weekly = m.adOrders / 4.33
  const margin = m.revenue ? m.netProfit / m.revenue : 0
  const verdict = m.netProfit > m.revenue * 0.03 ? 'profit' : m.netProfit >= -m.revenue * 0.03 ? 'thin' : 'loss'
  const T = (n: number) => tk(n, lang)

  const fmt = (f: FieldSpec, v: number) => f.unit === 'usd' ? usd(v) : f.unit === 'tk' ? T(v) : f.unit === '%' ? dec(v, f.step < 1 ? 1 : 0) + '%' : f.unit === 'x' ? dec(v, 1) + '×' : f.k === 'fx' ? v.toFixed(2) : int(v)

  return (
    <div className="calc">
      <header className="calc-head">
        <div className="eyebrow">{s.tabs.calc}</div>
        <h2>{s.calcTitle}</h2>
        <p className="lead">{s.calcSub}</p>
      </header>

      <div className="presets" role="radiogroup" aria-label={s.presetsLabel}>
        {(Object.keys(s.presets) as PresetId[]).map((p) => (
          <button key={p} role="radio" aria-checked={preset === p} className={`chip ${preset === p ? 'on' : ''}`} onClick={() => pick(p)}>{s.presets[p]}</button>
        ))}
      </div>

      {/* sticky summary: the answer stays on screen while inputs change (app-style) */}
      <div className={`summary ${verdict}`} aria-live="polite">
        <div><span>{s.k.netProfit}</span><b>{T(m.netProfit)}</b></div>
        <div><span>{s.k.revenue}</span><b>{T(m.revenue)}</b></div>
        <div className="hide-sm"><span>{s.k.orders}</span><b>{int(m.orders)}</b></div>
        <div><span>{s.k.roas}</span><b>{dec(m.roas)}×</b></div>
        <em className={`badge ${verdict}`}>{s.verdict[verdict]}</em>
      </div>

      <div className="calc-grid">
        <aside className="inputs">
          {GROUPS.map((g) => (
            <section key={g.id} className={`grp ${open[g.id] ? 'open' : ''}`}>
              <button className="grp-h" aria-expanded={!!open[g.id]} onClick={() => setToggled((o) => ({ ...o, [g.id]: !open[g.id] }))}>
                <span>{s.groups[g.id]}</span><i aria-hidden>⌄</i>
              </button>
              {open[g.id] && (
                <div className="grp-b">
                  {g.id === 'growth' && (
                    <>
                      <Toggle id="seoOn" label={s.f.seoOn} on={inputs.seoOn} onChange={(v) => set('seoOn', v)} s={s} />
                      <Toggle id="autoScale" label={s.f.autoScale} on={inputs.autoScale} onChange={(v) => set('autoScale', v)} s={s} />
                    </>
                  )}
                  {g.fields.filter((f) => !(f.k === 'seoVisitors' && !inputs.seoOn) && !(f.k === 'scalePct' && !inputs.autoScale)).map((f) => (
                    <Field key={f.k} id={f.k} label={s.f[f.k]} hint={(s.hints as Record<string, string>)[f.k]} value={inputs[f.k]} min={f.min} max={f.max} step={f.step}
                      display={fmt(f, inputs[f.k])} onChange={(v) => set(f.k, v)} />
                  ))}
                  {g.id === 'budget' && <div className="sub-note">{T(m.spend)} {s.perMonth}</div>}
                </div>
              )}
            </section>
          ))}
          <button className="btn ghost wide" onClick={reset}>{s.reset}</button>
        </aside>

        <div className="results">
          <Card title={s.steady} sub={s.steadySub}>
            <div className="kpis">
              <Kpi label={s.k.netProfit} value={T(m.netProfit)} tone={m.netProfit >= 0 ? 'pos' : 'neg'} big />
              <Kpi label={s.k.revenue} value={T(m.revenue)} />
              <Kpi label={s.k.orders} value={int(m.orders)} />
              <Kpi label={s.k.roas} value={dec(m.roas) + '×'} />
              <Kpi label={s.k.cpa} value={T(m.cpa)} />
              <Kpi label={s.k.roi} value={pct(m.roi)} tone={m.roi >= 0 ? 'pos' : 'neg'} />
              <Kpi label={s.k.mer} value={dec(m.mer) + '×'} />
            </div>
            <div className="meter" aria-hidden><div style={{ width: `${Math.max(2, Math.min(100, 50 + margin * 250))}%` }} className={verdict} /></div>
          </Card>

          <Card title={s.funnel}>
            <div className="funnel">
              {[
                [s.fv.spend, T(m.spend)], [s.fv.views, int(m.impressions)], [s.fv.clicks, `${int(m.clicks)} · ${T(m.cpc)} ${s.perClick}`],
                [s.fv.orders, int(m.adOrders + m.seoOrders)], [s.fv.repeat, int(m.repeatOrders)], [s.fv.delivered, int(m.delivered)],
              ].map(([l, v], i) => (
                <div key={i} className="f-step" style={{ ['--w' as string]: `${100 - i * 9}%` }}><span>{l}</span><b>{v}</b></div>
              ))}
            </div>
          </Card>

          <Card title={s.breakdown}>
            <Waterfall s={s} lang={lang} m={m} fee={inputs.agencyFee} />
          </Card>

          <Card title={s.health}>
            <div className="health">
              <Row l={s.h.beCpa} v={T(be.cpa)} ok={m.cpa <= be.cpa} />
              <Row l={s.h.beRoas} v={Number.isFinite(be.roas) ? dec(be.roas) + '×' : '—'} ok={m.roas >= be.roas} />
              <Row l={s.h.ltv} v={T(ltv)} />
              <Row l={s.h.ltvCac} v={m.cpa ? dec(ltv / m.cpa) + '×' : '—'} ok={m.cpa ? ltv / m.cpa >= 1 : undefined} />
              <Row l={s.h.beCvr} v={cvrBE === null ? '—' : dec(cvrBE, 2) + '%'} ok={cvrBE !== null ? inputs.cvr >= cvrBE : undefined} />
              {inputs.agencyFee > 0 && <Row l={s.h.cover} v={cover === null ? '—' : usd(cover)} ok={cover !== null && inputs.budgetUsd >= cover} />}
              <Row l={s.h.learning} v={dec(weekly, 1)} ok={weekly >= LEARNING_EVENTS_PER_WEEK} />
            </div>
            <p className="note">{weekly >= LEARNING_EVENTS_PER_WEEK ? s.learnOk : s.learnLow}</p>
          </Card>

          <Card title={s.forecast} sub={s.forecastSub}>
            <div className="legend"><i className="l-ads" />{s.legend.ads}<i className="l-seo" />{s.legend.seo}<i className="l-rep" />{s.legend.repeat}<i className="l-pro" />{s.legend.profit}</div>
            <ForecastChart rows={rows} lang={lang} labels={{ month: s.t.month }} />
            <div className="tbl-wrap">
              <table className="tbl num">
                <thead><tr>{[s.t.month, s.t.budget, s.t.orders, s.t.revenue, s.t.roas, s.t.profit, s.t.cumulative].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.month}>
                      <td data-label={s.t.month}>{r.month}</td><td data-label={s.t.budget}>{usd(r.budgetUsd)}</td><td data-label={s.t.orders}>{int(r.orders)}</td>
                      <td data-label={s.t.revenue}>{T(r.revenue)}</td><td data-label={s.t.roas}>{dec(r.roas)}×</td>
                      <td data-label={s.t.profit} className={r.netProfit >= 0 ? 'pos' : 'neg'}>{T(r.netProfit)}</td>
                      <td data-label={s.t.cumulative} className={tot.cumulative[i] >= 0 ? 'pos' : 'neg'}>{T(tot.cumulative[i])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tot">
              <div><span>{s.totals.spend}</span><b>{T(tot.spend)}</b></div>
              <div><span>{s.totals.revenue}</span><b>{T(tot.revenue)}</b></div>
              <div><span>{s.totals.profit}</span><b className={tot.netProfit >= 0 ? 'pos' : 'neg'}>{T(tot.netProfit)}</b></div>
              <div><span>{s.totals.payback}</span><b>{tot.payback ? `${s.totals.monthN} ${tot.payback}` : s.totals.none}</b></div>
            </div>
          </Card>

          <Card title={s.budgets} sub={s.budgetsSub}>
            <div className="tbl-wrap">
              <table className="tbl num">
                <thead><tr>{[s.b.budget, s.b.orders, s.b.revenue, s.b.profit, s.b.roi].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {BUDGET_STEPS.map((b) => {
                    const x = steadyMonth(inputs, b)
                    return (
                      <tr key={b} className={b === inputs.budgetUsd ? 'hl' : ''} onClick={() => set('budgetUsd', b)} style={{ cursor: 'pointer' }}>
                        <td data-label={s.b.budget}>{usd(b)}</td><td data-label={s.b.orders}>{int(x.orders)}</td><td data-label={s.b.revenue}>{T(x.revenue)}</td>
                        <td data-label={s.b.profit} className={x.netProfit >= 0 ? 'pos' : 'neg'}>{T(x.netProfit)}</td><td data-label={s.b.roi}>{pct(x.roi)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <section className={`grp how ${howOpen ? 'open' : ''}`}>
            <button className="grp-h" aria-expanded={howOpen} onClick={() => setHowOpen((o) => !o)}><span>{s.how}</span><i aria-hidden>⌄</i></button>
            {howOpen && <ol className="grp-b how-list">{s.howList.map((t) => <li key={t}>{t}</li>)}</ol>}
          </section>
          <p className="disclaimer">{s.disclaimer}</p>
        </div>
      </div>
    </div>
  )
}

function Field({ id, label, hint, value, min, max, step, display, onChange }: { id: string; label: string; hint?: string; value: number; min: number; max: number; step: number; display: string; onChange: (v: number) => void }) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  return (
    <div className="field">
      <div className="f-top"><label htmlFor={id}>{label}</label><output htmlFor={id}>{display}</output></div>
      <div className="f-ctl">
        <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)}
          style={{ ['--p' as string]: `${((value - min) / (max - min)) * 100}%` }} />
        <input id={id + '-n'} type="number" inputMode="decimal" min={min} max={max} step={step} value={value} aria-label={label}
          onChange={(e) => e.target.value !== '' && onChange(+e.target.value)} onBlur={(e) => onChange(clamp(+e.target.value || min))} />
      </div>
      {hint && <small>{hint}</small>}
    </div>
  )
}

function Toggle({ id, label, on, onChange, s }: { id: string; label: string; on: boolean; onChange: (v: boolean) => void; s: Strings }) {
  return (
    <div className="toggle">
      <span id={id + '-l'}>{label}</span>
      <button id={id} role="switch" aria-checked={on} aria-labelledby={id + '-l'} className={on ? 'on' : ''} onClick={() => onChange(!on)}><i /><em>{on ? s.on : s.off}</em></button>
    </div>
  )
}

function Card({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return <section className="card r-card"><h3>{title}</h3>{sub && <p className="sub">{sub}</p>}{children}</section>
}

function Kpi({ label, value, tone, big }: { label: string; value: string; tone?: 'pos' | 'neg'; big?: boolean }) {
  return <div className={`kpi ${big ? 'big' : ''}`}><span>{label}</span><b className={tone}>{value}</b></div>
}

function Row({ l, v, ok }: { l: string; v: string; ok?: boolean }) {
  return <div className="h-row"><span>{l}</span><b>{v}</b>{ok !== undefined && <i className={ok ? 'ok' : 'warn'} aria-hidden>{ok ? '✓' : '!'}</i>}</div>
}

function Waterfall({ s, lang, m, fee }: { s: Strings; lang: Lang; m: ReturnType<typeof steadyMonth>; fee: number }) {
  const items: [string, number][] = [[s.bd.product, m.productCost], [s.bd.ads, m.spend], [s.bd.returns, m.returnLoss], [s.bd.delivery, m.delivery], [s.bd.fees, m.fees]]
  if (fee > 0) items.push([s.bd.fee, fee])
  const base = Math.max(m.revenue, 1)
  return (
    <div className="wf">
      <div className="wf-row total"><span>{s.bd.revenue}</span><div className="wf-track"><div style={{ width: '100%' }} /></div><b>{tk(m.revenue, lang)}</b></div>
      {items.filter(([, v]) => v > 0).map(([l, v]) => (
        <div className="wf-row cost" key={l}><span>{l}</span><div className="wf-track"><div style={{ width: `${Math.min(100, (v / base) * 100)}%` }} /></div><b>-{tk(v, lang)}</b></div>
      ))}
      <div className={`wf-row profit ${m.netProfit >= 0 ? 'pos' : 'neg'}`}><span>{s.bd.profit}</span><div className="wf-track"><div style={{ width: `${Math.min(100, (Math.abs(m.netProfit) / base) * 100)}%` }} /></div><b>{tk(m.netProfit, lang)}</b></div>
    </div>
  )
}
