import type { Metadata, Viewport } from 'next'
import { Archivo, Hanken_Grotesk } from 'next/font/google'
import type { ReactNode } from 'react'
import { Demobaand } from '@/components/Demobaand'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { firma } from '@/data/firma'
import { erDemo, nettstedBase } from '@/lib/miljo'
import './globals.css'

// Hanken Grotesk er den fritt lisensierte skriften som ligger nærmest
// NorgesBank-skriften på nbim.no. next/font laster den ned ved bygging og
// serverer den selv, så ingen forespørsler går til Google fra nettleseren.
const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
})

// Archivo i bred, tung utgave gir blokkete overskrifter. Breddeaksen må
// lastes eksplisitt; ellers følger bare vekten med.
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  axes: ['wdth'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(nettstedBase() ?? 'http://localhost:5180'),
  // En demo med plassholdere skal ikke dukke opp i søk under firmaets navn.
  robots: erDemo ? { index: false, follow: false } : undefined,
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
    <html lang="nb" className={`${hanken.variable} ${archivo.variable}`}>
      <body>
        <a href="#innhold" className="hopp-til-innhold">
          Hopp til innholdet
        </a>
        {erDemo && <Demobaand />}
        <Header />
        <main id="innhold">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
