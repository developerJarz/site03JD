// Additional explanatory content: about us, service deep dives, quality standards, process, case studies, glossary.
// Written to help customers, Google and AI assistants understand exactly who Jarz Digital is and what it delivers.
type CityWords = { name: string; state: string }

export function about(c?: CityWords) {
  return {
    title: c ? `About Jarz Digital and our work in ${c.name}` : 'About Jarz Digital',
    paras: [
      'Jarz Digital is a digital growth agency founded in Dallas, Texas, with teams in Dhaka, Calgary and Cork. We help local and service businesses attract customers online through local SEO, Google Ads, AI search optimization, AI agents, business automation, website and web application development, social media marketing and branding.',
      'The company is led by Roknuzzaman Jony, a computer engineer and local SEO specialist with more than ten years of practical experience in search marketing. That engineering background shapes how we work: decisions are based on data, websites are built to technical standards, and every campaign is tracked from the first click to the final sale.',
      `Over the past decade our team has built more than 500 websites and served more than 500 clients across the United States, Canada, the United Kingdom and other markets. Our work ranges from single-location trades and clinics to multi-location service companies and e-commerce brands${c ? `, and we bring the same methods to businesses in ${c.name}` : ''}.`,
      'Our team includes specialists in local SEO, paid search, AI systems, web development, design and video. Because these skills sit in one company, we can plan a complete growth system instead of a single campaign, and we can take responsibility for the results it produces.',
    ],
    values: [
      ['Honesty', 'We give realistic forecasts, explain what drives results and tell you when something is not working.'],
      ['Accountability', 'Every report shows leads, customers and revenue, so our work is judged on outcomes.'],
      ['Craft', 'Websites, content and campaigns are built by hand to a professional standard, never from shortcuts.'],
      ['Partnership', 'We work as an extension of your team, with direct access to the specialists doing the work.'],
    ] as [string, string][],
  }
}

export interface ServiceDetail { id: string; who: string; how: string[]; deliver: string }

