'use client'

import Link from 'next/link'
import { useId } from 'react'
import { leieliste, type Kundetype } from '@/lib/leieliste'
import { Tekstfelt, Tekstomraade } from '../Skjemafelt'
import type { Feil, Kunde, Vei } from './steg'
import styles from '../Kasse.module.css'

/** Steg 4: hvem som leier, og hvordan vi får tak i dem. */
export function Kundeopplysninger({
  kundetype,
  kunde,
  settKundefelt,
  vei,
  visMelding,
  melding,
  settMelding,
  feil,
}: {
  kundetype: Kundetype
  kunde: Kunde
  settKundefelt: (felt: keyof Kunde) => (verdi: string) => void
  vei: Vei
  /** Meldingen står her når listen bare kan sendes som forespørsel. */
  visMelding: boolean
  melding: string
  settMelding: (verdi: string) => void
  feil: Feil
}) {
  const id = useId()
  const bedrift = kundetype === 'bedrift'
  return (
    <>
      <fieldset className={styles.kundetype}>
        <legend className="felt-etikett">Jeg leier som</legend>
        {(['privat', 'bedrift'] as const).map((t) => (
          <label key={t} className={styles.kundetypeValg}>
            <input
              type="radio"
              name={`${id}-kundetype`}
              value={t}
              checked={kundetype === t}
              onChange={() => leieliste.settKundetype(t)}
            />
            <span>{t === 'privat' ? 'Privatperson' : 'Bedrift'}</span>
          </label>
        ))}
      </fieldset>
      <div className={styles.felter}>
        {bedrift && (
          <>
            <Tekstfelt
              id="kasse-firma"
              etikett="Firmanavn"
              verdi={kunde.firma}
              endre={settKundefelt('firma')}
              feil={feil['kunde.firma']}
              autoComplete="organization"
            />
            <Tekstfelt
              id="kasse-orgnr"
              etikett="Org.nr."
              verdi={kunde.orgnr}
              endre={settKundefelt('orgnr')}
              feil={feil['kunde.orgnr']}
              inputMode="numeric"
              maks={11}
            />
          </>
        )}
        <Tekstfelt
          id="kasse-navn"
          etikett={bedrift ? 'Kontaktperson' : 'Fullt navn'}
          verdi={kunde.navn}
          endre={settKundefelt('navn')}
          feil={feil['kunde.navn']}
          autoComplete="name"
          maks={100}
        />
        <Tekstfelt
          id="kasse-telefon"
          etikett="Mobil"
          type="tel"
          verdi={kunde.telefon}
          endre={settKundefelt('telefon')}
          feil={feil['kunde.telefon']}
          autoComplete="tel-national"
          inputMode="tel"
          maks={16}
        />
        <Tekstfelt
          id="kasse-epost"
          etikett="E-post"
          type="email"
          verdi={kunde.epost}
          endre={settKundefelt('epost')}
          feil={feil['kunde.epost']}
          autoComplete="email"
          valgfri={vei === 'foresporsel'}
          hjelp={vei === 'betaling' ? 'Kvitteringen og bekreftelsen sendes hit.' : undefined}
          maks={200}
          className={styles.helBredde}
        />
      </div>
      {visMelding && (
        <Tekstomraade
          id="kasse-melding"
          etikett="Melding"
          verdi={melding}
          endre={settMelding}
          feil={feil.melding}
          valgfri
          hjelp="F.eks. hvor jobben er, om dere trenger fører, eller andre datoer."
        />
      )}
      <p className="hjelpetekst">
        Opplysningene brukes bare til denne leien. Les mer i{' '}
        <Link href="/personvern" target="_blank">
          personvernerklæringen
        </Link>
        .
      </p>
    </>
  )
}
