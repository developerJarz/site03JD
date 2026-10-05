// Canada site: long-form sections, industry playbooks, city extras and FAQ. Researched October 2026.
// Statistics: Statistics Canada (AI use by businesses, Q2 2026), ISED Key Small Business Statistics 2025,
// Consultus Digital / Hetman / Brand Butter / Creative Scope / ScopeX Media (Canadian Google Ads costs, 2026).
import type { Faq } from '../content'
import type { LongSection, Playbook } from '../longform'
import type { CityExtra, CityUniqueContent, CityWords } from '../sitedata'

export function opportunity(c?: CityWords): LongSection {
  const where = c ? `in ${c.name}` : 'across Canada'
  return {
    id: 'opportunity', eyebrow: 'The opportunity', title: c ? `Why ${c.name} businesses are winning, and losing, customers online` : 'Where Canadian local businesses are winning, and losing, customers online',
    intro: `Customers ${where} find almost every local service the same way: a Google search on their phone, a quick look at the map results and reviews, then a call or a booking within minutes. The businesses that appear first, answer first and look most trustworthy take most of the work. Four numbers explain the opportunity for Canadian businesses.`,
    stats: [
      ['1.08M', 'small employer businesses compete for Canadian customers, 98.2% of all employers', 'ISED, Key Small Business Statistics 2025'],
      ['14.8%', 'of local searchers click the #1 Google Maps result', 'First Page Sage, 2026'],
      ['21×', 'more likely to qualify a lead when you reply within 5 minutes instead of 30', 'Lead Response Management Study (MIT / InsideSales)'],
      ['19.2%', 'of Canadian businesses already use AI, up from 6.1% in 2024', 'Statistics Canada, Q2 2026'],
    ],
    blocks: [
      { h: 'Three map spots, hundreds of competitors', p: `More than a million small businesses compete for Canadian customers, yet Google shows only three in the map results for most local searches. If your business sits in fourth place or lower ${where}, most people never see it, however good your work is. Reaching the top three is the single biggest lever most local businesses have.` },
      { h: 'Clicks are getting more expensive', p: 'Canadian click prices keep rising, according to Brand Butter, because a small number of well-funded advertisers bid aggressively for a limited audience. Businesses that rely only on paid clicks pay more each year. Pairing ads with local SEO builds a stream of free enquiries that lowers the average cost of every customer.' },
      { h: 'Speed decides who gets the job', p: 'Most customers call two or three businesses and book the first one that answers properly. A missed call at 4:45 on a Friday is a job handed to a competitor. Fast answering, by your team or by an AI receptionist, is often the cheapest growth available.' },
      { h: 'AI adoption is accelerating', p: 'Statistics Canada reports that 19.2% of businesses used AI in the past year and another 25.2% plan to start within twelve months. At the same time, Canadians ask ChatGPT and Google AI Overviews for recommendations. The businesses that adapt now will be the ones AI tools recommend, and the ones best placed to answer every lead.' },
    ],
  }
}

export function whyHire(c?: CityWords): LongSection {
  const local = c ? ` ${c.name}` : ' Canadian'
  return {
    id: 'why-hire', eyebrow: 'Why hire Jarz Digital', title: c ? `Why ${c.name} business owners choose Jarz Digital` : 'Why Canadian business owners choose Jarz Digital',
    intro: `A marketing agency should be judged by the customers it brings in, not the length of its reports. These are the reasons${local} owners give for working with us, and for staying.`,
    blocks: [
      { h: 'One team for the whole system', p: 'Website, local SEO, Google Ads, Local Services Ads, AI agents, automation and social media are planned and delivered by one team. Nothing falls between agencies, and every piece is built to support the others.' },
      { h: 'Canadian data, Canadian dollars', p: 'Budgets, forecasts and reports use Canadian cost data in CAD, with city adjustments for Toronto, Peel Region, Calgary and the rest of Alberta. You see real local numbers, not averages borrowed from other markets.' },
      { h: 'A team in Calgary', p: 'Part of our team is based in Calgary, Alberta. We understand Canadian seasons, provincial rules and the way customers in Ontario and Alberta search, compare and buy.' },
      { h: 'Proven results in Canada', p: 'Our Canadian clients include an auto repair shop that appears first in the Richmond Hill map results with 492 five-star reviews, a Calgary beauty and spa business listed first beneath the only paid ad, and a business that received 1,845 calls from its Google profile in a single month.' },
      { h: 'Engineers, not only marketers', p: 'Our founder, Roknuzzaman Jony, is a computer engineer and local SEO specialist with more than ten years of hands-on experience. Our own developers build the websites, AI agents and automations, which means faster pages, cleaner tracking and tools competitors cannot copy from a template.' },
      { h: 'Clear terms', p: 'You receive a fixed monthly price in Canadian dollars after a free audit, a named point of contact and plain-language reporting. No long lock-in contracts, and no confusion about what is included.' },
    ],
  }
}

export function howWeGrow(c?: CityWords): LongSection {
  const inCity = c ? ` in ${c.name}` : ''
  return {
    id: 'how-we-grow', eyebrow: 'How we grow your business', title: `A growth plan for every stage of your business${inCity}`,
    intro: 'Every business starts from a different place. We build the plan around where you are today and the result you need next, then measure it in calls, customers and revenue.',
    blocks: [
      { h: 'New businesses', p: `We start with the foundations: a fast website, a complete Google Business Profile, Canadian directory listings, a review system and a focused Google Ads or Local Services Ads campaign. The goal is a steady flow of enquiries within the first month while local SEO builds${inCity}.` },
      { h: 'Growing businesses', p: 'We add service and neighbourhood pages, monthly content, Canadian backlinks and an AI receptionist so no lead is missed. Ads scale only when they are profitable, and organic traffic gradually lowers your cost per customer.' },
      { h: 'Established and multi-location businesses', p: 'We manage location pages, multiple Google profiles, call tracking by branch and automation that connects marketing to your CRM. Owners receive one report showing revenue by channel and location.' },
      { h: 'Your first 90 days', p: 'Weeks 1–4: audit, website and profile fixes, tracking and ads launch. Weeks 5–8: content, citations, review system and AI agent setup. Weeks 9–12: ranking gains, ad optimization and a clear plan for the next quarter.' },
    ],
  }
}

