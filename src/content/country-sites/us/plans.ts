// Growth plans: Ads only · Ads + SEO · Ads + SEO + full business management, each with a conservative, expected and strong range.
// Built on the calculator inputs (category, budget, click price, conversion, close rate, job value, margin, repeat jobs).
//
// What each layer adds (planning ranges, reached gradually):
//   Ads only      Jarz-managed ads: +30% conversion, −12% cost per click, +10% close rate by Month 3 (JARZ in model.ts).
//   + SEO         Free organic visitors (Google Search + Maps) grow from today's level along an SEO curve that is slow
//                 for three months and compounds after; a share of the extra visitors become leads.
//   + Full mgmt   Business management on top of SEO: every call and message answered (AI receptionist, follow-ups),
//                 landing-page and offer testing, review generation, Google profile and social upkeep, and automated
//                 reminders that bring customers back. Modelled as higher ad conversion, more leads closed, more repeat
//                 business and a stronger organic lift (reviews and profile activity feed local rankings).
// Supporting data: replying within 5 minutes makes a lead 21× more likely to qualify than replying in 30 (Lead Response
// Management Study, MIT/InsideSales); 62% of calls to small businesses go unanswered (411 Locals); the #1 Google Maps result
// takes 14.8% of clicks (First Page Sage 2026). Ranges are planning estimates, not guarantees.
import { channelCost, JARZ, JARZ_RAMP, SEO_CURVE, TODAY_DEFAULT, type Today, type UsInputs } from './model'

export type PlanId = 'ads' | 'seo' | 'full'
export type RangeId = 'low' | 'mid' | 'high'

export const PLANS: { id: PlanId; name: string; short: string; adds: string[] }[] = [
  { id: 'ads', name: 'Ads only', short: 'Ads', adds: ['Google Ads managed by Jarz Digital', 'Landing pages, call tracking and weekly optimization'] },
  { id: 'seo', name: 'Ads + SEO', short: 'Ads + SEO', adds: ['Everything in Ads only', 'Local SEO and Google Maps rankings', 'Free organic leads that grow every month'] },
  { id: 'full', name: 'Ads + SEO + Business management', short: 'Ads + SEO + Management', adds: ['Everything in Ads + SEO', 'AI receptionist and instant follow-ups', 'Reviews, Google profile and social upkeep', 'Conversion testing and customer-return automation'] },
]

export const RANGES: { id: RangeId; name: string }[] = [
  { id: 'low', name: 'Conservative' }, { id: 'mid', name: 'Expected' }, { id: 'high', name: 'Strong' },
]

/** Planning ranges. Every value is a multiplier or share reached by Month 12 (SEO) or Month 3 (management). */
export const RANGE_VALUES = {
  seoVisitorsX: { low: 1.8, mid: 3, high: 5 },         // organic visitors at Month 12 vs today
  orgLeadRate: { low: 0.02, mid: 0.025, high: 0.03 },  // share of organic visitors who call, book or enquire
  mgmtConversion: { low: 0.05, mid: 0.08, high: 0.15 },// extra ad conversion from landing-page and offer testing
  mgmtClose: { low: 0.08, mid: 0.15, high: 0.25 },     // extra leads closed: answered calls, instant replies, follow-ups
  mgmtRepeat: { low: 0.15, mid: 0.3, high: 0.5 },      // extra repeat business from reminders and re-engagement
  mgmtOrganic: { low: 1.1, mid: 1.2, high: 1.35 },     // organic lift from reviews, profile posts and social activity
}

export interface PlanFees { seo: number; mgmt: number }
export interface PlanMonth { month: number; adLeads: number; orgLeads: number; leads: number; customers: number; revenue: number; spend: number; profit: number; orgVisitors: number }
export interface PlanSummary { months: PlanMonth[]; yearRevenue: number; yearProfit: number; yearLeads: number; yearCustomers: number; m12Revenue: number; m12Leads: number; costPerCustomer: number; roi: number; paybackMonth: number }

const REPEAT_SPREAD = 12

export function planMonths(i: UsInputs, plan: PlanId, range: RangeId, today: Today = TODAY_DEFAULT, fees: PlanFees = { seo: 0, mgmt: 0 }): PlanSummary {
  const V = RANGE_VALUES
  const seo = plan !== 'ads', full = plan === 'full'
  const cohorts: number[] = []
  const months: PlanMonth[] = []
  for (let m = 0; m < 12; m++) {
    const k = JARZ_RAMP[m], s = SEO_CURVE[m]
    const cvrMult = (1 + (JARZ.cvr - 1) * k) * (full ? 1 + V.mgmtConversion[range] * k : 1)
    const cost = channelCost({ ...i, cpc: i.cpc * (1 - (1 - JARZ.cpc) * k), cvr: i.cvr * cvrMult })
    const adLeads = cost.available ? i.budget / cost.cpl : 0
    const extraVisitors = seo ? today.visitors * (V.seoVisitorsX[range] - 1) * s * (full ? V.mgmtOrganic[range] : 1) : 0
    const orgLeads = extraVisitors * V.orgLeadRate[range]
    const closeMult = (1 + (JARZ.close - 1) * k) * (full ? 1 + V.mgmtClose[range] * k : 1)
    const closeAds = Math.min(0.95, (cost.close / 100) * closeMult)
    const closeOrg = Math.min(0.95, (i.close / 100) * closeMult)
    const customers = adLeads * closeAds + orgLeads * closeOrg
    const repeat = i.repeat * (full ? 1 + V.mgmtRepeat[range] * k : 1)
    const repeatRevenue = cohorts.slice(-REPEAT_SPREAD).reduce((a, c) => a + (c * i.job * repeat) / REPEAT_SPREAD, 0)
    cohorts.push(customers)
    const revenue = customers * i.job + repeatRevenue
    const spend = i.budget + i.fee + (seo ? fees.seo : 0) + (full ? fees.mgmt : 0)
    months.push({ month: m + 1, adLeads, orgLeads, leads: adLeads + orgLeads, customers, revenue, spend, profit: revenue * (i.margin / 100) - spend, orgVisitors: today.visitors + extraVisitors })
  }
  const sum = (f: (p: PlanMonth) => number) => months.reduce((a, p) => a + f(p), 0)
  const yearSpend = sum((p) => p.spend), yearCustomers = sum((p) => p.customers), yearProfit = sum((p) => p.profit)
  let run = 0
  const paybackMonth = months.findIndex((p) => (run += p.profit) > 0)
  return {
    months, yearRevenue: sum((p) => p.revenue), yearProfit, yearLeads: sum((p) => p.leads), yearCustomers,
    m12Revenue: months[11].revenue, m12Leads: months[11].leads,
    costPerCustomer: yearCustomers ? yearSpend / yearCustomers : 0, roi: yearSpend ? (yearProfit / yearSpend) * 100 : 0,
    paybackMonth: paybackMonth >= 0 ? paybackMonth + 1 : 0,
  }
}

export const allPlans = (i: UsInputs, range: RangeId, today?: Today, fees?: PlanFees) =>
  Object.fromEntries(PLANS.map((p) => [p.id, planMonths(i, p.id, range, today, fees)])) as Record<PlanId, PlanSummary>
