// The Canada site's data bundle (served under /ca/).
import { CA_MARKET, caCityMarket } from '../../us/market'
import type { Faq } from '../content'
import type { SiteData } from '../sitedata'
import { CA_CITIES, CA_HOME, CA_HOME_FAQ, CA_INDUSTRIES, CA_PROOF, CA_SERVICES } from './content'
import { adsCostGuide, aiDeep, aiSearch, aiSearchFaq, automationDeep, CITY_EXTRA, CITY_UNIQUE, extraFaq, howWeGrow, opportunity, PLAYBOOKS, seoGuide, whyBest, whyHire } from './longform'
import { about, AUDIT, CASES, DETAILS, GLOSSARY, NATIONWIDE, PRICING, PROCESS, QUALITY, WHO } from './more'

export const CA_HOME_ID = 'ca'
export const CA_PAGES: string[] = [CA_HOME_ID, ...CA_CITIES.map((c) => c.id)]

function faqsFor(page: string): Faq[] {
  if (page === CA_HOME_ID) return [...CA_HOME_FAQ, ...aiSearchFaq(), ...extraFaq(), ...CA_CITIES.flatMap((c) => c.faq.slice(0, 1))]
  const city = CA_CITIES.find((c) => c.id === page)!
  const cw = { name: city.name, state: city.state }
  return [...city.faq, ...CITY_UNIQUE[page].faq, ...aiSearchFaq(cw), ...extraFaq(cw)]
}

export const CA_DATA: SiteData = {
  market: 'ca', homeId: CA_HOME_ID, lang: 'en-CA', ogLocale: 'en_CA', geoCountry: 'CA', crumbHome: 'Canada',
  servicesTitle: 'Local SEO services, Google Ads and AI for Canadian businesses', cityMarket: caCityMarket, video: true,
  regional: { name: 'Jarz Digital Canada', locality: 'Calgary', region: 'AB', countryName: 'Canada' },
  root: '/ca/', country: 'Canada', inCountry: 'across Canada',
  calc: CA_MARKET, calcDefault: 'plumbing',
  services: CA_SERVICES,
  cities: CA_CITIES,
  home: {
    title: CA_HOME.title, description: CA_HOME.description,
    eyebrow: 'Canada · Local SEO · Google Ads · AI SEO · AI agents · Web design',
    h1: 'Local SEO services and Google Ads for Canadian businesses, ', h1em: 'built for measurable growth',
    sub: 'Jarz Digital helps Canadian local businesses win customers online. We rank you on Google Maps and in AI search, run Google Ads and Local Services Ads measured in booked jobs, answer every enquiry with multilingual AI agents and build fast, accessible websites. With a team in Calgary, we work with businesses in Toronto, Brampton, Mississauga, Calgary and across Alberta.',
    servicesLead: 'Local SEO, Google Ads and Local Services Ads, AI SEO, AI receptionists, business automation, websites and web apps, social media and branding, planned together for the Canadian market so every service strengthens the others.',
    calcTitle: 'See what Google Ads can earn your business in Canada',
    calcLead: 'Pick your business type and budget. The numbers use 2026 Canadian cost-per-click and Local Services Ads data in Canadian dollars for 61 local business categories. Change anything to match your business.',
    compareTitle: 'Beyond advertising: a complete customer acquisition system for Canadian businesses',
    faqTitle: 'Questions Canadian business owners ask us',
  },
  heroExample: { cat: 'plumbing', label: 'Example: Canadian plumbing company, CA$1,500/month ads' },
  allLabel: 'All of Canada', allSub: 'Ontario, Alberta and beyond',
  results: {
    title: '#1 in Google\'s local results in the GTA and Calgary',
    lead: 'Live Google results and dashboards from Canadian clients: first place in the map results, the first listing beneath the only paid ad, and a single month with 1,845 calls from a Google profile. Client names are hidden for privacy.',
    proof: CA_PROOF,
    strip: [['1,845', 'calls from one client\'s Google Business Profile in a single month'], ['492', 'five-star reviews behind our Richmond Hill client\'s #1 map position'], ['$122,458', 'online sales for an e-commerce store we work with in eight months'], ['0', 'refunds on 1,859 orders']],
  },
  locations: {
    title: 'Local SEO, Google Ads and AI services in Toronto, Brampton, Mississauga, Calgary and Alberta',
    lead: 'We work with local businesses across Canada and focus most closely on the Greater Toronto Area and Alberta, each with its own competition, seasons and cost per click.',
    nationwide: NATIONWIDE,
  },
  cityExtra: CITY_EXTRA, cityUnique: CITY_UNIQUE,
  whoTitle: 'Businesses we help grow across Canada', who: WHO, industries: CA_INDUSTRIES,
  footer: {
    tag: 'Local SEO, Google Ads, web design and AI for local businesses across Canada.',
    address: ['Jarz Digital Canada', 'Team based in Calgary, Alberta'],
    copy: 'Jarz Digital Canada · Calgary, Alberta.',
  },
  waMessage: 'Hi Jarz Digital, I would like a free growth plan for my Canadian business.',
  faqsFor,
  about, details: DETAILS, quality: QUALITY, process: PROCESS, cases: CASES, glossary: GLOSSARY, pricing: PRICING, audit: AUDIT,
  long: { opportunity, whyHire, howWeGrow, whyBest, aiSearch, aiDeep, automationDeep, adsCostGuide, seoGuide },
  playbooks: PLAYBOOKS,
  playbooksLead: 'Every industry has different click costs, buying habits and seasons. These are the plans we use in Canada, with 2026 Canadian Google Ads costs in CAD for each.',
  calcCityLead: (city) => `Pick your business type and budget to see the calls, customers and revenue Google Ads can bring in ${city}. Numbers use 2026 Canadian data in CAD, adjusted for ${city} competition.`,
}