export function whyBest(c?: CityWords): LongSection {
  return {
    id: 'difference', eyebrow: 'What makes us different', title: c ? `What sets Jarz Digital apart in ${c.name}` : 'What sets Jarz Digital apart in Canada',
    intro: 'Many agencies list similar services. The difference shows in how the work is done, how quickly leads are answered and what you can measure at the end of each month.',
    blocks: [
      { h: 'Built on Canadian numbers', p: 'The calculator on this page uses 2026 Canadian cost-per-click and Local Services Ads data in CAD, adjusted by city. We plan real campaigns with the same figures, then replace them with your own results as soon as they arrive.' },
      { h: 'Speed to lead is part of the service', p: 'Most agencies stop at the click. We set up AI call answering, instant replies and follow-ups so the leads we generate are answered in seconds and turned into booked work.' },
      { h: 'Search, maps and AI together', p: 'We optimize for classic Google results, the map pack, Local Services Ads and the AI answers in Google, ChatGPT and Claude, so your business is visible wherever Canadians look.' },
      { h: 'International experience, local focus', p: 'We have built more than 500 websites and served more than 500 clients. Every campaign is still planned around your city, your neighbourhoods and your competitors.' },
    ],
  }
}

export function aiSearch(c?: CityWords): LongSection {
  const city = c ? ` in ${c.name}` : ' in Canada'
  return {
    id: 'ai-seo', eyebrow: 'AI SEO & generative engine optimization', title: `AI SEO services${city}: get recommended by ChatGPT, Claude, Gemini and Google AI Overviews`,
    intro: `Canadians increasingly ask AI assistants questions such as "best plumber near me", "which dentist${c ? ` in ${c.name}` : ''} offers direct billing" or "how much does a new furnace cost". ChatGPT, Claude, Gemini, Perplexity, Copilot and Google AI Overviews answer with a short list of businesses. Our AI SEO and generative engine optimization (GEO) services are designed to put your business on that list.`,
    blocks: [
      { h: 'How to rank in ChatGPT search', p: 'AI assistants recommend businesses they can verify from several trusted sources. We make sure your website, Google Business Profile, Canadian directories and reviews describe the same services, locations and strengths in clear, consistent language that AI systems can read and trust.' },
      { h: 'Visibility in Claude, Gemini and Perplexity', p: 'Each assistant draws on different sources and search indexes. We strengthen the places they rely on, including your own site, Google and Bing listings, Canadian industry directories and reputable local publications, so your business is mentioned whichever assistant a customer uses.' },
      { h: 'Google AI Overviews optimization', p: 'AI Overviews summarize answers at the top of Google. We write clear question-and-answer content, cost guides in Canadian dollars and service explanations in a format these summaries can quote, supported by structured data that identifies your business and service area.' },
      { h: 'Structured data and entity optimization', p: 'Schema markup for your organization, locations, services, reviews and FAQs helps AI systems understand exactly who you are and where you work. We implement and test it across your site in every AI SEO project.' },
      { h: 'Measuring AI visibility', p: 'We track how often AI assistants mention your business for your most important questions, alongside rankings and traffic, so you can see where you appear today and how that changes each month.' },
      { h: 'Why it matters now', p: 'Independent research found that Google AI Overviews can reduce clicks to standard results by up to 58% (Ahrefs, 2026). Early adopters secure the recommendations; businesses that wait compete for a shrinking share of clicks.' },
    ],
  }
}

export function aiDeep(c?: CityWords): LongSection {
  const city = c ? ` in ${c.name}` : ''
  return {
    id: 'ai-agents', eyebrow: 'AI agents & AI receptionist', title: c ? `AI agents and AI receptionists for ${c.name} businesses` : 'AI receptionists and AI agents for Canadian small businesses',
    intro: `An AI agent is software that can hold a conversation, take an action and hand over to your team when needed. For local businesses${city}, the most valuable use is simple: answer every call and message immediately, book the job and never let a lead go cold.`,
    blocks: [
      { h: 'AI receptionist for small business', p: 'The AI receptionist answers calls in a natural voice, gives accurate answers about your services, hours and service area, and books appointments straight into your calendar. Urgent calls, such as a burst pipe or a furnace failure in January, are transferred to your team immediately.' },
      { h: 'AI dental and medical receptionist', p: 'Clinics use AI receptionists to book, reschedule and confirm appointments, answer questions about direct billing and insurance, and keep front-desk staff free for patients in the room. Sensitive health questions are always passed to your team.' },
      { h: 'Multilingual by design', p: 'Canadian cities are multilingual. Your AI agent can answer in English and French, and in Punjabi, Hindi, Mandarin, Cantonese, Tagalog, Arabic or Spanish where your customers need it, which is a real advantage in Brampton, Mississauga, Toronto and Calgary.' },
      { h: 'Built for your industry', p: 'HVAC and plumbing companies use AI agents to triage emergencies and book service calls. Clinics schedule consultations. Restaurants take reservations and orders. Law firms and immigration consultants qualify new enquiries before a licensed professional calls back.' },
      { h: 'What an AI receptionist costs', p: 'Cost depends on call volume, integrations and how much the agent needs to know. We scope it during the free audit and price it as a fixed monthly service in CAD, usually a fraction of the cost of another full-time hire.' },
    ],
  }
}

export function automationDeep(c?: CityWords): LongSection {
  return {
    id: 'automation', eyebrow: 'Business automation', title: c ? `Business automation services for ${c.name} companies` : 'Business automation services for Canadian small businesses',
    intro: 'Most small businesses lose hours every week copying data between apps, chasing payments and sending the same messages by hand. Workflow automation removes that work and makes every step faster and more reliable, while keeping your messaging compliant with Canadian consent rules.',
    blocks: [
      { h: 'Lead capture and routing', p: 'Every call, form, chat and ad lead lands in one CRM, is assigned to the right person and triggers an instant reply. Nothing sits in an inbox overnight.' },
      { h: 'Quotes, reminders and follow-ups', p: 'Estimates are generated from your price list, appointment reminders go out automatically and unanswered quotes receive timely follow-ups. Email and text messages are set up with the consent records Canada\'s Anti-Spam Legislation (CASL) requires.' },
      { h: 'Reviews on autopilot', p: 'After each completed job, customers receive a short message asking for a Google review. A steady flow of fresh reviews is one of the strongest local ranking signals, and it improves your Local Services Ads ranking as well.' },
      { h: 'Invoices, payments and reporting', p: 'Invoices with card and payment links, receipts and statements are sent automatically, and dashboards update themselves with leads, jobs, revenue and marketing cost, connected to tools such as QuickBooks Online, Jobber and Jane.' },
    ],
  }
}