export const SERVICE_DETAILS: ServiceDetail[] = [
  { id: 'local-seo', who: 'Best for businesses that serve customers in a defined area: home services, clinics, law firms, restaurants, auto shops and retail.',
    how: ['Audit of your Google Business Profile, website, citations, reviews and competitors.', 'Category, service and description optimization, plus weekly posts and photo updates.', 'Location and service pages that target the searches customers use in each area you serve.', 'Citation cleanup and building so your name, address and phone match everywhere.', 'A review system that requests feedback after each job and helps you respond professionally.'],
    deliver: 'Monthly map-ranking reports for your main keywords, Google profile insights (calls, direction requests, website visits) and a list of completed work.' },
  { id: 'google-ads', who: 'Best for businesses that need leads quickly, want to test new services or areas, or compete in high-value categories.',
    how: ['Keyword research focused on buyer intent, with negative keywords to block irrelevant searches.', 'Campaign structure for Search, Performance Max and Local Services Ads where eligible.', 'Dedicated landing pages with click-to-call, forms and booking.', 'Call tracking and conversion tracking connected to Google Ads and Analytics.', 'Weekly bid, budget, search-term and ad-copy optimization.'],
    deliver: 'A live dashboard and monthly report showing spend, leads, cost per lead, customers and estimated revenue.' },
  { id: 'seo', who: 'Best for businesses that want long-term traffic that does not depend on ad spend, including e-commerce and multi-service companies.',
    how: ['Technical audit covering speed, Core Web Vitals, indexing, structure and mobile usability.', 'Keyword research and a keyword-to-page map for every important topic.', 'On-page optimization of titles, headings, content, internal links and structured data.', 'Helpful articles and guides that answer real customer questions.', 'Earning relevant, high-quality backlinks from trusted websites.'],
    deliver: 'Monthly rankings, organic traffic, conversions from search and a prioritized plan for the next month.' },
  { id: 'web-design', who: 'Best for businesses whose current website is slow, outdated, hard to use on mobile or not producing enquiries.',
    how: ['Discovery of your services, customers and goals, plus a review of competitor websites.', 'Sitemap and wireframes that make it easy for visitors to find what they need and contact you.', 'Custom design that reflects your brand, built mobile-first.', 'Development in React, Next.js, WordPress or Shopify with SEO structure and schema markup.', 'Testing for speed, accessibility, forms and tracking before launch.'],
    deliver: 'A fast, secure website you own, with training, hosting guidance and ongoing support options.' },
  { id: 'web-apps', who: 'Best for businesses that rely on spreadsheets, manual booking or disconnected tools and want a custom solution.',
    how: ['Workshops to understand your process and the people who use it.', 'A clear specification and prototype before development starts.', 'Development of portals, booking systems, calculators or dashboards.', 'Integration with your CRM, payment provider and existing software.', 'Launch, training and ongoing improvement.'],
    deliver: 'A working web application, documentation and a support plan.' },
  { id: 'ai', who: 'Best for businesses that want to be recommended by ChatGPT, Claude, Gemini, Perplexity and Google AI Overviews.',
    how: ['Review of how AI assistants currently describe your business and competitors.', 'Consistent business information across your website, profiles and directories.', 'Question-and-answer content and comparison pages written for AI summaries.', 'Structured data for your organization, services, locations, reviews and FAQs.', 'Monthly tracking of AI mentions for your most important questions.'],
    deliver: 'An AI visibility report alongside your SEO results, with clear next steps.' },
  { id: 'ai-agents', who: 'Best for businesses that miss calls, receive leads after hours or spend staff time answering the same questions.',
    how: ['Mapping of your services, pricing ranges, service area and booking rules.', 'Configuration of a voice agent, chat agent or both, in your brand tone.', 'Connection to your calendar, CRM and phone system.', 'Testing with real scenarios and clear hand-off rules for urgent calls.', 'Monthly review of conversations to improve answers and booking rates.'],
    deliver: 'A working AI receptionist and chat agent, call and chat summaries, and monthly performance reports.' },
  { id: 'automation', who: 'Best for growing teams that lose time to manual follow-ups, data entry, invoicing and reporting.',
    how: ['A workflow review to find the most time-consuming manual steps.', 'CRM setup or cleanup, with lead routing and pipeline stages.', 'Automated quotes, reminders, follow-ups and review requests.', 'Invoice, payment and reporting automations.', 'Documentation and training so your team knows how everything works.'],
    deliver: 'Working automations, a time-saved estimate and a dashboard that updates itself.' },
  { id: 'social', who: 'Best for businesses that want consistent visibility, stronger trust and lower-cost repeat customers.',
    how: ['A content plan aligned with your services, seasons and offers.', 'Branded graphics, short videos and captions.', 'Facebook and Instagram ad campaigns for awareness, leads and retargeting.', 'Community management for comments and messages.', 'Monthly performance review and content adjustments.'],
    deliver: 'A monthly content calendar, published posts and ads, and a report on reach, engagement and leads.' },
  { id: 'management', who: 'Best for owners who want one partner to manage their entire online presence.',
    how: ['A single growth plan covering website, SEO, ads, AI and social media.', 'Monthly website updates and maintenance.', 'Google Business Profile and review management.', 'Coordinated campaigns across every channel.', 'A monthly strategy call and consolidated reporting.'],
    deliver: 'One accountable team, one plan and one report covering every channel.' },
  { id: 'software', who: 'Best for businesses with unique processes that off-the-shelf software does not support.',
    how: ['Requirements gathering and process mapping.', 'Architecture and security planning.', 'Iterative development with regular demonstrations.', 'Data migration from existing tools.', 'Deployment, training and long-term support.'],
    deliver: 'Custom software, documentation and a maintenance plan that grows with your business.' },
  { id: 'graphics', who: 'Best for businesses that need a consistent, professional look across every channel.',
    how: ['Brand discovery and visual direction.', 'Logo, color palette and typography.', 'Templates for social media, ads and print.', 'Website graphics, banners and illustrations.', 'Brand guidelines for future use.'],
    deliver: 'A complete brand kit and ready-to-use design files, included free with every service.' },
]

