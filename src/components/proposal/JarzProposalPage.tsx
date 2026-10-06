'use client'
// Jarz Digital — 6-month growth proposal as one scrolling page with the ads profit calculator.
// Rendered inside the site layout (navbar + footer). All styles are scoped under .jdp.
// Navigation: a sticky sidebar on desktop; on smaller screens a compact section bar that opens a side drawer.
import Link from 'next/link'
import { useEffect, useRef, useState, type MouseEvent, type ReactElement } from 'react'
import enContent from './content/en.json'
import bnContent from './content/bn.json'
import { STR, type Lang, type Strings } from './calc/strings'
import Calculator from './components/Calculator'
import { setLang, useLang } from './lang'
import { About, Home, Market, Packages, Plan, Results, Why, type C } from './components/Pages'
import './styles.css'

const SECTIONS = ['overview', 'about', 'results', 'market', 'why', 'plan', 'calculator', 'packages', 'start'] as const
type Id = (typeof SECTIONS)[number]


const ICONS: Record<Id, ReactElement> = {
  overview: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />,
  about: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  results: <path d="M4 20V10m6 10V4m6 16v-7m6 7H2" />,
  market: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  why: <path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z" />,
  plan: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4m8-4v4" /></>,
  calculator: <><rect x="5" y="2.5" width="14" height="19" rx="2.5" /><path d="M8 6.5h8M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h3.5" /></>,
  packages: <><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" /><path d="m3 7.5 9 4.5 9-4.5M12 12v9" /></>,
  start: <path d="M5 12h14m-6-6 6 6-6 6" />,
}

export interface ProposalContact { whatsappHref: string; whatsappDisplay: string; email: string }

