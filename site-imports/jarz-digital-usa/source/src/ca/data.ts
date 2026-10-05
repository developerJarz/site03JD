// Canadian local-business Google Ads planning data, in Canadian dollars (CAD). Researched October 2026.
//
// Cost per click (CAD) is set per category from Canadian sources, not converted from US prices:
//   · Consultus Digital, "How Much Do Google Ads Cost in Canada? 2026 Guide" (Sep 2026): national account ranges
//     (home services $4–12, healthcare/dental $3–10, cosmetic $5–15, legal $8–30+, insurance/financial $6–20,
//     real estate $3–8, B2B $4–10, education $2–5, retail $0.50–3, restaurants $0.50–2); worked GTA example $9 CPC, 8% CVR.
//   · Hetman, "Alberta industry benchmarks for 2026": legal $9–15, home services/renovation $5.50–9.50,
//     logistics $4–7.50, healthcare/dentistry $3.50–6.50.
//   · Brand Butter, "Google Ads in Canada 2026" (Apr 2026): legal $8–45+, insurance $15–50+, home services $6–25,
//     dental $4–18, real estate $3–12, professional services $5–22, restaurants $1–6; Canadian CPCs run 8–22% above
//     comparable US keywords.
//   · SearchPod (Mar 2026): Canadian home services average about $8.70 per click.
//   · Head-term prices used for the city factors below: Creative Scope, Toronto 2026 (home services $15–30, legal $40–120,
//     dental/med spa $8–25, mortgage $25–60, real estate $5–18, restaurants $2–6); ScopeX Media, Calgary 2026 (plumbing
//     $15–45, HVAC $15–50, roofing $15–40, electrical $10–30, dental $8–25, cleaning $5–15, renovation $10–35);
//     CiCon Marketing ("dentist near me" ≈ $14.60).
// Local Services Ads cost per lead (CAD): Creative Scope Toronto 2026 — electrical ~$39, HVAC ~$51, plumbing ~$57,
//   cross-trade average ~$53. Trades without a published Canadian figure use the US figure × 0.72 (the average
//   Canada/US ratio of the measured trades).
// Conversion rates are the published category rates (WordStream / LocaliQ 2025); cost per lead = CPC ÷ conversion rate.
// Job values are Canadian prices where published (furnace $3,500–7,000 installed in Toronto; roof replacement $9,000–15,000;
//   Toronto plumbers $200–300/hour; Ontario AZ truck course $7,000–10,000), otherwise editable estimates.
import { CATEGORIES, type Category, type Group } from '../us/data'

type Row = [cpc: number, job: number, lsa: number | null, note?: string]

// id → [CAD cost per click (national account average), CAD job value, CAD Local Services Ads cost per lead, note]
const CA: Record<string, Row> = {
  // Home services: national average ≈ $8.70 (SearchPod); Alberta $5.50–9.50 (Hetman); head terms $15–50 in Toronto and Calgary.
  hvac: [9.2, 1600, 51, 'Furnace replacements in Toronto run $3,500–7,000 installed; LSA leads about $51 (Creative Scope 2026).'],
  heating: [9.0, 1500, 51, 'Cold snaps push Toronto and Calgary furnace-repair clicks to the top of their range.'],
  plumbing: [9.5, 650, 57, 'Toronto plumbers charge $200–300 an hour; LSA leads about $57, drain and sewer about $59.'],
  electrical: [7.5, 500, 39, 'Electrical has the cheapest LSA leads in Toronto (about $39); panel upgrades and EV chargers lift the job value.'],
  roofing: [8.5, 12000, 117, 'Toronto roof replacements average $9,000–15,000; Calgary hail season drives summer spikes.'],
  landscaping: [5.5, 700, 28],
  painting: [7.5, 3800, 29],
  cleaning: [5.0, 220, null, 'Calgary cleaning clicks run $5–15 on head terms, one of the cheapest home services.'],
  handyman: [5.0, 380, 25],
  contractor: [8.0, 32000, null, 'Kitchen and bathroom renovation keywords are the most competitive renovation terms in Calgary ($10–35).'],
  windows: [7.0, 6500, null],
  pools: [5.0, 520, null],
  windowclean: [5.0, 380, null],
  pest: [6.5, 290, 36, 'Quarterly plans: most profit comes from repeat service.'],
  tree: [6.5, 700, null],
  junkremoval: [5.5, 380, null],
  pressure: [5.5, 450, null],
  carpet: [4.5, 260, null],
  movers: [8.0, 2000, null, 'Toronto-to-Calgary and other long-distance moves are worth several local moves; run them as separate campaigns.'],
  locksmith: [8.0, 230, 25, 'Fake-lead rates are high in this trade; call tracking is essential.'],
  garagedoor: [7.0, 580, 18],
  // Automotive: no published Canadian range; US category prices × 0.9 (the Canada/US ratio measured for home services).
  autorepair: [5.8, 650, null],
  autobody: [6.8, 3250, null],
  brakes: [4.4, 520, null],
  transmission: [6.7, 3250, null],
  tires: [4.0, 780, null, 'Seasonal tire changeovers in spring and fall bring two demand peaks a year across Canada.'],
  autoglass: [7.1, 455, null],
  oilchange: [4.8, 115, null],
  towing: [9.0, 195, null],
  junkcar: [9.0, 600, null, 'Most leads are phone calls; job value = resale or scrap value per vehicle.'],
  // Health: Canada $3–10 (Consultus), Alberta dental $3.50–6.50 (Hetman), "dentist near me" ≈ $14.60 head term (CiCon).
  dentist: [6.5, 1100, null, 'A new patient is worth several thousand dollars over the years they stay.'],
  emergencydentist: [7.5, 780, null],
  ortho: [7.5, 7000, null],
  derm: [4.5, 325, null],
  physio: [4.5, 1000, null, 'Extended health benefits cover most physiotherapy visits, so patients complete full treatment plans.'],
  chiro: [5.0, 900, null],
  medspa: [9.0, 1250, null, 'Cosmetic clicks run $5–15 nationally and $8–25 in Toronto.'],
  plastic: [9.5, 7800, null],
  hearing: [6.0, 5000, null],
  vet: [3.5, 390, null],
  // Legal: Canada $8–30+ (Consultus), Alberta $9–15 (Hetman); Toronto personal injury head terms $80–150.
  pi: [22, 25000, 180, 'Head terms such as "personal injury lawyer Toronto" cost $80–150 a click; long-tail and city terms bring the account average down.'],
  criminal: [14, 6500, null],
  family: [11, 7800, null],
  bankruptcy: [12, 2000, null, 'In Canada, bankruptcy and consumer proposals are handled by Licensed Insolvency Trustees.'],
  estate: [9, 3250, 32],
  // Other local businesses.
  restaurant: [1.5, 55, null, 'A "lead" here is an order, booking, call or directions request. Restaurant clicks are among the cheapest in Canada.'],
  salon: [3.0, 115, null],
  gym: [3.5, 780, null],
  realestate: [5.0, 15000, null, 'Toronto real estate clicks run $5–18; job value = average agent commission after brokerage split.'],
  insurance: [12, 1550, null],
  accounting: [7.0, 1950, null],
  education: [3.5, 1050, null],
  events: [3.5, 1950, null],
  storage: [4.5, 1950, null],
  furniture: [1.8, 1950, null],
}

