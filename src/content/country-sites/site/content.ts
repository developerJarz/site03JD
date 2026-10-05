// Copy, keywords and SEO metadata for the Jarz Digital USA homepage and city landing pages.
// Keywords come from Google autocomplete and "People also ask" research (Oct 2026), US results.
export const SITE = 'https://www.jarzdigital.com'
export const BRAND = 'Jarz Digital'
export const PHONE_DISPLAY = '+880 1677-248045'
export const PHONE_TEL = '+8801677248045'
export const WHATSAPP = 'https://wa.me/8801677248045'
export const EMAIL = 'jarzdigital36@gmail.com'
export const FACEBOOK = 'https://www.facebook.com/search/top?q=jarz%20digital'
export const WA_MESSAGE = 'Hi Jarz Digital, I would like a free growth plan for my business.'
export const DALLAS_ADDRESS = { street: '1024 Alyssa Ln', city: 'Carrollton', region: 'TX', zip: '75006', country: 'US' }

export interface Service { id: string; icon: string; name: string; tagline: string; body: string; includes: string[]; result: string }

export const SERVICES: Service[] = [
  { id: 'local-seo', icon: 'pin', name: 'Local SEO & Google Maps', tagline: 'Show up in the top 3 when nearby customers search.',
    body: 'Most local customers pick a business from the Google Maps pack without scrolling further. Our local SEO services get your Google Business Profile, website and reviews working together, so you rank for the services you sell in the cities you serve.',
    includes: ['Google Business Profile optimization and weekly posts', 'Local citations and consistent name, address and phone', 'Service and city pages that rank', 'Review requests and replies', 'Map ranking reports for every keyword'],
    result: 'More calls and direction requests from Google Maps, without paying per click.' },
  { id: 'google-ads', icon: 'ads', name: 'Google Ads management', tagline: 'Ads that bring phone calls, not just clicks.',
    body: 'We build and manage Google Search, Performance Max and Local Services Ads around buyer keywords only. Every call and form is tracked, wasted searches are blocked each week, and budget moves to the ads that bring customers.',
    includes: ['Search, Maps and Local Services Ads setup', 'Landing pages built for calls and bookings', 'Call and conversion tracking', 'Weekly keyword and budget optimization', 'Monthly report on leads, customers and cost'],
    result: 'Leads from the first month, at a cost per customer you can see.' },
  { id: 'seo', icon: 'search', name: 'Website SEO', tagline: 'Rank your website for the searches that sell.',
    body: 'Technical fixes, on-page optimization and content that answers what your customers search for. All of our SEO work is done by hand, with no shortcuts that put your site at risk.',
    includes: ['Keyword research and a keyword-to-page plan', 'Technical SEO: speed, Core Web Vitals, indexing', 'On-page titles, headings and internal links', 'Blog and service content written for people', 'Quality backlinks from relevant sites'],
    result: 'Free organic visitors that grow every month.' },
  { id: 'web-design', icon: 'browser', name: 'Website design & development', tagline: 'Fast, good-looking sites that turn visitors into customers.',
    body: 'Custom websites built in React, Next.js, WordPress or Shopify. Mobile-first, quick to load and structured for SEO from day one, with click-to-call, quote forms and booking where your customers need them.',
    includes: ['Custom design, no cookie-cutter templates', 'Mobile-first and fast-loading', 'SEO-ready structure and schema markup', 'Click-to-call, forms and online booking', 'Free graphics and SEO content with every build'],
    result: 'A website that wins trust in seconds and gets more people to call.' },
  { id: 'web-apps', icon: 'app', name: 'Web app development', tagline: 'Custom tools that save hours every week.',
    body: 'When a website is not enough, we build web applications: customer portals, booking systems, quote calculators, dashboards and internal tools that connect to the software you already use.',
    includes: ['Online booking and scheduling', 'Customer and client portals', 'Quote and price calculators', 'Dashboards and reporting', 'Integrations with your CRM and tools'],
    result: 'Less admin, faster service and a better customer experience.' },
  { id: 'ai', icon: 'spark', name: 'AI SEO & AI search optimization', tagline: 'Get recommended by ChatGPT, Claude, Gemini and Google AI Overviews.',
    body: 'AI assistants now answer questions before people click. Our AI SEO and generative engine optimization (GEO) services make your business the one ChatGPT, Claude, Gemini, Perplexity and Google AI Overviews recommend for your services and city.',
    includes: ['ChatGPT SEO and AI assistant visibility', 'Google AI Overviews optimization', 'Structured data and entity optimization', 'Consistent business information across the web', 'Monthly AI visibility tracking'],
    result: 'Your business named in AI answers, where competitors are often missing.' },
  { id: 'social', icon: 'chat', name: 'Social media marketing', tagline: 'Stay visible and trusted where your customers scroll.',
    body: 'Consistent posts, short videos and targeted Facebook and Instagram ads that keep your brand in front of local customers and bring past visitors back.',
    includes: ['Content plan and branded post designs', 'Short-form videos and reels', 'Facebook and Instagram ads', 'Retargeting for website visitors', 'Comment and message management'],
    result: 'A brand people recognize, and cheaper repeat customers.' },
  { id: 'management', icon: 'chart', name: 'Monthly business management', tagline: 'One team that runs your whole online presence.',
    body: 'Website updates, Google profile, ads, SEO, social media and reporting handled every month by one team, so you can focus on running the business.',
    includes: ['Website updates and maintenance', 'Google Business Profile management', 'Ads, SEO and social in one plan', 'Monthly strategy call', 'One report with the numbers that matter'],
    result: 'Steady growth without hiring or managing an in-house team.' },
  { id: 'software', icon: 'code', name: 'Custom software development', tagline: 'Software built around how your business works.',
    body: 'From inventory and job tracking to custom CRMs, our developers build software that fits your process instead of forcing you to change it.',
    includes: ['Requirements and process mapping', 'Custom CRM and job management', 'Secure cloud hosting', 'Ongoing support and updates', 'Training for your team'],
    result: 'Systems that grow with you as you add staff and locations.' },
  { id: 'graphics', icon: 'brush', name: 'Graphic design & branding', tagline: 'A brand that looks as good as your work.',
    body: 'Logos, brand kits, ad creatives and social graphics, included free with every service so your ads, website and profiles look consistent.',
    includes: ['Logo and brand kit', 'Ad and social media creatives', 'Website graphics and banners', 'Print-ready designs', 'Video thumbnails and covers'],
    result: 'A professional, consistent look everywhere customers see you.' },
]