export function adsCostGuide(c?: CityWords): LongSection {
  const city = c ? ` in ${c.name}` : ' in Canada'
  return {
    id: 'ads-cost', eyebrow: 'Google Ads cost guide', title: `How much does Google Ads cost${city}?`,
    intro: 'Google Ads is an auction, so the price of a click depends on your industry, your location and how many competitors are bidding. Canadian account averages sit between about $1 and $12 for most local services, while headline keywords in Toronto and Calgary cost several times more. All figures below are in Canadian dollars.',
    blocks: [
      { h: 'High-cost categories', p: 'Legal services average $8–30 a click nationally and $9–15 in Alberta, with Toronto personal injury terms at $80–150. Insurance and financial services run $6–20, mortgage brokers $25–60 on Toronto head terms, and cosmetic treatments $5–15. Precise targeting and strong landing pages matter most here (Consultus Digital, Hetman, Creative Scope, 2026).' },
      { h: 'Home services', p: 'HVAC, plumbing, roofing and electrical average about $4–12 a click across Canadian accounts and $5.50–9.50 in Alberta, but Calgary head terms reach $15–50 and GTA terms $15–30, rising to $30–50 in peak season. Local Services Ads leads in Toronto average about $39 for electricians, $51 for HVAC and $57 for plumbers.' },
      { h: 'Lower-cost categories', p: 'Restaurants and hospitality pay about $0.50–2 a click nationally, retail and e-commerce $0.50–3, education $2–5 and healthcare and dentistry $3–10. Cleaning services in Calgary run $5–15 on head terms. In these categories the opportunity is volume and repeat business.' },
      { h: 'Recommended starting budget', p: `Most Canadian local businesses that see steady results spend $1,000 to $5,000 a month in ad spend${city}, with $1,500 to $4,000 a sensible floor for home services and dental. Competitive professional services in Toronto or Calgary often need $5,000 or more. Use the calculator to estimate what your budget can return.` },
      { h: 'How we lower your cost per customer', p: 'We bid only on buyer keywords, target the postal codes you serve, block irrelevant searches every week, send traffic to dedicated landing pages, track every call and add Local Services Ads where your trade qualifies. SEO then adds free enquiries, which lowers your blended cost over time.' },
    ],
  }
}

export function seoGuide(c?: CityWords): LongSection {
  const city = c ? c.name : 'your city'
  return {
    id: 'local-seo-guide', eyebrow: 'Local SEO explained', title: c ? `How local SEO works in ${c.name}` : 'How local SEO works in Canada, and how long it takes',
    intro: 'Google ranks local businesses on three main factors: relevance (do you offer what was searched), distance (how close you are to the searcher) and prominence (how well known and trusted you are). Local SEO improves the factors you can control.',
    blocks: [
      { h: 'Google Business Profile', p: 'Correct categories, services, photos, weekly posts, accurate hours and holiday hours for Canada Day, Thanksgiving and Boxing Day make your profile relevant for more searches and more appealing to people comparing options.' },
      { h: 'Reviews and reputation', p: 'The number, quality and freshness of your Google reviews influence both rankings and the share of people who call you. A steady review system beats occasional bursts every time.' },
      { h: 'Website and neighbourhood pages', p: `Fast, mobile-friendly pages for each service and area you cover help Google understand where you work, from the centre of ${city} to the surrounding communities.` },
      { h: 'Canadian citations and links', p: 'Consistent listings on Canadian directories such as Yelp.ca, YellowPages.ca, Canada411 and industry associations, plus relevant local links, build prominence. Mismatched names, addresses or phone numbers hold rankings back.' },
      { h: 'Timeline', p: 'Most businesses see map rankings and calls improve within two to three months, with stronger gains by months four to six. Highly competitive trades in Toronto and Calgary can take longer.' },
    ],
  }
}

