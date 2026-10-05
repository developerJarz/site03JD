import { useState } from 'react'
import type en from '../content/en.json'
import type { Strings } from '../calc/strings'
import { Bars, HBars, Gantt } from './charts'
import { Check, CountUp, Html, Reveal, SectionHead, Table, Zoom } from './ui'
import proof1 from '../assets/proof-1.png'
import proof2 from '../assets/proof-2.png'
import rank1 from '../assets/rank-1.jpg'
import rank2 from '../assets/rank-2.jpg'
import rank3 from '../assets/rank-3.jpg'

export type C = typeof en
const img = (x: unknown) => (typeof x === 'string' ? x : (x as { src: string }).src)
type P = { c: C; s: Strings; go: (tab: string) => void }

const SALES = [5.5, 11.3, 12.0, 16.8, 17.7, 18.3, 23.2, 11.9] // case-study store, US$K per month

export function Home({ c, s, go }: P) {
  const o = c.overview
  return (
    <>
      <section className="hero">
        <div className="hero-glow" aria-hidden />
        <div className="eyebrow">{c.cover.eyebrow}</div>
        <h1 className="hero-title">{c.cover.title}</h1>
        <p className="hero-sub">{c.cover.sub}</p>
        <div className="hero-cta">
          <button className="btn primary" onClick={() => go('calculator')}>{s.openCalc} →</button>
          <button className="btn ghost" onClick={() => go('packages')}>{s.nav.packages}</button>
        </div>
        <dl className="hero-meta">{c.cover.meta.slice(0, 2).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      </section>

      <div className="stats">{c.stats.map(([b, t], i) => <Reveal key={t} delay={i * 80} className="stat"><b><CountUp value={b} /></b><span>{t}</span></Reveal>)}</div>

      <section className="block">
        <SectionHead eyebrow={o.eyebrow} title={o.title} />
        <div className="letter">
          {o.letter.map((p, i) => <Html key={i} as="p" className={i === 0 ? 'lead' : ''} html={p} />)}
          <p className="sig"><b>{o.name}</b><span>{o.sig}</span></p>
        </div>
        <h3 className="h3">{o.glance}</h3>
        <div className="grid g3">{o.phases.map(([k, t, h, p], i) => <Reveal key={k} delay={i * 90} className={`phase ${k}`}><small>{t}</small><h4>{h}</h4><p>{p}</p></Reveal>)}</div>
        <Html as="p" className="note" html={o.note} />
        <h3 className="h3">{o.totals_h}</h3>
        <div className="strip">{o.totals.map(([b, t]) => <div key={t}><b><CountUp value={b} /></b><span>{t}</span></div>)}</div>
      </section>

    </>
  )
}

export function About({ c }: P) {
  const co = c.company
  return (
    <>
      <section className="block">
        <SectionHead eyebrow={co.eyebrow} title={co.title} />
        {co.body.map((p, i) => <Html key={i} as="p" className="body" html={p} />)}
        <h3 className="h3">{co.services_h}</h3>
        <div className="grid g4">{co.services.map(([a, b], i) => <Reveal key={a} delay={i * 40} className="card svc"><h4>{a}</h4><p>{b}</p></Reveal>)}</div>
        <h3 className="h3">{co.offices_h}</h3>
        <div className="grid g4">{co.offices.map(([a, b]) => <div key={a} className="card office"><h4>{a}</h4><p>{b}</p></div>)}</div>
        <h3 className="h3">{co.team_h}</h3>
        <div className="grid g3">{co.team.map(([i, h, p]) => <div key={h} className="card team"><Html className="ico" html={i} /><h4>{h}</h4><p>{p}</p></div>)}</div>
      </section>
    </>
  )
}

export function Results({ c }: P) {
  const pr = c.proof, a = c.analysis, r = c.rank
  return (
    <>
      <section className="block">
        <SectionHead eyebrow={pr.eyebrow} title={pr.title} lead={pr.intro} />
        <div className="grid g4">{pr.kpis.map(([b, t], i) => <Reveal key={t} delay={i * 70} className="card kpi-card"><b><CountUp value={b} /></b><span>{t}</span></Reveal>)}</div>
        <div className="card chart-card">
          <h3>{pr.chart_h}</h3><p className="sub">{pr.chart_sub}</p>
          <Bars values={SALES} labels={c.months} max={25} format={(v) => `$${v.toFixed(1)}K`} faded={[7]} />
        </div>
        <h3 className="h3">{pr.did_h}</h3>
        <div className="grid g2"><Check items={pr.did[0]} /><Check items={pr.did[1]} /></div>
      </section>

      <section className="block">
        <SectionHead eyebrow={a.eyebrow} title={a.title} lead={a.intro} />
        <Table head={a.head} rows={a.rows} />
        <h3 className="h3">{a.take_h}</h3>
        <div className="grid g3">{a.take.map(([h, t], i) => <div key={h} className={`card ${i === 2 ? 'accent' : ''}`}><h4>{h}</h4><p>{t}</p></div>)}</div>
      </section>

      <section className="block">
        <SectionHead eyebrow={pr.eyebrow} title={pr.shots_h} />
        <div className="grid g2"><Zoom src={img(proof1)} alt={pr.cap1} caption={pr.cap1} /><Zoom src={img(proof2)} alt={pr.cap2} caption={pr.cap2} /></div>
      </section>

      <section className="block">
        <SectionHead eyebrow={r.eyebrow} title={r.title} lead={r.intro} />
        <Table head={r.head} rows={r.rows} />
        <div className="grid g2 align-c">
          <div className="card"><h3>{r.ctr_h}</h3><p className="sub">{r.ctr_label}</p><HBars items={r.ctr as [string, number][]} max={16} unit="%" /><p className="src">{r.ctr_src}</p></div>
          <p className="note big">{r.ctr_note}</p>
        </div>
        <div className="grid g3 shots">
          <Zoom src={img(rank1)} alt={r.cap1} caption={r.cap1} /><Zoom src={img(rank2)} alt={r.cap2} caption={r.cap2} /><Zoom src={img(rank3)} alt={r.cap3} caption={r.cap3} />
        </div>
      </section>
    </>
  )
}

export function Market({ c }: P) {
  const mk = c.market
  return (
    <>
      <section className="block">
        <SectionHead eyebrow={mk.eyebrow} title={mk.title} lead={mk.intro} />
        <div className="strip">{mk.stats.map(([b, t]) => <div key={t}><b><CountUp value={b} /></b><span>{t}</span></div>)}</div>
        <div className="grid g2">
          <div className="card"><h3>{mk.plat_h}</h3><HBars items={mk.platforms as [string, number][]} max={62} /><p className="src">{mk.plat_src}</p></div>
          <div className="card"><h3>{mk.ecom_h}</h3>
            <Bars values={mk.ecom.map((e) => e[2] as number)} labels={mk.ecom.map((e) => String(e[0]))} max={16} format={(v) => (v < 10 ? '$5.2–7.4B' : `$${v}B`)} faded={[0]} />
            {mk.ecom.map((e) => <p key={String(e[0])} className="src">{e[0]}: {e[3]}</p>)}
          </div>
        </div>
        <h3 className="h3">{mk.cost_h}</h3>
        <Table head={mk.cost_head} rows={mk.cost_rows} />
        <p className="src">{mk.cost_src}</p>
        <h3 className="h3">{mk.insights_h}</h3>
        <div className="grid g3">{mk.insights.map(([h, p], i) => <Reveal key={h} delay={i * 60} className="card"><span className="num">{String(i + 1).padStart(2, '0')}</span><h4>{h}</h4><p>{p}</p></Reveal>)}</div>
      </section>

    </>
  )
}

export function Why({ c }: P) {
  const ag = c.agency, fw = c.framework
  return (
    <>
      <section className="block">
        <SectionHead eyebrow={ag.eyebrow} title={ag.title} lead={ag.intro} />
        <div className="grid g4">{ag.needs.map(([h, p]) => <div key={h} className="card accent"><h4>{h}</h4><p>{p}</p></div>)}</div>
        <Table head={ag.head} rows={ag.rows} />
        <p className="src">{ag.src}</p>
        <div className="grid g2">
          <div className="card"><h3>{ag.posts_h}</h3><HBars items={ag.posts as [string, number][]} max={32} /></div>
          <div className="card"><h3>{ag.videos_h}</h3><HBars items={ag.videos as [string, number][]} max={6.5} /></div>
        </div>
      </section>

      <section className="block">
        <SectionHead eyebrow={fw.eyebrow} title={fw.title} lead={fw.intro} />
        <div className="funnel-steps">
          {fw.stages.map(([h, sub, ch, k], i) => (
            <Reveal key={h} delay={i * 90} className="fstep" >
              <div className="fbar" style={{ width: `${100 - i * 12}%` }}><b>{h}</b><span>{sub}</span></div>
              <p>{ch}</p><p className="kpi-t">{k}</p>
            </Reveal>
          ))}
        </div>
        <h3 className="h3">{fw.kpi_h}</h3>
        <Table head={fw.kpi_head} rows={fw.kpi_rows} />
      </section>
    </>
  )
}

export function Plan({ c, s, go }: P) {
  const rm = c.roadmap, m1 = c.m1, m2 = c.m2, seo = c.seo, m36 = c.m36, bd = c.budget
  return (
    <>
      <section className="block">
        <SectionHead eyebrow={rm.eyebrow} title={rm.title} lead={rm.intro} />
        <div className="timeline">
          {rm.rows.map((r, i) => (
            <Reveal key={i} delay={i * 60} className="t-item">
              <div className="t-dot"><Html html={r[0]} /></div>
              <div className="card"><Html as="h4" html={r[1]} /><Html as="p" html={r[2]} /><Html as="p" className="t-see" html={r[3]} /></div>
            </Reveal>
          ))}
        </div>
        <h3 className="h3">{rm.gantt_h}</h3>
        <div className="card"><Gantt rows={rm.gantt as [string, number, number, string][]} monthWord={c.month_w} /></div>
      </section>

      <section className="block">
        <SectionHead eyebrow={m1.eyebrow} title={m1.title} lead={m1.intro} />
        <div className="grid g2">{m1.streams.map(([n, h, items]) => <div key={n as string} className="card"><span className="num">{n as string}</span><h4>{h as string}</h4><Check items={items as string[]} /></div>)}</div>
        <div className="strip">{m1.stats.map(([b, t]) => <div key={t}><b>{b}</b><span>{t}</span></div>)}</div>
        <h3 className="h3">{m1.hub_h}</h3>
        <p className="body">{m1.hub_p}</p>
        <div className="hub">
          <div className="hub-core"><b>{m1.hub_center[0]}</b><span>{m1.hub_center[1]}</span></div>
          <div className="hub-nodes">{m1.hub_nodes.map(([n, col]) => <span key={n} style={{ ['--c' as string]: col }}>{n}</span>)}</div>
          <div className="hub-track">{m1.hub_track}</div>
        </div>
        <h3 className="h3">{m1.weeks_h}</h3>
        <div className="grid g4 weeks">{m1.weeks.map(([h, items], i) => <div key={h as string} className="card"><span className="num">{i + 1}</span><h4>{h as string}</h4><Check items={items as string[]} /></div>)}</div>
        <p className="note"><b>{m1.done_b}</b> {m1.done}</p>
      </section>

      <section className="block">
        <SectionHead eyebrow={m2.eyebrow} title={m2.title} lead={m2.intro} />
        <Table head={m2.head} rows={m2.rows} />
        <h3 className="h3">{m2.ads_h}</h3>
        <div className="grid g3">{m2.ads.map(([h, p], i) => <div key={h} className="card"><span className="num">{i + 1}</span><h4>{h}</h4><p>{p}</p></div>)}</div>
        <Html as="p" className="note warn" html={m2.note} />
      </section>

      <section className="block">
        <SectionHead eyebrow={seo.eyebrow} title={seo.title} lead={seo.intro} />
        <div className="grid g2">
          {(['research', 'onpage', 'technical', 'local', 'offpage', 'content'] as const).map((k) => (
            <div key={k} className="card"><h4>{seo[k][0] as string}</h4><Check items={seo[k][1] as string[]} /></div>
          ))}
        </div>
        <h3 className="h3">{seo.process_h}</h3>
        <ol className="flow">{seo.process.map(([h, t]) => <li key={h}><b>{h}</b><span>{t}</span></li>)}</ol>
        <h3 className="h3">{seo.when_h}</h3>
        <Table head={seo.when_head} rows={seo.when_rows} />
        <p className="note">{seo.when_note}</p>
      </section>

      <section className="block">
        <SectionHead eyebrow={m36.eyebrow} title={m36.title} />
        <div className="grid g2">{m36.months.map(([n, h, p, items, g]) => (
          <div key={n as string} className="card month"><span className="mnum">{c.month_w} {n as string}</span><h4>{h as string}</h4><p>{p as string}</p><Check items={items as string[]} /><p className="goal">{g as string}</p></div>
        ))}</div>
      </section>

      <section className="block">
        <SectionHead eyebrow={bd.eyebrow} title={bd.title} lead={bd.intro} />
        <Table head={bd.head} rows={bd.rows} />
        <p className="src">{bd.foot}</p>
        <button className="btn primary" onClick={() => go('calculator')}>{s.openCalc} →</button>
        <h3 className="h3">{bd.inc_h}</h3>
        <div className="grid g4">{bd.inc.map(([h, p]) => <div key={h} className="card"><h4>{h}</h4><p>{p}</p></div>)}</div>
      </section>
    </>
  )
}

export function Packages({ c }: P) {
  const pk = c.packages, nx = c.next
  const [pick, setPick] = useState(1)
  const tiers = ['basic', 'std', 'gold']
  return (
    <>
      <section className="block">
        <SectionHead eyebrow={pk.eyebrow} title={pk.title} lead={pk.intro} />
        <div className="tier-tabs" role="tablist">
          {pk.names.map(([n, tag], i) => (
            <button key={n} role="tab" aria-selected={pick === i} className={`tier ${tiers[i]} ${pick === i ? 'on' : ''}`} onClick={() => setPick(i)}>
              {i === 1 && <em>{pk.popular}</em>}<b>{n}</b><span>{tag}</span>
            </button>
          ))}
        </div>
        {/* phones: one package at a time; wide screens: full comparison */}
        <div className="pk-one">
          {pk.groups.map(([g, items]) => (
            <div key={g as string} className="card pk-grp"><h4>{g as string}</h4>
              {(items as string[][]).map((it) => <div key={it[0]} className="pk-row"><span>{it[0]}</span><Html html={it[pick + 1]} /></div>)}
            </div>
          ))}
        </div>
        <div className="pk-all tbl-wrap">
          <table className="tbl pk">
            <thead><tr><th />{pk.names.map(([n], i) => <th key={n} className={`th-${tiers[i]}`}>{n}</th>)}</tr></thead>
            <tbody>
              {pk.groups.map(([g, items]) => [
                <tr key={g as string} className="grp-row"><td colSpan={4}>{g as string}</td></tr>,
                ...(items as string[][]).map((it) => <tr key={it[0]}>{it.map((cell, j) => <td key={j}><Html html={cell} /></td>)}</tr>),
              ])}
            </tbody>
          </table>
        </div>
        <p className="fee">{pk.fee}</p>
      </section>

      <section className="block">
        <SectionHead eyebrow={nx.eyebrow} title={nx.title} />
        <div className="grid g2">
          <div className="card"><h4>{nx.rep_h}</h4><Check items={nx.rep} /></div>
          <div className="card"><h4>{nx.need_h}</h4><Check items={nx.need} /></div>
        </div>
        <h3 className="h3">{nx.inv_h}</h3>
        <Table head={nx.inv_head} rows={nx.inv_rows} />
        <h3 className="h3">{nx.steps_h}</h3>
        <div className="grid g3">{nx.steps.map(([h, p], i) => <div key={h} className={`card ${i === 2 ? 'accent' : ''}`}><span className="num">{i + 1}</span><h4>{h}</h4><p>{p}</p></div>)}</div>

      </section>
    </>
  )
}
