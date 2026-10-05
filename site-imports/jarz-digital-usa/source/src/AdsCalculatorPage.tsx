'use client'
// Jarz Digital — standalone ads revenue & profit calculator page (English + Bangla).
// Styles are scoped under .jdp so the page can sit inside any website.
import { useEffect, useState } from 'react'
import { STR, type Lang } from './calc/strings'
import Calculator from './components/Calculator'
import logoSrc from './assets/logo-full-dark.png'
import './styles.css'

const img = (x: unknown) => (typeof x === 'string' ? x : (x as { src: string }).src)

export default function AdsCalculatorPage() {
  const [lang, setLang] = useState<Lang>('en')
  const s = STR[lang]

  useEffect(() => { try { if (localStorage.getItem('jd-lang') === 'bn') setLang('bn') } catch { /* storage unavailable */ } }, [])
  useEffect(() => { try { localStorage.setItem('jd-lang', lang) } catch { /* storage unavailable */ } }, [lang])

  return (
    <div className={`jdp calc-page ${lang === 'bn' ? 'bn' : ''}`} lang={lang}>
      <header className="top">
        <div className="top-in">
          <a className="brand" href="https://jarzdigital.com" aria-label="Jarz Digital"><img src={img(logoSrc)} alt="Jarz Digital" /></a>
          <button className="lang" onClick={() => setLang(lang === 'en' ? 'bn' : 'en')} aria-label="Language">{lang === 'en' ? 'বাংলা' : 'EN'}</button>
        </div>
      </header>

      <main className="main">
        <Calculator s={s} lang={lang} />
        <section className="cta-final">
          <h2>{s.ctaTitle}</h2>
          <p>{s.ctaText}</p>
          <div className="cta-row">
            <a className="btn primary" href="https://wa.me/8801925982536" target="_blank" rel="noopener noreferrer">{s.ctaBtn}</a>
            <a className="btn ghost" href="https://jarzdigital.com" target="_blank" rel="noopener noreferrer">{s.ctaWeb}</a>
          </div>
          <p className="contact-line">WhatsApp +880 1925-982536 · jarzdigital36@gmail.com</p>
        </section>
        <footer className="foot"><b>Jarz Digital</b> · jarzdigital.com</footer>
      </main>
    </div>
  )
}
