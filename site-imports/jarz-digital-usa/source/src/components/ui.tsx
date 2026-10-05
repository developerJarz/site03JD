import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Renders trusted proposal copy that contains small inline markup (<b>, pills, ticks). */
export function Html({ html, as: Tag = 'span', className }: { html: string; as?: 'span' | 'p' | 'div' | 'h3' | 'h4'; className?: string }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Adds .in when the element scrolls into view; content is visible at rest either way. */
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || reduce || !('IntersectionObserver' in window)) { setSeen(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.01 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${seen ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>
}

/** Counts up to a value like "500+", "$122,458" or "4.9★" once it is visible. */
export function CountUp({ value }: { value: string }) {
  const m = value.match(/^([^0-9]*)([0-9][0-9,.]*)(.*)$/)
  const ref = useRef<HTMLSpanElement>(null)
  const [text, setText] = useState(value)
  useEffect(() => {
    if (!m || reduce || !ref.current || !('IntersectionObserver' in window)) return
    const target = parseFloat(m[2].replace(/,/g, ''))
    const decimals = (m[2].split('.')[1] || '').length
    const comma = m[2].includes(',')
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const step = (t: number) => {
        const k = Math.max(0, Math.min(1, (t - t0) / 900))
        // start at 60% so a paused or throttled animation never shows a misleading zero
        const v = target * (0.6 + 0.4 * (1 - Math.pow(1 - k, 3)))
        const s = comma ? v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : v.toFixed(decimals)
        setText(k < 1 ? m[1] + s + m[3] : value)
        if (k < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, { threshold: 0.4 })
    io.observe(ref.current)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [value])
  return <span ref={ref}>{text}</span>
}

export function SectionHead({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <header className="sec-head">
      {eyebrow && <div className="eyebrow">{eyebrow.replace(/^\d+\s·\s/, '')}</div>}
      <h2>{title}</h2>
      {lead && <Html as="p" className="lead" html={lead} />}
    </header>
  )
}

export function Check({ items }: { items: string[] }) {
  return <ul className="check">{items.map((t, i) => <li key={i}><Html html={t} /></li>)}</ul>
}

/** Table on wide screens, stacked label/value cards on phones. */
export function Table({ head, rows, highlight }: { head: string[]; rows: (string | number)[][]; highlight?: number }) {
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead><tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i === highlight ? 'hl' : ''}>
              {r.map((c, j) => <td key={j} data-label={head[j] || ''}><Html html={String(c)} /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Tap an image to see it full screen. */
export function Zoom({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open])
  return (
    <figure className="shot">
      <button className="shot-btn" onClick={() => setOpen(true)} aria-label={alt}><img src={src} alt={alt} loading="lazy" /></button>
      {caption && <figcaption>{caption}</figcaption>}
      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <img src={src} alt={alt} />
          <button className="lb-close" aria-label="Close">×</button>
        </div>
      )}
    </figure>
  )
}

/** True on phone-width screens. Charts use it to redraw with a narrower canvas and readable labels. */
export function useNarrow(max = 640) {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${max}px)`)
    const on = () => setNarrow(mq.matches)
    on(); mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [max])
  return narrow
}
