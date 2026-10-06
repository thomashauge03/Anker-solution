import type { Metadata, Viewport } from 'next'
import { Archivo, IBM_Plex_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Topplinje } from '@/components/Topplinje'
import { firma } from '@/data/firma'
import './globals.css'

// next/font laster ned skriftene ved bygging og serverer dem selv. Ingen
// forespørsler går til Google fra besøkendes nettleser.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

const nettsted = process.env.NETTSTED_URL ?? 'http://localhost:5180'

export const metadata: Metadata = {
  metadataBase: new URL(nettsted),
  title: {
    default: `${firma.navn} — utleie av maskiner og verktøy`,
    template: `%s · ${firma.navn}`,
  },
  description:
    'Lei gravemaskin, minigraver, vibroplate, motorsag og annet utstyr per døgn eller uke. Betal med Vipps eller kort, eller send en forespørsel.',
  openGraph: {
    type: 'website',
    locale: 'nb_NO',
    siteName: firma.navn,
  },
}

export const viewport: Viewport = {
  themeColor: '#0b0b0b',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nb" className={`${archivo.variable} ${mono.variable}`}>
      <body>
        <a href="#innhold" className="hopp-til-innhold">
          Hopp til innholdet
        </a>
        <Topplinje />
        <Header />
        <main id="innhold">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
