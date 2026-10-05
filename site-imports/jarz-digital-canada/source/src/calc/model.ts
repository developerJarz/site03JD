// Ads profit engine for Bangladeshi businesses. Pure functions: same inputs → same exact numbers.
// All money is in Bangladeshi Taka (Tk) unless a name ends in Usd.

export interface Inputs {
  budgetUsd: number        // monthly ad budget, minimum $50
  fx: number               // Tk per US$
  aov: number              // average order value, Tk
  margin: number           // gross margin on product, % of price (price − product cost)
  cpm: number              // cost per 1,000 ad views, Tk
  ctr: number              // click-through rate, %
  cvr: number              // visitor → order conversion rate, %
  returnRate: number       // cash-on-delivery orders refused / returned, %
  returnCost: number       // Tk lost per returned order (two-way delivery)
  deliveryCost: number     // Tk you pay per delivered order (0 if the customer pays)
  paymentFee: number       // payment / gateway fee, % of sales
  repeatShare: number      // % of new customers who buy again
  repeatOrders: number     // extra orders per returning customer
  seoOn: boolean           // include organic (SEO) visitors
  seoVisitors: number      // organic visitors per month once SEO is mature (Month 6)
  agencyFee: number        // monthly service fee, Tk (0 = leave out)
  autoScale: boolean       // raise budget when ads are clearly profitable
  scalePct: number         // budget increase per month when scaling, %
}

export interface Month {
  month: number
  budgetUsd: number
  spend: number
  cpm: number
  impressions: number
  clicks: number
  cpc: number
  cvr: number
  adOrders: number
  seoVisitors: number
  seoOrders: number
  repeatOrders: number
  orders: number           // all orders placed
  returned: number
  delivered: number
  revenue: number          // delivered sales
  adRevenue: number        // delivered sales from first-time ad buyers
  repeatRevenue: number
  seoRevenue: number
  productCost: number
  fees: number
  delivery: number
  returnLoss: number
  profitBeforeFee: number  // after ad spend, before agency fee
  netProfit: number        // after agency fee
  cpa: number              // ad spend per new ad order
  roas: number             // first-order ad sales ÷ ad spend
  mer: number              // all sales ÷ ad spend
  roi: number              // net profit ÷ (ad spend + fee), %
}

export const LEARNING_EVENTS_PER_WEEK = 50   // Meta: ~50 optimisation events in 7 days to exit the learning phase
const RAMP = [0.7, 0.85, 1, 1.05, 1.1, 1.15]   // conversion rate vs your input as ads learn and we optimise
const SEO_RAMP = [0.1, 0.25, 0.45, 0.65, 0.85, 1] // share of mature organic traffic reached each month
const REPEAT_WINDOW = 3                          // returning customers spread their extra orders over 3 months
const SCALE_TRIGGER = 1.2                        // scale only when ROAS ≥ 1.2 × break-even ROAS
const SCALE_CAP = 4                              // never more than 4× the starting budget

/** Ad costs rise when a budget outgrows its audience: +10% CPM per doubling above $500. */
export function effectiveCpm(cpm: number, budgetUsd: number): number {
  return cpm * (1 + 0.1 * Math.max(0, Math.log2(budgetUsd / 500)))
}

/** Profit from one first-time order after product cost, fees, delivery and the expected loss on returns. */
export function contributionPerOrder(i: Inputs): number {
  const r = i.returnRate / 100
  const keep = i.aov * (i.margin / 100 - i.paymentFee / 100) - i.deliveryCost
  return (1 - r) * keep - r * i.returnCost
}

/** Lifetime value: first order plus the repeat orders it brings (no ad cost on repeats). */
export function lifetimeValue(i: Inputs): number {
  return contributionPerOrder(i) * (1 + (i.repeatShare / 100) * i.repeatOrders)
}

export function breakEven(i: Inputs) {
  const c = contributionPerOrder(i)
  const cpa = Math.max(0, c)                        // most you can pay for a first order
  const roas = c > 0 ? i.aov / c : Infinity          // ad return needed on first orders
  const cpaLtv = Math.max(0, lifetimeValue(i))      // most you can pay counting repeat orders
  return { cpa, roas, cpaLtv }
}

