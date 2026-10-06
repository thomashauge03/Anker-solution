'use client'

import { adresseLinje, firma } from '@/data/firma'
import { Tekstfelt } from '../Skjemafelt'
import type { Adresse, Feil, Levering, Rad } from './steg'
import styles from '../Kasse.module.css'

/** Steg 3: hente selv, eller få det levert og hentet. */
export function Leveringsvalg({
  valgt,
  settLevering,
  maaLeveres,
  adresse,
  settAdressefelt,
  feil,
  visPris,
}: {
  valgt: Levering
  settLevering: (l: Levering) => void
  /** Utstyr som er for tungt for vanlig henger. */
  maaLeveres: Rad[]
  adresse: Adresse
  settAdressefelt: (felt: keyof Adresse) => (verdi: string) => void
  feil: Feil
  visPris: (kr: number) => string
}) {
  return (
    <>
      <fieldset className={styles.valgkort} aria-describedby={feil.levering ? 'kasse-levering-feil' : undefined}>
        <legend className="skjult">Henting eller levering</legend>
        <label className={styles.valg} data-av={maaLeveres.length > 0 || undefined}>
          <input
            id="kasse-levering-henting"
            type="radio"
            name="levering"
            value="henting"
            checked={valgt === 'henting'}
            onChange={() => settLevering('henting')}
            disabled={maaLeveres.length > 0}
          />
          <span className={styles.valgTekst}>
            <strong>Jeg henter selv</strong>
            <span>{adresseLinje}</span>
          </span>
          <span className={styles.valgPris}>{visPris(0)}</span>
        </label>
        <label className={styles.valg}>
          <input
            type="radio"
            name="levering"
            value="levering"
            checked={valgt === 'levering'}
            onChange={() => settLevering('levering')}
          />
          <span className={styles.valgTekst}>
            <strong>Levering og henting</strong>
            <span>Innen {firma.levering.radiusKm}&nbsp;km fra lageret. Lenger unna? Send forespørsel.</span>
          </span>
          <span className={styles.valgPris}>{visPris(firma.levering.prisInklMva)}</span>
        </label>
      </fieldset>
      {maaLeveres.length > 0 && (
        <p className="hjelpetekst">
          {maaLeveres.map((r) => r.maskin.navn).join(', ')} er for tung for vanlig henger, og må leveres av oss.
        </p>
      )}
      {feil.levering && (
        <p id="kasse-levering-feil" className="feilmelding">
          {feil.levering}
        </p>
      )}
      {valgt === 'levering' && (
        <div className={styles.adresse}>
          <Tekstfelt
            id="kasse-adresse"
            etikett="Leveringsadresse"
            verdi={adresse.adresse}
            endre={settAdressefelt('adresse')}
            feil={feil['levering.adresse']}
            autoComplete="street-address"
            className={styles.helBredde}
          />
          <Tekstfelt
            id="kasse-postnr"
            etikett="Postnummer"
            verdi={adresse.postnr}
            endre={settAdressefelt('postnr')}
            feil={feil['levering.postnr']}
            autoComplete="postal-code"
            inputMode="numeric"
            maks={4}
          />
          <Tekstfelt
            id="kasse-sted"
            etikett="Poststed"
            verdi={adresse.sted}
            endre={settAdressefelt('sted')}
            feil={feil['levering.sted']}
            autoComplete="address-level2"
            maks={60}
          />
        </div>
      )}
    </>
  )
}
