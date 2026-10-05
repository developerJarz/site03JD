// <head> tags for each page: title, description, canonical, hreflang, Open Graph, Twitter and JSON-LD structured data.
// Every country site is separate: each page declares only its own language and region, and its own organization unit.
import { BRAND, DALLAS_ADDRESS, EMAIL, PHONE_TEL, SITE, type City, type Faq } from './content'
import { GUIDE_TRANSCRIPT, type PageId } from './Site'
import { dataFor, ROUTE_LIST } from './sites'
import { US_DATA } from './us-data'
import type { SiteData } from './sitedata'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const ld = (o: unknown) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`

const ORG_ID = `${SITE}/#organization`
const BIZ_ID = `${SITE}/#dallas-office`
const KNOWS = ['Local SEO', 'Google Ads', 'Local Services Ads', 'AI SEO', 'Generative engine optimization', 'ChatGPT SEO', 'AI agents', 'AI receptionist', 'Business automation', 'Website design', 'Web application development']

const org = (D: SiteData) => ({
  '@type': 'Organization', '@id': ORG_ID, name: BRAND, url: `${SITE}/`, logo: `${SITE}/img/jarz-digital-logo.png`, email: EMAIL,
  description: 'Digital marketing agency for local businesses: local SEO, Google Ads, AI SEO, AI agents, business automation and website development.',
  contactPoint: { '@type': 'ContactPoint', telephone: PHONE_TEL, email: EMAIL, contactType: 'sales', areaServed: D.geoCountry, availableLanguage: D.market === 'ca' ? ['English', 'French'] : ['English'] },
})

const dallasOffice = {
  '@type': 'ProfessionalService', '@id': BIZ_ID, name: `${BRAND} Dallas`, parentOrganization: { '@id': ORG_ID }, url: `${SITE}/dallas-tx/`,
  image: `${SITE}/img/og-home.jpg`, telephone: PHONE_TEL, email: EMAIL,
  address: { '@type': 'PostalAddress', streetAddress: DALLAS_ADDRESS.street, addressLocality: DALLAS_ADDRESS.city, addressRegion: DALLAS_ADDRESS.region, postalCode: DALLAS_ADDRESS.zip, addressCountry: DALLAS_ADDRESS.country },
  areaServed: [...US_DATA.cities.map((c) => ({ '@type': 'City', name: `${c.name}, ${c.stateCode}` })), { '@type': 'Country', name: 'United States' }],
  knowsAbout: KNOWS,
}

const unitId = (D: SiteData) => `${SITE}${D.root}#${D.market}`
// No street address is published for the regional teams, so each is an organization unit with its service area.
const regionalOrg = (D: SiteData) => {
  const r = D.regional!
  return {
    '@type': 'Organization', '@id': unitId(D), name: r.name, parentOrganization: { '@id': ORG_ID }, url: `${SITE}${D.root}`, email: EMAIL,
    ...(r.locality ? { location: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: r.locality, ...(r.region ? { addressRegion: r.region } : {}), addressCountry: D.geoCountry } } } : {}),
    areaServed: [...D.cities.map((c) => (c.display ? { '@type': 'State', name: c.name } : { '@type': 'City', name: c.stateCode ? `${c.name}, ${c.stateCode}` : c.name })), { '@type': D.market === 'eu' ? 'Place' : 'Country', name: r.countryName }],
    knowsAbout: KNOWS,
  }
}
const providerId = (D: SiteData) => (D.regional ? unitId(D) : ORG_ID)

const videoLd = (url: string, place?: string) => ({
  '@type': 'VideoObject', '@id': `${url}#calculator-guide`,
  name: place ? `How to use the ${place} Google Ads calculator` : 'How to use the Jarz Digital Google Ads calculator',
  description: 'A 95-second walkthrough of the Jarz Digital Google Ads calculator: business type, ad platforms, growth plans (Ads only, Ads + SEO, Ads + SEO + business management), results ranges, inputs, result tabs and the 12-month plan comparison.',
  thumbnailUrl: `${SITE}/video/calculator-guide-poster.jpg`, contentUrl: `${SITE}/video/calculator-guide.mp4`, embedUrl: `${url}#calculator-guide`,
  uploadDate: '2026-10-05', duration: 'PT1M35S', inLanguage: 'en-CA', publisher: { '@id': ORG_ID }, transcript: GUIDE_TRANSCRIPT.join(' '),
})

