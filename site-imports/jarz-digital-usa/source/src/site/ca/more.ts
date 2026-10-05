// Canada site: about, service details, standards, process, case studies, glossary, pricing, audit and who we serve.
import { SERVICE_DETAILS, type ServiceDetail } from '../more'
import type { CityWords } from '../sitedata'

// Canadian spelling for the shared service steps.
const ca = (s: string) => s
  .replace(/\bneighborhood/g, 'neighbourhood').replace(/\bNeighborhood/g, 'Neighbourhood')
  .replace(/\bcenter\b/g, 'centre').replace(/\bcolor/g, 'colour').replace(/\bfavor/g, 'favour')
  .replace(/\bdefense\b/g, 'defence').replace(/\bcatalog\b/g, 'catalogue')

export function about(c?: CityWords) {
  return {
    title: c ? `About Jarz Digital and our work in ${c.name}` : 'About Jarz Digital in Canada',
    paras: [
      'Jarz Digital is a digital growth agency with its Canadian team based in Calgary, Alberta. We help Canadian local and service businesses attract customers through local SEO, Google Ads and Local Services Ads, AI search optimization, AI receptionists and agents, business automation, website and web application development, social media and branding.',
      'The company is led by Roknuzzaman Jony, a computer engineer and local SEO specialist with more than ten years of hands-on experience in search marketing. That engineering background shapes everything we do: decisions are based on data, websites are built to technical and accessibility standards, and every campaign is tracked from the first click to the final sale.',
      `Our team has built more than 500 websites and served more than 500 clients. Canadian clients range from a GTA auto repair shop that appears first in its local map results to a Calgary beauty and spa business listed first beneath the only paid ad${c ? `, and we bring the same methods to businesses in ${c.name}` : ''}.`,
      'Because local SEO specialists, paid search managers, AI engineers, developers and designers work in one company, we can build a complete growth system rather than a single campaign, and we take responsibility for the results it produces.',
    ],
    values: [
      ['Honesty', 'Realistic forecasts in Canadian dollars, clear explanations and a straight answer when something is not working.'],
      ['Accountability', 'Every report shows leads, customers and revenue, so our work is judged on outcomes, not activity.'],
      ['Craft', 'Websites, content and campaigns built by hand to a professional standard, never from shortcuts.'],
      ['Partnership', 'We work as an extension of your team, with direct access to the specialists doing the work.'],
    ] as [string, string][],
  }
}

const EXTRA_STEP: Record<string, string> = {
  'local-seo': 'Canadian citation building on Yelp.ca, YellowPages.ca, Canada411, Bing Places and industry associations.',
  'google-ads': 'Local Services Ads verification support: business registration, provincial licence, insurance certificate and background checks.',
  'web-design': 'Accessibility checks against WCAG 2.1 AA, which supports AODA compliance for Ontario organizations.',
  automation: 'Consent capture and unsubscribe handling for CASL-compliant email and text messages.',
  'ai-agents': 'Language set-up for English, French and the other languages your customers speak.',
}

export const DETAILS: ServiceDetail[] = SERVICE_DETAILS.map((d) => ({
  ...d,
  who: ca(d.who),
  how: [...d.how.map(ca), ...(EXTRA_STEP[d.id] ? [EXTRA_STEP[d.id]] : [])],
  deliver: ca(d.deliver).replace(/\brevenue\b/, 'revenue in CAD'),
}))

export const QUALITY: [string, string][] = [
  ['Fast, accessible websites', 'Every site is built to pass Core Web Vitals and checked against WCAG 2.1 AA accessibility guidelines, which supports AODA compliance for Ontario organizations.'],
  ['White-hat SEO only', 'We follow Google Search guidelines. No purchased link schemes, hidden text or tactics that could lead to penalties.'],
  ['Privacy by design', 'Forms, AI agents and automations collect only what you need, with clear consent and secure storage, in line with PIPEDA and Alberta\'s PIPA.'],
  ['CASL-compliant messaging', 'Email and text follow-ups record consent and include working unsubscribe options, as Canada\'s Anti-Spam Legislation requires.'],
  ['Accurate tracking', 'Calls, forms and bookings are tracked with call tracking, Google Analytics 4 and Google Ads conversions, and checked every month.'],
  ['Regulated-industry care', 'For clinics, law firms and immigration consultants, ads and pages are written to respect regulatory college and Law Society advertising rules.'],
  ['Responsible AI', 'AI agents follow the rules you approve, hand urgent or sensitive conversations to your team and never invent prices or promises.'],
  ['Clear, honest reporting', 'Reports explain what changed, why it matters and what happens next, in plain language and Canadian dollars.'],
]

