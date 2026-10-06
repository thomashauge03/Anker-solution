'use client'

import Link from 'next/link'
import { useState } from 'react'
import { firma } from '@/data/firma'
import { antallDogn } from '@/lib/dato'
import { leieliste, useLeieliste } from '@/lib/leieliste'
import { leiepris } from '@/lib/pris'
import { Periodevelger } from './Periodevelger'
import { Pil } from './Pil'
import { MvaTekst, Pris } from './Pris'
import styles from './Bestillingsboks.module.css'

type Props = {
  slug: string
  navn: string
  dognpris: number
  ukepris: number
  antall: number
  kunForesporsel: boolean
  kreverLevering: boolean
}

function prisforklaring(dogn: number, p: { dognpris: number; ukepris: number }): string {
  const uker = Math.floor(dogn / 7)
  const rest = dogn % 7
  const deler: string[] = []
  if (uker > 0) deler.push(`${uker} ${uker === 1 ? 'uke' : 'uker'}`)
  if (rest > 0) {
    deler.push(rest * p.dognpris >= p.ukepris ? `${rest} døgn til ukepris` : `${rest} døgn`)
  }
  return deler.join(' + ')
}

export function Bestillingsboks({ slug, navn, dognpris, ukepris, antall, kunForesporsel, kreverLevering }: Props) {
  const liste = useLeieliste()
  const [mengde, settMengde] = useState(1)
  const [lagtTil, settLagtTil] = useState(false)

  const iLista = liste.linjer.find((l) => l.slug === slug)?.antall ?? 0
  // Kunden kan ikke legge til flere enn vi har.
  const ledige = Math.max(0, antall - iLista)
  const valgt = Math.min(mengde, Math.max(1, ledige))
  const dogn = liste.fra && liste.til ? antallDogn(liste.fra, liste.til) : null
  const sum = dogn ? leiepris({ dognpris, ukepris }, dogn) * valgt : null

  function leggTil() {
    if (ledige < 1) return
    leieliste.leggTil(slug, valgt)
    settMengde(1)
    settLagtTil(true)
  }

  return (
    <section className={styles.boks} aria-labelledby="bestill-tittel">
      <h2 id="bestill-tittel" className={styles.tittel}>
        {kunForesporsel ? 'Spør om leie' : 'Lei denne'}
      </h2>

      <Periodevelger visDogn />

      {antall > 1 && ledige > 1 && (
        <div className={`felt ${styles.mengde}`}>
          <span className="felt-etikett" id={`${slug}-antall`}>
            Antall
          </span>
          <div className={styles.stepper} role="group" aria-labelledby={`${slug}-antall`}>
            <button
              type="button"
              onClick={() => settMengde(Math.max(1, valgt - 1))}
              disabled={valgt <= 1}
              aria-label="Færre"
            >
              −
            </button>
            <output aria-live="polite">{valgt}</output>
            <button
              type="button"
              onClick={() => settMengde(Math.min(ledige, valgt + 1))}
              disabled={valgt >= ledige}
              aria-label="Flere"
            >
              +
            </button>
          </div>
          <span className="hjelpetekst">Vi har {antall} stk.</span>
        </div>
      )}

      <div className={styles.sum} aria-live="polite">
        {sum !== null && dogn !== null ? (
          <>
            <div>
              <p className="etikett">Pris for perioden</p>
              <p className={styles.forklaring}>
                {valgt > 1 ? `${valgt} stk. · ` : ''}
                {prisforklaring(dogn, { dognpris, ukepris })}
              </p>
            </div>
            <p className={styles.belop}>
              {kunForesporsel && <span className={styles.fra}>fra </span>}
              <Pris kr={sum} />
              <span className={styles.mva}>
                <MvaTekst />
              </span>
            </p>
          </>
        ) : (
          <p className="dempet">Velg datoer for å se hva leien koster.</p>
        )}
      </div>

      {kunForesporsel && (
        <p className={styles.merknad}>
          {navn} leies ut etter avtale, fordi transport og eventuell fører må planlegges. Legg den i leielisten og send
          en forespørsel. Vi svarer {firma.svartid}.
        </p>
      )}
      {kreverLevering && !kunForesporsel && (
        <p className={styles.merknad}>
          Leveres og hentes av oss innen {firma.levering.radiusKm} km for <Pris kr={firma.levering.prisInklMva} />.
        </p>
      )}

      <div className={styles.knapper}>
        <button type="button" className="knapp knapp--bred" onClick={leggTil} disabled={ledige < 1}>
          {ledige < 1 ? 'Alle vi har ligger i leielisten' : 'Legg i leielisten'}
          <Pil />
        </button>
        {!kunForesporsel && (
          <Link href={`/kontakt?maskin=${slug}`} className="knapp knapp--omriss knapp--bred">
            Har du spørsmål? Spør oss
            <Pil />
          </Link>
        )}
      </div>

      {(lagtTil || iLista > 0) && (
        <div className={styles.kvittering} role="status">
          <p>
            <span className={styles.hake} aria-hidden="true" />
            {iLista > 0 ? `${iLista} stk. i leielisten.` : 'Lagt i leielisten.'}
          </p>
          <Link href="/leieliste" className="pil-lenke">
            Gå til leielisten <Pil />
          </Link>
        </div>
      )}
    </section>
  )
}
