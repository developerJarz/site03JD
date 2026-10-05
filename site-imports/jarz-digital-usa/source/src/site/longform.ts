// Long-form content for the homepage and city pages (research Oct 2026). Formal, plain English.
// High-CPC topics (legal, roofing, HVAC, plumbing, painting) and low-CPC topics (restaurants, tires, vets, cleaning) are both covered.
import type { Faq } from './content'

export interface Block { h: string; p: string }
export interface LongSection { id: string; eyebrow: string; title: string; intro: string; blocks: Block[]; stats?: [string, string, string][] }
export type CityId = 'dallas' | 'miami' | 'baltimore' | 'denver'
type CityWords = { name: string; state: string }

/* ---------------- new services ---------------- */
export const NEW_SERVICES = [
  { id: 'ai-agents', icon: 'bot', name: 'AI agents & AI receptionist', tagline: 'Answer every call, chat and lead in seconds, 24 hours a day.',
    body: 'An AI agent answers your phone and website chat in a natural voice, books appointments into your calendar, qualifies leads and sends the details to your team. It works after hours, on weekends and during your busiest jobs, so no customer reaches voicemail and moves on to a competitor.',
    includes: ['AI receptionist and voice agent for inbound calls', 'Website and Facebook chat agent', 'Appointment booking into your calendar', 'Lead qualification and instant text follow-up', 'Call summaries sent to your phone and CRM'],
    result: 'Every lead answered within seconds, and more of them booked.' },
  { id: 'automation', icon: 'flow', name: 'Business automation', tagline: 'Connect your tools and remove repetitive work.',
    body: 'We map how leads, jobs and payments move through your business, then automate the repetitive steps: lead routing, quotes, reminders, invoices, review requests and reporting. Your team spends less time on data entry and more time serving customers.',
    includes: ['CRM setup and lead routing', 'Automatic quotes, reminders and follow-ups', 'Invoice and payment workflows', 'Review requests after every completed job', 'Dashboards that update themselves'],
    result: 'Hours saved every week, fewer mistakes and faster service.' },
]

/* ---------------- shared long-form (adapted per city) ---------------- */
export function opportunity(c?: CityWords): LongSection {
  const where = c ? `in ${c.name}` : 'in the United States'
  return {
    id: 'opportunity', eyebrow: 'The opportunity', title: c ? `Why ${c.name} businesses are winning, and losing, customers online` : 'Where local businesses are winning, and losing, customers online',
    intro: `Customers ${where} now find almost every local service the same way: they search on Google, compare the first few results and call or book within minutes. The businesses that appear first, answer first and look most trustworthy take most of the work. Four numbers explain the opportunity.`,
    stats: [
      ['14.8%', 'of local searchers click the #1 Google Maps result', 'First Page Sage, 2026'],
      ['62%', 'of calls to small businesses go unanswered', '411 Locals call study'],
      ['21×', 'more likely to qualify a lead when you reply within 5 minutes instead of 30', 'Lead Response Management Study (MIT / InsideSales)'],
      ['58%', 'of small employers already use AI agents', 'Small Business & Entrepreneurship Council, Sep 2026'],
    ],
    blocks: [
      { h: 'The top three spots take the calls', p: `The Google Maps pack shows three businesses. Together they receive close to 40% of clicks on local searches. If your business sits in fourth place or lower ${where}, most customers never see it, however good your work is.` },
      { h: 'Most leads are lost after they arrive', p: 'Paying for a click is only half the job. Six in ten calls to small businesses are not answered, and a customer who reaches voicemail usually calls the next company on the list. Answering every lead quickly is often the cheapest growth available.' },
      { h: 'Advertising costs keep rising', p: 'The average US cost per lead on Google Ads rose about 5% in 2025 to $70.11. Businesses that rely only on paid clicks pay more every year. Businesses that combine ads with local SEO build a stream of free leads that lowers their average cost over time.' },
      { h: 'AI has changed how customers search', p: 'Google AI Overviews and ChatGPT now answer many questions before anyone clicks. Businesses with clear, well-structured websites and strong Google Business Profiles are the ones these tools mention. This is the new front page, and most local competitors have not adapted yet.' },
    ],
  }
}

export function whyHire(c?: CityWords): LongSection {
  const local = c ? ` ${c.name}` : ''
  return {
    id: 'why-hire', eyebrow: 'Why hire Jarz Digital', title: c ? `Why ${c.name} businesses choose Jarz Digital` : 'Why business owners choose Jarz Digital',
    intro: `A marketing agency should be judged by the customers it brings, not the reports it sends. These are the reasons${local} business owners give for working with us, and for staying.`,
    blocks: [
      { h: 'One team for the whole growth system', p: 'Website, local SEO, Google Ads, AI agents, automation and social media are planned and delivered by one team. Nothing falls between agencies, and every service is built to support the others.' },
      { h: 'We measure customers, not clicks', p: 'Every call, form and booking is tracked from the first day. Monthly reports show leads, customers, cost per customer and revenue, so you always know what your marketing returns.' },
      { h: 'Ten years of hands-on SEO', p: 'Our founder, Roknuzzaman Jony, is a computer engineer and local SEO specialist with more than ten years of practical experience. All SEO work is done by hand, without shortcuts that put your website at risk.' },
      { h: 'Proven #1 rankings', p: 'Our clients hold the top Google Maps position for their main searches in Miami, Baltimore and London, ahead of competitors with more reviews and ahead of paid ads.' },
      { h: 'Developers, not only marketers', p: 'Our own developers build websites, web applications, AI agents and automations. That means faster pages, cleaner tracking and tools that competitors cannot copy from a template.' },
      { h: 'Clear terms and direct communication', p: 'You receive a fixed monthly price after a free audit, a named point of contact and plain-language reporting. There is no confusion about what is included or what it costs.' },
    ],
  }
}

