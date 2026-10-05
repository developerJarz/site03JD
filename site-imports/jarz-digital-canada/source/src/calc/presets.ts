import type { Inputs } from './model'

// Typical starting values for Bangladeshi online businesses (estimates based on 2025–26 Facebook ad
// cost reports: CPC Tk 5–20, CPM Tk 30–230). Every value can be changed in the calculator.
export type PresetId = 'food' | 'beauty' | 'fashion' | 'gadgets' | 'home' | 'services' | 'custom'

type P = Pick<Inputs, 'aov' | 'margin' | 'cpm' | 'ctr' | 'cvr' | 'returnRate' | 'repeatShare' | 'repeatOrders'>

export const PRESETS: Record<Exclude<PresetId, 'custom'>, P> = {
  food:     { aov: 600,  margin: 35, cpm: 120, ctr: 1.8, cvr: 3.5, returnRate: 3, repeatShare: 50, repeatOrders: 2 },
  beauty:   { aov: 1200, margin: 45, cpm: 140, ctr: 1.6, cvr: 3.0, returnRate: 5, repeatShare: 45, repeatOrders: 1.5 },
  fashion:  { aov: 1800, margin: 50, cpm: 150, ctr: 1.5, cvr: 2.2, returnRate: 8, repeatShare: 35, repeatOrders: 1 },
  gadgets:  { aov: 4500, margin: 25, cpm: 170, ctr: 1.3, cvr: 1.2, returnRate: 5, repeatShare: 20, repeatOrders: 0.5 },
  home:     { aov: 9000, margin: 35, cpm: 160, ctr: 1.2, cvr: 0.7, returnRate: 4, repeatShare: 15, repeatOrders: 0.4 },
  services: { aov: 2500, margin: 60, cpm: 150, ctr: 1.4, cvr: 2.0, returnRate: 0, repeatShare: 40, repeatOrders: 1.5 },
}

export const DEFAULT_INPUTS: Inputs = {
  budgetUsd: 300, fx: 122.68, ...PRESETS.fashion, returnCost: 120, deliveryCost: 0, paymentFee: 0,
  seoOn: false, seoVisitors: 3000, agencyFee: 0, autoScale: true, scalePct: 20,
}
