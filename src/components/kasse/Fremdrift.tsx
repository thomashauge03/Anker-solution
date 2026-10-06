'use client'

import { stegliste, stegnr, type StegId } from './steg'
import styles from '../Kasse.module.css'

/**
 * Stegene øverst i kassen. Steg kunden allerede har vært på, kan klikkes.
 * På mobil blir det bare «Steg 2 av 5 · Periode» og en tynn linje.
 */
export function Fremdrift({
  naa,
  lengst,
  gaaTil,
}: {
  naa: StegId
  /** Det lengste steget kunden har kommet til, fra 0. */
  lengst: number
  gaaTil: (steg: StegId) => void
}) {
  const nr = stegnr(naa)
  return (
    <nav aria-label="Steg i bestillingen">
      <ol role="list" className={styles.fremdriftListe}>
        {stegliste.map((s, i) => {
          const tilstand = i === nr ? 'naa' : i < nr || i <= lengst ? 'ferdig' : 'senere'
          const tekst = (
            <>
              <span className={styles.fremdriftNr} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              {s.navn}
            </>
          )
          return (
            <li
              key={s.id}
              className={styles.fremdriftSteg}
              data-tilstand={tilstand}
              aria-current={i === nr ? 'step' : undefined}
            >
              {tilstand === 'ferdig' ? (
                <button type="button" onClick={() => gaaTil(s.id)}>
                  {tekst}
                  {i < nr && <span className="skjult">, fullført</span>}
                </button>
              ) : (
                <span>{tekst}</span>
              )}
            </li>
          )
        })}
      </ol>

      <div className={styles.fremdriftKompakt}>
        <span className={styles.fremdriftLinje} aria-hidden="true">
          <span style={{ transform: `scaleX(${(nr + 1) / stegliste.length})` }} />
        </span>
        <p>
          Steg {nr + 1} av {stegliste.length} · <strong>{stegliste[nr].navn}</strong>
        </p>
      </div>
    </nav>
  )
}
