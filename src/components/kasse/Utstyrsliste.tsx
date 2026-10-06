'use client'

import Link from 'next/link'
import { leieliste } from '@/lib/leieliste'
import type { Beregning } from '@/lib/pris'
import { Pil } from '../Pil'
import { Piktogram } from '../Piktogram'
import type { Rad } from './steg'
import styles from '../Kasse.module.css'

/** Steg 1: utstyret i listen, med antall og pris for perioden. */
export function Utstyrsliste({
  rader,
  beregning,
  visPris,
}: {
  rader: Rad[]
  beregning: Beregning | null
  visPris: (kr: number) => string
}) {
  return (
    <>
      <ul role="list">
        {rader.map(({ linje, maskin }) => {
          const linjesum = beregning?.linjer.find((l) => l.slug === maskin.slug)?.sum
          return (
            <li key={maskin.slug} className={styles.linje}>
              <div className={styles.linjeBilde}>
                <Piktogram id={maskin.piktogram} skala={maskin.skala} />
              </div>
              <div className={styles.linjeTekst}>
                <p className="etikett dempet">{maskin.kode}</p>
                <Link href={`/maskiner/${maskin.slug}`} className={styles.linjeNavn}>
                  {maskin.navn}
                </Link>
                {maskin.kunForesporsel && <p className={styles.linjeMerknad}>Leies ut etter avtale</p>}
                {maskin.kreverLevering && !maskin.kunForesporsel && (
                  <p className={styles.linjeMerknad}>Må leveres av oss</p>
                )}
              </div>
              <div className={styles.linjeAntall} role="group" aria-label={`Antall ${maskin.navn}`}>
                <button
                  type="button"
                  onClick={() => leieliste.settAntall(maskin.slug, linje.antall - 1)}
                  disabled={linje.antall <= 1}
                  aria-label="Færre"
                >
                  −
                </button>
                <output aria-live="polite">{linje.antall}</output>
                <button
                  type="button"
                  onClick={() => leieliste.settAntall(maskin.slug, linje.antall + 1)}
                  disabled={linje.antall >= maskin.antall}
                  aria-label="Flere"
                >
                  +
                </button>
              </div>
              <p className={styles.linjeSum}>
                {linjesum !== undefined ? (
                  visPris(linjesum)
                ) : (
                  <span className="dempet">{visPris(maskin.dognpris)} / døgn</span>
                )}
              </p>
              <button
                type="button"
                className={styles.fjern}
                onClick={() => leieliste.fjern(maskin.slug)}
                aria-label={`Fjern ${maskin.navn}`}
              >
                Fjern
              </button>
            </li>
          )
        })}
      </ul>
      <Link href="/maskiner" className={`pil-lenke ${styles.merUtstyr}`}>
        Legg til mer utstyr <Pil />
      </Link>
    </>
  )
}
