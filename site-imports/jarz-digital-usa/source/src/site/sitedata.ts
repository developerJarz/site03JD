// Everything a country site needs. The page components in Site.tsx read from this, so the USA site and the
// Canada site share one design and one codebase while every word of copy, every city and every benchmark is their own.
import { createContext, useContext } from 'react'
import type { CalcMarket } from '../us/market'
import type { City, Faq, Service } from './content'
import type { Block, LongSection, Playbook } from './longform'
import type { ServiceDetail } from './more'

export type CityWords = { name: string; state: string }
export interface Proof { img: string; alt: string; city: string; search: string; note: string; width: number; height: number; badge?: string }
export interface CityExtra { market: string; neighborhoods: string; keywords: string[] }
export interface CityUniqueContent { seo: Block[]; ads: Block[]; ai: Block[]; services: Record<string, string>; faq: Faq[] }
type Builder = (c?: CityWords) => LongSection

export interface SiteData {
  market: 'us' | 'ca' | 'uk' | 'eu' | 'bd'
  homeId: string               // page id of this site's homepage
  lang: string                 // html lang / hreflang, e.g. 'en-GB'
  ogLocale: string             // e.g. 'en_GB'
  geoCountry: string           // ISO country code for geo meta and schema, e.g. 'GB'
  crumbHome: string            // breadcrumb label for the site's homepage
  servicesTitle?: string       // homepage services heading
  cityMarket?: (cityId: string, cityName: string) => CalcMarket
  video?: boolean              // show the calculator video guide
  regional?: { name: string; locality?: string; region?: string; countryName: string }  // organization unit for this country site
  root: string                 // '/' for the USA, '/ca/' for Canada
  country: string              // 'USA' | 'Canada'
  inCountry: string            // 'across the USA' | 'across Canada'
  calc: CalcMarket
  calcDefault: string
  services: Service[]          // all twelve, in display order
  cities: City[]
  home: {
    title: string; description: string; eyebrow: string; h1: string; h1em: string; sub: string
    servicesLead: string; calcTitle: string; calcLead: string; compareTitle: string; faqTitle: string
  }
  heroExample: { cat: string; label: string }
  allLabel: string; allSub: string
  results: { title: string; lead: string; proof: Proof[]; strip: [string, string][] }
  locations: { title: string; lead: string; nationwide: string }
  cityExtra: Record<string, CityExtra>
  cityUnique: Record<string, CityUniqueContent>
  whoTitle: string
  who: [string, string][]
  industries: string[]
  footer: { tag: string; address: string[]; copy: string }
  waMessage: string
  faqsFor: (page: string) => Faq[]
  about: (c?: CityWords) => { title: string; paras: string[]; values: [string, string][] }
  details: ServiceDetail[]
  quality: [string, string][]
  process: [string, string][]
  cases: { h: string; p: string }[]
  glossary: [string, string][]
  pricing: { title: string; intro: string; blocks: [string, string][] }
  audit: { title: string; items: string[] }
  long: { opportunity: Builder; whyHire: Builder; howWeGrow: Builder; whyBest: Builder; aiSearch: Builder; aiDeep: Builder; automationDeep: Builder; adsCostGuide: Builder; seoGuide: Builder }
  playbooks: Playbook[]
  playbooksLead: string
  calcCityLead: (city: string) => string
}

export const SiteCtx = createContext<SiteData | null>(null)
export const useSite = () => useContext(SiteCtx)!
