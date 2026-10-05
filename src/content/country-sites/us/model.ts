// US Google Ads revenue engine for local, lead-based businesses. All money in US$.
import { ALL_INDUSTRY, type Category } from './data'

export type Channel = 'search' | 'lsa' | 'microsoft' | 'meta'

export interface UsInputs {
  budget: number   // monthly ad spend, $
  cpc: number      // cost per click, $
  cvr: number      // click → lead, %
  close: number    // lead → customer, %
  job: number      // average job value, $
  margin: number   // gross margin, %
  repeat: number   // extra purchases per customer in a year
  fee: number      // monthly agency / management fee, $ (0 = leave out)
  channel: Channel
  lsaCpl: number | null
  autoScale: boolean
}

export interface UsMonth {
  month: number; budget: number; cpc: number; cpl: number; clicks: number; leads: number; customers: number
  revenue: number; repeatRevenue: number; total: number; grossProfit: number; netProfit: number; netLifetime: number
  cpa: number; roas: number; roi: number
}

const META_CPL_AVG = 27.66      // WordStream 2025 Facebook lead ads, all industries
const META_CLOSE_FACTOR = 0.5   // social leads are less ready to buy than search leads (estimate)
const MS_DISCOUNT = 0.7         // Microsoft Ads clicks ~30% cheaper (published range 20–40%)
const CVR_RAMP = [0.8, 0.9, 1, 1.05, 1.1, 1.15]   // conversion rate vs input while the account learns and is optimised
const CPC_RAMP = [1.1, 1.05, 1, 0.97, 0.95, 0.93] // Quality Score gains lower click prices over time
const REPEAT_SPREAD = 12        // repeat purchases arrive evenly over 12 months
const SCALE_TRIGGER = 1.2       // raise budget only at ≥ 1.2× break-even return
const SCALE_STEP = 0.2

export function fromCategory(cat: Category, budget: number, fee = 0, channel: Channel = 'search', autoScale = true): UsInputs {
  return { budget, cpc: cat.cpc, cvr: +(cat.cpc / cat.cpl * 100).toFixed(2), close: cat.close, job: cat.job, margin: cat.margin, repeat: cat.repeat, fee, channel, lsaCpl: cat.lsa, autoScale }
}

/** Clicks get pricier as budgets outgrow local search volume: +10% CPC per doubling above $2,500/month. */
export const saturation = (budget: number) => 1 + 0.1 * Math.max(0, Math.log2(budget / 2500))

/** Cost per lead and close rate for the chosen channel. */
export function channelCost(i: UsInputs, cvrFactor = 1, cpcFactor = 1) {
  const cpc = i.cpc * cpcFactor * saturation(i.budget)
  const searchCpl = cpc / ((i.cvr / 100) * cvrFactor)
  switch (i.channel) {
    case 'microsoft': return { cpc: cpc * MS_DISCOUNT, cpl: searchCpl * MS_DISCOUNT, close: i.close, available: true }
    case 'lsa': return { cpc: 0, cpl: (i.lsaCpl ?? NaN) / cvrFactor, close: i.close, available: i.lsaCpl !== null }
    case 'meta': return { cpc: 0, cpl: (META_CPL_AVG * (searchCpl / ALL_INDUSTRY.cpl)) / cvrFactor, close: i.close * META_CLOSE_FACTOR, available: true }
    default: return { cpc, cpl: searchCpl, close: i.close, available: true }
  }
}

export function breakEven(i: UsInputs) {
  const perLead = (i.close / 100) * i.job * (i.margin / 100)
  return { cpl: perLead, cplLifetime: perLead * (1 + i.repeat), cpc: perLead * (i.cvr / 100), roas: i.margin ? 100 / i.margin : Infinity }
}