export const QUALITY: [string, string][] = [
  ['Websites that pass Core Web Vitals', 'We build for speed and stability on mobile networks, test every page before launch and monitor performance after it goes live.'],
  ['White-hat SEO only', 'We follow Google Search guidelines. There are no purchased link schemes, hidden text or tactics that could lead to penalties.'],
  ['Accurate tracking', 'Calls, forms and bookings are tracked with call tracking, Google Analytics 4 and Google Ads conversions, and checked monthly for accuracy.'],
  ['Clear, honest reporting', 'Reports explain what changed, why it matters and what happens next, in plain language without vanity metrics.'],
  ['Data security and privacy', 'Access to your accounts uses individual logins and the minimum permissions required. Customer data handled by AI agents and automations is stored securely.'],
  ['Responsive communication', 'You have a named point of contact, a monthly strategy call and direct access to the specialists working on your account.'],
  ['Responsible use of AI', 'AI agents follow the rules you approve, hand urgent or sensitive conversations to your team and never invent prices or promises.'],
  ['Continuous improvement', 'Every month we review results, test new ideas and adjust the plan, so performance improves over time.'],
]

export const PROCESS: [string, string][] = [
  ['Free audit', 'We review your Google Business Profile, website, ads, reviews, competitors and AI visibility, and identify the fastest opportunities for growth.'],
  ['Growth plan and proposal', 'You receive a clear plan with priorities, timelines, a fixed monthly price and the results we expect to see, based on your market and benchmarks.'],
  ['Onboarding and setup', 'We secure access, install tracking, fix urgent website and profile issues, and launch the first campaigns, usually within two to four weeks.'],
  ['Launch and early results', 'Ads and Local Services Ads begin generating calls, the AI agent starts answering leads and local SEO work begins to move rankings.'],
  ['Optimization', 'Each month we refine keywords, content, landing pages, budgets and automations based on what brings customers.'],
  ['Scale', 'Once the system is profitable, we expand into new services, areas or locations and increase the budget on the channels that perform best.'],
]

export const CASES = [
  { h: 'Auto body and car customization shop, Miami, Florida', p: 'The shop competed against larger businesses with many more reviews. We built a high-contrast website, optimized its Google Business Profile and managed ongoing local SEO. It now ranks first among Miami businesses for "car customization Miami", ahead of a competitor with more than 1,500 reviews.' },
  { h: 'Family-run seafood carry-out, Baltimore, Maryland', p: 'We designed a new website, manage the Google presence and create social media content. The business ranks first for "steamed crab shop Baltimore", above a competitor with about 3,500 reviews and above a paid listing.' },
  { h: 'Removal company, London, United Kingdom', p: 'Through local SEO and Google Business Profile optimization, the company reached the first position in the London map results for "removal company in London", above every competitor and the sponsored ad.' },
  { h: 'E-commerce delivery store, United States', p: 'Starting from launch, the store reached $122,458 in online sales and 1,859 orders in its first seven and a half months. Monthly sales grew about four times between month one and month seven, with no refunds.' },
]

export const GLOSSARY: [string, string][] = [
  ['Local SEO', 'Optimizing your Google Business Profile, website and online listings so your business appears in local and "near me" searches and in the Google Maps results.'],
  ['Google Business Profile', 'The free business listing that appears in Google Search and Maps, showing your services, reviews, hours, photos and contact details.'],
  ['Map pack', 'The group of three businesses shown with a map at the top of many local Google searches.'],
  ['AI SEO / GEO', 'AI search optimization, also called generative engine optimization: making your business visible and recommended in AI assistants such as ChatGPT, Claude, Gemini and Google AI Overviews.'],
  ['AI Overviews', 'AI-generated summaries that Google shows at the top of some search results.'],
  ['AI receptionist', 'An AI voice agent that answers calls, provides information and books appointments on behalf of a business.'],
  ['Local Services Ads', 'Google ads for service businesses that charge per lead rather than per click and display a Google Verified badge.'],
  ['CPC (cost per click)', 'The amount you pay each time someone clicks your ad.'],
  ['CPL (cost per lead)', 'The average ad cost of receiving one phone call, form or booking.'],
  ['ROAS (return on ad spend)', 'Revenue generated for every dollar spent on advertising.'],
  ['Conversion rate', 'The share of website visitors or ad clicks that become leads.'],
  ['Citations', 'Mentions of your business name, address and phone number on directories and websites, which support local rankings.'],
  ['Structured data (schema)', 'Code added to web pages that tells search engines and AI systems exactly what a business offers, where it operates and how customers rate it.'],
  ['Core Web Vitals', 'Google\'s measurements of page loading speed, responsiveness and visual stability.'],
  ['Business automation', 'Using software to complete repetitive tasks such as follow-ups, reminders, invoicing and reporting without manual work.'],
]

