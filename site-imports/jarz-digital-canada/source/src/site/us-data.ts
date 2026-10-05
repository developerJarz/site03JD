// The USA site's data bundle: the existing US copy, cities and benchmarks, assembled for the shared page components.
import { US_MARKET } from '../us/market'
import { CITIES, HOME, INDUSTRIES, PROOF, SERVICES, WA_MESSAGE, DALLAS_ADDRESS, BRAND } from './content'
import { adsCostGuide, aiDeep, aiSearch, automationDeep, CITY_EXTRA, CITY_UNIQUE, howWeGrow, NEW_SERVICES, opportunity, PLAYBOOKS, seoGuide, whyBest, whyHire } from './longform'
import { about, AUDIT, CASES, GLOSSARY, NATIONWIDE, PRICING, PROCESS, QUALITY, SERVICE_DETAILS, WHO } from './more'
import { faqsFor } from './faqs'
import type { SiteData } from './sitedata'
import type { CityId } from './longform'

export const US_DATA: SiteData = {
  market: 'us', root: '/', country: 'USA', inCountry: 'across the USA',
  calc: US_MARKET, calcDefault: 'plumbing',
  services: [...SERVICES.slice(0, 6), ...NEW_SERVICES, ...SERVICES.slice(6)],
  cities: CITIES,
  home: {
    title: HOME.title, description: HOME.description,
    eyebrow: 'Local SEO · Google Ads · AI SEO · AI agents · Web design',
    h1: 'Local SEO services, Google Ads and AI for ', h1em: 'measurable business growth',
    sub: 'Jarz Digital is a full-service digital growth agency for US local businesses. We rank you on Google Maps and in AI search, run Google Ads that bring calls, answer every lead with AI agents and build the websites that turn visitors into customers. Founded in Dallas and growing businesses in Miami, Baltimore, Denver and across the USA.',
    servicesLead: 'Local SEO, Google Ads, AI SEO, AI agents, business automation, website and web app development, social media and branding, planned together so every service strengthens the others.',
    calcTitle: 'See what Google Ads can earn your business',
    calcLead: 'Pick your business type and budget. The numbers use 2025 US benchmarks for 55 local business categories. Change anything to match your business.',
    compareTitle: 'Beyond advertising: a complete customer acquisition system',
    faqTitle: 'Questions business owners ask us',
  },
  heroExample: { cat: 'plumbing', label: 'Example: plumbing company, $1,500/month ads' },
  allLabel: 'All of the USA', allSub: 'Canada and the UK too',
  results: {
    title: '#1 on Google Maps in Miami, Baltimore and London',
    lead: 'Live Google results for real clients. Each one ranks first for its main search, ahead of competitors with more reviews and ahead of paid ads. Client names are hidden for privacy.',
    proof: PROOF.map((p) => ({ ...p, badge: `#1 · ${p.city}` })),
    strip: [['$122,458', 'online sales for an e-commerce store we work with, in its first 7.5 months'], ['1,859', 'orders in the same period'], ['4×', 'monthly sales growth from month 1 to month 7'], ['0', 'refunds']],
  },
  locations: {
    title: 'Local SEO, Google Ads and AI services in Dallas, Miami, Baltimore and Denver',
    lead: 'We work with local businesses all over the USA and focus most closely on four metros, each with its own strategy, competitors and seasons.',
    nationwide: NATIONWIDE,
  },
  cityExtra: CITY_EXTRA, cityUnique: CITY_UNIQUE,
  whoTitle: 'Businesses we help grow across the USA', who: WHO, industries: INDUSTRIES,
  footer: {
    tag: 'Local SEO, Google Ads, web design and AI for local businesses across the USA.',
    address: [BRAND, `${DALLAS_ADDRESS.street}, ${DALLAS_ADDRESS.city}, ${DALLAS_ADDRESS.region} ${DALLAS_ADDRESS.zip}`],
    copy: 'Offices in Dallas, Dhaka, Calgary and Cork.',
  },
  waMessage: WA_MESSAGE,
  faqsFor: (page) => faqsFor(page as 'home' | CityId),
  about, details: SERVICE_DETAILS, quality: QUALITY, process: PROCESS,
  cases: CASES.map((c) => (c.h.startsWith('E-commerce') ? { ...c, h: 'E-commerce delivery store' } : c)),
  glossary: GLOSSARY, pricing: PRICING, audit: AUDIT,
  long: { opportunity, whyHire, howWeGrow, whyBest, aiSearch, aiDeep, automationDeep, adsCostGuide, seoGuide },
  playbooks: PLAYBOOKS,
  playbooksLead: 'Every industry has different click costs, buying habits and seasons. These are the plans we use, with 2025 US Google Ads benchmarks for each.',
  calcCityLead: (city) => `Pick your business type and budget to see the calls, customers and revenue Google Ads can bring in ${city}. Numbers use 2025 US benchmarks; ${city} prices can differ.`,
}