/** One typical month after optimisation. netProfit = this month's jobs; netLifetime adds a year of repeat purchases. */
export function steady(i: UsInputs, budget = i.budget): UsMonth {
  const x = { ...i, budget }
  const ch = channelCost(x)
  const leads = ch.available ? budget / ch.cpl : 0
  const customers = leads * (ch.close / 100)
  const revenue = customers * i.job
  const repeatRevenue = revenue * i.repeat
  const total = revenue + repeatRevenue
  const grossProfit = revenue * (i.margin / 100)
  const netProfit = grossProfit - budget - i.fee                     // this month's jobs only
  const netLifetime = total * (i.margin / 100) - budget - i.fee       // plus a year of repeat business
  return {
    month: 0, budget, cpc: ch.cpc, cpl: ch.cpl, clicks: ch.cpc ? budget / ch.cpc : 0, leads, customers, revenue, repeatRevenue, total, grossProfit, netProfit, netLifetime,
    cpa: customers ? budget / customers : 0, roas: budget ? revenue / budget : 0, roi: budget + i.fee ? (netProfit / (budget + i.fee)) * 100 : 0,
  }
}

/** Six months: the account learns, click prices fall, repeat customers return, budget scales when profitable. */
export function forecast(i: UsInputs): UsMonth[] {
  const out: UsMonth[] = []
  const cohorts: number[] = []
  const be = breakEven(i)
  let budget = i.budget
  for (let m = 0; m < 6; m++) {
    const ch = channelCost({ ...i, budget }, CVR_RAMP[m], CPC_RAMP[m])
    const leads = ch.available ? budget / ch.cpl : 0
    const customers = leads * (ch.close / 100)
    const revenue = customers * i.job
    const repeatRevenue = cohorts.reduce((a, rev) => a + (rev * i.repeat) / REPEAT_SPREAD, 0)
    cohorts.push(revenue)
    const total = revenue + repeatRevenue
    const grossProfit = total * (i.margin / 100)
    const netProfit = grossProfit - budget - i.fee
    out.push({ month: m + 1, budget, cpc: ch.cpc, cpl: ch.cpl, clicks: ch.cpc ? budget / ch.cpc : 0, leads, customers, revenue, repeatRevenue, total, grossProfit, netProfit, netLifetime: netProfit,
      cpa: customers ? budget / customers : 0, roas: budget ? revenue / budget : 0, roi: budget + i.fee ? (netProfit / (budget + i.fee)) * 100 : 0 })
    if (i.autoScale && budget && revenue / budget >= be.roas * SCALE_TRIGGER) budget = Math.round(budget * (1 + SCALE_STEP))
  }
  return out
}

/** Expected profit per $1 of lead cost: (job × close × margin × lifetime) ÷ CPL. Above 1 = leads pay for themselves. */
export const returnIndex = (cat: Category) => (cat.job * (cat.close / 100) * (cat.margin / 100) * (1 + cat.repeat)) / cat.cpl
export const leadValue = (cat: Category) => cat.job * (cat.close / 100)

export const US_BUDGETS = [500, 1000, 1500, 2500, 5000, 10000]

/* ---------- Typical agency vs Jarz Digital vs Jarz Digital + SEO (12 months) ----------
   Typical agency = the published US averages entered in the calculator.
   Jarz Digital improvements (estimates from our account work, reached by Month 3):
   - conversion rate +30%  (landing pages built for calls/forms, call tracking, offer testing)
   - cost per click −12%   (tighter keywords and higher Quality Score)
   - close rate +10%       (instant AI replies and follow-ups, so fewer leads go cold)
   SEO grows free organic visitors (Google + Maps) to 3× today by Month 12; about 2.5% of organic visitors become leads. */
