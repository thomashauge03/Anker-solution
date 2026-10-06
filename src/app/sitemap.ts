import type { MetadataRoute } from 'next'
import { maskiner } from '@/data/maskiner'
import { nettstedBase } from '@/lib/miljo'

const base = nettstedBase() ?? 'http://localhost:5180'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/maskiner`, changeFrequency: 'weekly', priority: 0.9 },
    ...maskiner.map((m) => ({
      url: `${base}/maskiner/${m.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${base}/kontakt`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${base}/vilkar`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/personvern`, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
