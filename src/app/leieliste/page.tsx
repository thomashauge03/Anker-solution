import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Kasse } from '@/components/Kasse'
import { kortModus, vippsModus } from '@/lib/server/oppsett'
import styles from './leieliste.module.css'

export const metadata: Metadata = {
  title: 'Leieliste',
  robots: { index: false },
}

export default async function Leielisteside() {
  // Lages ved hver forespørsel, så betalingsvalgene følger miljøet. Kassen
  // leser selv steget og «avbrutt» fra adressen.
  await connection()
  return (
    <div className={`ramme ${styles.side}`}>
      <header className="sidehode">
        <p className="etikett">Bestilling</p>
        <h1 className="tittel">Leieliste</h1>
        <p className="ingress">Se over utstyret, velg periode, og betal eller send en forespørsel.</p>
      </header>
      <Kasse vipps={vippsModus()} kort={kortModus()} />
    </div>
  )
}
