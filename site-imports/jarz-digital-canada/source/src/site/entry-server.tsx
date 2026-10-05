import { renderToString } from 'react-dom/server'
import { SitePage, type PageId } from './Site'
export { headFor, ROUTES } from './seo'

export function render(page: PageId) {
  return renderToString(<SitePage page={page} />)
}
