'use client'

import { firma } from '@/data/firma'
import { formaterPeriode } from '@/lib/dato'
import { flertall, kronerFraOre } from '@/lib/format'
import type { Beregning } from '@/lib/pris'
import type { Levering, Rad, Vei } from './steg'
import styles from '../Kasse.module.css'

/** Prisen ved siden av stegene på store skjermer. */
export function Sammendrag({
  rader,
  fra,
  til,
  beregning,
  levering,
  vei,
  bedrift,
  visPris,
}: {
  rader: Rad[]
  fra: string | null
  til: string | null
  beregning: Beregning | null
  levering: Levering
  vei: Vei
  bedrift: boolean
  visPris: (kr: number) => string
}) {
  return (
    <aside className={styles.sammendrag} aria-labelledby="sammendrag-tittel">
      <div className={styles.sammendragInnhold}>
        <h2 id="sammendrag-tittel" className={styles.sammendragTittel}>
          Sammendrag
        </h2>
        {fra && til ? (
          <p className={styles.periode}>
            <span className="mono">{formaterPeriode(fra, til)}</span>
            {beregning && <span className="dempet"> · {beregning.dogn} døgn</span>}
          </p>
        ) : (
          <p className={`${styles.periode} dempet`}>Velg periode for å se totalpris.</p>
        )}

        <dl className={styles.poster}>
          {rader.map(({ linje, maskin }) => {
            const sum = beregning?.linjer.find((l) => l.slug === maskin.slug)?.sum
            return (
              <div key={maskin.slug}>
                <dt>
                  {linje.antall > 1 && <span className="mono">{linje.antall} × </span>}
                  {maskin.navn}
                </dt>
                <dd className="mono">
                  {sum !== undefined ? visPris(sum) : `${visPris(maskin.dognpris * linje.antall)} / døgn`}
                </dd>
              </div>
            )
          })}
          <div>
            <dt>{levering === 'levering' ? 'Levering og henting' : 'Henting'}</dt>
            <dd className="mono">{visPris(levering === 'levering' ? firma.levering.prisInklMva : 0)}</dd>
          </div>
        </dl>

        {beregning && (
          <dl className={styles.total}>
            {bedrift ? (
              <>
                <div>
                  <dt>Sum eks. mva</dt>
                  <dd className="mono">{kronerFraOre(beregning.totalEksOre)}</dd>
                </div>
                <div>
                  <dt>Mva 25 %</dt>
                  <dd className="mono">{kronerFraOre(beregning.mvaOre)}</dd>
                </div>
              </>
            ) : null}
            <div className={styles.totalsum}>
              <dt>{vei === 'betaling' ? 'Å betale' : 'Veiledende pris'}</dt>
              <dd>{kronerFraOre(beregning.totalInklOre)}</dd>
            </div>
            {!bedrift && (
              <div className={styles.herav}>
                <dt>Herav mva</dt>
                <dd className="mono">{kronerFraOre(beregning.mvaOre)}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </aside>
  )
}

/** Kort sum over knappene når sammendraget ikke får plass ved siden av. */
export function Sumlinje({ beregning, bedrift }: { beregning: Beregning | null; bedrift: boolean }) {
  if (!beregning) {
    return <p className={`${styles.sumlinje} dempet`}>Velg periode for å se totalpris.</p>
  }
  return (
    <p className={styles.sumlinje}>
      <span>
        Sum{' '}
        <span className="dempet">
          · {flertall(beregning.dogn, 'døgn', 'døgn')}, {bedrift ? 'eks.' : 'inkl.'} mva
        </span>
      </span>
      <strong className="mono">{kronerFraOre(bedrift ? beregning.totalEksOre : beregning.totalInklOre)}</strong>
    </p>
  )
}
