// FAQ lists shared by the page and its FAQPage schema.
import { CITIES, HOME_FAQ, type Faq } from './content'
import { aiSearchFaq, CITY_UNIQUE, extraFaq, type CityId } from './longform'

export function faqsFor(page: 'home' | CityId): Faq[] {
  if (page === 'home') return [...HOME_FAQ, ...aiSearchFaq(), ...extraFaq().filter((f) => !f.q.startsWith('Do you work with businesses outside')), ...CITIES.flatMap((c) => c.faq.slice(0, 2))]
  const city = CITIES.find((c) => c.id === page)!
  const cw = { name: city.name, state: city.state }
  return [...city.faq, ...CITY_UNIQUE[page].faq, ...aiSearchFaq(cw), ...extraFaq(cw)]
}
