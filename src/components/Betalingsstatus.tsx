'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { adresseLinje, firma } from '@/data/firma'
import { formaterLangDato, formaterPeriode } from '@/lib/dato'
import { kroner, kronerFraOre } from '@/lib/format'
import { leieliste } from '@/lib/leieliste'
import { Pil } from './Pil'
import styles from './Betalingsstatus.module.css'

type Ordre = {
  fra: string
  til: string
  dogn: number
  levering: 'henting' | 'levering'
  linjer: { navn: string; kode: string; antall: number; sum: number }[]
  leveringspris: number
  totalInklOre: number
  mvaOre: number
  epost: string
}

type Svar = {
  status: 'reservert' | 'betalt' | 'venter' | 'avbrutt' | 'ukjent'
  referanse?: string
  test?: boolean
  ordre?: Ordre
  feil?: string
}

const lagringsnokkel = (ref: string) => `anker:kvittering:${ref}`

/** Kvitteringen lagres i økta, så en ny lasting viser det samme. */
function lesLagret(ref: string): Svar | null {
  try {
    const raa = window.sessionStorage.getItem(lagringsnokkel(ref))
    return raa ? (JSON.parse(raa) as Svar) : null
  } catch {
    return null
  }
}

export function Betalingsstatus() {
  const p = useSearchParams()
  const ref = p.get('ref') ?? ''
  // Siden tegnes bare i nettleseren (useSearchParams under Suspense).
  const [svar, settSvar] = useState<Svar | null>(() => (typeof window === 'undefined' ? null : lesLagret(ref)))
  const [laster, settLaster] = useState(() => svar === null)
  const kalt = useRef(false)

  const hent = useCallback(async () => {
    try {
      const res = await fetch('/api/betaling/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parametre: p.toString() }),
      })
      const data = (await res.json()) as Svar
      if (!res.ok) {
        settSvar({ status: 'ukjent', feil: data.feil })
      } else {
        const tidligere = lesLagret(ref)
        const samlet = { ...data, ordre: data.ordre ?? tidligere?.ordre }
        settSvar(samlet)
        if (data.status === 'reservert' || data.status === 'betalt') {
          leieliste.tom()
          try {
            window.sessionStorage.setItem(lagringsnokkel(ref), JSON.stringify(samlet))
          } catch {
            // Ikke kritisk.
          }
        }
      }
    } catch {
      settSvar({ status: 'ukjent', feil: 'Fikk ikke kontakt med serveren.' })
    }
    settLaster(false)
  }, [p, ref])

  useEffect(() => {
    // React kjører effekter to ganger i utvikling. Kallet sender e-post,
    // så det skal bare gå én gang — og ikke i det hele tatt når kvitteringen
    // allerede er lagret i økta.
    if (kalt.current || svar) return
    kalt.current = true
    void hent()
  }, [hent, svar])

  function sjekkIgjen() {
    settLaster(true)
    void hent()
  }

  if (laster && !svar) {
    return (
      <div className={styles.boks} aria-live="polite">
        <p className="etikett">Bestilling {ref}</p>
        <p className="underoverskrift">Sjekker betalingen …</p>
      </div>
    )
  }

  if (!svar) return null

  if (svar.status === 'reservert' || svar.status === 'betalt') {
    return <Bekreftelse svar={svar} referanse={ref} />
  }

  if (svar.status === 'avbrutt') {
    return (
      <div className={styles.boks}>
        <p className="etikett">Bestilling {ref}</p>
        <h1 className="tittel">Betalingen ble avbrutt.</h1>
        <p className="ingress">Ingenting er trukket. Leielisten ligger der den lå, så du kan prøve igjen.</p>
        <div className={styles.knapper}>
          <Link href="/leieliste" className="knapp">
            Tilbake til leielisten <Pil />
          </Link>
        </div>
      </div>
    )
  }

  if (svar.status === 'venter') {
    return (
      <div className={styles.boks}>
        <p className="etikett">Bestilling {ref}</p>
        <h1 className="tittel">Betalingen er ikke fullført ennå.</h1>
        <p className="ingress">
          Har du godkjent i Vipps eller med kortet? Det kan ta noen sekunder før vi får beskjed.
        </p>
        <div className={styles.knapper}>
          <button type="button" className="knapp" onClick={sjekkIgjen} disabled={laster}>
            {laster ? 'Sjekker …' : 'Sjekk igjen'} <Pil />
          </button>
          <Link href="/leieliste" className="knapp knapp--omriss">
            Tilbake til leielisten
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.boks}>
      <p className="etikett">Bestilling {ref || 'ukjent'}</p>
      <h1 className="tittel">Vi finner ikke betalingen.</h1>
      <p className="ingress">
        {svar.feil ?? 'Lenken kan være for gammel.'} Har du betalt, er bestillingen ikke borte — ring oss på{' '}
        <a href={`tel:${firma.telefon}`}>{firma.telefonVisning}</a>, så sjekker vi.
      </p>
      <div className={styles.knapper}>
        <Link href="/leieliste" className="knapp knapp--omriss">
          Til leielisten
        </Link>
      </div>
    </div>
  )
}