/* ---------------- industry playbooks (CAD data + city notes) ---------------- */
export const PLAYBOOKS: Playbook[] = [
  { id: 'hvac', name: 'HVAC and furnace companies', kw: 'HVAC marketing', data: 'About $9 per click nationally · Calgary head terms $15–50 · LSA about $51 per lead (Toronto)',
    base: 'Heating and cooling demand in Canada is driven by the weather. We combine Local Services Ads, search campaigns for repair and replacement, seasonal landing pages and an AI receptionist for no-heat calls at night.',
    city: { toronto: 'Toronto furnace replacements run $3,500–7,000 installed. We plan budgets before the first cold snap and July heat waves, when lead costs spike.', brampton: 'Newer subdivisions in Brampton bring steady furnace, AC and water heater rental replacements. We target homeowners in Castlemore, Sandalwood and Gore Meadows.', mississauga: 'Mississauga condos and older bungalows have very different HVAC needs. We build separate pages for ductless systems, heat pumps and furnace replacement.', calgary: 'Calgary cold snaps and chinook swings create sudden furnace demand. We scale no-heat campaigns within hours and run AC campaigns during summer heat.', alberta: 'Across Alberta, furnace repair is the priority from October to April. We add heat pump and rebate content where it applies.' } },
  { id: 'plumbing', name: 'Plumbers and drain services', kw: 'plumber marketing', data: 'About $9.50 per click nationally · LSA about $57 per lead, drain about $59 (Toronto)',
    base: 'Plumbing leads are urgent and arrive by phone. We prioritize click-to-call ads, Local Services Ads, emergency pages and 24/7 call answering so no flooded basement goes to a competitor.',
    city: { toronto: 'Older Toronto neighbourhoods have ageing pipes and sewer lines, which drives steady drain and backwater valve work. We target those high-value jobs.', brampton: 'Basement apartments and newer homes in Brampton create demand for water heaters, sump pumps and backflow work.', mississauga: 'We split Mississauga campaigns between condo plumbing and detached homes, which search very differently.', calgary: 'Frozen and burst pipes spike in Calgary cold snaps. We run emergency campaigns during deep freezes and maintenance offers in autumn.', alberta: 'Rural Alberta clients need well, septic and water treatment pages as well as standard plumbing services.' } },
  { id: 'roofing', name: 'Roofing and exteriors', kw: 'roofing company SEO', data: 'About $8.50 per click nationally · Calgary head terms $15–40 · roof replacement $9,000–15,000',
    base: 'One roof replacement can cover dozens of leads. We focus on storm-response pages, insurance claim guidance, financing messages and strong reviews to win high-value replacements and exterior work.',
    city: { calgary: 'Calgary sits in one of Canada\'s most hail-prone regions. We prepare hail damage and insurance pages before the season and scale ads within hours of a storm.', alberta: 'Hail and wind storms across central and southern Alberta create sudden demand. We target affected towns quickly with storm-specific campaigns.', toronto: 'Toronto roof replacements average $9,000–15,000. We target replacement, flat roof and eavestrough searches across the GTA.', brampton: 'Brampton\'s large stock of 1990s and 2000s homes is reaching roof-replacement age. We target those subdivisions directly.', mississauga: 'We separate residential roofing from commercial flat-roof work for Mississauga\'s business parks.' } },
  { id: 'legal', name: 'Law firms', kw: 'law firm SEO and personal injury lawyer marketing', data: 'Legal $8–30 per click nationally · Alberta $9–15 · Toronto injury head terms $80–150',
    base: 'Legal keywords are among the most expensive in Canada. We combine practice-area pages that follow Law Society advertising rules, Local Services Ads, intake call tracking and an AI agent that qualifies new enquiries before a lawyer calls back.',
    city: { toronto: 'Toronto has Canada\'s most competitive legal market. We target personal injury, family and real estate law by neighbourhood and focus budgets on terms that sign clients.', brampton: 'Brampton firms see strong demand for real estate, family, immigration and criminal defence law. We run multilingual intake where clients need it.', mississauga: 'Mississauga firms compete with downtown Toronto. We build local relevance around City Centre and the courthouse to win nearby clients.', calgary: 'Calgary legal clicks average $9–15. We target personal injury, family and real estate law across the four quadrants.', alberta: 'Firms in Edmonton, Red Deer and Lethbridge can rank across several towns with practice-area and community pages.' } },
  { id: 'immigration', name: 'Immigration consultants and lawyers', kw: 'immigration consultant marketing', data: 'About $9 per click · very competitive in Peel Region',
    base: 'Immigration clients research carefully and need to trust you before they call. We build a page for every pathway you handle, show your CICC or Law Society credentials, collect detailed reviews and answer enquiries in the client\'s language.',
    city: { brampton: 'Brampton is one of the most competitive immigration markets in Canada. Punjabi and Hindi pages and ads often lower the cost per lead.', mississauga: 'Mississauga clients search for study permits, work permits and family sponsorship. We create pathway pages that answer those questions clearly.', toronto: 'We target Toronto searches by pathway and language, from Express Entry to spousal sponsorship.', calgary: 'Calgary immigration enquiries often relate to work permits and the Alberta Advantage Immigration Program. We build content for both.', alberta: 'We help consultants across Alberta reach clients interested in provincial nomination and rural immigration streams.' } },
  { id: 'dental', name: 'Dentists and dental clinics', kw: 'dental marketing', data: 'About $6.50 per click nationally · "dentist near me" about $14.60 · Toronto and Calgary $8–25',
    base: 'A new patient is worth thousands of dollars over the years they stay. We run campaigns for high-value treatments, optimize each dentist\'s profile, highlight direct billing and use an AI receptionist to book outside office hours, all within your regulatory college\'s advertising rules.',
    city: { mississauga: 'Mississauga patients search by neighbourhood: Erin Mills, Square One, Hurontario and Heartland. We build pages and profile signals for each area you serve.', toronto: 'Toronto dental keywords are among the most expensive in Canada. We focus budgets on implants, Invisalign and emergency care, where the return is highest.', brampton: 'Families in Brampton look for dentists who speak their language and offer evening hours. We highlight both.', calgary: 'Calgary dental clicks rise in new communities such as Seton and Mahogany. We target new residents looking for a family dentist.', alberta: 'Alberta clinics benefit from community pages that capture searches from surrounding towns.' } },
  { id: 'clinics', name: 'Physiotherapy, RMT and chiropractic clinics', kw: 'physiotherapy clinic marketing', data: 'Healthcare $3–10 per click nationally · Alberta $3.50–6.50',
    base: 'Extended health benefits make these services part of many Canadians\' routines. We promote direct billing, online booking and condition-specific pages, and automate reminders that keep schedules full.',
    city: { mississauga: 'Searches such as "physiotherapy Mississauga OHIP covered" and "physiotherapy near Square One" show what patients need to know. We answer those questions on your pages.', toronto: 'Our GTA massage and physiotherapy client has 442 Google reviews and a top result with sitelinks. We apply the same review and content system to Toronto clinics.', brampton: 'We target sports injury, motor vehicle accident and workplace injury rehab searches across Brampton.', calgary: 'Calgary\'s active population drives demand for sports physio, RMT and chiropractic care.', alberta: 'We help clinics across Alberta reach patients in surrounding towns with community pages and reviews.' } },
  { id: 'auto', name: 'Auto repair, body and collision shops', kw: 'auto repair shop marketing', data: 'About $5–7 per click · our Richmond Hill client ranks first with 492 reviews',
    base: 'Auto repair leads are affordable and convert well. We optimize for service-specific searches such as brakes, tires, collision and seasonal tire changeovers, and use reviews and fast quotes to win the job.',
    city: { toronto: 'Our GTA auto repair client ranks first in the Richmond Hill map results for "auto repair in richmond hill". We apply the same approach across Toronto.', brampton: 'Brampton drivers search for "auto repair open Sunday" and "auto shop near me". We optimize hours, reviews and service pages for those searches.', mississauga: 'We target collision and body work near Mississauga\'s major routes and business parks.', calgary: 'Hail damage keeps Calgary body shops and paintless dent repair busy. We prepare hail campaigns and insurance pages before the season.', alberta: 'Long highway distances and winter conditions drive towing, glass and tire demand across Alberta.' } },
  { id: 'trucking', name: 'Truck driving schools and logistics', kw: 'truck driving school marketing', data: 'Logistics $4–7.50 per click in Alberta · AZ course $7,000–10,000',
    base: 'Driver training and logistics need two separate strategies: student recruitment and B2B customers. We keep those audiences apart so budgets are not wasted, and highlight MELT approval, pass rates and funding options for students.',
    city: { brampton: 'Brampton has many truck driving schools competing for the same students. Clear pricing, MELT approval, reviews and Punjabi-language content set you apart.', mississauga: 'Mississauga\'s logistics hub creates demand for freight, warehousing and fleet services. We build B2B lead campaigns that avoid job-seeker clicks.', calgary: 'Calgary schools compete for Class 1 students. We target Class 1 MELT, funding and job-placement searches.', alberta: 'Across Alberta, energy, agriculture and freight keep demand for Class 1 drivers and logistics services strong.', toronto: 'We target AZ licence and logistics searches across the GTA with separate campaigns for students and shippers.' } },
  { id: 'realestate', name: 'Realtors and mortgage brokers', kw: 'real estate marketing', data: 'Real estate $3–8 nationally · Toronto $5–18 · mortgage head terms $25–60',
    base: 'Real estate and mortgage clients compare carefully and take time to decide. We build neighbourhood guides, home-value and pre-approval funnels, and follow-up automation that keeps you in front of them until they are ready.',
    city: { toronto: 'Toronto buyers search by neighbourhood and condo building. Neighbourhood guides and listing alerts capture that interest early.', brampton: 'Brampton buyers often move up from condos and townhomes. We target first-time and move-up searches.', mississauga: 'Mississauga condo searches around Square One and Port Credit are strong. We build building and neighbourhood pages.', calgary: 'Calgary continues to attract buyers from other provinces. We create relocation guides that rank for out-of-province searches.', alberta: 'Edmonton and Red Deer realtors benefit from community and acreage pages that serve buyers across the region.' } },
  { id: 'restaurants', name: 'Restaurants and cafés', kw: 'restaurant marketing', data: 'About $0.50–2 per click nationally · Toronto $2–6',
    base: 'Restaurants have some of the cheapest clicks in Canada and depend on regular guests. We optimize the Google profile, menus, photos and reviews, and run local ads for orders, reservations and events.',
    city: { toronto: 'Toronto diners search by neighbourhood, cuisine and patio. We optimize for searches such as "restaurant near me open now" in each area.', brampton: 'Brampton\'s food scene is diverse. We optimize for cuisine-specific searches and late-night ordering.', mississauga: 'We target Port Credit, Streetsville and Square One diners with menu and patio content.', calgary: 'Calgary restaurants see big spikes during Stampede. We plan profile updates and ads for event weeks.', alberta: 'Restaurants in smaller Alberta towns can lead local search quickly with a strong profile and steady reviews.' } },
  { id: 'cleaning', name: 'Cleaning, snow removal and landscaping', kw: 'cleaning business marketing', data: 'Cleaning about $5 per click nationally · Calgary head terms $5–15',
    base: 'Recurring and seasonal contracts are worth far more than one visit. We promote seasonal contracts, collect reviews automatically and send reminders that keep customers booked year after year.',
    city: { calgary: 'Calgary snow removal contracts sell in September and October, and landscaping in spring. We time campaigns around both.', alberta: 'Across Alberta, seasonal contracts for snow and landscaping keep crews busy year-round when they are sold early.', toronto: 'Busy Toronto households book recurring cleaning. We promote plans rather than single visits.', brampton: 'Move-in and move-out cleaning is strong in Brampton\'s rental market.', mississauga: 'We target condo and office cleaning in Mississauga\'s City Centre and business parks.' } },
]

