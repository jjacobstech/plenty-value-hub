import Product from '#models/product'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/marketplace', priority: '0.9', changefreq: 'daily' },
  { path: '/for-partners', priority: '0.7', changefreq: 'monthly' },
  { path: '/reviews', priority: '0.6', changefreq: 'weekly' },
  { path: '/auth/signup', priority: '0.5', changefreq: 'monthly' },
  { path: '/auth/login', priority: '0.4', changefreq: 'monthly' },
]

export default class SeoController {
  async sitemap({ response }: HttpContext) {
    const appUrl = env.get('APP_URL').replace(/\/$/, '')

    const products = await Product.query()
      .where('status', 'approved')
      .select('id', 'updated_at')
      .orderBy('updated_at', 'desc')

    const staticEntries = STATIC_PAGES.map(
      (page) => `
  <url>
    <loc>${appUrl}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    ).join('')

    const productEntries = products
      .map((p) => {
        const lastmod = p.updatedAt
          ? new Date(p.updatedAt.toISO()!).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
        return `
  <url>
    <loc>${appUrl}/product/${p.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      })
      .join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${productEntries}
</urlset>`

    response.header('Content-Type', 'application/xml; charset=utf-8')
    response.header('Cache-Control', 'public, max-age=3600')
    return response.send(xml)
  }

  async robots({ response }: HttpContext) {
    const appUrl = env.get('APP_URL').replace(/\/$/, '')

    const content = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /vendor
Disallow: /affiliate
Disallow: /api
Disallow: /auth/verify-email
Disallow: /auth/forgot-password
Disallow: /auth/reset-password

Sitemap: ${appUrl}/sitemap.xml`

    response.header('Content-Type', 'text/plain; charset=utf-8')
    response.header('Cache-Control', 'public, max-age=86400')
    return response.send(content)
  }
}