export const JARZ = { cvr: 1.3, cpc: 0.88, close: 1.1 }
export const ORG_LEAD_RATE = 0.025
export const JARZ_RAMP = [0.4, 0.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

export interface GrowthPoint { month: number; typical: number; jarz: number; jarzSeo: number; leadsTypical: number; leadsJarz: number; leadsSeo: number }

export function growth12(i: UsInputs, today: Today = TODAY_DEFAULT): GrowthPoint[] {
  const base = { ...i, channel: 'search' as Channel }
  const typ: number[] = [], jz: number[] = [], js: number[] = []
  const pts: GrowthPoint[] = []
  for (let m = 0; m < 12; m++) {
    const k = JARZ_RAMP[m]
    const t = channelCost(base)
    const j = channelCost({ ...base, cpc: base.cpc * (1 - (1 - JARZ.cpc) * k), cvr: base.cvr * (1 + (JARZ.cvr - 1) * k) })
    const leadsT = i.budget / t.cpl
    const leadsJ = i.budget / j.cpl
    const leadsS = today.visitors * (G360.organicVisitorsX - 1) * SEO_CURVE[m] * ORG_LEAD_RATE // extra organic leads from SEO
    const closeJ = (i.close / 100) * (1 + (JARZ.close - 1) * k)
    const custT = leadsT * (i.close / 100), custJ = leadsJ * closeJ, custS = leadsS * closeJ
    const rep = (arr: number[]) => arr.slice(-REPEAT_SPREAD).reduce((a, c) => a + (c * i.job * i.repeat) / REPEAT_SPREAD, 0)
    pts.push({ month: m + 1, typical: custT * i.job + rep(typ), jarz: custJ * i.job + rep(jz), jarzSeo: (custJ + custS) * i.job + rep(js), leadsTypical: leadsT, leadsJarz: leadsJ, leadsSeo: leadsJ + leadsS })
    typ.push(custT); jz.push(custJ); js.push(custJ + custS)
  }
  return pts
}

/* ---------- 360° growth dashboard (12 months) ----------
   Starting point = the business today (editable). Typical agency runs ads only, so organic numbers stay flat.
   Jarz Digital adds SEO, Google Business Profile management, review requests and AI lead replies.
   Growth targets below are typical illustrations from local SEO campaigns, not guarantees. */
export interface Today { visitors: number; keywords: number; reviews: number; mapTop3: number }
export const TODAY_DEFAULT: Today = { visitors: 400, keywords: 3, reviews: 15, mapTop3: 0 }
export const G360 = {
  keywordsGain: 45,     // extra keywords on Google page 1 by Month 12 (service × city terms)
  mapTop3Gain: 12,      // extra keywords in the top-3 Google Maps results
  organicVisitorsX: 3,  // organic visitors grow to 3× today by Month 12 (the expected range in plans.ts)
  reviewsPerMonth: 5,   // new Google reviews a month from automatic review requests
  callShare: 0.65,      // share of local-service leads that arrive as phone calls
}
export const SEO_CURVE = [0.02, 0.06, 0.12, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]

export interface Point360 {
  month: number
  keywords: number; keywordsTyp: number; mapTop3: number
  visitorsPaid: number; visitorsOrganic: number; visitorsTyp: number
  callsAds: number; callsOrganic: number; callsTyp: number
  leads: number; leadsTyp: number; reviews: number; reviewsTyp: number
  revenue: number; revenueTyp: number
}

export function growth360(i: UsInputs, today: Today = TODAY_DEFAULT): Point360[] {
  const g = growth12(i, today)
  const base = { ...i, channel: 'search' as Channel }
  const tCost = channelCost(base)
  const baseOrgLeads = today.visitors * ORG_LEAD_RATE
  return g.map((p, m) => {
    const k = JARZ_RAMP[m]
    const jCpc = channelCost({ ...base, cpc: base.cpc * (1 - (1 - JARZ.cpc) * k) }).cpc
    const s = SEO_CURVE[m]
    const visitorsOrganic = today.visitors * (1 + (G360.organicVisitorsX - 1) * s)
    const orgLeads = visitorsOrganic * ORG_LEAD_RATE
    return {
      month: p.month,
      keywords: today.keywords + G360.keywordsGain * s, keywordsTyp: today.keywords,
      mapTop3: today.mapTop3 + G360.mapTop3Gain * s,
      visitorsPaid: i.budget / jCpc, visitorsOrganic, visitorsTyp: i.budget / tCost.cpc + today.visitors,
      callsAds: p.leadsJarz * G360.callShare, callsOrganic: orgLeads * G360.callShare, callsTyp: (p.leadsTypical + baseOrgLeads) * G360.callShare,
      leads: p.leadsJarz + orgLeads, leadsTyp: p.leadsTypical + baseOrgLeads,
      reviews: today.reviews + G360.reviewsPerMonth * (m + 1), reviewsTyp: today.reviews,
      revenue: p.jarzSeo + baseOrgLeads * (i.close / 100) * i.job, revenueTyp: p.typical + baseOrgLeads * (i.close / 100) * i.job,
    }
  })
}
