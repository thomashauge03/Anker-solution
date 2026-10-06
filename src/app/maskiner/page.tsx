import type { Metadata } from 'next'
import { Katalog } from '@/components/Katalog'
import { kategorier, maskiner } from '@/data/maskiner'

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
      <header className="ramme sidehode">
        <p className="etikett">Utvalg</p>
        <h1 className="tittel">Maskiner</h1>
        <p className="ingress">
          {maskiner.length} maskiner og verktøy. Pris per døgn — fra fire døgn betaler du ukepris.
        </p>
      </header>
      {/* Nøkkelen gjør at en lenke til et annet filter starter katalogen på
          nytt, i stedet for å beholde det forrige. */}
      <Katalog
        key={`${kategori ?? ''}|${sok}`}
        startKategori={kategorier.some((k) => k.id === kategori) ? kategori : null}
        startSok={sok}
      />
    </>
  )
}
