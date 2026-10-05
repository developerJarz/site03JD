// US local-business Google Ads benchmarks (researched Oct 2026).
// cpc / ctr / cvr / cpl = published averages; lsa = Google Local Services Ads cost per lead.
// job / close / margin / repeat are business assumptions: sourced where marked in `jobSrc`, otherwise
// typical estimates the user can edit in the calculator ("est").

export type Group = 'home' | 'auto' | 'health' | 'legal' | 'other'

export interface Category {
  id: string
  name: string
  group: Group
  cpc: number          // avg cost per click, $
  ctr: number          // click-through rate, %
  cvr: number          // published click → lead conversion rate, %
  cpl: number          // avg cost per lead, $
  lsa: number | null   // Local Services Ads cost per lead, $ (null = no published figure)
  job: number          // average job / first-sale value, $
  close: number        // % of leads that become paying customers
  margin: number       // gross margin on the job, %
  repeat: number       // extra purchases per customer in the first year
  src: SourceId        // where cpc/ctr/cvr/cpl come from
  jobSrc: string       // where the job value comes from ("est" = estimate)
  note?: string
}

export type SourceId = 'wsAll' | 'liqHome' | 'liqAuto' | 'liqHealth' | 'liqLegal' | 'web'

export const SOURCES: Record<SourceId | 'lsa' | 'jobs' | 'ms' | 'meta' | 'budget' | 'close', string> = {
  wsAll: 'WordStream / LocaliQ, Google Ads Benchmarks 2025 (23 industries)',
  liqHome: 'LocaliQ, 2025 Search Ad Benchmarks for Home Services (16 trades)',
  liqAuto: 'LocaliQ, Automotive Search Advertising Benchmarks (2025 data)',
  liqHealth: 'LocaliQ, Healthcare Search Ads Benchmarks for 16 Specialties (2025 data)',
  liqLegal: 'LocaliQ, Legal Search Advertising Benchmarks (2024 data)',
  web: 'Trade-specific 2026 reports (SmartMoving, VibeAds, Valley Marketing Group, Practice Growth Co, Hook Agency, Danson Solutions); midpoints of published ranges',
  lsa: 'The Media Captain, Local Services Ads cost per lead by trade (Aug 2025); Elevarus & Cube Creative (2026)',
  jobs: 'Home Service Hound, Average Home Service Ticket Prices 2025; Angi cost guides 2026; Delmain dental LTV; Pelora med spa',
  ms: 'Microsoft Ads clicks 20–40% cheaper than Google, with ~20× less search volume (Improvado, Hawky, TrackBee, 2026)',
  meta: 'WordStream Facebook Ads Benchmarks 2025: $27.66 average cost per lead, 7.72% lead conversion rate',
  budget: 'Most local service businesses spend about $1,000–$2,000 a month on Google Ads (getvibeads, 2026)',
  close: 'Home-service phone leads book at roughly 40–50%; in-home sales appointments close at 30–50% (Estatehub, AmpUp 2026)',
}

const c = (id: string, name: string, group: Group, ctr: number, cpc: number, cvr: number, cpl: number, lsa: number | null,
  job: number, close: number, margin: number, repeat: number, src: SourceId, jobSrc = 'est', note?: string): Category =>
  ({ id, name, group, ctr, cpc, cvr, cpl, lsa, job, close, margin, repeat, src, jobSrc, note })