/* ---------------- FAQ ---------------- */
export function aiSearchFaq(c?: CityWords): Faq[] {
  const city = c ? ` in ${c.name}` : ''
  return [
    { q: c ? `What is AI SEO, and why does it matter for ${c.name} businesses?` : 'What is AI SEO?', a: 'AI SEO, also called generative engine optimization (GEO) or AI search optimization, is the work of making your business visible and recommended in AI assistants such as ChatGPT, Claude, Gemini, Perplexity and Google AI Overviews, alongside traditional Google rankings.' },
    { q: `How can my business rank in ChatGPT${city}?`, a: 'ChatGPT and similar assistants recommend businesses they can confirm across trusted sources. Consistent details on your website, Google Business Profile, Canadian directories and reviews, plus clear service and location content with structured data, give your business the best chance of being recommended.' },
    { q: c ? `How is AI SEO different from regular SEO in ${c.name}?` : 'Is AI SEO different from regular SEO?', a: 'It builds on the same foundations but puts more weight on clear answers, consistent business information across the web, structured data and reputation. We handle both together, so every improvement helps your Google rankings and your AI visibility.' },
  ]
}

export function extraFaq(c?: CityWords): Faq[] {
  const city = c ? ` in ${c.name}` : ''
  return [
    { q: `What is an AI receptionist and how does it help a small business${city}?`, a: 'An AI receptionist answers your calls in a natural voice, gives accurate information about your services, books appointments and texts you a summary. Every customer reaches someone immediately, even after hours, which turns more calls into booked jobs.' },
    { q: c ? `Can an AI receptionist answer ${c.name} callers in French or other languages?` : 'Can an AI receptionist answer in French or other languages?', a: 'Yes. AI agents can answer in English and French, and in many other languages including Punjabi, Hindi, Mandarin, Cantonese, Tagalog, Arabic and Spanish. We configure the languages your customers actually use.' },
    { q: c ? `How much does an AI receptionist cost for a ${c.name} business?` : 'How much does an AI receptionist cost in Canada?', a: 'It depends on call volume, integrations and how detailed the agent needs to be. We price it as a fixed monthly service in CAD after a free audit. For most businesses it costs far less than a full-time hire and works every hour of the day.' },
    { q: c ? `What business processes can you automate for ${c.name} companies?` : 'What business processes can you automate?', a: 'Common examples are lead capture and routing, quotes, appointment reminders, follow-ups, review requests, invoices and reporting. We map your current process first and automate the steps that take the most time, with CASL-compliant consent for email and text messages.' },
    { q: c ? `How do you choose which ${c.name} keywords to target?` : 'How do I know which keywords to target?', a: 'We research the searches Canadians actually use in your city, including high-value service keywords and lower-cost local and neighbourhood terms, then map each keyword to the page that should rank for it. This keyword plan is part of the free audit.' },
    { q: c ? `Can you improve the existing website of my ${c.name} business?` : 'Can you work with my existing website?', a: 'Yes. We can improve and optimize your current site or rebuild it if speed, structure or design are holding you back. Rankings are protected during any redesign.' },
    { q: c ? `What reports do ${c.name} clients receive?` : 'What reports will I receive?', a: 'A clear monthly report with rankings, website visitors, calls, leads, customers, cost per customer and revenue in CAD, plus a short call to agree the next steps.' },
    { q: c ? `Do ${c.name} clients have to sign a long contract?` : 'Do I have to sign a long contract?', a: 'No. We earn your business month by month with clear results. Pricing and terms are agreed after the free audit, before any work begins.' },
    { q: c ? `How quickly will my ${c.name} business see results?` : 'How quickly will I see results?', a: 'Google Ads and Local Services Ads can bring calls in the first weeks. Local SEO usually shows clear movement within two to three months and stronger results by months four to six.' },
  ]
}

