import type { Metadata } from 'next'
import { Bolgeskille } from '@/components/Bolgeskille'
import { Katalog } from '@/components/Katalog'
import { Sidehode } from '@/components/Sidehode'
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
      <Sidehode etikett="Utvalg" tittel="Maskiner" form={11}>
        <p className="ingress">
          {maskiner.length} maskiner og verktøy. Pris per døgn, og fra fire døgn betaler du ukepris.
        </p>
      </Sidehode>
      <Bolgeskille form={3} />
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