export function howWeGrow(c?: CityWords): LongSection {
  const inCity = c ? ` in ${c.name}` : ''
  return {
    id: 'how-we-grow', eyebrow: 'How we grow your business', title: `A growth plan for every stage of your business${inCity}`,
    intro: 'Every business starts from a different place. We build the plan around where you are today and the results you need next.',
    blocks: [
      { h: 'New or small businesses', p: `We start with the foundations: a fast website, a fully optimized Google Business Profile, review collection and a focused Google Ads or Local Services Ads campaign. The aim is steady calls within the first month while local SEO begins to build${inCity}.` },
      { h: 'Growing businesses', p: 'We add service and area pages, monthly content, backlinks and an AI receptionist so no lead is missed. Ads scale only when they are profitable, and organic traffic gradually lowers your cost per customer.' },
      { h: 'Established and multi-location businesses', p: 'We manage location pages, multiple Google Business Profiles, call tracking by branch and business automation that connects marketing to your CRM. Leadership receives one report that shows revenue by channel and location.' },
      { h: 'What happens in the first 90 days', p: 'Weeks 1–4: audit, website and profile fixes, tracking, ads launch. Weeks 5–8: content, citations, review system, AI agent setup. Weeks 9–12: ranking gains, ad optimization and a clear plan for the following quarter.' },
    ],
  }
}

export function whyBest(c?: CityWords): LongSection {
  return {
    id: 'difference', eyebrow: 'What makes us different', title: c ? `What sets Jarz Digital apart in ${c.name}` : 'What sets Jarz Digital apart',
    intro: 'Many agencies offer similar services on paper. The difference shows in how the work is done and what you can measure.',
    blocks: [
      { h: 'Strategy built on data', p: 'Budgets and targets are set from published benchmarks for your industry and from your own numbers. The calculator on this page uses the same 2025 US data we use when planning campaigns.' },
      { h: 'Speed to lead is built in', p: 'Most agencies stop at the click. We set up AI replies, call routing and follow-ups so that the leads we generate are answered in seconds and converted into booked work.' },
      { h: 'Search and AI visibility together', p: 'We optimize for the classic Google results, the Google Maps pack and the new AI answers in Google and ChatGPT, so your business is visible wherever customers look.' },
      { h: 'International experience, local focus', p: 'We have built 500+ websites and served 500+ clients across the USA, Canada, the UK and beyond. We bring those tested methods to every market and plan each campaign around your city and competitors.' },
    ],
  }
}

export function aiDeep(c?: CityWords): LongSection {
  const city = c ? ` in ${c.name}` : ''
  return {
    id: 'ai-agents', eyebrow: 'AI agents & AI receptionist', title: c ? `AI agents and AI receptionists for ${c.name} businesses` : 'AI agents and AI receptionists for small businesses',
    intro: `An AI agent is software that can hold a conversation, take action and hand off to your team when needed. For local businesses${city}, the most valuable use is simple: answer every call and message immediately, book the job and never let a lead go cold.`,
    blocks: [
      { h: 'AI receptionist for small business', p: 'The AI receptionist answers inbound calls in a natural voice, gives accurate answers about your services, hours and service area, and books appointments directly into your calendar. Urgent calls are transferred to your team instantly.' },
      { h: 'AI voice agent for after-hours calls', p: 'Evenings and weekends are when many emergency and service calls arrive. The voice agent handles them consistently, collects the details and sends a summary to your phone, so you can respond first thing or dispatch immediately.' },
      { h: 'AI chat and customer service agent', p: 'On your website, Facebook and Instagram, an AI chat agent answers common questions, provides estimates within the ranges you set and captures contact details. Conversations are logged in your CRM for follow-up.' },
      { h: 'Built for your industry', p: 'HVAC and plumbing companies use AI agents to book service calls and triage emergencies. Clinics and med spas use them to schedule consultations. Restaurants use them for reservations and orders. Law firms use them to qualify new cases before an attorney calls back.' },
      { h: 'What an AI receptionist costs', p: 'Cost depends on call volume, the number of integrations and how much the agent needs to know. We scope it during the free audit and price it as a fixed monthly service, usually far below the cost of a full-time hire.' },
    ],
  }
}

export function automationDeep(c?: CityWords): LongSection {
  return {
    id: 'automation', eyebrow: 'Business automation', title: c ? `Business automation services for ${c.name} companies` : 'Business automation services for small businesses in the USA',
    intro: 'Most small businesses lose hours every week to copying data, chasing payments and sending the same messages by hand. Workflow automation removes that work and makes every step faster and more reliable. In a 2026 survey, 93% of owners using AI said it saves them time, and more than half save five or more hours a week.',
    blocks: [
      { h: 'Lead capture and routing', p: 'Every call, form, chat and ad lead lands in one CRM, is assigned to the right person and triggers an instant reply. Nothing sits in an inbox overnight.' },
      { h: 'Quotes, reminders and follow-ups', p: 'Estimates are generated from your price list, appointment reminders go out automatically and unanswered quotes receive timely follow-ups that win back work that would otherwise be lost.' },
      { h: 'Reviews on autopilot', p: 'After each completed job, customers receive a short message asking for a Google review. A steady flow of new reviews is one of the strongest local ranking signals.' },
      { h: 'Invoicing and reporting', p: 'Invoices, payment links and receipts are sent automatically, and dashboards update themselves with leads, jobs, revenue and marketing cost, so you can make decisions without building spreadsheets.' },
    ],
  }
}

