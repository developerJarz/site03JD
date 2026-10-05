// <head> tags for each page: title, description, canonical, hreflang, Open Graph, Twitter and JSON-LD structured data.
import { BRAND, DALLAS_ADDRESS, EMAIL, PHONE_TEL, SITE, type City, type Faq } from './content'
import { dataFor, type PageId } from './Site'
import { US_DATA } from './us-data'
import { CA_DATA, CA_HOME_ID } from './ca'
import type { SiteData } from './sitedata'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const ld = (o: unknown) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`

const ORG_ID = `${SITE}/#organization`
const BIZ_ID = `${SITE}/#dallas-office`
const CA_ID = `${SITE}/ca/#canada`
const KNOWS = ['Local SEO', 'Google Ads', 'Local Services Ads', 'AI SEO', 'Generative engine optimization', 'ChatGPT SEO', 'AI agents', 'AI receptionist', 'Business automation', 'Website design', 'Web application development']

const organizationBase = {
  '@type': 'Organization', '@id': ORG_ID, name: BRAND, url: `${SITE}/`, logo: `${SITE}/img/jarz-digital-logo.png`, email: EMAIL,
  description: 'Digital marketing agency for local businesses: local SEO, Google Ads, AI SEO, AI agents, business automation and website development.',
  contactPoint: { '@type': 'ContactPoint', telephone: PHONE_TEL, email: EMAIL, contactType: 'sales' },
}
const org = (isCa: boolean) => ({ ...organizationBase, contactPoint: { ...organizationBase.contactPoint, areaServed: isCa ? 'CA' : 'US', availableLanguage: isCa ? ['English', 'French'] : ['English'] } })

const dallasOffice = {
  '@type': 'ProfessionalService', '@id': BIZ_ID, name: `${BRAND} Dallas`, parentOrganization: { '@id': ORG_ID }, url: `${SITE}/dallas-tx/`,
  image: `${SITE}/img/og-home.jpg`, telephone: PHONE_TEL, email: EMAIL,
  address: { '@type': 'PostalAddress', streetAddress: DALLAS_ADDRESS.street, addressLocality: DALLAS_ADDRESS.city, addressRegion: DALLAS_ADDRESS.region, postalCode: DALLAS_ADDRESS.zip, addressCountry: DALLAS_ADDRESS.country },
  areaServed: [...US_DATA.cities.map((c) => ({ '@type': 'City', name: `${c.name}, ${c.stateCode}` })), { '@type': 'Country', name: 'United States' }],
  knowsAbout: KNOWS,
}

// No street address is published for the Canadian team, so this is an organization unit with its service area rather than a map listing.
const canada = {
  '@type': 'Organization', '@id': CA_ID, name: `${BRAND} Canada`, parentOrganization: { '@id': ORG_ID }, url: `${SITE}/ca/`, email: EMAIL,
  location: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Calgary', addressRegion: 'AB', addressCountry: 'CA' } },
  areaServed: [...CA_DATA.cities.map((c) => (c.display ? { '@type': 'State', name: c.name } : { '@type': 'City', name: `${c.name}, ${c.stateCode}` })), { '@type': 'Country', name: 'Canada' }],
  knowsAbout: [...KNOWS, 'CASL-compliant automation', 'AODA website accessibility'],
}

const faqLd = (faqs: Faq[]) => ({ '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) })

const catalog = (D: SiteData, area: unknown) => ({
  '@type': 'OfferCatalog', name: 'Digital marketing services',
  itemListElement: D.services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, description: s.tagline, provider: { '@id': ORG_ID }, areaServed: area } })),
})

export interface Head { title: string; description: string; url: string; image: string; html: string }

const urlFor = (D: SiteData, c?: City) => (c ? `${SITE}${D.root}${c.slug}/` : `${SITE}${D.root}`)