const r2 = (n: number) => Math.round(n * 100) / 100

const NAME: Record<string, string> = { criminal: 'Criminal defence lawyer', bankruptcy: 'Insolvency trustee / bankruptcy', vet: 'Veterinarian / pet services', realestate: 'Real estate agent / REALTOR®' }

const fromUs = (c: Category): Category => {
  const [cpc, job, lsa, note] = CA[c.id]
  return { ...c, name: NAME[c.id] ?? c.name, cpc, cpl: r2(cpc / (c.cvr / 100)), job, lsa, jobSrc: 'est', src: 'web', note: note ?? undefined }
}

const ca = (id: string, name: string, group: Group, cpc: number, cvr: number, job: number, close: number, margin: number, repeat: number, note: string): Category =>
  ({ id, name, group, cpc, ctr: 6, cvr, cpl: r2(cpc / (cvr / 100)), lsa: null, job, close, margin, repeat, src: 'web', jobSrc: 'est', note })

// Categories that matter in Canadian cities but have no US benchmark row.
const CANADA_ONLY: Category[] = [
  ca('snow', 'Snow removal & ice control', 'home', 4.5, 12, 900, 45, 50, 0, 'Seasonal contracts in Calgary, Edmonton and the GTA; one contract covers the whole winter.'),
  ca('basement', 'Basement finishing & legal suites', 'home', 8.0, 4, 45000, 10, 25, 0, 'Basement finishing and legal secondary suites in Calgary and the GTA commonly run $35,000–60,000.'),
  ca('immigration', 'Immigration consultant (RCIC) / lawyer', 'legal', 9.0, 7, 3000, 25, 70, 0.2, 'Very competitive in Brampton and Mississauga; Punjabi, Hindi and Urdu campaigns can lower the cost per lead.'),
  ca('rmt', 'Registered massage therapy (RMT)', 'health', 3.5, 12, 120, 60, 60, 5, 'Insurance coverage brings clients back several times a year, so repeat visits carry most of the profit.'),
  ca('truckschool', 'Truck driving school (AZ / Class 1)', 'other', 4.5, 9, 8000, 20, 40, 0, 'Ontario AZ courses (MELT) typically cost $7,000–10,000; Alberta Class 1 MELT is similar. Logistics clicks in Alberta run $4–7.50.'),
  ca('mortgage', 'Mortgage broker', 'other', 11, 4, 3500, 15, 80, 0, 'Toronto mortgage head terms run $25–60 a click; job value = broker commission per funded mortgage.'),
]

export const CA_CATEGORIES: Category[] = [...CATEGORIES.map(fromUs), ...CANADA_ONLY]

/** City cost factors applied to clicks and leads. Toronto and Vancouver run the hottest auctions, Calgary behind them, and
 *  GTA home-services clicks can cost two to three times a mid-sized Ontario city (Consultus 2026). Toronto proper costs
 *  more than suburban GTA (Creative Scope 2026). */
export const CA_CITY_FACTOR: Record<string, number> = { toronto: 1.35, mississauga: 1.25, brampton: 1.2, calgary: 1.15, alberta: 1 }

export const CA_SOURCES = [
  'Consultus Digital, How Much Do Google Ads Cost in Canada? 2026 Guide (Sep 2026)',
  'Hetman, Alberta Google Ads industry benchmarks for 2026',
  'Brand Butter, Google Ads in Canada 2026 (Apr 2026)',
  'Creative Scope, Google Ads cost in Toronto 2026 and Local Services Ads Toronto 2026 playbook (Aug 2026)',
  'ScopeX Media, Google Ads cost for Calgary service businesses 2026 (Mar 2026)',
  'WordStream / LocaliQ Google Ads Benchmarks 2025 (category conversion rates)',
]