export function adsCostGuide(c?: CityWords): LongSection {
  const city = c ? ` in ${c.name}` : ''
  return {
    id: 'ads-cost', eyebrow: 'Google Ads cost guide', title: `How much does Google Ads cost${city}?`,
    intro: `Google Ads uses an auction, so the price of each click depends on your industry, location and competition. In 2025 the US average was $5.26 per click and $70.11 per lead, but local service categories vary widely.`,
    blocks: [
      { h: 'High-cost categories', p: 'Painting ($13.74 per click), electricians ($12.18), criminal defense lawyers ($12.30), roofing ($10.70), plumbing ($10.49) and HVAC ($9.68) are among the most expensive local categories. Personal injury Local Services Ads average about $249 per lead. In these markets, precise targeting and strong landing pages make the biggest difference.' },
      { h: 'Lower-cost categories', p: 'Restaurants ($2.05 per click), tires and wheel alignment ($4.44), veterinarians ($3.97), dermatology ($4.90) and auto repair ($6.42) are more affordable. Here the opportunity is volume: more searches, more customers and more repeat business.' },
      { h: 'Recommended starting budget', p: `Most local service businesses spend $1,000 to $2,000 a month on Google Ads${city}. A smaller budget can work in low-cost categories, while competitive trades need more to gather data quickly. Use the calculator on this page to estimate leads and revenue for your category.` },
      { h: 'How we lower your cost per customer', p: 'We bid only on buyer keywords, block irrelevant searches every week, send traffic to dedicated landing pages, track calls and forms, and add Local Services Ads where available. SEO then adds free leads, which lowers your blended cost over time.' },
    ],
  }
}

export function seoGuide(c?: CityWords): LongSection {
  const city = c ? c.name : 'your city'
  return {
    id: 'local-seo-guide', eyebrow: 'Local SEO explained', title: c ? `How local SEO works in ${c.name}` : 'How local SEO works, and how long it takes',
    intro: `Google ranks local businesses on three main factors: relevance (do you offer what was searched), distance (how close you are to the searcher) and prominence (how well known and trusted you are). Local SEO improves the factors you can control.`,
    blocks: [
      { h: 'Google Business Profile', p: 'Correct categories, services, photos, weekly posts and accurate hours make your profile relevant for more searches and more attractive to customers comparing options.' },
      { h: 'Reviews and reputation', p: 'The number, quality and freshness of your Google reviews influence both rankings and conversions. A consistent review system matters more than occasional bursts.' },
      { h: 'Website and location pages', p: `Fast, mobile-friendly pages for each service and area you cover help Google understand where you work, from the center of ${city} to the surrounding suburbs.` },
      { h: 'Citations and backlinks', p: 'Consistent listings in trusted directories and relevant local links build prominence. Inconsistent names, addresses or phone numbers hold rankings back.' },
      { h: 'Timeline', p: 'Most businesses see Google Maps rankings and calls begin to improve within two to three months, with larger gains by months four to six. Highly competitive trades and large cities can take longer.' },
    ],
  }
}

/* ---------------- industry playbooks (base text + city notes) ---------------- */
export interface Playbook { id: string; name: string; kw: string; data: string; base: string; city: Partial<Record<string, string>> }

