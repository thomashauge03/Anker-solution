import type { Metadata } from 'next'
import { Katalog } from '@/components/Katalog'
import { kategorier, maskiner } from '@/data/maskiner'
import styles from './maskiner.module.css'

export const metadata: Metadata = {
  title: 'Maskiner og utstyr',
  description:
    'Gravemaskiner, lastere, vibroplater, motorsag, aggregat, henger og mer. Se pris per døgn og uke, og lei direkte.',
}

export default async function Maskinside({ searchParams }: PageProps<'/maskiner'>) {
  const parametre = await searchParams
  const kategori = typeof parametre.kategori === 'string' ? parametre.kategori : null
  const sok = typeof parametre.sok === 'string' ? parametre.sok.slice(0, 80) : ''

  return (
    <>
      <header className={`ramme ${styles.hode}`}>
        <p className="etikett">
          {maskiner.length} modeller · {kategorier.length} kategorier
        </p>
        <h1 className="tittel">Maskiner og utstyr</h1>
        <p className="ingress">
          Prisene gjelder per døgn. Leier du fire døgn eller mer, betaler du ukepris. Velg «Bedrift» for å se priser
          eks. mva.
        </p>
      </header>
      <Katalog
        startKategori={kategorier.some((k) => k.id === kategori) ? kategori : null}
        startSok={sok}
      />
    </>
  )
}
