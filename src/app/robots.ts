import type { MetadataRoute } from 'next'

const base = (process.env.NETTSTED_URL ?? 'http://localhost:5180').replace(/\/+$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/betaling/', '/leieliste'] },
    sitemap: `${base}/sitemap.xml`,
  }
}