export const PLAYBOOKS: Playbook[] = [
  { id: 'hvac', name: 'HVAC companies', kw: 'HVAC marketing', data: '$9.68 per click · $127.74 per lead · LSA about $80',
    base: 'HVAC searches spike with the weather, and the first company to answer usually gets the job. We combine Local Services Ads, search campaigns for repair and replacement, seasonal landing pages and an AI receptionist for after-hours breakdowns.',
    city: { dallas: 'Dallas summers regularly reach triple digits, so AC repair demand peaks for months. We plan budgets before the heat arrives and target suburbs such as Frisco, Plano and McKinney where new homes add maintenance demand.', miami: 'Miami heat and humidity keep AC demand high all year. We focus on repair, maintenance plans and humidity control, with campaigns that run evenings and weekends.', baltimore: 'Baltimore winters drive furnace and heat pump searches, while older rowhomes need system upgrades. We split campaigns by season to keep cost per lead stable.', denver: 'Denver swings between cold winters and hot, dry summers. We run furnace and heating campaigns in winter and AC campaigns in summer, with snow-day emergency coverage.' } },
  { id: 'plumbing', name: 'Plumbers', kw: 'plumber marketing', data: '$10.49 per click · $129.02 per lead · LSA about $69',
    base: 'Plumbing leads are urgent and phone-driven. We prioritize click-to-call ads, Local Services Ads, emergency pages and 24/7 call answering so no burst pipe goes to a competitor.',
    city: { dallas: 'Fast population growth across DFW brings constant new construction and repair demand. We target by service area so crews are not sent across the metroplex for small jobs.', miami: 'Older buildings, condos and storm-related water damage create steady plumbing demand in Miami. We build pages for leak detection, water heaters and drain services.', baltimore: 'Baltimore\'s older housing stock means frequent pipe replacement, sewer line and water heater work. We create content around these high-value jobs.', denver: 'Freezing winter nights lead to burst pipes across Denver. We run emergency campaigns during cold snaps and pre-season maintenance offers in the fall.' } },
  { id: 'roofing', name: 'Roofing contractors', kw: 'roofing company SEO', data: '$10.70 per click · $228.15 per lead · LSA about $162',
    base: 'Roofing has the highest cost per lead of any home trade, yet a single job can cover dozens of leads. We focus on storm-response pages, financing messages, strong reviews and Local Services Ads to win high-value replacements.',
    city: { dallas: 'Spring hail storms across North Texas trigger sudden demand. We prepare storm landing pages in advance and scale ads within hours of a storm.', miami: 'Hurricane season and strict Florida building codes drive roof replacement and inspection searches. We highlight licensing, insurance work and wind-rated materials.', baltimore: 'Flat and low-slope rowhome roofs need regular repair in Baltimore. We target repair and coating searches that bring a steady flow of jobs.', denver: 'The Front Range is one of the most hail-prone areas in the country. We build hail damage, insurance claim and inspection pages that capture demand after every storm.' } },
  { id: 'legal', name: 'Law firms', kw: 'law firm SEO and personal injury lawyer marketing', data: 'Injury $9.30 per click · $159.17 per lead · LSA about $249',
    base: 'Legal keywords are among the most expensive online. We combine practice-area pages, Local Services Ads, intake call tracking and an AI agent that qualifies new cases before an attorney calls back, so marketing spend turns into signed clients.',
    city: { dallas: 'Dallas has a dense legal market downtown and in Uptown. We target personal injury, family and criminal defense searches by county and suburb.', miami: 'Miami firms compete for injury, immigration and family law cases. We structure intake so every inquiry is answered quickly, day or night.', baltimore: 'Baltimore firms benefit from neighborhood and county-level pages across the metro. We focus on injury, family and estate planning searches.', denver: 'Denver firms see strong demand for injury, family and estate law. We target the city and growing suburbs such as Aurora and Lakewood.' } },
  { id: 'dental', name: 'Dentists and orthodontists', kw: 'dental marketing', data: '$7.03 per click · $84.77 per lead',
    base: 'A new dental patient can be worth thousands of dollars over the years they stay. We run campaigns for high-value treatments, optimize each provider\'s Google profile and use an AI receptionist to book appointments outside office hours.',
    city: { dallas: 'Families moving into the northern suburbs search for a new dentist close to home. We target new-resident searches in Frisco, Prosper and McKinney.', miami: 'Cosmetic and implant dentistry are strong in Miami. We build treatment pages and booking flows for these higher-value services.', baltimore: 'With a major medical community in the region, patients compare carefully. We emphasize reviews, credentials and easy online booking.', denver: 'Active Denver residents value convenience. We promote online booking, same-week appointments and family dentistry across the metro.' } },
  { id: 'medspa', name: 'Med spas and aesthetics', kw: 'med spa marketing', data: '$15–25 per click · $45–85 per lead',
    base: 'Med spa customers research carefully and book from strong visuals and reviews. We combine treatment pages, Instagram content, targeted ads and an AI agent that answers pricing questions and books consultations.',
    city: { miami: 'Miami has one of the most competitive aesthetics markets in the country. We position each treatment clearly and capture searches in Brickell, Coral Gables and Miami Beach.', dallas: 'Uptown, Highland Park and Plano have strong demand for aesthetics. We target treatment searches by neighborhood with booking-focused pages.', denver: 'Denver clients favor natural results and wellness. We promote consultations, memberships and packages that bring repeat visits.', baltimore: 'We help Baltimore med spas stand out with clear pricing guidance, reviews and easy consultation booking.' } },
  { id: 'auto', name: 'Auto repair and auto body shops', kw: 'auto repair shop marketing', data: 'Repair $6.42 per click · $42.10 per lead · Body $7.54 / $56.26',
    base: 'Auto repair leads are affordable and convert well. We optimize for service-specific searches such as brakes, transmissions and collision repair, and use reviews and fast quotes to win the job.',
    city: { miami: 'Our Miami auto body client ranks first for car customization. We apply the same approach to collision, paint and custom work across the metro.', denver: 'Hail damage keeps Denver body shops and paintless dent repair busy. We prepare hail campaigns and insurance-claim pages before storm season.', dallas: 'Long commutes across DFW mean steady repair demand. We target shops by area so customers find the nearest trusted option.', baltimore: 'Baltimore drivers deal with winter road wear and potholes. We focus on alignment, tires, suspension and brake repair searches.' } },
  { id: 'movers', name: 'Moving companies', kw: 'moving company marketing', data: 'About $10–60 per click · $130–183 per lead',
    base: 'Movers pay high prices for leads, so quality matters. We target local and long-distance moving searches separately, add instant quote forms and follow up automatically before competitors do.',
    city: { dallas: 'DFW is one of the fastest-growing metros in the country, which keeps moving demand high year-round.', miami: 'Seasonal residents and condo moves create steady demand in Miami. We target building and neighborhood searches.', denver: 'Population growth along the Front Range brings in-state and out-of-state moves. We separate local and long-distance campaigns.', baltimore: 'Rowhome moves and university schedules shape Baltimore demand. We time campaigns around peak moving months.' } },
  { id: 'restaurants', name: 'Restaurants', kw: 'restaurant marketing', data: '$2.05 per click · $30.27 per lead',
    base: 'Restaurants have some of the cheapest clicks on Google and depend on repeat guests. We optimize the Google Business Profile, menus, photos and reviews, and run local ads for orders, reservations and events.',
    city: { baltimore: 'Our Baltimore seafood client ranks first for steamed crabs. We help restaurants win searches in the Inner Harbor, Fells Point and Canton.', miami: 'Tourists and locals both search "near me" in Miami. We optimize for neighborhood searches and visual content that drives reservations.', dallas: 'Dallas diners search by cuisine and neighborhood. We build visibility in Deep Ellum, Bishop Arts, Uptown and the suburbs.', denver: 'Denver diners search by neighborhood, patio seating and brunch. We optimize for these searches and seasonal menus.' } },
  { id: 'cleaning', name: 'Cleaning and pest control', kw: 'cleaning business marketing', data: 'Cleaning $8.50 per click · $46.99 per lead',
    base: 'Recurring services are worth far more than the first visit. We focus on recurring plans, review generation and automated reminders that keep customers booked month after month.',
    city: { miami: 'Humidity and warm weather keep pest control and cleaning demand high all year in Miami.', dallas: 'Busy households across DFW book recurring cleaning and quarterly pest control. We promote plans rather than one-off visits.', baltimore: 'Older homes in Baltimore create steady demand for pest control and deep cleaning services.', denver: 'Denver demand rises in spring and fall. We plan seasonal promotions and recurring plans.' } },
  { id: 'junkcar', name: 'Junk car buyers and towing', kw: 'cash for junk cars marketing', data: 'About $10–50 per click · mostly phone leads',
    base: 'Junk car and towing leads arrive by phone and need an answer immediately. We run call-only campaigns, block spam and lead-sellers, and use an AI receptionist to give instant quotes and dispatch.',
    city: { dallas: 'DFW covers a large area, so we target by county and dispatch radius to keep pickups profitable.', miami: 'Storm-damaged and flooded vehicles create demand in South Florida. We prepare campaigns for after-storm searches.', baltimore: 'We target Baltimore city and county with fast-answer call campaigns and clear pickup areas.', denver: 'Winter accidents and hail-damaged vehicles drive demand in Denver. We scale call campaigns when conditions change.' } },
  { id: 'health', name: 'Clinics, physical therapy and veterinarians', kw: 'healthcare marketing', data: 'Physical therapy $4.95 per click · $32.79 per lead · Vets $3.97 / $31.82',
    base: 'Healthcare and veterinary clicks are relatively affordable, and patients return for years. We optimize provider profiles, service pages and online booking, and automate reminders that keep schedules full.',
    city: { denver: 'Denver\'s active population drives strong demand for physical therapy, sports medicine and chiropractic care.', baltimore: 'Baltimore is a major healthcare hub, so patients compare carefully. We emphasize credentials, reviews and convenient booking.', dallas: 'Growing suburbs across DFW need new providers. We target new-resident and "near me" searches.', miami: 'Bilingual communication and convenient booking help Miami clinics convert more searchers into patients.' } },
]