/* ---------------- city extras ---------------- */
export const CITY_EXTRA: Record<string, CityExtra> = {
  toronto: { market: 'Toronto is Canada\'s largest city and the centre of a region of more than six million people. It also runs the most expensive local search auctions in the country: home-service head terms cost $15–30 a click and legal terms can pass $100. For a Toronto business, ranking in the map top three for its own neighbourhoods, answering every enquiry quickly and keeping paid search tightly targeted is the difference between a full calendar and an expensive month.',
    neighborhoods: 'We work with businesses in Downtown Toronto, the Financial District, Liberty Village, Leslieville, the Danforth, the Annex, Yorkville, Midtown, North York, Scarborough, Etobicoke and East York, and across the GTA in Richmond Hill, Markham, Vaughan, Pickering, Ajax, Mississauga and Oakville.',
    keywords: ['seo company toronto', 'local seo company toronto', 'seo services toronto', 'ai seo agency toronto', 'ppc agency toronto', 'web design company toronto', 'AI receptionist Toronto', 'dental seo company toronto'] },
  brampton: { market: 'Brampton is one of Canada\'s fastest-growing and most diverse cities, with a young population and strong demand for immigration services, driver training, auto repair, healthcare, real estate and home services. Customers often compare several options and trust businesses that speak their language and answer quickly. Local SEO, multilingual content and fast response give Brampton businesses a clear advantage.',
    neighborhoods: 'We serve businesses in Downtown Brampton, Bramalea, Springdale, Heart Lake, Mount Pleasant, Castlemore, Sandalwood, Fletcher\'s Meadow, Gore Meadows and Credit Valley, as well as Caledon, Malton and the rest of Peel Region.',
    keywords: ['seo company brampton', 'local seo brampton', 'seo services brampton', 'web design company brampton', 'digital marketing agency brampton', 'immigration consultant marketing Brampton', 'truck driving school marketing Brampton', 'AI receptionist Brampton'] },
  mississauga: { market: 'Mississauga combines established neighbourhoods, busy commercial centres and one of Canada\'s largest logistics and corporate districts around Toronto Pearson. Customers search by neighbourhood and compare reviews carefully, while B2B buyers research suppliers in depth. Our Mississauga SEO work builds neighbourhood relevance for consumer businesses and focused lead generation for B2B and logistics companies.',
    neighborhoods: 'We serve businesses in Port Credit, Streetsville, Meadowvale, Erin Mills, Churchill Meadows, City Centre and Square One, Cooksville, Clarkson, Lorne Park, Malton and Heartland, and nearby in Oakville, Milton and Brampton.',
    keywords: ['mississauga seo agency', 'seo company mississauga', 'local seo mississauga', 'website development mississauga', 'google ads agency mississauga', 'physiotherapy clinic marketing Mississauga', 'dental marketing Mississauga', 'trucking company marketing Mississauga'] },
  calgary: { market: 'Calgary is one of Canada\'s fastest-growing cities, drawing new residents from across the country and the world. Severe hail, sudden cold snaps and a strong construction and renovation market create constant demand for roofing, HVAC, plumbing, auto body and basement development, while an active population supports clinics, salons and fitness studios. With part of our team based in Calgary, we plan campaigns around the city\'s quadrants, communities and seasons.',
    neighborhoods: 'We work with businesses in Downtown Calgary, the Beltline, Kensington, Inglewood, Bridgeland, Mission and Marda Loop, and across the NW, NE, SW and SE communities including Tuscany, Evanston, Saddle Ridge, Panorama Hills, Seton and Mahogany, plus Airdrie, Cochrane, Okotoks and Chestermere.',
    keywords: ['seo company calgary', 'local seo services calgary', 'web design company calgary', 'google ads calgary', 'digital marketing agency calgary', 'roofing marketing Calgary', 'AI receptionist Calgary', 'small business marketing calgary'] },
  alberta: { market: 'Alberta is one of the fastest-growing provinces in Canada, with strong energy, construction, agriculture, logistics and service sectors. Outside Calgary and Edmonton, many markets have lower click costs and fewer strong competitors, which makes local SEO especially effective. We help businesses that serve several towns build visibility across their entire territory.',
    neighborhoods: 'We work with businesses in Edmonton, St. Albert, Sherwood Park, Spruce Grove and Leduc; in Red Deer, Lacombe and Sylvan Lake; in Lethbridge and Medicine Hat; in Grande Prairie and Fort McMurray; and in the Calgary region including Airdrie, Cochrane, Okotoks and Canmore.',
    keywords: ['alberta seo agency', 'seo company alberta', 'seo edmonton', 'web design edmonton', 'digital marketing agencies edmonton', 'local seo red deer', 'google ads lethbridge', 'AI receptionist Alberta'] },
}