export const PROCESS: [string, string][] = [
  ['Free audit', 'We review your Google Business Profile, website, ads, reviews, Canadian citations, competitors and AI visibility, and find the fastest opportunities for growth.'],
  ['Growth plan and fixed price', 'You receive a clear plan with priorities, timelines, a fixed monthly price in CAD and the results we expect, based on Canadian benchmarks for your city and industry.'],
  ['Onboarding and setup', 'We secure access, install tracking, fix urgent website and profile issues, start Local Services Ads verification where eligible and launch the first campaigns within two to four weeks.'],
  ['Launch and early results', 'Ads begin producing calls, the AI agent starts answering enquiries and local SEO work begins moving your map rankings.'],
  ['Monthly optimization', 'Each month we refine keywords, content, landing pages, budgets and automations based on what brings paying customers.'],
  ['Scale', 'Once the system is profitable, we expand into new services, neighbourhoods, towns or locations and move budget to the channels that perform best.'],
]

export const CASES = [
  { h: 'Auto repair shop, Richmond Hill, Ontario', p: 'The shop competes on one of the GTA\'s busiest corridors. Through Google Business Profile optimization, review growth and local SEO, it now appears first in the Google map results for "auto repair in richmond hill", rated 5.0 from 492 reviews, ahead of competitors with up to 978 reviews.' },
  { h: 'Beauty and spa business, Calgary, Alberta', p: 'A small Calgary beauty salon offering threading, waxing, hydrafacials and laser hair removal. It now appears as the first business listing for "beauty & spa in calgary", directly beneath the only sponsored ad, with a 4.9 rating from 90 reviews.' },
  { h: 'Massage and physiotherapy clinic, Richmond Hill, Ontario', p: 'A multi-disciplinary clinic offering RMT, chiropractic and physiotherapy. Its website appears as the top result with full sitelinks, and its Google profile carries a 4.6 rating from 442 reviews with online booking.' },
  { h: '1,845 calls in one month from Google', p: 'For one client, the Google Business Profile produced 1,845 phone calls in June 2026 alone, with daily peaks above 250 calls, showing how much demand a well-optimized profile can capture.' },
  { h: 'Online store: $122,458 in eight months', p: 'An e-commerce delivery store we work with reached $122,458 in gross sales, $116,728 in net sales and 1,859 orders between July and February, with zero refunds.' },
  { h: 'Online store launch: $85,396 in sales', p: 'After launching in July, an online store we support recorded $85,396 in total sales, 1,285 orders and 2,257 products sold, with daily orders climbing steadily through the autumn.' },
]

export const GLOSSARY: [string, string][] = [
  ['Local SEO', 'Optimizing your Google Business Profile, website and listings so your business appears in local and "near me" searches and in the Google map results.'],
  ['Google Business Profile', 'The free business listing in Google Search and Maps that shows your services, reviews, hours, photos and contact details.'],
  ['Map pack', 'The group of three businesses shown with a map at the top of many local Google searches.'],
  ['Local Services Ads', 'Google ads for service businesses that charge per lead rather than per click and appear at the very top of results. Available in Canada for trades and some professional services.'],
  ['Google Verified', 'The checkmark shown on Local Services Ads since October 2025, after Google checks a business\'s registration, licence, insurance and background.'],
  ['AI SEO / GEO', 'AI search optimization, also called generative engine optimization: making your business visible and recommended in ChatGPT, Claude, Gemini and Google AI Overviews.'],
  ['AI Overviews', 'AI-generated summaries that Google shows at the top of some search results.'],
  ['AI receptionist', 'An AI voice agent that answers calls, provides information and books appointments for a business.'],
  ['CPC (cost per click)', 'The amount you pay each time someone clicks your ad, shown in Canadian dollars on this page.'],
  ['CPL (cost per lead)', 'The average ad cost of receiving one call, form or booking.'],
  ['ROAS (return on ad spend)', 'Revenue generated for every dollar spent on advertising.'],
  ['Citations', 'Mentions of your business name, address and phone number on directories such as Yelp.ca, YellowPages.ca and Canada411.'],
  ['CASL', 'Canada\'s Anti-Spam Legislation, which requires consent and an unsubscribe option for commercial emails and text messages.'],
  ['PIPEDA and PIPA', 'Canada\'s federal private-sector privacy law and Alberta\'s Personal Information Protection Act, which govern how businesses collect and store customer information.'],
  ['AODA', 'The Accessibility for Ontarians with Disabilities Act, which sets website accessibility requirements for many Ontario organizations.'],
  ['Structured data (schema)', 'Code that tells search engines and AI systems exactly what a business offers, where it operates and how customers rate it.'],
]