export interface Faq { q: string; a: string }

export const HOME_FAQ: Faq[] = [
  { q: 'How much does local SEO cost for a small business?', a: 'It depends on how competitive your trade and city are, and how many locations you serve. A plumber in a small town needs less work than a personal injury firm in Dallas. We give you a fixed monthly price after a free audit of your Google profile, website and competitors, so you know the cost before you start.' },
  { q: 'Is $10 a day enough for Google Ads?', a: 'For most local service businesses, no. At US averages of about $5 to $12 per click, $300 a month buys roughly 25 to 60 clicks, which is often only a handful of leads. Most local businesses spend $1,000 to $2,000 a month. Use the calculator on this page to see what a budget can bring in your category.' },
  { q: 'How much should I pay someone to manage my Google Ads?', a: 'Management is usually a monthly fee on top of what you pay Google. What matters more is the cost per customer you end up with. We quote a flat monthly fee after reviewing your account, and every report shows leads, customers and revenue, not just clicks.' },
  { q: 'How long does local SEO take to work?', a: 'Most businesses see their Google Maps rankings and calls start to move within 2 to 3 months, with bigger gains by months 4 to 6. Ads bring leads from the first month while SEO builds, which is why we usually run both.' },
  { q: 'Is SEO still worth it in 2026 with AI search?', a: 'Yes, and it has changed. Google AI Overviews and ChatGPT pull answers from well-structured, trusted websites and Google Business Profiles. We optimize for classic rankings and for AI answers, so your business is named in both.' },
  { q: 'What is the difference between Google Ads and Local Services Ads?', a: 'Google Search Ads charge per click and show for the keywords you choose. Local Services Ads charge per lead, show at the very top with a Google Verified badge, and are available for trades like HVAC, plumbing, roofing and legal services. We usually run both for the best mix of cost and volume.' },
  { q: 'Do you only work with businesses in Dallas?', a: 'No. Our US team is based in the Dallas area, and we work with local businesses across the country, including Miami, Baltimore and Denver. Everything is done remotely with regular video calls and clear reports.' },
  { q: 'Can you build our website and run the marketing too?', a: 'Yes. Our own designers and developers build websites and web apps, and the same team runs your SEO, ads and social media. One team means the website is built to convert the traffic we send to it.' },
]

export interface City {
  id: string; slug: string; name: string; state: string; stateCode: string; region: string
  title: string; description: string; h1: string; kicker: string
  intro: string[]; market: { h: string; p: string }[]; areas: string[]
  calcCat: string; proof?: { img: string; alt: string; caption: string; width: number; height: number }
  faq: Faq[]; keywords: string[]; geo: { lat: number; lng: number }
  display?: string   // how the place is written in headings, e.g. 'Toronto, ON' (default) or 'Alberta'
  brand?: string     // primary keyword phrase for this page, e.g. 'SEO company in Toronto'
}