/* ---------------- extra FAQ ---------------- */
export function extraFaq(c?: CityWords): Faq[] {
  const city = c ? ` in ${c.name}` : ''
  return [
    { q: `What is an AI receptionist and how does it help a small business${city}?`, a: 'An AI receptionist answers your calls in a natural voice, gives accurate information about your services, books appointments and sends you a summary. It means every customer reaches someone immediately, even after hours, which turns more calls into booked jobs.' },
    { q: c ? `How much does an AI receptionist cost for a ${c.name} business?` : 'How much does an AI receptionist cost?', a: 'It depends on call volume, integrations and how detailed the agent needs to be. We price it as a fixed monthly service after a free audit. For most businesses it costs far less than a full-time hire and works every hour of the day.' },
    { q: c ? `What business processes can you automate for ${c.name} companies?` : 'What business processes can you automate?', a: 'Common examples are lead capture and routing, quotes, appointment reminders, follow-ups, review requests, invoices and reporting. We map your current process first and automate the steps that take the most time.' },
    { q: `Do AI agents work for my industry${city}?`, a: 'Yes, for most local businesses. Home services use them for booking and emergencies, clinics and med spas for consultations, restaurants for reservations and law firms for case intake. We configure each agent around your services and rules.' },
    { q: c ? `How do you choose which ${c.name} keywords to target?` : 'How do I know which keywords to target?', a: 'We research the searches your customers actually use, including high-value service terms and lower-cost local terms, then map each keyword to the page that should rank for it. This plan is part of the free audit.' },
    { q: c ? `Can you improve the existing website of my ${c.name} business?` : 'Can you work with my existing website?', a: 'Yes. We can improve and optimize your current site, or rebuild it if speed, structure or design is holding you back. Rankings are protected during any redesign.' },
    { q: c ? `What reports do ${c.name} clients receive?` : 'What reports will I receive?', a: 'A clear monthly report with rankings, website visitors, calls, leads, customers, cost per customer and revenue, plus a short call to agree the next steps.' },
    { q: c ? `Do ${c.name} clients have to sign a long contract?` : 'Do I have to sign a long contract?', a: 'No. We earn your business month by month with clear results. Pricing and terms are agreed after the free audit, before any work begins.' },
    { q: `Do you work with businesses outside${c ? ` ${c.name}` : ' your listed cities'}?`, a: 'Yes. We work with local businesses across the USA, with a focus on Dallas, Miami, Baltimore and Denver, as well as clients in Canada and the UK.' },
    { q: c ? `How quickly will my ${c.name} business see results?` : 'How quickly will I see results?', a: 'Google Ads and Local Services Ads can bring calls in the first weeks. Local SEO usually shows clear movement within two to three months and stronger results by months four to six.' },
  ]
}

/* ---------------- city-only extras ---------------- */
export const CITY_EXTRA: Record<CityId, { market: string; neighborhoods: string; keywords: string[] }> = {
  dallas: { market: 'Dallas–Fort Worth is one of the largest and fastest-growing metropolitan areas in the United States. New residents arrive every month, new homes are built across Collin and Denton counties, and competition for local search is intense in almost every trade. For a Dallas business, ranking in the Google Maps top three and answering every lead quickly is the difference between a full schedule and a quiet week. We help Dallas SEO, Google Ads and web design clients build that advantage from our base in Carrollton.',
    neighborhoods: 'We work with businesses in Downtown Dallas, Uptown, Deep Ellum, Oak Lawn, Bishop Arts, Lakewood, Preston Hollow and across the suburbs, from Plano, Frisco, McKinney and Allen to Irving, Arlington, Garland, Richardson and Fort Worth.',
    keywords: ['AI receptionist Dallas', 'business automation Dallas', 'HVAC marketing Dallas', 'roofing SEO Dallas', 'law firm SEO Dallas'] },
  miami: { market: 'Miami is a fast, mobile-first market shaped by tourism, international business and a bilingual population. Customers compare reviews quickly and expect an answer right away. Hurricane season, year-round heat and a strong hospitality and aesthetics sector create constant demand for roofing, AC, pest control, restaurants and med spas. Local SEO services in Miami work best when Google profiles, websites and fast responses are managed together.',
    neighborhoods: 'We serve businesses in Brickell, Downtown Miami, Wynwood, Little Havana, Coral Gables, Coconut Grove, Doral, Hialeah, Kendall, Miami Beach, Aventura and across Broward County to Fort Lauderdale.',
    keywords: ['AI receptionist Miami', 'business automation Miami', 'med spa marketing Miami', 'roofing SEO Miami', 'restaurant marketing Miami'] },
  baltimore: { market: 'Baltimore combines historic neighborhoods, an older housing stock and a major healthcare and university community. Residents are loyal to the businesses they trust, which makes early visibility on Google especially valuable. Home repair, healthcare, legal services and restaurants all compete for a place in the Maps top three. Our Baltimore SEO and web design work focuses on neighborhood relevance, reviews and fast, mobile-friendly websites.',
    neighborhoods: 'We work with businesses in the Inner Harbor, Fells Point, Canton, Federal Hill, Hampden, Mount Vernon, Charles Village and across Baltimore County and Anne Arundel County, including Towson, Dundalk, Catonsville, Columbia and Glen Burnie.',
    keywords: ['AI receptionist Baltimore', 'business automation Baltimore', 'plumber marketing Baltimore', 'dental marketing Baltimore', 'restaurant SEO Baltimore'] },
  denver: { market: 'Denver has grown quickly along the Front Range, and new businesses open across the metro every month. Severe hail, snow and dramatic seasonal changes drive sudden demand for roofing, auto body, heating and repair services, while an active population supports fitness, wellness and healthcare. Denver SEO and Google Ads campaigns perform best when they are planned around these seasons and the city\'s many distinct suburbs.',
    neighborhoods: 'We serve businesses in LoDo, RiNo, Capitol Hill, Cherry Creek, Highlands, Washington Park and across the metro, including Aurora, Lakewood, Littleton, Englewood, Arvada, Westminster, Thornton, Centennial, Highlands Ranch, Boulder and Castle Rock.',
    keywords: ['AI receptionist Denver', 'business automation Denver', 'roofing SEO Denver', 'auto body marketing Denver', 'physical therapy marketing Denver'] },
}