export const PRICING = {
  title: 'How our pricing works',
  intro: 'Every business has different goals, competition and starting points, so we do not sell fixed packages that ignore those differences. You receive a clear fixed monthly price in Canadian dollars after a free audit, before any work begins.',
  blocks: [
    ['What affects the price', 'The services you need, how competitive your industry and city are, how many locations or towns you serve and the current condition of your website and Google profile.'],
    ['Ad spend is separate', 'Money spent on Google Ads, Local Services Ads or social ads is paid directly to the platform. Most Canadian local businesses invest $1,000 to $5,000 a month; the calculator on this page estimates what different budgets can return.'],
    ['No long-term lock-in', 'We earn your business month by month. Terms are agreed in writing after the audit, so you always know what is included.'],
    ['Value you can measure', 'Because every lead and customer is tracked, you can compare what you invest with the revenue it produces and decide with confidence.'],
  ] as [string, string][],
}

export const AUDIT = {
  title: 'What the free growth audit includes',
  items: [
    'Where you rank today on Google Maps and in Google Search for your most valuable keywords in your city',
    'How ChatGPT, Gemini and Google AI Overviews currently describe and recommend your business',
    'A review of your Google Business Profile, reviews and Canadian directory listings',
    'Whether your trade qualifies for Local Services Ads and what verification you need',
    'Website speed, mobile experience, accessibility and conversion points',
    'A review of current Google Ads campaigns, including wasted spend in CAD',
    'How quickly your calls and online enquiries are answered',
    'A prioritized growth plan with expected results and a fixed monthly price',
  ],
}

export const NATIONWIDE = 'Beyond our focus cities, we support local and service businesses across Canada, including Ottawa, Hamilton, London, Kitchener–Waterloo, Vancouver, Winnipeg, Saskatoon, Regina, Halifax and communities throughout Ontario and Alberta. All work is delivered remotely with scheduled video calls, shared dashboards and clear monthly reporting, so your location never limits the quality of service you receive.'

export const WHO: [string, string][] = [
  ['Home service companies', 'HVAC and furnace, plumbing and drains, roofing and eavestroughs, electrical, renovation and basements, landscaping, snow removal, cleaning and moving companies that depend on phone calls and booked jobs. We focus on Local Services Ads, map rankings, emergency coverage and AI call answering.'],
  ['Healthcare and wellness clinics', 'Dentists, physiotherapists, RMTs, chiropractors, med spas and veterinary clinics. We build trust through reviews, practitioner profiles and treatment pages, and keep schedules full with online booking, direct-billing information and automated reminders.'],
  ['Law firms and immigration professionals', 'Personal injury, family, real estate and criminal defence lawyers, plus regulated immigration consultants. We combine practice-area SEO, compliant advertising and fast intake so serious enquiries become signed clients.'],
  ['Automotive businesses', 'Auto repair, body and collision, tire, glass and towing companies. We target service-specific searches, seasonal tire changeovers and hail damage, and use reviews and fast quotes to win the job.'],
  ['Restaurants and hospitality', 'Restaurants, cafés, caterers and event venues. We optimize Google profiles, menus and photos, and run local campaigns for orders, reservations and events.'],
  ['Driving schools and logistics', 'Truck driving schools, freight, warehousing and fleet services. We separate student, job-seeker and customer audiences so every campaign reaches the right people.'],
  ['Real estate and financial services', 'Realtors, mortgage brokers, insurance brokers and accountants. We build neighbourhood guides, pre-approval and quote funnels, and long-term follow-up automation.'],
  ['Multi-location and franchise businesses', 'Companies with several branches across a province or the country. We manage location pages, multiple Google profiles and reporting by branch.'],
]
