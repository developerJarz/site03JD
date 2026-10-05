// Renders every route to static HTML with its own <head> (SEO), then writes sitemap.xml and robots.txt.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = path.resolve('dist-site')
const { render, headFor, ROUTES } = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href)
// Inline the stylesheet so the first paint does not wait for a separate CSS request.
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8').replace(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/, (_, href) =>
  `<style>${fs.readFileSync(path.join(dist, href), 'utf8')}</style>`)
const SITE = 'https://www.jarzdigital.com'
const today = new Date().toISOString().slice(0, 10)

for (const r of ROUTES) {
  const head = headFor(r.page)
  const html = template
    .replace('<!--seo-head-->', head.html)
    .replace('<html lang="en-US">', `<html lang="${r.path.startsWith('/ca/') ? 'en-CA' : 'en-US'}">`)
    .replace('<div id="root" data-page="home"><!--app--></div>', `<div id="root" data-page="${r.page}">${render(r.page)}</div>`)
  const out = path.join(dist, r.path, 'index.html')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, html)
  console.log('rendered', r.path, '-', head.title)
}

fs.writeFileSync(path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  ROUTES.map((r) => `  <url><loc>${SITE}${r.path}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${r.path === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n') +
  `\n</urlset>\n`)
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
console.log('wrote sitemap.xml and robots.txt')
