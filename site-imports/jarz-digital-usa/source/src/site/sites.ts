// Registry of country sites. Each bundle owns its homepage id and city ids.
import type { SiteData } from './sitedata'
import { US_DATA } from './us-data'
import { CA_DATA } from './ca'

export const SITES: SiteData[] = [US_DATA, CA_DATA]
export const pagesOf = (D: SiteData) => [D.homeId, ...D.cities.map((c) => c.id)]
export const dataFor = (page: string): SiteData => SITES.find((D) => pagesOf(D).includes(page)) ?? US_DATA
export const ROUTE_LIST = SITES.flatMap((D) => [{ page: D.homeId, path: D.root }, ...D.cities.map((c) => ({ page: c.id, path: `${D.root}${c.slug}/` }))])
