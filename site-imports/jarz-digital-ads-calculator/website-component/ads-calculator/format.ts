import type { Lang } from './calc/strings'

/** Lakh-style grouping used in Bangladesh: 15,32,588 */
export function group(n: number): string {
  const s = Math.round(Math.abs(n)).toString()
  if (s.length <= 3) return s
  let head = s.slice(0, -3)
  const tail = s.slice(-3)
  const parts: string[] = []
  while (head.length > 2) { parts.unshift(head.slice(-2)); head = head.slice(0, -2) }
  if (head) parts.unshift(head)
  return parts.join(',') + ',' + tail
}

export const tk = (n: number, lang: Lang) => (n < 0 ? '-' : '') + (lang === 'bn' ? '৳' : 'Tk ') + group(n)
export const int = (n: number) => group(n)
export const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US')
export const dec = (n: number, d = 1) => (Number.isFinite(n) ? n.toFixed(d) : '∞')
export const pct = (n: number, d = 0) => (Number.isFinite(n) ? n.toFixed(d) + '%' : '—')

/** Short money for chart labels: Tk 5.8L, Tk 92K */
export function short(n: number, lang: Lang): string {
  const c = lang === 'bn' ? '৳' : 'Tk '
  const a = Math.abs(n)
  const s = a >= 1e7 ? (a / 1e7).toFixed(1) + 'Cr' : a >= 1e5 ? (a / 1e5).toFixed(1) + 'L' : a >= 1e3 ? Math.round(a / 1e3) + 'K' : Math.round(a).toString()
  return (n < 0 ? '-' : '') + c + s
}