export function headFor(page: PageId): Head {
  const D = dataFor(page)
  const city = D.cities.find((c) => c.id === page)
  const isCa = D.market === 'ca'
  const url = urlFor(D, city)
  const image = city ? `${SITE}/img/og-${isCa ? 'ca-' : ''}${city.slug}.jpg` : `${SITE}/img/og-${isCa ? 'ca' : 'home'}.jpg`
  const title = city ? city.title : D.home.title
  const description = city ? city.description : D.home.description
  const graph = city ? cityGraph(D, city, url) : homeGraph(D, url)
  const lang = isCa ? 'en-CA' : 'en-US'
  // The USA and Canada sites are run as fully separate sites, so each page only declares its own language and region.
  const alternates = [`<link rel="alternate" hreflang="${lang}" href="${url}" />`]
  const html = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    ...alternates,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${BRAND}" />`,
    `<meta property="og:locale" content="${isCa ? 'en_CA' : 'en_US'}" />`,
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
    city ? `<meta name="geo.region" content="${isCa ? 'CA' : 'US'}-${city.stateCode}" /><meta name="geo.placename" content="${city.name}" /><meta name="geo.position" content="${city.geo.lat};${city.geo.lng}" />` : '',
    ld({ '@context': 'https://schema.org', '@graph': graph }),
  ].filter(Boolean).join('\n    ')
  return { title, description, url, image, html }
}

function homeGraph(D: SiteData, url: string) {
  const isCa = D.market === 'ca'
  const country = { '@type': 'Country', name: isCa ? 'Canada' : 'United States' }
  return [
    org(isCa),
    isCa ? canada : dallasOffice,
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: BRAND, publisher: { '@id': ORG_ID }, inLanguage: 'en' },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: D.home.title, description: D.home.description, isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': isCa ? CA_ID : ORG_ID }, inLanguage: isCa ? 'en-CA' : 'en-US' },
    { '@type': 'Service', name: `Local SEO, Google Ads and web design for local businesses in ${isCa ? 'Canada' : 'the United States'}`, provider: { '@id': isCa ? CA_ID : ORG_ID }, areaServed: country, hasOfferCatalog: catalog(D, country) },
    faqLd(D.faqsFor(isCa ? CA_HOME_ID : 'home')),
  ]
}

function cityGraph(D: SiteData, city: City, url: string) {
  const isCa = D.market === 'ca'
  const area = city.display
    ? { '@type': 'State', name: city.name, containedInPlace: { '@type': 'Country', name: 'Canada' } }
    : { '@type': 'City', name: `${city.name}, ${city.stateCode}`, containedInPlace: { '@type': 'State', name: city.state } }
  const crumbs = isCa
    ? [{ '@type': 'ListItem', position: 1, name: 'Canada', item: `${SITE}/ca/` }, { '@type': 'ListItem', position: 2, name: city.display ?? `${city.name}, ${city.stateCode}`, item: url }]
    : [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` }, { '@type': 'ListItem', position: 2, name: `${city.name}, ${city.stateCode}`, item: url }]
  return [
    org(isCa),
    ...(isCa ? [canada] : city.id === 'dallas' ? [dallasOffice] : []),
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: city.title, description: city.description, inLanguage: isCa ? 'en-CA' : 'en-US', isPartOf: { '@id': `${SITE}/#website` } },
    { '@type': 'BreadcrumbList', itemListElement: crumbs },
    { '@type': 'Service', name: `Local SEO and Google Ads in ${city.display ?? `${city.name}, ${city.stateCode}`}`, serviceType: ['Local SEO', 'Google Ads management', 'AI SEO', 'AI receptionist', 'Website design'], provider: { '@id': isCa ? CA_ID : ORG_ID }, areaServed: area, hasOfferCatalog: catalog(D, area) },
    faqLd(D.faqsFor(city.id)),
  ]
}

export const ROUTES: { page: PageId; path: string }[] = [
  { page: 'home', path: '/' },
  ...US_DATA.cities.map((c) => ({ page: c.id, path: `/${c.slug}/` })),
  { page: CA_HOME_ID, path: '/ca/' },
  ...CA_DATA.cities.map((c) => ({ page: c.id, path: `/ca/${c.slug}/` })),
]
