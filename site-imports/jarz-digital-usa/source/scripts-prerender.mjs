// Renders every route to static HTML with its own <head> (SEO), then writes sitemap.xml and robots.txt.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const SET = process.env.SITE_SET || 'main'
const dist = path.resolve(SET === 'main' ? 'dist-site' : `dist-${SET}`)
const PREFIX = SET === 'main' ? null : `/${SET}/`
const inSet = (p) => (PREFIX ? p.startsWith(PREFIX) : !/^\/(uk|eu|bd)\//.test(p))
const { render, headFor, ROUTES: ALL } = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href)
// Inline the stylesheet so the first paint does not wait for a separate CSS request.
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8').replace(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/, (_, href) =>
  `<style>${fs.readFileSync(path.join(dist, href), 'utf8')}</style>`)
const ROUTES = ALL.filter((r) => inSet(r.path))
const SITE = 'https://www.jarzdigital.com'
const today = new Date().toISOString().slice(0, 10)

for (const r of ROUTES) {
  const head = headFor(r.page)
  const html = template
    .replace('<!--seo-head-->', head.html)
    .replace('<html lang="en-US">', `<html lang="${headFor(r.page).lang}">`)
    .replace('<div id="root" data-page="home"><!--app--></div>', `<div id="root" data-page="${r.page}">${render(r.page)}</div>`)
  const out = path.join(dist, r.path, 'index.html')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, html)
  console.log('rendered', r.path, '-', head.title)
}

const mapDir = PREFIX ? path.join(dist, PREFIX) : dist
fs.mkdirSync(mapDir, { recursive: true })
fs.writeFileSync(path.join(mapDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  ROUTES.map((r) => `  <url><loc>${SITE}${r.path}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${r.path === '/' || r.path === PREFIX ? '1.0' : '0.8'}</priority></url>`).join('\n') +
  `\n</urlset>\n`)
if (!PREFIX) fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n` + ['uk', 'eu', 'bd'].map((x) => `Sitemap: ${SITE}/${x}/sitemap.xml\n`).join(''))
else fs.rmSync(path.join(dist, 'index.html'), { force: true }) // subfolder projects do not own the domain root
console.log('wrote sitemap.xml and robots.txt')