/* ---------------- city-unique content ---------------- */
export const CITY_UNIQUE: Record<string, CityUniqueContent> = {
  toronto: {
    seo: [
      { h: 'Proximity rules in a dense city', p: 'In Toronto, a business two kilometres away can be invisible in the map results. As a Toronto SEO company, we build neighbourhood pages, service-area settings and reviews that mention the areas you serve, from the Annex to Scarborough, so you rank where your customers are.' },
      { h: 'Competing with franchises and lead sellers', p: 'National brands and lead-generation sites spend heavily in Toronto. Independent businesses win with genuine local proof: real photos, detailed reviews, local project pages and fast answers that a call centre cannot match.' },
      { h: 'Dental, legal and home-service SEO', p: 'Searches like "dental seo company toronto" and "local seo company toronto" show how specialized the market is. We tailor SEO to each industry\'s rules and buying habits rather than applying one template.' },
    ],
    ads: [
      { h: 'Toronto proper versus the suburbs', p: 'Downtown and Toronto proper cost more per click than the suburban GTA. We split campaigns by area and adjust bids where your best customers live, rather than paying downtown prices everywhere.' },
      { h: 'Peak-season planning', p: 'Legal and home-service clicks in Toronto rise 20–40% in spring and late autumn. We set budgets and landing pages ahead of those peaks so you stay visible without overpaying.' },
      { h: 'Local Services Ads first for urgent trades', p: 'For urgent work, Local Services Ads often deliver cheaper enquiries than search clicks. Toronto LSA leads average about $39 for electricians, $51 for HVAC and $57 for plumbers.' },
    ],
    ai: [
      { h: 'AI receptionists for busy GTA teams', p: 'GTA crews spend hours in traffic and on site. An AI receptionist answers every call, books routine jobs and passes emergencies to your team, so no lead is lost on the 401.' },
      { h: 'Showing up in Toronto AI answers', p: 'When Torontonians ask ChatGPT or Google AI Overviews for the best clinic or contractor in their neighbourhood, consistent listings, clear service pages and reviews that mention the area help AI tools name your business.' },
    ],
    services: { 'local-seo': 'Neighbourhood pages from Etobicoke to Scarborough, plus York Region.', 'google-ads': 'Area-split campaigns that avoid paying downtown prices everywhere.', 'web-design': 'Fast, accessible websites built for AODA and GTA mobile users.', 'ai-agents': 'Multilingual AI receptionists for busy GTA teams.', automation: 'Dispatch and follow-up workflows for crews covering the whole GTA.', ai: 'AI visibility for Toronto questions in ChatGPT and Google AI Overviews.' },
    faq: [
      { q: 'Are you an SEO company in Toronto or a remote agency?', a: 'We work with Toronto and GTA businesses remotely, with regular video calls, shared dashboards and monthly reporting. Our Canadian team is based in Calgary, and we plan every Toronto campaign around your neighbourhoods and competitors.' },
      { q: 'Can a new Toronto business rank quickly?', a: 'New businesses can get enquiries quickly through Google Ads and Local Services Ads while local SEO builds. With a complete profile, steady reviews and neighbourhood pages, most see map rankings improve within a few months.' },
      { q: 'Beyond Toronto, do you work with businesses in York Region and Durham?', a: 'Yes. We work across the GTA, including Richmond Hill, Markham, Vaughan, Pickering and Ajax. Our Richmond Hill auto repair client ranks first in the map results for its main search.' },
      { q: 'Which Toronto industries do you work with most?', a: 'HVAC, plumbing and renovation, dental and physiotherapy clinics, law firms, auto repair and body shops, restaurants and professional services.' },
    ],
  },
  brampton: {
    seo: [
      { h: 'Language-aware local SEO', p: 'Many Brampton residents search in English but read and decide in Punjabi, Hindi or Urdu. As a Brampton SEO company, we add multilingual content where it helps, so families understand your services and trust you before they call.' },
      { h: 'Reviews that mention the community', p: 'Reviews that mention Bramalea, Springdale or Castlemore strengthen your relevance in those areas. Our review system asks customers for honest, detailed feedback after every job.' },
      { h: 'Competing in crowded categories', p: 'Immigration, driving schools, real estate and auto repair are crowded in Brampton. Clear credentials, transparent pricing and fast replies help you stand out from dozens of similar listings.' },
    ],
    ads: [
      { h: 'Multilingual campaigns', p: 'We test Punjabi and Hindi ads alongside English campaigns. In some categories, language-specific ads reach motivated customers at a lower cost per lead.' },
      { h: 'Separating students from customers', p: 'For driving schools and logistics companies, we keep student, job-seeker and customer searches in separate campaigns so each budget reaches the right audience.' },
      { h: 'Evening and weekend coverage', p: 'Many Brampton customers research after work and on weekends. We schedule ads and AI call answering for those hours so you are available when they are ready.' },
    ],
    ai: [
      { h: 'Multilingual AI receptionist', p: 'An AI receptionist that answers in English, Punjabi or Hindi makes every caller feel understood, books appointments and sends your team a clear summary in English.' },
      { h: 'AI answers for Brampton searches', p: 'When people ask AI tools for the best immigration consultant or auto shop in Brampton, consistent listings and detailed reviews help your business appear in the answer.' },
    ],
    services: { 'local-seo': 'Visibility across Bramalea, Springdale, Castlemore and the rest of Peel.', 'google-ads': 'English, Punjabi and Hindi campaigns tested side by side.', 'web-design': 'Mobile-first websites with WhatsApp chat and booking.', 'ai-agents': 'AI receptionists that answer in your customers\' language.', automation: 'Follow-ups and reminders that keep busy enquiries moving.', ai: 'AI visibility for Brampton questions in ChatGPT and Gemini.' },
    faq: [
      { q: 'Do you work with truck driving schools in Brampton?', a: 'Yes. We help driving schools rank for AZ and DZ licence searches, highlight MELT approval and funding options, and keep student and job-seeker searches in separate campaigns.' },
      { q: 'Can you help my Brampton auto shop rank for "open Sunday" searches?', a: 'Yes. Accurate hours, service pages and reviews help you appear for searches such as "auto repair Brampton open Sunday" and "auto shop near me".' },
      { q: 'Beyond Brampton, do you serve Caledon and Malton?', a: 'Yes. We work across Peel Region, including Caledon, Malton and Mississauga.' },
      { q: 'Which Brampton industries do you work with most?', a: 'Immigration consultants, truck driving schools, auto repair, legal services, healthcare, real estate, restaurants and home services.' },
    ],
  },
  mississauga: {
    seo: [
      { h: 'Neighbourhood relevance', p: 'Mississauga searches are highly local: "dentist Erin Mills", "physiotherapy Meadowvale", "restaurant Port Credit". As a Mississauga SEO agency, we build pages and profile signals for each community you serve.' },
      { h: 'Consumer and B2B strategies', p: 'Clinics and home services need map visibility and reviews, while logistics and B2B firms need detailed service pages and case studies. We plan each separately so neither audience is shortchanged.' },
      { h: 'Competing with Toronto', p: 'Many Mississauga customers also see Toronto businesses in results. Strong local signals and proximity help Mississauga businesses win nearby customers who prefer not to cross the city.' },
    ],
    ads: [
      { h: 'Postal-code targeting', p: 'We target the Mississauga postal codes you actually serve and adjust bids by area, so you are not paying for clicks from across the GTA.' },
      { h: 'Healthcare campaigns that follow the rules', p: 'Clinic ads follow Google\'s healthcare policies and your regulatory college\'s advertising rules, focusing on services, direct billing and booking rather than claims.' },
      { h: 'B2B lead generation', p: 'For logistics and corporate services, we build lead-generation campaigns with clear offers and track leads through to signed contracts.' },
    ],
    ai: [
      { h: 'AI receptionists for clinics', p: 'An AI receptionist books, reschedules and confirms appointments, answers direct-billing questions and frees front-desk staff for patients in the clinic.' },
      { h: 'AI visibility for local questions', p: 'When residents ask AI tools which physiotherapy clinic near Square One offers direct billing, clear service pages and consistent profiles help your clinic be named.' },
    ],
    services: { 'local-seo': 'Neighbourhood pages for Port Credit, Streetsville, Erin Mills and Meadowvale.', 'google-ads': 'Postal-code campaigns for consumer and B2B customers.', 'web-design': 'Website development with booking, portals and fast load times.', 'ai-agents': 'AI receptionists that book and confirm clinic appointments.', automation: 'Reminders, recalls and review requests that keep schedules full.', ai: 'AI visibility for Mississauga questions in ChatGPT and Google AI Overviews.' },
    faq: [
      { q: 'Do you work with logistics companies in Mississauga?', a: 'Yes. We build B2B websites, case studies and lead-generation campaigns for trucking, warehousing and logistics firms, keeping job-seeker traffic out of customer campaigns.' },
      { q: 'Can you help my Mississauga restaurant get more orders?', a: 'Yes. We optimize your Google profile, menu, photos and reviews and run local ads for orders, reservations and events in your neighbourhood.' },
      { q: 'Beyond Mississauga, do you serve Oakville and Milton?', a: 'Yes. We work with businesses across Halton and Peel, including Oakville, Milton and Brampton.' },
      { q: 'Which Mississauga industries do you work with most?', a: 'Dental, physiotherapy and RMT clinics, home services, logistics and B2B services, restaurants, legal and real estate.' },
    ],
  },
  calgary: {
    seo: [
      { h: 'Quadrant and community pages', p: 'Calgary customers search by quadrant and community. As a Calgary SEO company, we build pages for the communities you serve, from Tuscany and Evanston to Seton and Mahogany, and set your service area correctly.' },
      { h: 'Ready before the storm', p: 'Hail, wind and cold snaps change demand overnight. We publish storm and emergency content in advance so it is already ranking when customers start searching.' },
      { h: 'Proof from Calgary', p: 'A Calgary beauty and spa business we support is the first business listing for "beauty & spa in calgary", directly beneath the only paid ad, with a 4.9 rating from 90 reviews.' },
    ],
    ads: [
      { h: 'Realistic Calgary budgets', p: 'Alberta account averages run about $5.50–9.50 a click for home services, but Calgary head terms for plumbing, HVAC and roofing reach $15–50. We mix head terms with longer, cheaper searches to keep your cost per lead under control.' },
      { h: 'Hail-response campaigns', p: 'Roofing, siding, eavestrough, auto body and glass campaigns are prepared before hail season and launched within hours of a storm.' },
      { h: 'Stampede and seasonal planning', p: 'Restaurants, salons and event businesses see big swings around Stampede and the holidays. We adjust budgets and messaging for those weeks.' },
    ],
    ai: [
      { h: 'AI receptionists for storm surges', p: 'After a hail storm, roofers and body shops can receive more calls in a day than in a week. An AI receptionist answers every caller, books inspections and organizes leads for your team.' },
      { h: 'AI visibility for newcomers', p: 'New Calgarians ask AI assistants for trusted providers. Consistent, detailed information helps your business be named in those answers.' },
    ],
    services: { 'local-seo': 'Community pages across all four quadrants, plus Airdrie and Cochrane.', 'google-ads': 'Hail-response and seasonal campaigns with realistic Calgary budgets.', 'web-design': 'Website design for Calgary businesses, built fast and mobile-first.', 'ai-agents': 'AI receptionists that handle post-storm call surges.', automation: 'Inspection booking, estimates and follow-ups that run themselves.', ai: 'AI visibility for Calgary questions in ChatGPT, Claude and Gemini.' },
    faq: [
      { q: 'Can you meet Calgary clients in person?', a: 'Most meetings take place by video call so we can share dashboards and screens easily. Part of our team is based in Calgary, so we know the market first-hand.' },
      { q: 'Do you work with Calgary basement development and renovation companies?', a: 'Yes. Basement development and legal suites are a large market in Calgary. We build project galleries, financing and permit content and campaigns that target homeowners planning a renovation.' },
      { q: 'Beyond Calgary, do you serve Airdrie, Cochrane and Okotoks?', a: 'Yes. We work across the Calgary region, including Airdrie, Cochrane, Okotoks and Chestermere.' },
      { q: 'Which Calgary industries do you work with most?', a: 'Roofing and exteriors, HVAC and plumbing, renovation and basements, auto body and glass, beauty and wellness, dental and physiotherapy clinics, and restaurants.' },
    ],
  },
  alberta: {
    seo: [
      { h: 'Visibility across a whole territory', p: 'Alberta businesses often serve several towns. As an Alberta SEO agency, we create town pages, set service areas and build citations so you rank across your whole territory.' },
      { h: 'Edmonton and the capital region', p: 'Edmonton, St. Albert, Sherwood Park and Spruce Grove each have their own searches. We target them individually so you appear wherever your customers live.' },
      { h: 'Smaller markets, faster wins', p: 'In Red Deer, Lethbridge, Medicine Hat and Grande Prairie, there are fewer strong competitors. A complete profile, steady reviews and a fast website can move you to the top quickly.' },
    ],
    ads: [
      { h: 'Lower click costs outside the big cities', p: 'Clicks in smaller Alberta markets usually cost less than in Calgary and Edmonton. We use that advantage to bring leads at a lower cost while SEO builds.' },
      { h: 'Energy, agriculture and B2B', p: 'For oilfield services, agriculture equipment and B2B companies, we build campaigns aimed at buyers and procurement teams rather than consumers.' },
      { h: 'Weather-driven demand', p: 'Hail, wind and winter conditions drive sudden demand for roofing, glass, towing and heating across Alberta. We prepare campaigns in advance and launch them quickly.' },
    ],
    ai: [
      { h: 'AI receptionists for remote crews', p: 'Crews working far from the office cannot always answer the phone. An AI receptionist answers every call, books jobs and texts your team the details.' },
      { h: 'AI visibility across Alberta', p: 'When customers ask AI tools for providers in their town, consistent listings and town-specific content help your business appear in the answer.' },
    ],
    services: { 'local-seo': 'Town pages and citations across Edmonton, Red Deer, Lethbridge and beyond.', 'google-ads': 'Lower-cost campaigns in smaller Alberta markets.', 'web-design': 'Websites that serve customers across several towns.', 'ai-agents': 'AI receptionists for crews working far from the office.', automation: 'Dispatch, quotes and follow-ups for multi-town service areas.', ai: 'AI visibility for Alberta questions in ChatGPT and Google AI Overviews.' },
    faq: [
      { q: 'Do you work with Alberta businesses in Red Deer and Lethbridge?', a: 'Yes. We work with businesses across Alberta, including Red Deer, Lethbridge, Medicine Hat, Grande Prairie and Fort McMurray.' },
      { q: 'Can you help Alberta oilfield and B2B companies?', a: 'Yes. We build B2B websites, case studies and lead-generation campaigns for energy services, equipment and logistics companies.' },
      { q: 'Do you serve the Alberta capital region around Edmonton?', a: 'Yes. Beyond Edmonton itself, we work with businesses in St. Albert, Sherwood Park, Spruce Grove, Leduc and Fort Saskatchewan.' },
      { q: 'Which Alberta industries do you work with most?', a: 'Trades and home services, renovation, automotive, healthcare, legal, agriculture and energy services, and restaurants.' },
    ],
  },
}