export const CITIES: City[] = [
  { id: 'dallas', slug: 'dallas-tx', name: 'Dallas', state: 'Texas', stateCode: 'TX', region: 'Dallas–Fort Worth',
    title: 'Dallas SEO Company & Google Ads Agency | Jarz Digital',
    description: 'Dallas SEO company for local businesses. Local SEO, Google Ads management and web design in Dallas, TX that bring calls, leads and customers. Free audit.',
    h1: 'Dallas SEO company and Google Ads agency',
    kicker: 'Local SEO · Google Ads · Web design in Dallas, TX',
    intro: [
      'Jarz Digital is a Dallas SEO company and Google Ads agency founded in the Dallas area, with our US team based in Carrollton. We help Dallas–Fort Worth businesses rank on Google Maps and in AI search and run Google Ads that bring phone calls. We also answer every lead with AI agents and build websites that turn visitors into booked jobs.',
      'DFW is one of the most competitive local search markets in the country. Home service, legal and medical businesses here bid against hundreds of competitors for the same customers, so wasted clicks get expensive fast. Our job is to make every dollar bring a customer.',
    ],
    market: [
      { h: 'Built for a big, spread-out metro', p: 'Customers in Plano, Frisco and Arlington search differently from customers in Uptown or Oak Cliff. We build city and suburb pages and target ads by area, so you show up where your trucks actually go.' },
      { h: 'Heat means HVAC and roofing compete hard', p: 'Texas summers and spring storms drive huge demand for AC repair, roofing and plumbing. We plan budgets around those peaks so you are at the top when the calls spike.' },
      { h: 'Local Services Ads for trades', p: 'For HVAC, plumbing, electrical and roofing, we pair Google Search Ads with Local Services Ads so you appear with the Google Verified badge at the very top of results.' },
    ],
    areas: ['Dallas', 'Fort Worth', 'Plano', 'Frisco', 'Irving', 'Arlington', 'Carrollton', 'Garland', 'McKinney', 'Richardson', 'Denton', 'Grand Prairie'],
    calcCat: 'hvac',
    faq: [
      { q: 'Do you have an office in Dallas?', a: 'Yes. Our US team works from 1024 Alyssa Ln, Carrollton, TX 75006, in the Dallas–Fort Worth area, and works with clients across DFW.' },
      { q: 'How much do Google Ads cost in Dallas?', a: 'Dallas clicks for home services often cost more than the national averages of about $8 to $13 because the market is so competitive. The calculator on this page uses national benchmarks; we check your exact Dallas keywords in a free audit.' },
      { q: 'Can you help my Dallas business rank in the suburbs too?', a: 'Yes. We build pages and Google Business Profile content for each area you serve, from Plano and Frisco to Arlington and Fort Worth, so you can rank beyond one zip code.' },
    ],
    keywords: ['dallas seo company', 'local seo agency dallas', 'google ads agency dallas', 'web design dallas tx', 'digital marketing agency dallas tx'],
    geo: { lat: 32.7767, lng: -96.797 } },
  { id: 'miami', slug: 'miami-fl', name: 'Miami', state: 'Florida', stateCode: 'FL', region: 'South Florida',
    title: 'Miami SEO Company, Google Ads & Web Design | Jarz Digital',
    description: 'Local SEO services in Miami, FL. We ranked a Miami car customization shop #1 on Google Maps. Google Ads and web design that bring calls. Free audit.',
    h1: 'Local SEO services, Google Ads and web design in Miami',
    kicker: 'Miami, FL · Local SEO · Google Ads · Web design',
    intro: [
      'We helped a Miami auto body and car customization shop reach the number one spot on Google for "car customization Miami", ahead of competitors with far more reviews. The same local SEO system works for any Miami business that depends on nearby customers.',
      'Miami is a fast, mobile-first market where people search, compare a few reviews and call within minutes. Our local SEO services in Miami, together with Google Ads, AI agents and web design, make sure your business is the one they find, trust and call.',
    ],
    market: [
      { h: 'Neighborhood-level targeting', p: 'Brickell, Coral Gables, Hialeah, Doral and Miami Beach behave like separate markets. We target ads and build pages by area so you are not paying for clicks from places you do not serve.' },
      { h: 'Reviews win in Miami', p: 'Customers here read reviews before they call. We set up automatic review requests and professional replies so your rating and review count keep climbing.' },
      { h: 'Fast answers, day and night', p: 'Many Miami searches happen in the evening. AI replies answer every lead in seconds, so you do not lose late-night customers to a competitor.' },
    ],
    areas: ['Miami', 'Miami Beach', 'Brickell', 'Coral Gables', 'Hialeah', 'Doral', 'Kendall', 'Homestead', 'Miami Gardens', 'North Miami', 'Aventura', 'Fort Lauderdale'],
    calcCat: 'autobody',
    proof: { img: '/img/miami-car-customization-google-maps-1st-place.jpg', alt: 'Google Maps results for "car customization miami" showing a Jarz Digital client in first place', caption: '"car customization miami": our client ranks first of all Miami businesses (client name hidden).', width: 1600, height: 975 },
    faq: [
      { q: 'Can you get my Miami business into the Google Maps top 3?', a: 'That is exactly what our local SEO work targets. Results depend on competition and your location, but our Miami client reached number one for its main search. We show you where you rank today in a free audit.' },
      { q: 'Do you manage Google Ads for Miami businesses?', a: 'Yes. We run Search Ads and Local Services Ads targeted by neighborhood, with call tracking so you can see which areas bring customers.' },
      { q: 'Do you build websites for Miami companies?', a: 'Yes. We design fast, mobile-first websites with click-to-call and booking, built to rank for Miami searches from day one.' },
    ],
    keywords: ['miami seo company', 'local seo services miami', 'google ads agency miami', 'web design miami fl', 'digital marketing agency miami fl'],
    geo: { lat: 25.7617, lng: -80.1918 } },
  { id: 'baltimore', slug: 'baltimore-md', name: 'Baltimore', state: 'Maryland', stateCode: 'MD', region: 'Baltimore metro',
    title: 'Baltimore SEO Company & Web Design Agency | Jarz Digital',
    description: 'Baltimore SEO company and web design agency. We ranked a Baltimore seafood restaurant #1 on Google Maps. Local SEO and Google Ads in Baltimore, MD.',
    h1: 'Baltimore SEO company and web design agency',
    kicker: 'Baltimore, MD · Local SEO · Web design · Google Ads',
    intro: [
      'A family-run steamed crab carry-out we work with ranks number one on Google for "steamed crab shop Baltimore", above a competitor with more reviews and above a paid listing. We built its website, manage its Google presence and run its social content.',
      'Baltimore customers are loyal to the places they find first. As a Baltimore SEO company and web design agency, we help businesses reach the Google Maps top 3 for their neighborhood and stay there, bringing steady calls and orders year after year.',
    ],
    market: [
      { h: 'Neighborhood searches matter', p: 'People search "near me" from Fells Point, Canton, Federal Hill and the suburbs. We optimize your Google Business Profile and pages for the areas you serve.' },
      { h: 'Restaurants and local services', p: 'From seafood and restaurants to contractors and clinics, we combine Google Maps rankings, a fast website and social media so customers find you and come back.' },
      { h: 'Seasonal peaks', p: 'Crab season, holidays and summer bring spikes in searches. We plan content and ads ahead of the busy months so you capture the demand.' },
    ],
    areas: ['Baltimore', 'Fells Point', 'Canton', 'Federal Hill', 'Towson', 'Dundalk', 'Glen Burnie', 'Catonsville', 'Columbia', 'Ellicott City', 'Essex', 'Pikesville'],
    calcCat: 'plumbing',
    proof: { img: '/img/baltimore-steamed-crab-shop-google-maps-1st-place.jpg', alt: 'Google results for "steamed crab shop baltimore" showing a Jarz Digital client ranked first above a sponsored listing', caption: '"steamed crab shop baltimore": our client ranks first, above a paid listing (client name hidden).', width: 1600, height: 1054 },
    faq: [
      { q: 'Do you work with Baltimore restaurants?', a: 'Yes. Our Baltimore seafood client ranks first for its main search. We handle Google Business Profile, website, reviews and social media for restaurants and food businesses.' },
      { q: 'How long until my Baltimore business ranks on Google Maps?', a: 'Most businesses see movement in 2 to 3 months and stronger results by month 6. Competition in your neighborhood and your review count both affect the timeline.' },
      { q: 'Can you redesign the current website of my Baltimore business?', a: 'Yes. We rebuild slow or outdated sites into fast, mobile-friendly websites without losing the rankings you already have.' },
    ],
    keywords: ['baltimore seo company', 'baltimore web design agency', 'website design baltimore', 'digital marketing baltimore md', 'local seo baltimore'],
    geo: { lat: 39.2904, lng: -76.6122 } },
  { id: 'denver', slug: 'denver-co', name: 'Denver', state: 'Colorado', stateCode: 'CO', region: 'Denver metro',
    title: 'Denver SEO Company & Local SEO Services | Jarz Digital',
    description: 'Local SEO services in Denver, CO for contractors, clinics and local businesses. Denver SEO, Google Ads management and web design that bring calls.',
    h1: 'Denver SEO company and local SEO services',
    kicker: 'Denver, CO · Local SEO · Google Ads · Web design',
    intro: [
      'Jarz Digital is a Denver SEO company providing local SEO services, Google Ads management, AI SEO, AI agents and web design. We help contractors, home services, clinics and local shops across the Denver metro get found on Google Maps, win more booked jobs and convert more visitors.',
      'Denver keeps growing, and new competitors open every month. Businesses that win here own their Google Business Profile, collect reviews steadily and show up for the exact services customers search.',
    ],
    market: [
      { h: 'Storms drive roofing searches', p: 'Colorado hail and snow bring sudden spikes in roofing, gutter and repair searches. We prepare your pages and ads before storm season so you catch the demand.' },
      { h: 'A metro of suburbs', p: 'Aurora, Lakewood, Littleton and Boulder each have their own searches. We build area pages and target ads by suburb so you rank where you work.' },
      { h: 'Health and wellness demand', p: 'Denver has strong demand for physical therapy, chiropractors, dentists and med spas. We run patient-focused SEO and ads that bring bookings, not just website visits.' },
    ],
    areas: ['Denver', 'Aurora', 'Lakewood', 'Littleton', 'Englewood', 'Arvada', 'Westminster', 'Thornton', 'Centennial', 'Highlands Ranch', 'Boulder', 'Broomfield'],
    calcCat: 'roofing',
    faq: [
      { q: 'Do you work with Denver contractors?', a: 'Yes. Roofing, HVAC, plumbing and remodeling companies are a big part of our work. We run Local Services Ads and Search Ads alongside local SEO so you get calls now and more free leads over time.' },
      { q: 'How much does local SEO cost in Denver?', a: 'It depends on your trade, the areas you serve and the competition. We give you a fixed monthly price after a free audit of your rankings and competitors.' },
      { q: 'Can you help my Denver business show up across the metro?', a: 'Yes. We build content and Google Business Profile updates for each area you serve, from Aurora and Lakewood to Highlands Ranch and Castle Rock.' },
    ],
    keywords: ['denver seo company', 'local seo services denver', 'web design denver colorado', 'digital marketing agency denver colorado', 'denver seo agency'],
    geo: { lat: 39.7392, lng: -104.9903 } },
]

