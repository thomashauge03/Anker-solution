'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { firma } from '@/data/firma'
import { formaterMobil } from '@/lib/format'
import { normaliserTelefon } from '@/lib/regler'
import { Pil } from '../Pil'
import styles from '../Kasse.module.css'

export function ForesporselSendt({ referanse, test, telefon }: { referanse: string; test: boolean; telefon: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => ref.current?.focus(), [])
  return (
    <div className={styles.kvittering}>
      <p className="etikett">Referanse {referanse}</p>
      <h2 ref={ref} tabIndex={-1} className="tittel">
        Forespørselen er sendt.
      </h2>
      <p className="ingress">
        Takk! Vi ringer deg på {formaterMobil(normaliserTelefon(telefon))} {firma.svartid} med pris og ledig dato.
        Du har ikke bestilt noe ennå.
      </p>
      {test && (
        <p className={styles.test}>
          <strong>Testmodus.</strong> E-posten ble skrevet til serverloggen i stedet for å bli sendt.
        </p>
      )}
      <div className={styles.tomKnapper}>
        <Link href="/maskiner" className="knapp">
          Se mer utstyr <Pil />
        </Link>
        <Link href="/" className="knapp knapp--omriss">
          Til forsiden
        </Link>
      </div>
    </div>
  )
}
