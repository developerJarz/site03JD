import { useSyncExternalStore } from 'react'
import type { Lang } from './calc/strings'

// Language choice for the proposal and the calculator (homepage too): remembered in localStorage
// (memory fallback), read via useSyncExternalStore so the server render and hydration are always
// English and a saved Bangla choice applies right after.
let memLang: Lang | null = null
const langSubs = new Set<() => void>()
const subscribeLang = (cb: () => void) => { langSubs.add(cb); return () => { langSubs.delete(cb) } }
function readLang(): Lang {
  if (memLang) return memLang
  try { return localStorage.getItem('jd-lang') === 'bn' ? 'bn' : 'en' } catch { return 'en' }
}
export function setLang(l: Lang) {
  memLang = l
  try { localStorage.setItem('jd-lang', l) } catch { /* storage unavailable */ }
  langSubs.forEach((cb) => cb())
}
export const useLang = () => useSyncExternalStore(subscribeLang, readLang, () => 'en' as Lang)
