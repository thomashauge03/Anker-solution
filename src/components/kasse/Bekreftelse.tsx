'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { adresseLinje, firma } from '@/data/firma'
import { antallDogn, formaterLangDato } from '@/lib/dato'
import { flertall, formaterMobil, kronerFraOre } from '@/lib/format'
import type { Beregning } from '@/lib/pris'
import { normaliserTelefon } from '@/lib/regler'
import { Tekstomraade } from '../Skjemafelt'
import type { Adresse, Feil, Kunde, Levering, Rad, StegId, Vei } from './steg'
import styles from '../Kasse.module.css'

// Steg 5: alt kunden har valgt, valget mellom å betale og å spørre, og
// totalen rett før knappen.

function Del({
  tittel,
  steg,
  endreTekst,
  endre,
  children,
}: {
  tittel: string
  steg: StegId
  endreTekst: string
  endre: (steg: StegId) => void
  children: ReactNode
}) {
  return (
    <div className={styles.oversiktRad}>
      <dt>{tittel}</dt>
      <dd className={styles.oversiktVerdi}>{children}</dd>
      <dd>
        <button type="button" className={styles.endre} onClick={() => endre(steg)}>
          Endre<span className="skjult"> {endreTekst}</span>
        </button>
      </dd>
    </div>
  )
}

export function Oversikt({
  rader,
  beregning,
  fra,
  til,
  levering,
  adresse,
  kunde,
  bedrift,
  melding,
  visPris,
  endre,
}: {
  rader: Rad[]
  beregning: Beregning | null
  fra: string | null
  til: string | null
  levering: Levering
  adresse: Adresse
  kunde: Kunde
  bedrift: boolean
  /** Meldingen fra «Opplysninger», når den står der. */
  melding: string | null
  visPris: (kr: number) => string
  endre: (steg: StegId) => void
}) {
  const epost = kunde.epost.trim()
  return (
    <dl className={styles.oversikt}>
      <Del tittel="Utstyr" steg="utstyr" endreTekst="utstyret" endre={endre}>
        <ul role="list" className={styles.oversiktPoster}>
          {rader.map(({ linje, maskin }) => {
            const sum = beregning?.linjer.find((l) => l.slug === maskin.slug)?.sum
            return (
              <li key={maskin.slug}>
                <span>
                  {linje.antall > 1 && <span className="mono">{linje.antall} × </span>}
                  {maskin.navn}
                </span>
                {sum !== undefined && <span className="mono">{visPris(sum)}</span>}
              </li>
            )
          })}
        </ul>
      </Del>

      <Del tittel="Leieperiode" steg="periode" endreTekst="leieperioden" endre={endre}>
        {fra && til ? (
          <>
            <p>
              {formaterLangDato(fra)} – {formaterLangDato(til)}
            </p>
            <p className="dempet">{flertall(antallDogn(fra, til), 'døgn', 'døgn')}</p>
          </>
        ) : (
          <p className="dempet">Ikke valgt. Vi avtaler datoene når vi svarer.</p>
        )}
      </Del>

      <Del tittel="Henting eller levering" steg="levering" endreTekst="henting eller levering" endre={endre}>
        <p className={styles.oversiktPost}>
          <span>{levering === 'levering' ? 'Levering og henting' : 'Jeg henter selv'}</span>
          <span className="mono">{levering === 'levering' ? visPris(firma.levering.prisInklMva) : '0,-'}</span>
        </p>
        <p className="dempet">
          {levering === 'levering'
            ? `${adresse.adresse.trim()}, ${adresse.postnr.trim()} ${adresse.sted.trim()}`
            : adresseLinje}
        </p>
      </Del>

      <Del tittel="Dine opplysninger" steg="opplysninger" endreTekst="opplysningene" endre={endre}>
        {bedrift && (
          <p>
            {kunde.firma.trim()} <span className="dempet">· org.nr. {kunde.orgnr.trim()}</span>
          </p>
        )}
        <p>{kunde.navn.trim()}</p>
        <p className="dempet">
          {formaterMobil(normaliserTelefon(kunde.telefon))}
          {epost && ` · ${epost}`}
        </p>
        {melding && <p className={styles.oversiktMelding}>{melding}</p>}
      </Del>
    </dl>
  )
}