/* ---------------- AI search (AI SEO / GEO) ---------------- */
export function aiSearch(c?: CityWords): LongSection {
  const city = c ? ` in ${c.name}` : ''
  return {
    id: 'ai-seo', eyebrow: 'AI SEO & generative engine optimization', title: c ? `AI SEO services${city}: rank in ChatGPT, Claude, Gemini and Google AI Overviews` : 'AI SEO services: rank in ChatGPT, Claude, Gemini and Google AI Overviews',
    intro: `Customers increasingly ask AI assistants for recommendations: "best roofer near me", "which dentist${city} takes walk-ins", "how much does AC repair cost". ChatGPT, Claude, Gemini, Perplexity, Microsoft Copilot and Google AI Overviews answer with a short list of businesses. Our AI SEO and generative engine optimization (GEO) services are designed to put your business on that list.`,
    blocks: [
      { h: 'How to rank in ChatGPT search', p: 'AI assistants recommend businesses they can verify from several trusted sources. We make sure your website, Google Business Profile, directory listings and reviews describe the same services, locations and strengths in clear, consistent language that AI systems can read and trust.' },
      { h: 'Visibility in Claude, Gemini and Perplexity', p: 'Different assistants draw on different sources and search indexes. We strengthen the places they rely on, including your own website, Bing and Google listings, industry directories and reputable local publications, so your business is mentioned whichever assistant a customer uses.' },
      { h: 'Google AI Overviews optimization', p: 'AI Overviews summarize answers at the top of Google results. We write question-and-answer content, comparison pages and service explanations in a format these summaries can quote, supported by structured data that identifies your business, services and service area.' },
      { h: 'Structured data and entity optimization', p: 'Schema markup for your organization, locations, services, reviews and FAQs helps AI systems understand exactly who you are and where you work. We implement and test it across your site as part of every AI SEO project.' },
      { h: 'Measuring AI visibility', p: 'We track how often AI assistants mention your business for your most important questions, alongside classic rankings and traffic. You see where you appear today and how that changes month by month.' },
      { h: 'Why AI SEO matters now', p: 'Independent research found that Google AI Overviews can reduce clicks to standard results by up to 58% (Ahrefs, 2026). Businesses that adapt early secure the recommendations; those that wait compete for a shrinking set of clicks.' },
    ],
  }
}

export function aiSearchFaq(c?: CityWords): Faq[] {
  const city = c ? ` in ${c.name}` : ''
  return [
    { q: c ? `What is AI SEO, and why does it matter for ${c.name} businesses?` : 'What is AI SEO?', a: 'AI SEO, also called generative engine optimization (GEO) or AI search optimization, is the work of making your business visible and recommended in AI assistants such as ChatGPT, Claude, Gemini, Perplexity and Google AI Overviews, in addition to traditional Google rankings.' },
    { q: `How can my business rank in ChatGPT${city}?`, a: 'ChatGPT and similar assistants recommend businesses they can confirm across trusted sources. Consistent information on your website, Google Business Profile, directories and reviews, plus clear service and location content with structured data, gives your business the best chance of being recommended.' },
    { q: c ? `How is AI SEO different from regular SEO in ${c.name}?` : 'Is AI SEO different from regular SEO?', a: 'It builds on the same foundations, but places more weight on clear answers, consistent business information across the web, structured data and reputation. We handle both together, so improvements help your Google rankings and your AI visibility.' },
  ]
}

/* ---------------- city-unique content (reduces duplication between city pages) ---------------- */
export interface CityUnique { seo: Block[]; ads: Block[]; ai: Block[]; services: Record<string, string>; faq: Faq[] }

