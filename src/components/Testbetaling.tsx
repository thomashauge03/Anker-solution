'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Pil } from './Pil'
import styles from './Testbetaling.module.css'

/**
 * Står i stedet for Vipps eller Stripe når nøklene mangler. Kunden velger
 * selv utfallet, og sendes videre slik leverandøren ville gjort.
 */
export function Testbetaling() {
  const p = useSearchParams()
  const router = useRouter()
  const ref = p.get('ref') ?? ''
  const metode = p.get('metode') === 'kort' ? 'kort' : 'vipps'
  const navn = metode === 'vipps' ? 'Vipps' : 'kort'

  function videre(utfall: 'godkjent' | 'avbrutt') {
    const q = new URLSearchParams({ ref, metode, test: utfall })
    router.replace(`/betaling/status?${q}`)
  }

  return (
    <section className={styles.boks} aria-labelledby="test-tittel">
      <p className={styles.baand}>Testmodus · ingen penger trekkes</p>
      <div className={styles.innhold}>
        <p className="etikett">Bestilling {ref}</p>
        <h1 id="test-tittel" className="overskrift">
          Testbetaling med {navn}
        </h1>
        <p>
          Her ville kunden blitt sendt til {metode === 'vipps' ? 'Vipps-appen' : 'kortbetaling hos Stripe'}. Når
          nøklene er lagt inn, skjer det automatisk. Velg hva som skal skje:
        </p>
        <div className={styles.knapper}>
          <button
            type="button"
            className={`knapp ${metode === 'vipps' ? 'knapp--vipps' : ''}`}
            onClick={() => videre('godkjent')}
          >
            Godkjenn betalingen <Pil />
          </button>
          <button type="button" className="knapp knapp--omriss" onClick={() => videre('avbrutt')}>
            Avbryt
          </button>
        </div>
      </div>
    </section>
  )
}
