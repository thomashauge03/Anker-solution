import type { MetadataRoute } from 'next'
import { erDemo, nettstedBase } from '@/lib/miljo'

export default function robots(): MetadataRoute.Robots {
  // Demoen med plassholdere skal ikke indekseres.
  if (erDemo) return { rules: { userAgent: '*', disallow: '/' } }
  const base = nettstedBase() ?? 'http://localhost:5180'
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/betaling/', '/leieliste'] },
    sitemap: `${base}/sitemap.xml`,
  }
}
