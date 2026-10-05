'use client'
// Jarz Digital — 6-month growth proposal as one scrolling page with the ads profit calculator.
// Drop-in page component: all styles are scoped under .jdp so they never touch the rest of a website.
import { useEffect, useState } from 'react'
import enContent from './content/en.json'
import bnContent from './content/bn.json'
import { STR, type Lang } from './calc/strings'
import Calculator from './components/Calculator'
import { About, Home, Market, Packages, Plan, Results, Why, type C } from './components/Pages'
import logoSrc from './assets/logo-full-dark.png'
import './styles.css'

const img = (x: unknown) => (typeof x === 'string' ? x : (x as { src: string }).src)

const SECTIONS = ['overview', 'about', 'results', 'market', 'why', 'plan', 'calculator', 'packages', 'start'] as const
type Id = (typeof SECTIONS)[number]
const BAR: Id[] = ['overview', 'results', 'plan', 'calculator', 'packages']

const ICONS: Partial<Record<Id, JSX.Element>> = {
  overview: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />,
  results: <path d="M4 20V10m6 10V4m6 16v-7m6 7H2" />,
  plan: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4m8-4v4" /></>,
  calculator: <><rect x="5" y="2.5" width="14" height="19" rx="2.5" /><path d="M8 6.5h8M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h3.5" /></>,
  packages: <><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" /><path d="m3 7.5 9 4.5 9-4.5M12 12v9" /></>,
}

function initialLang(): Lang {
  try { return localStorage.getItem('jd-lang') === 'bn' ? 'bn' : 'en' } catch { return 'en' }
}

export default function JarzProposalPage() {
  const [lang, setLang] = useState<Lang>('en')
  const [active, setActive] = useState<Id>('overview')
  const c = (lang === 'bn' ? bnContent : enContent) as C
  const s = STR[lang]

  useEffect(() => { setLang(initialLang()) }, [])
  useEffect(() => { try { localStorage.setItem('jd-lang', lang) } catch { /* storage unavailable */ } }, [lang])

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

  // keep the active menu chip visible in the scrolling menu
  useEffect(() => { document.querySelector(`.jdp .snav [data-id="${active}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' }) }, [active])

  const go = (id: string) => document.getElementById('jdp-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const props = { c, s, go }

  return (
    <div className={`jdp ${lang === 'bn' ? 'bn' : ''}`} lang={lang}>
      <header className="top">
        <div className="top-in">
          <button className="brand" onClick={() => go('overview')} aria-label="Jarz Digital"><img src={img(logoSrc)} alt="Jarz Digital" /></button>
          <nav className="snav" aria-label="Page sections">
            {SECTIONS.map((id) => (
              <button key={id} data-id={id} className={`${active === id ? 'on' : ''} ${id === 'calculator' ? 'cta' : ''}`} aria-current={active === id ? 'true' : undefined} onClick={() => go(id)}>{s.nav[id]}</button>
            ))}
          </nav>
          <button className="lang" onClick={() => setLang(lang === 'en' ? 'bn' : 'en')} aria-label="Language">{lang === 'en' ? 'বাংলা' : 'EN'}</button>
        </div>
      </header>

      <main className="main">
        <section id="jdp-overview" className="anchor"><Home {...props} /></section>
        <section id="jdp-about" className="anchor"><About {...props} /></section>
        <section id="jdp-results" className="anchor"><Results {...props} /></section>
        <section id="jdp-market" className="anchor"><Market {...props} /></section>
        <section id="jdp-why" className="anchor"><Why {...props} /></section>
        <section id="jdp-plan" className="anchor"><Plan {...props} /></section>
        <section id="jdp-calculator" className="anchor block calc-block"><Calculator s={s} lang={lang} /></section>
        <section id="jdp-packages" className="anchor"><Packages {...props} /></section>
        <section id="jdp-start" className="anchor cta-final">
          <h2>{s.ctaTitle}</h2>
          <p>{s.ctaText}</p>
          <div className="cta-row">
            <a className="btn primary" href="https://wa.me/8801925982536" target="_blank" rel="noopener noreferrer">{s.ctaBtn}</a>
            <a className="btn ghost" href="https://jarzdigital.com" target="_blank" rel="noopener noreferrer">{s.ctaWeb}</a>
          </div>
          <p className="contact-line">WhatsApp +880 1925-982536 · jarzdigital36@gmail.com</p>
        </section>
        <footer className="foot"><b>Jarz Digital</b> · jarzdigital.com · {c.offices_short}</footer>
      </main>

      <nav className="tabbar" aria-label="Quick links">
        {BAR.map((id) => (
          <button key={id} className={`${active === id ? 'on' : ''} ${id === 'calculator' ? 'calc-tab' : ''}`} aria-current={active === id ? 'true' : undefined} onClick={() => go(id)}>
            <svg viewBox="0 0 24 24" aria-hidden>{ICONS[id]}</svg><span>{s.short[id as keyof typeof s.short]}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
