import type { Lang } from '../calc/strings'
import type { Month } from '../calc/model'
import { short } from '../format'

/** Monthly bars with a label on each bar (case-study sales). */
export function Bars({ values, labels, format, max, faded = [] }: { values: number[]; labels: string[]; format: (v: number) => string; max: number; faded?: number[] }) {
  const W = 700, H = 260, L = 8, B = 30, T = 28
  const ph = H - B - T
  const bw = (W - L * 2) / values.length
  return (
    <svg className="chart grow-y" viewBox={`0 0 ${W} ${H}`} role="img">
      {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={L} x2={W - L} y1={T + ph - g * ph} y2={T + ph - g * ph} className="grid" />)}
      {values.map((v, i) => {
        const h = (v / max) * ph, x = L + i * bw + bw * 0.16, w = bw * 0.68, y = T + ph - h
        return (
          <g key={i}>
            <rect className="bar" style={{ animationDelay: `${i * 70}ms` }} x={x} y={y} width={w} height={h} rx={6} fill={faded.includes(i) ? 'url(#gFade)' : 'url(#gTeal)'} />
            <text x={x + w / 2} y={y - 8} className="val" textAnchor="middle">{format(v)}</text>
            <text x={x + w / 2} y={H - 8} className="lbl" textAnchor="middle">{labels[i]}</text>
          </g>
        )
      })}
      <Defs />
    </svg>
  )
}

export function Defs() {
  return (
    <defs>
      <linearGradient id="gTeal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#52D4DC" /><stop offset="1" stopColor="#008D96" /></linearGradient>
      <linearGradient id="gFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#52D4DC" stopOpacity=".35" /><stop offset="1" stopColor="#008D96" stopOpacity=".25" /></linearGradient>
    </defs>
  )
}

/** Horizontal bars: label · track · value */
export function HBars({ items, max, unit = '' }: { items: [string, number][]; max: number; unit?: string }) {
  return (
    <div className="hbars">
      {items.map(([n, v], i) => (
        <div className="hbar" key={n}>
          <span>{n}</span>
          <div className="track"><div className="fill" style={{ width: `${(v / max) * 100}%`, animationDelay: `${i * 90}ms` }} /></div>
          <b>{v}{unit}</b>
        </div>
      ))}
    </div>
  )
}

/** Stacked monthly sales (ads / SEO / repeat) with a net-profit line and zero line. */
export function ForecastChart({ rows, lang, labels }: { rows: Month[]; lang: Lang; labels: { month: string } }) {
  const W = 720, H = 300, L = 56, R = 12, T = 18, B = 34
  const ph = H - T - B
  const top = Math.max(...rows.map((r) => r.revenue), 1)
  const low = Math.min(0, ...rows.map((r) => r.netProfit))
  const span = top - low
  const y = (v: number) => T + ((top - v) / span) * ph
  const bw = (W - L - R) / rows.length
  const ticks = niceTicks(low, top)
  const pts = rows.map((r, i) => [L + i * bw + bw / 2, y(r.netProfit)] as const)
  return (
    <svg className="chart grow-y" viewBox={`0 0 ${W} ${H}`} role="img">
      {ticks.map((t) => (
        <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className={t === 0 ? 'zero' : 'grid'} /><text x={L - 8} y={y(t) + 4} className="axis" textAnchor="end">{short(t, lang)}</text></g>
      ))}
      {rows.map((r, i) => {
        const x = L + i * bw + bw * 0.2, w = bw * 0.6
        const ads = r.adRevenue, seo = r.seoRevenue, rep = r.repeatRevenue
        const y0 = y(0), ya = y(ads), ys = y(ads + seo), yr = y(ads + seo + rep)
        return (
          <g key={i} className="bar" style={{ animationDelay: `${i * 80}ms` }}>
            <rect x={x} y={ya} width={w} height={Math.max(0, y0 - ya)} fill="#008D96" rx={2} />
            <rect x={x} y={ys} width={w} height={Math.max(0, ya - ys)} fill="#52D4DC" />
            <rect x={x} y={yr} width={w} height={Math.max(0, ys - yr)} fill="#F2A33A" rx={2} />
            <text x={x + w / 2} y={H - 10} className="lbl" textAnchor="middle">{labels.month} {r.month}</text>
          </g>
        )
      })}
      <polyline className="pline" fill="none" points={pts.map((p) => p.join(',')).join(' ')} />
      {pts.map(([px, py], i) => <circle key={i} cx={px} cy={py} r={4.5} className={rows[i].netProfit >= 0 ? 'dot pos' : 'dot neg'} />)}
    </svg>
  )
}

function niceTicks(low: number, high: number): number[] {
  const span = high - low || 1
  const raw = span / 4
  const p = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw) || raw
  const out: number[] = []
  for (let v = Math.ceil(low / step) * step; v <= high + 1e-9; v += step) out.push(Math.round(v))
  if (!out.includes(0)) out.push(0)
  return out
}

/** Which work runs in which month. */
export function Gantt({ rows, monthWord }: { rows: [string, number, number, string][]; monthWord: string }) {
  return (
    <div className="gantt">
      <div className="g-row g-head"><span /><div className="g-months">{[1, 2, 3, 4, 5, 6].map((m) => <span key={m}>{monthWord} {m}</span>)}</div></div>
      {rows.map(([label, a, b, color], i) => (
        <div className="g-row" key={i}>
          <span className="g-label">{label}</span>
          <div className="g-track">
            <div className="g-bar" style={{ left: `${((a - 1) / 6) * 100}%`, width: `${((b - a + 1) / 6) * 100}%`, background: color === '#060B13' ? '#E6EEF5' : color, animationDelay: `${i * 70}ms` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
