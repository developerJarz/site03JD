import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { SitePage, type PageId } from './Site'

const root = document.getElementById('root')!
const page = (root.dataset.page || 'home') as PageId
const app = <StrictMode><SitePage page={page} /></StrictMode>
// Pre-rendered pages hydrate; the dev server (empty root) renders from scratch.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