const faqLd = (faqs: Faq[]) => ({ '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) })

const catalog = (D: SiteData, area: unknown) => ({
  '@type': 'OfferCatalog', name: 'Digital marketing services',
  itemListElement: D.services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, description: s.tagline, provider: { '@id': providerId(D) }, areaServed: area } })),
})

export interface Head { title: string; description: string; url: string; image: string; html: string; lang: string }

const urlFor = (D: SiteData, c?: City) => (c ? `${SITE}${D.root}${c.slug}/` : `${SITE}${D.root}`)
const placeName = (c: City) => c.display ?? (c.stateCode ? `${c.name}, ${c.stateCode}` : c.name)

export function headFor(page: PageId): Head {
  const D = dataFor(page)
  const city = D.cities.find((c) => c.id === page)
  const us = D.market === 'us'
  const url = urlFor(D, city)
  const image = city ? `${SITE}/img/og-${us ? '' : `${D.market}-`}${city.slug}.jpg` : `${SITE}/img/og-${us ? 'home' : D.market}.jpg`
  const title = city ? city.title : D.home.title
  const description = city ? city.description : D.home.description
  const graph = city ? cityGraph(D, city, url) : homeGraph(D, url)
  const html = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<link rel="alternate" hreflang="${D.lang}" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${BRAND}" />`,
    `<meta property="og:locale" content="${D.ogLocale}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    city ? `<meta name="geo.region" content="${D.geoCountry}${city.stateCode ? `-${city.stateCode}` : ''}" /><meta name="geo.placename" content="${city.name}" /><meta name="geo.position" content="${city.geo.lat};${city.geo.lng}" />` : '',
    ld({ '@context': 'https://schema.org', '@graph': graph }),
  ].filter(Boolean).join('\n    ')
  return { title, description, url, image, html, lang: D.lang }
}

function homeGraph(D: SiteData, url: string) {
  const us = D.market === 'us'
  const area = { '@type': D.market === 'eu' ? 'Place' : 'Country', name: us ? 'United States' : D.regional!.countryName }
  return [
    org(D),
    us ? dallasOffice : regionalOrg(D),
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: BRAND, publisher: { '@id': ORG_ID }, inLanguage: 'en' },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: D.home.title, description: D.home.description, isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': providerId(D) }, inLanguage: D.lang },
    { '@type': 'Service', name: `Local SEO, Google Ads and web design for businesses in ${us ? 'the United States' : D.regional!.countryName}`, provider: { '@id': providerId(D) }, areaServed: area, hasOfferCatalog: catalog(D, area) },
    faqLd(D.faqsFor(D.homeId)),
    ...(D.video ? [videoLd(url)] : []),
  ]
}

function cityGraph(D: SiteData, city: City, url: string) {
  const us = D.market === 'us'
  const area = city.display
    ? { '@type': 'State', name: city.name, containedInPlace: { '@type': 'Country', name: D.regional?.countryName ?? 'United States' } }
    : { '@type': 'City', name: placeName(city), containedInPlace: { '@type': city.state === city.name ? 'Country' : 'State', name: city.state } }
  const crumbs = [{ '@type': 'ListItem', position: 1, name: D.crumbHome, item: `${SITE}${D.root}` }, { '@type': 'ListItem', position: 2, name: placeName(city), item: url }]
  return [
    org(D),
    ...(!us ? [regionalOrg(D)] : city.id === 'dallas' ? [dallasOffice] : []),
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: city.title, description: city.description, inLanguage: D.lang, isPartOf: { '@id': `${SITE}/#website` } },
    { '@type': 'BreadcrumbList', itemListElement: crumbs },
    { '@type': 'Service', name: `Local SEO and Google Ads in ${placeName(city)}`, serviceType: ['Local SEO', 'Google Ads management', 'AI SEO', 'AI receptionist', 'Website design'], provider: { '@id': providerId(D) }, areaServed: area, hasOfferCatalog: catalog(D, area) },
    faqLd(D.faqsFor(city.id)),
    ...(D.video ? [videoLd(url, city.name)] : []),
  ]
}

export const ROUTES: { page: PageId; path: string }[] = ROUTE_LIST
