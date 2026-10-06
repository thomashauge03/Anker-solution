'use client'

import { useId } from 'react'
import { antallDogn, iDagINorge, leggTilDager } from '@/lib/dato'
import { flertall } from '@/lib/format'
import { leieliste, useLeieliste } from '@/lib/leieliste'
import { MAKS_DAGER_FRAM, MAKS_DOGN } from '@/lib/regler'
import styles from './Periodevelger.module.css'

/**
 * Hente- og returdato. Perioden er felles for hele leielisten, så den
 * følger kunden fra forsiden via maskinsiden til kassen.
 */
export function Periodevelger({
  feil,
  visDogn = false,
}: {
  feil?: { fra?: string; til?: string }
  visDogn?: boolean
}) {
  const id = useId()
  const { fra, til } = useLeieliste()
  const idag = iDagINorge()
  const sisteDag = leggTilDager(idag, MAKS_DAGER_FRAM)

  function endreFra(verdi: string) {
    if (!verdi) {
      leieliste.settPeriode(null, null)
      return
    }
    // Uten returdato, eller retur før henting: foreslå ett døgn.
    const nyTil = !til || til < verdi ? leggTilDager(verdi, 1) : til
    leieliste.settPeriode(verdi, nyTil)
  }

  function endreTil(verdi: string) {
    if (!verdi) {
      leieliste.settPeriode(null, null)
      return
    }
    const nyFra = fra && fra <= verdi ? fra : verdi < idag ? idag : verdi
    leieliste.settPeriode(nyFra, verdi)
  }

  const dogn = fra && til ? antallDogn(fra, til) : null

  return (
    <div className={styles.periode}>
      <div className="felt">
        <label htmlFor={`${id}-fra`}>Hentes</label>
        <input
          id={`${id}-fra`}
          type="date"
          className="inndata"
          min={idag}
          max={sisteDag}
          value={fra ?? ''}
          onChange={(e) => endreFra(e.target.value)}
          aria-invalid={feil?.fra ? true : undefined}
          aria-describedby={feil?.fra ? `${id}-fra-feil` : undefined}
        />
        {feil?.fra && (
          <p id={`${id}-fra-feil`} className="feilmelding">
            {feil.fra}
          </p>
        )}
      </div>
      <div className="felt">
        <label htmlFor={`${id}-til`}>Leveres tilbake</label>
        <input
          id={`${id}-til`}
          type="date"
          className="inndata"
          min={fra ?? idag}
          max={fra ? leggTilDager(fra, MAKS_DOGN) : sisteDag}
          value={til ?? ''}
          onChange={(e) => endreTil(e.target.value)}
          aria-invalid={feil?.til ? true : undefined}
          aria-describedby={feil?.til ? `${id}-til-feil` : undefined}
        />
        {feil?.til && (
          <p id={`${id}-til-feil`} className="feilmelding">
            {feil.til}
          </p>
        )}
      </div>
      {visDogn && (
        <p className={styles.dogn} aria-live="polite">
          {dogn && (
            <>
              <span className="mono">{flertall(dogn, 'døgn', 'døgn')}</span>
              {fra === til && <span className="dempet"> · samme dag regnes som ett døgn</span>}
            </>
          )}
        </p>
      )}
    </div>
  )
}