export default function JarzProposalPage({ contact }: { contact: ProposalContact }) {
  const lang = useLang()
  const [active, setActive] = useState<Id>('overview')
  const [progress, setProgress] = useState(0)
  const [drawer, setDrawer] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const c = (lang === 'bn' ? bnContent : enContent) as C
  const s = STR[lang]

  // highlight the menu item for the section in view
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (vis) setActive(vis.target.id.replace('jdp-', '') as Id)
    }, { rootMargin: '-35% 0px -55% 0px' })
    SECTIONS.forEach((id) => { const el = document.getElementById('jdp-' + id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [lang])

  // reading progress through the proposal (drives the sidebar rail and the mobile bar)
  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const el = root.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const span = r.height - window.innerHeight
      setProgress(span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])

  // drawer: lock page scroll, close on Escape, hand focus back to the trigger
  useEffect(() => {
    if (!drawer) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false)
    window.addEventListener('keydown', onKey)
    document.querySelector<HTMLElement>('.jdp .drawer .side-nav a')?.focus()
    const btn = trigger.current
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); btn?.focus({ preventScroll: true }) }
  }, [drawer])

  const go = (id: string) => {
    setDrawer(false)
    // next frame: the drawer's scroll lock is released first
    requestAnimationFrame(() => document.getElementById('jdp-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  const props = { c, s, go }
  const nav = { s, active, go, progress }

  return (
    <div ref={root} className={`jdp ${lang === 'bn' ? 'bn' : ''}`} lang={lang}>
      <div className="shell">
        <aside className="side" aria-label={s.side.contents}>
          <SideHead s={s} />
          <LangSwitch lang={lang} setLang={setLang} />
          <SideNav {...nav} />
          <SideFoot s={s} contact={contact} />
        </aside>

        <div className="content">
          {/* phones & tablets: current section + progress; opens the contents drawer */}
          <div className="mbar">
            <button ref={trigger} className="mbar-btn" onClick={() => setDrawer(true)} aria-expanded={drawer} aria-controls="jdp-drawer">
              <svg viewBox="0 0 24 24" aria-hidden><path d="M4 6h16M4 12h10M4 18h16" /></svg>
              <span className="mbar-txt"><small>{s.side.contents}</small><b>{s.nav[active]}</b></span>
            </button>
            {active !== 'calculator' && <button className="mbar-cta" onClick={() => go('calculator')}>{s.short.calculator}</button>}
            <LangSwitch lang={lang} setLang={setLang} compact />
            <span className="mbar-progress" aria-hidden><i style={{ transform: `scaleX(${progress})` }} /></span>
          </div>

          <main className="main">
            <section id="jdp-overview" className="anchor"><Home {...props} /></section>
            <section id="jdp-about" className="anchor"><About {...props} /></section>
            <section id="jdp-results" className="anchor"><Results {...props} /></section>
            <section id="jdp-market" className="anchor"><Market {...props} /></section>
            <section id="jdp-why" className="anchor"><Why {...props} /></section>
            <section id="jdp-plan" className="anchor"><Plan {...props} /></section>
            <section id="jdp-calculator" className="anchor block calc-block"><Calculator s={s} lang={lang} showVideo={true} /></section>
            <section id="jdp-packages" className="anchor"><Packages {...props} /></section>
            <section id="jdp-start" className="anchor cta-final">
              <h2>{s.ctaTitle}</h2>
              <p>{s.ctaText}</p>
              <div className="cta-row">
                <a className="btn primary" href={contact.whatsappHref} target="_blank" rel="noopener noreferrer">{s.ctaBtn}</a>
                <Link className="btn ghost" href="/contact">{s.ctaWeb}</Link>
              </div>
              <p className="contact-line">WhatsApp {contact.whatsappDisplay} · {contact.email}</p>
            </section>
          </main>
        </div>
      </div>

      <div className={`drawer-veil ${drawer ? 'open' : ''}`} onClick={() => setDrawer(false)} aria-hidden />
      <div id="jdp-drawer" className={`drawer ${drawer ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label={s.side.contents} inert={!drawer}>
        <div className="drawer-top">
          <SideHead s={s} />
          <button className="drawer-x" onClick={() => setDrawer(false)} aria-label={s.side.close}>×</button>
        </div>
        <SideNav {...nav} />
        <SideFoot s={s} contact={contact} />
      </div>
    </div>
  )
}

function SideHead({ s }: { s: Strings }) {
  return <div className="side-head"><span>{s.side.kicker}</span><b>{s.side.title}</b></div>
}

function LangSwitch({ lang, setLang, compact }: { lang: Lang; setLang: (l: Lang) => void; compact?: boolean }) {
  return (
    <div className={`lang-sw ${compact ? 'compact' : ''}`} role="group" aria-label="Language">
      <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
      <button aria-pressed={lang === 'bn'} onClick={() => setLang('bn')}>বাংলা</button>
    </div>
  )
}

function SideNav({ s, active, go, progress }: { s: Strings; active: Id; go: (id: string) => void; progress: number }) {
  const click = (id: Id) => (e: MouseEvent) => { e.preventDefault(); go(id) }
  return (
    <nav className="side-nav" aria-label={s.side.contents}>
      <div className="side-list">
        <span className="side-rail" aria-hidden><i style={{ transform: `scaleY(${progress})` }} /></span>
        <ol>
          {SECTIONS.map((id, i) => (
            <li key={id}>
              <a href={`#jdp-${id}`} className={`${active === id ? 'on' : ''} ${id === 'calculator' ? 'hot' : ''}`} aria-current={active === id ? 'location' : undefined} onClick={click(id)}>
                <svg viewBox="0 0 24 24" aria-hidden>{ICONS[id]}</svg>
                <span>{s.nav[id]}</span>
                <em>{String(i + 1).padStart(2, '0')}</em>
              </a>
            </li>
          ))}
        </ol>
      </div>
      <p className="side-pct">{Math.round(progress * 100)}% {s.side.read}</p>
    </nav>
  )
}

function SideFoot({ s, contact }: { s: Strings; contact: ProposalContact }) {
  return (
    <div className="side-foot">
      <a className="btn primary side-cta" href={contact.whatsappHref} target="_blank" rel="noopener noreferrer">{s.side.talk}</a>
    </div>
  )
}