export const PRICING = {
  title: 'How our pricing works',
  intro: 'Every business has different goals, competition and starting points, so we do not sell fixed packages that ignore those differences. Instead, you receive a clear fixed monthly price after a free audit, before any work begins.',
  blocks: [
    ['What affects the price', 'The number of services you need, how competitive your industry and city are, how many locations you serve and the current condition of your website and Google profile.'],
    ['Advertising budget is separate', 'Money spent on Google Ads, Local Services Ads or social media ads is paid directly to the platform. Most local service businesses invest $1,000 to $2,000 a month; the calculator on this page estimates what different budgets can return.'],
    ['No long-term lock-in', 'We earn your business month by month. Terms are agreed in writing after the audit, so you always know what is included.'],
    ['Value you can measure', 'Because every lead and customer is tracked, you can compare what you invest with the revenue it produces and decide with confidence.'],
  ] as [string, string][],
}

export const AUDIT = {
  title: 'What the free growth audit includes',
  items: [
    'Where you rank today on Google Maps and in Google Search for your most valuable keywords',
    'How ChatGPT, Gemini and Google AI Overviews currently describe and recommend your business',
    'A review of your Google Business Profile, reviews and directory listings',
    'Website speed, mobile experience, structure and conversion points',
    'A review of any current Google Ads or Local Services Ads campaigns, including wasted spend',
    'How quickly your calls and online enquiries are being answered',
    'Your top competitors and what they are doing differently',
    'A prioritized growth plan with expected results and a fixed monthly price',
  ],
}

export const NATIONWIDE = 'Beyond our four focus metros, we support local and service businesses throughout the United States, including Texas, Florida, Maryland, Colorado, California, New York, Georgia, Illinois, Arizona and North Carolina. All work is delivered remotely with scheduled video calls, shared dashboards and clear monthly reporting, so the location of your business never limits the quality of service you receive. We also work with clients in Canada, the United Kingdom and Ireland.'

export const WHO: [string, string][] = [
  ['Home service companies', 'HVAC, plumbing, roofing, electrical, landscaping, cleaning, pest control, garage door and moving companies that depend on phone calls and booked jobs. We focus on Local Services Ads, Google Maps rankings, emergency coverage and AI call answering.'],
  ['Healthcare and wellness practices', 'Dentists, orthodontists, physical therapists, chiropractors, dermatologists, med spas and veterinary clinics. We build trust through reviews, provider profiles and treatment pages, and keep schedules full with online booking and automated reminders.'],
  ['Law firms and attorneys', 'Personal injury, criminal defense, family, bankruptcy and estate planning attorneys. We combine practice-area SEO, Local Services Ads and fast intake so that high-value enquiries become signed clients.'],
  ['Automotive businesses', 'Auto repair shops, body shops, tire and glass specialists, towing companies and junk car buyers. We target service-specific searches and use fast quotes and call answering to win more jobs.'],
  ['Restaurants and hospitality', 'Restaurants, cafés, caterers and event venues. We optimize Google profiles, menus, photos and reviews, and run local campaigns for orders, reservations and events.'],
  ['Professional and personal services', 'Accountants, insurance agencies, real estate agents, salons, gyms, photographers and tutors. We build visibility for local searches and nurture leads with automation.'],
  ['E-commerce and retail brands', 'Online stores and retailers that need product SEO, shopping campaigns, conversion-focused websites and automated customer journeys.'],
  ['Multi-location and franchise businesses', 'Companies with several branches that need consistent location pages, multiple Google Business Profiles, call tracking by location and reporting that compares performance across the network.'],
]
