import type { Metadata } from 'next'
import { Kasse } from '@/components/Kasse'
import { kortModus, vippsModus } from '@/lib/server/oppsett'
import styles from './leieliste.module.css'

export const metadata: Metadata = {
  title: 'Leieliste',
  robots: { index: false },
}

export default async function Leielisteside({ searchParams }: PageProps<'/leieliste'>) {
  const { avbrutt } = await searchParams
  return (
    <div className={`ramme ${styles.side}`}>
      <header className="sidehode">
        <p className="etikett">Bestilling</p>
        <h1 className="tittel">Leieliste</h1>
        <p className="ingress">Se over utstyret, velg periode, og betal eller send en forespørsel.</p>
      </header>
      <Kasse vipps={vippsModus()} kort={kortModus()} avbrutt={avbrutt === '1'} />
    </div>
  )
}
