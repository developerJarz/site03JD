// Which benchmark set the calculator uses: US (USD) or Canada (CAD). Labels change with it so every sentence stays accurate.
import { CATEGORIES, type Category } from './data'
import { CA_CATEGORIES, CA_CITY_FACTOR } from '../ca/data'

export interface CalcMarket {
  id: 'us' | 'ca'
  categories: Category[]
  avg: string            // "US average" / "Canadian average"
  benchmarks: string     // short source line used in leads and disclaimers
  meta: string           // Facebook & Instagram note
  currency: string       // shown next to money inputs
  budgetHint: string
  symbol: string         // currency symbol used in every amount, e.g. '$', '£', '€', 'Tk '
  locale: string
}

export const US_MARKET: CalcMarket = {
  id: 'us', categories: CATEGORIES, avg: 'US average', currency: 'USD', symbol: '$', locale: 'en-US', budgetHint: 'Most local businesses spend $1,000–2,000 a month.',
  benchmarks: '2025 US benchmarks',
  meta: 'Facebook & Instagram lead cost is estimated from the $27.66 US average, scaled to your category. Leads close at half the rate of search leads.',
}

export const CA_MARKET: CalcMarket = {
  id: 'ca', categories: CA_CATEGORIES, avg: 'Canadian average', currency: 'CAD', symbol: '$', locale: 'en-CA', budgetHint: 'Most Canadian local businesses spend $1,000–5,000 a month (CAD).',
  benchmarks: '2026 Canadian data in CAD',
  meta: 'Facebook & Instagram lead cost is estimated from the North American average (about CA$38 per lead), scaled to your category. Leads close at half the rate of search leads.',
}

const r2 = (n: number) => Math.round(n * 100) / 100

/** Canada market with click and lead costs adjusted for one city (Toronto 1.35×, Mississauga 1.25×, Brampton 1.2×, Calgary 1.15×). */
export function caCityMarket(cityId: string, cityName: string): CalcMarket {
  const f = CA_CITY_FACTOR[cityId] ?? 1
  if (f === 1) return { ...CA_MARKET, avg: `${cityName} average` }
  return {
    ...CA_MARKET,
    avg: `${cityName} average`,
    categories: CA_CATEGORIES.map((c) => ({ ...c, cpc: r2(c.cpc * f), cpl: r2(c.cpl * f), lsa: c.lsa === null ? null : Math.round(c.lsa * Math.sqrt(f)) })),
  }
}