export const CITY_UNIQUE: Record<CityId, CityUnique> = {
  dallas: {
    seo: [
      { h: 'Proximity matters across a huge metroplex', p: 'Dallas–Fort Worth spans many counties and dozens of cities. Google strongly favors businesses close to the searcher. A company based in Carrollton rarely ranks in Mesquite or Mansfield without dedicated service-area pages, a well-structured Google Business Profile and reviews that mention the suburbs it serves. As a Dallas SEO company, we plan coverage area by area.' },
      { h: 'Service-area businesses and verification', p: 'Many Dallas contractors work from home or a yard and hide their address on Google. We set service areas correctly, keep the profile compliant with Google\'s guidelines and build supporting pages so you can rank across North Texas without a storefront in every city.' },
      { h: 'Competing with national brands', p: 'Franchises and national lead-generation companies spend heavily in Dallas. Independent businesses win by showing genuine local proof: real photos, neighborhood reviews, local projects and fast answers. These signals are hard for national brands to copy.' },
    ],
    ads: [
      { h: 'Budgeting by area, not just by keyword', p: 'Click prices in Dallas vary by suburb and season. We split campaigns by area so budget goes to the zip codes that produce profitable jobs, and we exclude areas your crews do not cover.' },
      { h: 'Reaching Spanish-speaking customers', p: 'North Texas has a large Spanish-speaking population. Where it fits your business, Spanish-language ads and landing pages can reach customers that competitors overlook, often at a lower cost per lead.' },
      { h: 'Storm and heat-wave readiness', p: 'Hail storms and heat waves create sudden spikes in searches for roofing, AC and repair services. We prepare ads and pages in advance so a Google Ads agency response in Dallas is measured in hours, not days.' },
    ],
    ai: [
      { h: 'AI receptionists for busy Dallas seasons', p: 'During storm season and summer peaks, call volume can triple overnight. An AI receptionist answers every call immediately, books routine jobs and passes emergencies to your team, so growth is not limited by how many people can answer the phone.' },
      { h: 'Standing out in AI answers', p: 'Dallas buyers increasingly ask ChatGPT and Google AI Overviews for recommendations. Consistent listings, clear service pages and reviews that mention Dallas neighborhoods help AI assistants recommend your business by name.' },
    ],
    services: { 'local-seo': 'Area pages for Plano, Frisco, McKinney, Irving, Arlington and Fort Worth.', 'google-ads': 'Campaigns split by suburb and season for North Texas.', 'web-design': 'Websites built for Dallas service areas, with click-to-call on every page.', 'ai-agents': 'AI receptionists that handle storm-season call surges.', 'automation': 'Dispatch and follow-up workflows for crews covering the whole metroplex.', 'ai': 'AI visibility for Dallas questions in ChatGPT and Google AI Overviews.' },
    faq: [
      { q: 'Do you work with Fort Worth businesses as well as Dallas?', a: 'Yes. We serve businesses across the whole Dallas–Fort Worth metroplex, including Fort Worth, Arlington, Grand Prairie and the surrounding cities, with pages and campaigns planned for each area.' },
      { q: 'Can a new Dallas-area business in Frisco or McKinney rank quickly?', a: 'New businesses can gain visibility quickly through Google Ads and Local Services Ads while local SEO builds. With a complete Google profile, steady reviews and area pages, most see map rankings improve within a few months.' },
      { q: 'Is your Dallas office open to clients?', a: 'Our US team works from Carrollton in the Dallas area. Most meetings take place by video call so we can share dashboards and screens easily.' },
      { q: 'Which Dallas industries do you work with most?', a: 'Home services such as HVAC, roofing and plumbing, law firms, dental and medical practices, auto repair, restaurants and professional services make up most of our Dallas work.' },
    ],
  },
  miami: {
    seo: [
      { h: 'Bilingual search behavior', p: 'Miami customers search in English, Spanish and often a mix of both. As a Miami SEO company, we know that local SEO services in Miami must reflect how people actually search, with service names, reviews and content that match both languages where it fits your customers.' },
      { h: 'Neighborhoods act like separate markets', p: 'A searcher in Brickell sees different results from one in Hialeah or Kendall. We optimize your Google Business Profile and build neighborhood content so you appear in the areas that bring profitable work, not just near your address.' },
      { h: 'Reviews carry extra weight', p: 'Miami customers compare reviews closely before calling. A steady flow of recent, detailed reviews, with professional replies, improves both your map ranking and the share of searchers who choose you.' },
    ],
    ads: [
      { h: 'Seasonal tourism and residents', p: 'Winter brings seasonal residents and visitors, which changes demand for restaurants, med spas, cleaning, property services and rentals. We adjust budgets and messages to match the season.' },
      { h: 'Hurricane-season planning', p: 'Before and after storms, searches for roofing, impact windows, water damage and tree removal rise sharply. We prepare campaigns in advance so you can respond the moment customers need help.' },
      { h: 'Competitive aesthetic and legal markets', p: 'Med spa, cosmetic and personal injury clicks in Miami are expensive. Tight targeting, strong landing pages and fast follow-up are essential to keep cost per customer under control.' },
    ],
    ai: [
      { h: 'AI agents in English and Spanish', p: 'AI receptionists and chat agents can be configured to answer in English and Spanish, so every Miami caller is served in the language they prefer, at any hour.' },
      { h: 'Late-evening enquiries', p: 'Many Miami searches happen in the evening and at weekends. An AI agent books appointments and captures details while your team is off, so morning starts with a full schedule.' },
    ],
    services: { 'local-seo': 'Neighborhood visibility from Brickell and Doral to Kendall and Miami Beach.', 'google-ads': 'Campaigns adjusted for tourist season and hurricane season.', 'web-design': 'Fast, visual websites that convert mobile-first Miami customers.', 'ai-agents': 'Bilingual AI receptionists available day and night.', 'automation': 'Booking, reminder and review workflows for busy service teams.', 'ai': 'AI search visibility for Miami recommendations in ChatGPT and Gemini.' },
    faq: [
      { q: 'Can you create Spanish-language content for my Miami business?', a: 'Where it suits your customers, we can include Spanish-language pages, ads and AI agent responses so you reach Miami\'s Spanish-speaking customers effectively.' },
      { q: 'Beyond Miami, do you work with businesses in Fort Lauderdale and Broward County?', a: 'Yes. We work across South Florida, including Fort Lauderdale, Hollywood and Aventura, with pages and campaigns planned for each area you serve.' },
      { q: 'How do you prepare Miami businesses for hurricane season?', a: 'We build storm-response landing pages and ad campaigns ahead of the season, so roofing, window, water damage and tree service businesses can launch them as soon as demand rises.' },
      { q: 'Which Miami industries do you work with most?', a: 'Auto body and customization, restaurants, med spas and aesthetics, home services, law firms and healthcare practices are among the industries we support in Miami.' },
    ],
  },
  baltimore: {
    seo: [
      { h: 'City and county are different searches', p: 'Baltimore City and Baltimore County are separate jurisdictions, and customers search for both. We build pages and profile content that reflect where you actually work, from city neighborhoods to Towson, Catonsville and Dundalk.' },
      { h: 'Neighborhood identity', p: 'Residents identify strongly with neighborhoods such as Fells Point, Canton, Federal Hill and Hampden. Mentioning the neighborhoods you serve in content, posts and reviews helps your Baltimore SEO, and as a Baltimore web design agency partner we build them into your site structure. It also makes your business feel local.' },
      { h: 'A competitive regional market', p: 'Baltimore businesses compete with companies from the Washington, D.C. area and Annapolis. Strong local reviews and clear service-area pages keep you ahead of competitors from outside the city.' },
    ],
    ads: [
      { h: 'Older homes, higher-value jobs', p: 'Baltimore\'s historic rowhomes need plumbing, electrical, roofing and heating upgrades. We target these higher-value jobs with specific ads and landing pages rather than generic service terms.' },
      { h: 'Seasonal demand', p: 'Crab season, summer tourism around the Inner Harbor and winter heating demand all shift search volume. Budgets move with the seasons to keep cost per customer steady.' },
      { h: 'Healthcare and professional services', p: 'With a major healthcare and university community, Baltimore has strong demand for medical, dental, legal and professional services. Campaigns emphasize credentials, reviews and easy booking.' },
    ],
    ai: [
      { h: 'AI receptionists for small teams', p: 'Many Baltimore contractors and practices run lean teams. An AI receptionist answers calls during jobs and appointments, books new customers and sends a clear summary for follow-up.' },
      { h: 'Recommendations in AI answers', p: 'When residents ask AI assistants for the best restaurant or contractor in their neighborhood, consistent information and strong reviews help your business appear in the answer.' },
    ],
    services: { 'local-seo': 'Visibility across Baltimore City and Baltimore County neighborhoods.', 'google-ads': 'Campaigns for high-value rowhome repairs and seasonal demand.', 'web-design': 'Baltimore web design focused on trust, reviews and easy booking.', 'ai-agents': 'AI receptionists for lean teams who cannot answer every call.', 'automation': 'Review and reminder workflows that keep Baltimore customers coming back.', 'ai': 'AI visibility for neighborhood questions in ChatGPT and Google AI Overviews.' },
    faq: [
      { q: 'Do you work with businesses in Baltimore County as well as the city?', a: 'Yes. We serve Baltimore City and Baltimore County, plus Anne Arundel and Howard counties, including Towson, Catonsville, Columbia and Glen Burnie.' },
      { q: 'Can you help my Baltimore restaurant rank in Fells Point or Canton?', a: 'Yes. Our Baltimore seafood client ranks first for its main search. We optimize menus, photos, reviews and neighborhood content so diners find you when they search nearby.' },
      { q: 'Do you design websites for Baltimore businesses?', a: 'Yes. As a Baltimore web design agency partner, we build fast, mobile-friendly websites with clear service pages, reviews and online booking.' },
      { q: 'Which Baltimore industries do you work with most?', a: 'Restaurants and food businesses, home repair contractors, healthcare and dental practices, law firms and professional services.' },
    ],
  },
  denver: {
    seo: [
      { h: 'A metro of distinct suburbs', p: 'Our local SEO services in Denver start from one fact: searches are spread across Aurora, Lakewood, Littleton, Arvada, Westminster, Centennial and Boulder. Each area needs its own relevance signals, so we build service-area content and profile updates for every part of the metro you serve.' },
      { h: 'Seasonal search patterns', p: 'Hail, snow and fast spring changes drive sudden demand for roofing, auto body, heating and repairs. Content and profile updates are scheduled before each season so your business is ready when searches rise.' },
      { h: 'Industries that depend on organic search', p: 'Some businesses, such as cannabis dispensaries, face strict restrictions on Google advertising. For them, local SEO and Google Business Profile optimization are the main ways to be found, and we plan accordingly.' },
    ],
    ads: [
      { h: 'Hail-response campaigns', p: 'The Front Range is among the most hail-prone regions in the country. Roofing, gutter, auto glass and auto body businesses benefit from campaigns that launch within hours of a storm.' },
      { h: 'Winter and summer splits', p: 'Heating and snow-related services peak in winter, while AC, landscaping and outdoor services peak in summer. Budgets follow the season to protect cost per lead.' },
      { h: 'Health, fitness and wellness', p: 'Denver\'s active population supports strong demand for physical therapy, chiropractic care, fitness studios and med spas. Campaigns focus on bookings rather than clicks.' },
    ],
    ai: [
      { h: 'AI receptionists for storm surges', p: 'After a hail storm, roofing and auto body businesses can receive more calls in a day than in a week. An AI receptionist answers every caller, books inspections and organizes leads for your team.' },
      { h: 'AI search for growing suburbs', p: 'New residents moving to the Denver area ask AI assistants for trusted local providers. Clear, consistent information helps your business be named in those answers.' },
    ],
    services: { 'local-seo': 'Area visibility from Aurora and Lakewood to Boulder and Castle Rock.', 'google-ads': 'Hail-response and seasonal campaigns for the Front Range.', 'web-design': 'Websites built for Denver service areas and mobile searchers.', 'ai-agents': 'AI receptionists that handle post-storm call surges.', 'automation': 'Inspection booking, estimates and follow-up workflows.', 'ai': 'AI visibility for Denver recommendations in ChatGPT, Claude and Gemini.' },
    faq: [
      { q: 'Beyond Denver, do you work with businesses in Boulder and Aurora?', a: 'Yes. We serve the whole Denver metro, including Boulder, Aurora, Lakewood, Littleton, Arvada, Westminster and Castle Rock.' },
      { q: 'How do you help Denver roofing companies after hail storms?', a: 'We prepare hail damage pages and campaigns before the season, launch ads within hours of a storm and use an AI receptionist to book inspections while call volume is high.' },
      { q: 'Can you help Denver businesses that cannot advertise on Google?', a: 'Yes. Businesses with advertising restrictions rely on local SEO, Google Business Profile optimization, reviews and AI search visibility, which we manage in full.' },
      { q: 'Which Denver industries do you work with most?', a: 'Roofing and home services, auto body and glass, physical therapy and wellness, dental practices, restaurants and professional services.' },
    ],
  },
}