function monthCore(i: Inputs, month: number, budgetUsd: number, cvrFactor: number, seoShare: number, repeatOrders: number): Month {
  const spend = budgetUsd * i.fx
  const cpm = effectiveCpm(i.cpm, budgetUsd)
  const impressions = (spend / cpm) * 1000
  const clicks = impressions * (i.ctr / 100)
  const cvr = (i.cvr / 100) * cvrFactor
  const adOrders = clicks * cvr
  const seoVisitors = i.seoOn ? i.seoVisitors * seoShare : 0
  const seoOrders = seoVisitors * cvr
  const orders = adOrders + seoOrders + repeatOrders
  const r = i.returnRate / 100
  const returned = orders * r
  const delivered = orders - returned
  const revenue = delivered * i.aov
  const productCost = revenue * (1 - i.margin / 100)
  const fees = revenue * (i.paymentFee / 100)
  const delivery = delivered * i.deliveryCost
  const returnLoss = returned * i.returnCost
  const profitBeforeFee = revenue - productCost - fees - delivery - returnLoss - spend
  const netProfit = profitBeforeFee - i.agencyFee
  const adRevenue = adOrders * (1 - r) * i.aov
  return {
    month, budgetUsd, spend, cpm, impressions, clicks, cpc: clicks ? spend / clicks : 0, cvr: cvr * 100,
    adOrders, seoVisitors, seoOrders, repeatOrders, orders, returned, delivered, revenue, adRevenue,
    repeatRevenue: repeatOrders * (1 - r) * i.aov, seoRevenue: seoOrders * (1 - r) * i.aov,
    productCost, fees, delivery, returnLoss, profitBeforeFee, netProfit,
    cpa: adOrders ? spend / adOrders : 0, roas: spend ? adRevenue / spend : 0, mer: spend ? revenue / spend : 0,
    roi: spend + i.agencyFee ? (netProfit / (spend + i.agencyFee)) * 100 : 0,
  }
}

/** One typical month once ads are optimised and returning customers are coming back (steady state). */
export function steadyMonth(i: Inputs, budgetUsd = i.budgetUsd): Month {
  const base = monthCore(i, 0, budgetUsd, 1, 1, 0)
  const newOrders = base.adOrders + base.seoOrders
  return monthCore(i, 0, budgetUsd, 1, 1, newOrders * (i.repeatShare / 100) * i.repeatOrders)
}

/** Six-month forecast: ads learn, SEO grows, repeat buyers return, budget scales only when profitable. */
export function forecast(i: Inputs): Month[] {
  const out: Month[] = []
  const newByMonth: number[] = []
  const be = breakEven(i)
  let budget = i.budgetUsd
  for (let m = 0; m < 6; m++) {
    let repeat = 0
    for (let k = Math.max(0, m - REPEAT_WINDOW); k < m; k++) repeat += (newByMonth[k] * (i.repeatShare / 100) * i.repeatOrders) / REPEAT_WINDOW
    const row = monthCore(i, m + 1, budget, RAMP[m], SEO_RAMP[m], repeat)
    out.push(row)
    newByMonth.push(row.adOrders + row.seoOrders)
    if (i.autoScale && row.roas >= be.roas * SCALE_TRIGGER) budget = Math.min(budget * (1 + i.scalePct / 100), i.budgetUsd * SCALE_CAP)
  }
  return out
}

export function totals(rows: Month[]) {
  const sum = (k: keyof Month) => rows.reduce((a, r) => a + (r[k] as number), 0)
  let cum = 0
  let payback: number | null = null
  const cumulative = rows.map((r) => { cum += r.netProfit; if (payback === null && cum > 0) payback = r.month; return cum })
  return { spend: sum('spend'), revenue: sum('revenue'), orders: sum('orders'), repeatRevenue: sum('repeatRevenue'), netProfit: sum('netProfit'), cumulative, payback }
}

/** Ad budget needed to cover a fixed monthly fee at steady state, or null if each sale loses money. */
export function budgetToCoverFee(i: Inputs): number | null {
  const probe = steadyMonth({ ...i, agencyFee: 0 }, 100)
  const perUsd = probe.profitBeforeFee / 100
  if (perUsd <= 0) return null
  return i.agencyFee / perUsd
}

/** Conversion rate (%) at which first orders exactly pay for their ads. */
export function breakEvenCvr(i: Inputs): number | null {
  const c = contributionPerOrder(i)
  if (c <= 0) return null
  const cpc = effectiveCpm(i.cpm, i.budgetUsd) / (10 * i.ctr)
  return (cpc / c) * 100
}

export const BUDGET_STEPS = [50, 100, 200, 300, 500, 1000, 2000]