function Bekreftelse({ svar, referanse }: { svar: Svar; referanse: string }) {
  const o = svar.ordre
  return (
    <div className={styles.bekreftelse}>
      <div className={styles.hode}>
        <p className="etikett">Referanse {referanse}</p>
        <h1 className="display">Takk!</h1>
        <p className="ingress">
          Bestillingen er mottatt, og beløpet er reservert. Vi sjekker at utstyret er klart og bekrefter leien
          {o?.epost ? ` på ${o.epost}` : ' på e-post'}. Først da trekkes pengene.
        </p>
        {svar.test && (
          <p className={styles.test}>
            <strong>Testmodus.</strong> Ingen penger er reservert, og e-postene ble skrevet til serverloggen.
          </p>
        )}
      </div>

      <div className={styles.rutenett}>
        <section aria-labelledby="neste">
          <h2 id="neste" className={styles.seksjonstittel}>
            Dette skjer nå
          </h2>
          <ol role="list" className={styles.steg}>
            <li>
              <span>01</span>
              Vi bekrefter leien {firma.svartid}.
            </li>
            <li>
              <span>02</span>
              Beløpet trekkes når leien er bekreftet. Kan vi ikke levere, frigjøres hele beløpet.
            </li>
            <li>
              <span>03</span>
              {o?.levering === 'levering'
                ? `Vi leverer utstyret ${o ? formaterLangDato(o.fra) : ''}.`
                : `Hent utstyret ${o ? formaterLangDato(o.fra) : ''} på ${adresseLinje}.`}
            </li>
          </ol>
        </section>

        {o && (
          <section aria-labelledby="ordre" className={styles.ordre}>
            <h2 id="ordre" className={styles.seksjonstittel}>
              Bestillingen
            </h2>
            <p className="mono">
              {formaterPeriode(o.fra, o.til)} · {o.dogn} døgn
            </p>
            <dl className={styles.poster}>
              {o.linjer.map((l) => (
                <div key={l.kode}>
                  <dt>
                    {l.antall > 1 && `${l.antall} × `}
                    {l.navn}
                  </dt>
                  <dd className="mono">{kroner(l.sum)}</dd>
                </div>
              ))}
              {o.leveringspris > 0 && (
                <div>
                  <dt>Levering og henting</dt>
                  <dd className="mono">{kroner(o.leveringspris)}</dd>
                </div>
              )}
              <div className={styles.total}>
                <dt>Reservert</dt>
                <dd>{kronerFraOre(o.totalInklOre)}</dd>
              </div>
              <div className={styles.herav}>
                <dt>Herav mva</dt>
                <dd className="mono">{kronerFraOre(o.mvaOre)}</dd>
              </div>
            </dl>
          </section>
        )}
      </div>

      <div className={styles.knapper}>
        <Link href="/maskiner" className="knapp knapp--omriss">
          Se mer utstyr <Pil />
        </Link>
      </div>
    </div>
  )
}