export function Betalingsvalg({
  vei,
  settVei,
  kanBetale,
  etterAvtale,
  betalingApen,
  visMelding,
  melding,
  settMelding,
  godtar,
  settGodtar,
  angreKreves,
  angreAnmodning,
  settAngreAnmodning,
  feil,
}: {
  vei: Vei
  settVei: (v: Vei) => void
  kanBetale: boolean
  /** Utstyr som bare leies ut etter avtale. */
  etterAvtale: Rad[]
  betalingApen: boolean
  /** Meldingen står her når kunden selv velger forespørsel. */
  visMelding: boolean
  melding: string
  settMelding: (verdi: string) => void
  godtar: boolean
  settGodtar: (verdi: boolean) => void
  angreKreves: boolean
  angreAnmodning: boolean
  settAngreAnmodning: (verdi: boolean) => void
  feil: Feil
}) {
  return (
    <div className={styles.betaling}>
      <fieldset className={styles.valgkort}>
        <legend className={styles.delTittel}>Betal nå eller send forespørsel</legend>
        <label className={styles.valg} data-av={!kanBetale || undefined}>
          <input
            type="radio"
            name="vei"
            value="betaling"
            checked={vei === 'betaling'}
            onChange={() => settVei('betaling')}
            disabled={!kanBetale}
          />
          <span className={styles.valgTekst}>
            <strong>Betal nå</strong>
            <span>Med Vipps eller kort. Beløpet reserveres, og trekkes først når vi har bekreftet leien.</span>
          </span>
        </label>
        <label className={styles.valg}>
          <input
            type="radio"
            name="vei"
            value="foresporsel"
            checked={vei === 'foresporsel'}
            onChange={() => settVei('foresporsel')}
          />
          <span className={styles.valgTekst}>
            <strong>Send forespørsel</strong>
            <span>Ikke bindende. Vi svarer {firma.svartid} med pris og ledig dato.</span>
          </span>
        </label>
      </fieldset>
      {etterAvtale.length > 0 && (
        <p className="hjelpetekst">
          {etterAvtale.map((r) => r.maskin.navn).join(', ')} leies ut etter avtale, så listen sendes som forespørsel.
        </p>
      )}
      {etterAvtale.length === 0 && !betalingApen && (
        <p className="hjelpetekst">Betaling på nett er ikke åpnet ennå. Send listen som forespørsel.</p>
      )}

      {vei === 'foresporsel' ? (
        visMelding && (
          <Tekstomraade
            id="kasse-melding"
            etikett="Melding"
            verdi={melding}
            endre={settMelding}
            feil={feil.melding}
            valgfri
            hjelp="F.eks. hvor jobben er, om dere trenger fører, eller andre datoer."
          />
        )
      ) : (
        <div className={styles.samtykker}>
          <label className="avkrysning">
            <input
              id="kasse-vilkar"
              type="checkbox"
              checked={godtar}
              onChange={(e) => settGodtar(e.target.checked)}
              aria-invalid={feil.godtarVilkar ? true : undefined}
              aria-describedby={feil.godtarVilkar ? 'kasse-vilkar-feil' : undefined}
            />
            <span>
              Jeg har lest og godtar{' '}
              <Link href="/vilkar" target="_blank">
                leievilkårene
              </Link>
              .
            </span>
          </label>
          {feil.godtarVilkar && (
            <p id="kasse-vilkar-feil" className="feilmelding">
              {feil.godtarVilkar}
            </p>
          )}
          {angreKreves && (
            <>
              <label className="avkrysning">
                <input
                  id="kasse-angrerett"
                  type="checkbox"
                  checked={angreAnmodning}
                  onChange={(e) => settAngreAnmodning(e.target.checked)}
                  aria-invalid={feil.startForAngrefrist ? true : undefined}
                  aria-describedby={feil.startForAngrefrist ? 'kasse-angrerett-feil' : undefined}
                />
                <span>
                  Jeg ber om at leien starter før angrefristen på 14 dager er ute. Jeg vet at angreretten faller bort
                  når leieperioden er over, og at jeg betaler for dagene jeg har brukt hvis jeg angrer underveis.{' '}
                  <Link href="/vilkar#angrerett" target="_blank">
                    Les om angrerett
                  </Link>
                </span>
              </label>
              {feil.startForAngrefrist && (
                <p id="kasse-angrerett-feil" className="feilmelding">
                  {feil.startForAngrefrist}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

/** Totalen rett over knappen, så kunden ser hva knappen forplikter til. */
export function Totalboks({
  beregning,
  vei,
  bedrift,
  levering,
  testmodus,
}: {
  beregning: Beregning | null
  vei: Vei
  bedrift: boolean
  levering: Levering
  testmodus: boolean
}) {
  const medLevering = levering === 'levering' ? ' og levering' : ''
  return (
    <div className={styles.totalboks}>
      {beregning ? (
        <>
          <dl className={styles.totalboksSum}>
            <div>
              <dt>{vei === 'betaling' ? 'Å betale' : 'Veiledende pris'}</dt>
              <dd>{kronerFraOre(beregning.totalInklOre)}</dd>
            </div>
          </dl>
          <p className={styles.handlingTekst}>
            Inkl. mva{medLevering}.{bedrift && ` Eks. mva: ${kronerFraOre(beregning.totalEksOre)}.`}
          </p>
        </>
      ) : (
        <p>Prisen avhenger av perioden. Du får pris og ledig dato når vi svarer.</p>
      )}
      <p className={styles.handlingTekst}>
        {vei === 'betaling'
          ? 'Beløpet reserveres nå og trekkes når vi har bekreftet leien. Kan vi ikke levere, frigjøres hele beløpet.'
          : 'Forespørselen er ikke bindende. Du betaler ingenting nå.'}
      </p>
      {testmodus && (
        <p className={styles.test}>
          <strong>Testmodus.</strong> Betalingen simuleres — ingen penger trekkes.
        </p>
      )}
    </div>
  )
}