export const CATEGORIES: Category[] = [
  // ---- Home services
  c('hvac', 'HVAC / AC repair & install', 'home', 6.43, 9.68, 6.56, 127.74, 80, 1200, 45, 50, 0.5, 'liqHome', 'Blend of $320–650 repairs and $7,500–14,000 replacements', 'Replacement jobs lift the average; tune-up plans bring repeat visits.'),
  c('heating', 'Heating & furnace', 'home', 5.97, 9.30, 7.48, 129.02, 80, 1100, 45, 50, 0.5, 'liqHome'),
  c('plumbing', 'Plumbing', 'home', 4.97, 10.49, 7.63, 129.02, 69, 585, 50, 50, 0.3, 'liqHome', '$315–856 service ticket'),
  c('electrical', 'Electricians', 'home', 5.15, 12.18, 9.08, 93.69, null, 384, 45, 50, 0.2, 'liqHome', '$348–419 service ticket'),
  c('roofing', 'Roofing & gutters', 'home', 5.66, 10.70, 3.70, 228.15, 162, 9000, 20, 35, 0, 'liqHome', '$7,500–12,000 per job', 'Highest cost per lead, but one job pays for many leads.'),
  c('landscaping', 'Landscaping & lawn care', 'home', 4.69, 8.76, 6.42, 117.92, 39, 565, 35, 45, 2, 'liqHome', '$333–800 per job'),
  c('painting', 'Painting', 'home', 6.29, 13.74, 10.80, 138.38, 40, 3000, 25, 45, 0, 'liqHome'),
  c('cleaning', 'House cleaning / maid', 'home', 9.01, 8.50, 17.65, 46.99, null, 191, 40, 45, 6, 'liqHome', '$173–209 per clean', 'Recurring cleans make each customer worth far more than the first visit.'),
  c('handyman', 'Handyman', 'home', 6.51, 7.10, 13.45, 54.05, 34, 300, 50, 50, 0.5, 'liqHome'),
  c('contractor', 'General contractors & remodeling', 'home', 6.48, 5.31, 2.61, 165.67, null, 25000, 10, 20, 0, 'liqHome'),
  c('windows', 'Doors & windows', 'home', 5.52, 8.76, 4.41, 200.34, null, 5000, 20, 30, 0, 'liqHome'),
  c('pools', 'Pools & spas', 'home', 5.41, 5.81, 10.89, 45.15, null, 400, 40, 45, 3, 'liqHome'),
  c('windowclean', 'Window cleaning', 'home', 10.04, 9.12, 13.58, 66.69, null, 300, 45, 50, 1, 'liqHome'),
  c('pest', 'Pest control', 'home', 5.5, 8.50, 12, 70.83, 50, 225, 60, 55, 3, 'web', '$150–300 per service', 'Quarterly plans: most profit comes from repeat service.'),
  c('tree', 'Tree service', 'home', 5.5, 12, 15, 80, null, 545, 40, 50, 0.2, 'web', '$460–630 per job'),
  c('junkremoval', 'Junk removal', 'home', 6, 9, 12, 75, null, 290, 55, 50, 0.1, 'web', '$230–350 per job'),
  c('pressure', 'Pressure washing', 'home', 6, 12, 12, 100, null, 350, 45, 60, 0.5, 'web'),
  c('carpet', 'Carpet cleaning', 'home', 7, 7, 12, 58.33, null, 200, 50, 55, 0.5, 'web'),
  c('movers', 'Movers / removal company', 'home', 6, 15, 10, 150, null, 1692, 25, 35, 0, 'web', 'Angi: local move $1,692 average', 'SmartMoving (500 movers): $130–183 per Google lead; $40–100 in well-run accounts.'),
  c('locksmith', 'Locksmith', 'home', 6, 16, 25, 64, 34, 180, 60, 60, 0, 'web', 'est', 'Fake-lead and fraud rates can exceed 30% in this trade; call tracking is a must.'),
  c('garagedoor', 'Garage door repair', 'home', 6, 12, 15, 80, 25, 450, 50, 50, 0, 'web', 'Angi: repair $265, replacement $1,231 (blended)'),
  // ---- Automotive
  c('autorepair', 'Auto repair shop', 'auto', 4.41, 6.42, 15.39, 42.10, null, 500, 55, 50, 1, 'liqAuto'),
  c('autobody', 'Auto body & paint', 'auto', 5.73, 7.54, 11.81, 56.26, null, 2500, 35, 45, 0.2, 'liqAuto'),
  c('brakes', 'Brake repair', 'auto', 5.23, 4.90, 13.37, 32.46, null, 400, 60, 50, 0.5, 'liqAuto'),
  c('transmission', 'Transmission repair', 'auto', 5.53, 7.46, 19.23, 34.81, null, 2500, 35, 40, 0, 'liqAuto'),
  c('tires', 'Tires & alignment', 'auto', 6.84, 4.44, 17.87, 28.50, null, 600, 60, 25, 0.5, 'liqAuto'),
  c('autoglass', 'Auto glass repair', 'auto', 6.08, 7.92, 23.10, 33.78, null, 350, 60, 45, 0, 'liqAuto'),
  c('oilchange', 'Oil change & quick lube', 'auto', 6.80, 5.31, 15.44, 34.81, null, 90, 70, 45, 3, 'liqAuto'),
  c('towing', 'Towing', 'auto', 6, 10, 20, 50, null, 150, 70, 55, 0, 'web', 'est', 'Few published benchmarks; values are estimates.'),
  c('junkcar', 'Junk car buyer (cash for cars)', 'auto', 6, 15, 30, 50, null, 700, 50, 40, 0, 'web', 'est', 'Clicks run $10–50; most leads are phone calls, so conversion is high. Job value = resale/scrap value per car.'),
  // ---- Health
  c('dentist', 'Dentist (general)', 'health', 5.06, 7.03, 7.74, 84.77, null, 850, 50, 60, 1, 'liqHealth', 'First-year revenue ~$850 (Hyperleap)', 'A patient is worth $5,500–7,500 over the years they stay (Delmain).'),
  c('emergencydentist', 'Emergency dentist', 'health', 6.40, 7.85, 8.89, 75.19, null, 600, 60, 60, 3, 'liqHealth'),
  c('ortho', 'Orthodontist', 'health', 4.35, 8.76, 14.21, 71.52, null, 5500, 30, 60, 0, 'liqHealth'),
  c('derm', 'Dermatology', 'health', 5.91, 4.90, 25.33, 18.54, null, 250, 60, 60, 2, 'liqHealth'),
  c('physio', 'Physical therapy', 'health', 6.61, 4.95, 15.35, 32.79, null, 1200, 55, 50, 0.3, 'liqHealth'),
  c('chiro', 'Chiropractor', 'health', 6, 6, 12, 50, null, 1000, 50, 60, 0.5, 'web', 'est', 'No published chiropractic benchmark; estimated from medical averages.'),
  c('medspa', 'Med spa / aesthetics', 'health', 6, 18, 25, 72, null, 974, 40, 60, 1.5, 'web', 'Pelora: ~$974 per patient', 'Practice Growth Co: $45–85 per lead, $15–25 per click.'),
  c('plastic', 'Plastic & cosmetic surgery', 'health', 5.81, 5.75, 8.52, 102.51, null, 6000, 15, 60, 0.2, 'liqHealth'),
  c('hearing', 'Hearing aids & care', 'health', 5.00, 8.00, 5.62, 96.54, null, 4500, 35, 50, 0, 'liqHealth'),
  c('vet', 'Veterinarian / pet services', 'health', 6.58, 3.97, 13.07, 31.82, null, 300, 60, 55, 2, 'wsAll'),
  // ---- Legal
  c('pi', 'Personal injury lawyer', 'legal', 4.56, 9.30, 5.45, 159.17, 249, 15000, 10, 70, 0, 'liqLegal', 'est', 'Search clicks for top injury terms can cost far more in big cities.'),
  c('criminal', 'Criminal defense lawyer', 'legal', 4.51, 12.30, 9.90, 101.49, null, 5000, 20, 70, 0, 'liqLegal'),
  c('family', 'Family / divorce lawyer', 'legal', 4.70, 7.69, 8.52, 103.54, null, 6000, 20, 70, 0, 'liqLegal'),
  c('bankruptcy', 'Bankruptcy lawyer', 'legal', 6.23, 11.70, 13.56, 82.27, null, 1800, 30, 70, 0, 'liqLegal'),
  c('estate', 'Estate & probate lawyer', 'legal', 5.17, 7.92, 9.65, 72.24, 45, 2500, 30, 70, 0, 'liqLegal'),
  // ---- Other local
  c('restaurant', 'Restaurant & food', 'other', 7.58, 2.05, 7.09, 30.27, null, 45, 70, 30, 4, 'wsAll', 'est', 'A "lead" here is an order, booking, call or directions request.'),
  c('salon', 'Salon, barber & beauty', 'other', 5.71, 5.70, 7.82, 60.34, null, 90, 60, 55, 6, 'wsAll'),
  c('gym', 'Gym & fitness studio', 'other', 7.18, 5.00, 6.80, 62.80, null, 600, 35, 60, 0, 'wsAll'),
  c('realestate', 'Real estate agent', 'other', 8.43, 2.53, 3.28, 100.48, null, 9000, 3, 60, 0, 'wsAll'),
  c('insurance', 'Insurance agency', 'other', 8.33, 3.46, 2.55, 83.93, null, 1200, 20, 80, 2, 'wsAll'),
  c('accounting', 'Accountant / business services', 'other', 5.65, 5.58, 5.14, 103.54, null, 1500, 25, 60, 1, 'wsAll'),
  c('education', 'Tutoring / driving school', 'other', 5.74, 6.23, 11.38, 90.02, null, 800, 35, 50, 0, 'wsAll'),
  c('events', 'Photographer / events / personal services', 'other', 7.69, 5.81, 9.74, 53.52, null, 1500, 25, 50, 0, 'wsAll'),
  c('storage', 'Self storage', 'other', 8.32, 7.46, 4.65, 120.30, null, 1500, 50, 60, 0, 'liqHome'),
  c('furniture', 'Furniture store', 'other', 6.11, 3.86, 2.73, 121.51, null, 1500, 25, 40, 0, 'wsAll'),
]

export const GROUPS: Record<Group, string> = { home: 'Home services', auto: 'Automotive', health: 'Health & wellness', legal: 'Legal', other: 'Other local businesses' }

export const ALL_INDUSTRY = { cpc: 5.26, ctr: 6.66, cvr: 7.52, cpl: 70.11 } // WordStream 2025, all industries