export const HOME = {
  title: 'Local SEO Services & Google Ads Agency USA | Jarz Digital',
  shortTitle: 'Local SEO, Google Ads & Web Design Agency | Jarz Digital',
  description: 'Local SEO services, Google Ads, AI SEO and AI agents for US local businesses. Jarz Digital brings more calls in Dallas, Miami, Baltimore and Denver.',
  keywords: ['local seo services for small business', 'google ads management services', 'website design company', 'digital marketing agency in usa', 'local seo agency'],
}

export const PROOF = [
  { img: '/img/miami-car-customization-google-maps-1st-place.jpg', alt: 'Google Maps results for "car customization miami" with a Jarz Digital client ranked first', city: 'Miami, FL', search: 'car customization miami', note: 'Ranked above a competitor with 1,500+ reviews', width: 1600, height: 975 },
  { img: '/img/baltimore-steamed-crab-shop-google-maps-1st-place.jpg', alt: 'Google results for "steamed crab shop baltimore" with a Jarz Digital client ranked first above a sponsored listing', city: 'Baltimore, MD', search: 'steamed crab shop baltimore', note: 'Ranked above a 3,500-review competitor and a paid ad', width: 1600, height: 1054 },
  { img: '/img/london-removal-company-google-maps-1st-place.jpg', alt: 'Google Maps results for "removal company in london" with a Jarz Digital client ranked first', city: 'London, UK', search: 'removal company in london', note: 'Ranked above every competitor and the sponsored ad', width: 1600, height: 986 },
]

export const INDUSTRIES = ['HVAC', 'Plumbing', 'Roofing', 'Electricians', 'Movers', 'Junk removal', 'Pest control', 'Landscaping', 'Cleaning services', 'Garage doors', 'Locksmiths', 'Auto body shops', 'Auto repair', 'Junk car buyers', 'Towing', 'Dentists', 'Med spas', 'Chiropractors', 'Physical therapy', 'Veterinarians', 'Personal injury lawyers', 'Family lawyers', 'Restaurants', 'Salons & barbers', 'Gyms', 'Real estate', 'Insurance agencies', 'Contractors']
