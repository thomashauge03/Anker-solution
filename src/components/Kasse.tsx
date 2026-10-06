'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { firma } from '@/data/firma'
import { finnMaskin } from '@/data/maskiner'
import { kroner } from '@/lib/format'
import { leieliste, useErKlient, useLeieliste } from '@/lib/leieliste'
import { beregnBestilling, eksMvaOre } from '@/lib/pris'
import { starterForAngrefrist } from '@/lib/regler'
import { Betalingsvalg, Oversikt, Totalboks } from './kasse/Bekreftelse'
import { ForesporselSendt } from './kasse/ForesporselSendt'
import { Fremdrift } from './kasse/Fremdrift'
import { Kundeopplysninger } from './kasse/Kundeopplysninger'
import { Leveringsvalg } from './kasse/Leveringsvalg'
import { Sammendrag, Sumlinje } from './kasse/Sammendrag'
import {
  feilISteg,
  feltId,
  feltrekkefolge,
  forsteUferdige,
  harFeil,
  lesSteg,
  sjekk,
  stegForFelt,
  stegliste,
  stegnr,
  type Adresse,
  type Feil,
  type Kunde,
  type Levering,
  type Rad,
  type StegId,
  type Vei,
} from './kasse/steg'
import { Utstyrsliste } from './kasse/Utstyrsliste'
import { Periodevelger } from './Periodevelger'
import { Pil } from './Pil'
import { Honningkrukke } from './Skjemafelt'
import styles from './Kasse.module.css'

type Modus = 'ekte' | 'test' | 'av'

type Props = { vipps: Modus; kort: Modus }

/** Steget som vises, steget adressen ba om, og det lengste kunden har kommet. */
type Visning = { onsket: StegId; vist: StegId; lengst: number }

const MANGLER = 'Noen felt mangler eller er feil. De er merket under.'

/** Fokus på feltet med feil. Feil uten felt gir fokus på meldingen øverst. */
function fokuserFelt(felt: string | undefined, reserve: HTMLElement | null) {
  const el =
    (felt === 'fra' || felt === 'til'
      ? document.querySelector<HTMLInputElement>(`[aria-describedby$="-${felt}-feil"]`)
      : document.getElementById((felt && feltId[felt]) || '')) ?? reserve
  el?.focus()
  el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

/**
 * Kassen, ett steg om gangen: utstyr, periode, levering, opplysninger og
 * bekreftelse. Steget står i adressen (?steg=…), så nettleserens tilbake-
 * og fremknapp flytter mellom stegene. Personopplysninger ligger bare i
 * minnet her og lagres ikke i nettleseren.
 */
export function Kasse({ vipps, kort }: Props) {
  const liste = useLeieliste()
  const klar = useErKlient()
  const sok = useSearchParams()
  const [vei, settVei] = useState<Vei>('betaling')
  const [levering, settLevering] = useState<Levering>('henting')
  const [adresse, settAdresse] = useState<Adresse>({ adresse: '', postnr: '', sted: '' })
  const [kunde, settKunde] = useState<Kunde>({ navn: '', telefon: '', epost: '', firma: '', orgnr: '' })
  const [melding, settMelding] = useState('')
  const [godtar, settGodtar] = useState(false)
  const [angreAnmodning, settAngreAnmodning] = useState(false)
  const [nettside, settNettside] = useState('')
  const [feil, settFeil] = useState<Feil>({})
  const [toppfeil, settToppfeil] = useState<{ steg: StegId; tekst: string } | null>(null)
  const [sender, settSender] = useState<false | 'vipps' | 'kort' | 'foresporsel'>(false)
  const [sendt, settSendt] = useState<{ referanse: string; test: boolean; telefon: string } | null>(null)
  const [visning, settVisning] = useState<Visning | null>(null)
  const start = useRef(0)
  const kasseRef = useRef<HTMLFormElement>(null)
  const overskriftRef = useRef<HTMLHeadingElement>(null)
  const meldingerRef = useRef<HTMLDivElement>(null)
  /** Feltet som skal ha fokus når neste steg er tegnet. Null gir overskriften. */
  const fokusEtterBytte = useRef<string | null>(null)
  const forrigeSteg = useRef<StegId | null>(null)

  // Utfyllingstiden måles fra kassen vises første gang, ikke per steg.
  useEffect(() => {
    start.current = Date.now()
  }, [])

  // Også nettleserens tilbake- og fremknapp skal vise steget fra toppen,
  // ikke der kunden forlot det. Valget gjelder historikkinnslaget og arves
  // av stegene etter, så andre sider beholder vanlig oppførsel. Står det
  // allerede på «manual», er kunden kommet tilbake til kassen fra en annen
  // side, og da har nettleseren ikke rullet noe sted.
  useEffect(() => {
    const historikk = window.history
    if (historikk.scrollRestoration === 'manual') window.scrollTo({ top: 0, behavior: 'instant' })
    historikk.scrollRestoration = 'manual'
    return () => {
      historikk.scrollRestoration = 'auto'
    }
  }, [])

  // Kommer kunden tilbake fra betalingen med tilbakeknappen, kan siden
  // vises fra nettleserens hurtigbuffer. Da må knappene virke igjen.
  useEffect(() => {
    const vedVisning = (e: PageTransitionEvent) => {
      if (e.persisted) settSender(false)
    }
    window.addEventListener('pageshow', vedVisning)
    return () => window.removeEventListener('pageshow', vedVisning)
  }, [])

  const rader: Rad[] = liste.linjer
    .map((linje) => ({ linje, maskin: finnMaskin(linje.slug) }))
    .filter((r): r is Rad => r.maskin !== undefined)

  const etterAvtale = rader.filter((r) => r.maskin.kunForesporsel)
  const maaLeveres = rader.filter((r) => r.maskin.kreverLevering)
  const betalingApen = vipps !== 'av' || kort !== 'av'
  const kanBetale = etterAvtale.length === 0 && betalingApen && rader.length > 0
  const valgtVei: Vei = kanBetale ? vei : 'foresporsel'
  const valgtLevering: Levering = maaLeveres.length > 0 ? 'levering' : levering
  const bedrift = liste.kundetype === 'bedrift'
  const angreKreves = !bedrift && valgtVei === 'betaling' && !!liste.fra && starterForAngrefrist(liste.fra)
  const testmodus = (vipps === 'test' || kort === 'test') && valgtVei === 'betaling'
  // Kan det bare bli en forespørsel, står meldingen sammen med
  // opplysningene. Ellers dukker den opp når kunden velger forespørsel.
  const meldingPaa: StegId = kanBetale ? 'bekreft' : 'opplysninger'

  const beregning =
    liste.fra && liste.til && rader.length > 0
      ? beregnBestilling(
          {
            linjer: rader.map((r) => r.linje),
            fra: liste.fra,
            til: liste.til,
            levering: { type: valgtLevering },
          },
          finnMaskin,
          firma.levering.prisInklMva,
        )
      : null

  const visPris = (kr: number) => kroner(bedrift ? eksMvaOre(kr) / 100 : kr)

  const alleFeil = sjekk(valgtVei, liste, kunde, valgtLevering, adresse, godtar, angreKreves, angreAnmodning, melding)

  // Etter en avbrutt betaling skal kunden tilbake til bekreftelsen.
  const avbrutt = sok.get('avbrutt') === '1'
  const onsket: StegId = lesSteg(sok.get('steg')) ?? (avbrutt ? 'bekreft' : 'utstyr')
  const aktiv = klar && !sendt && rader.length > 0

  // Et steg vises ikke før stegene foran er i orden. Det sjekkes bare når
  // adressen endrer seg, så ingen kastes ut av steget de står på.
  let vist: StegId = onsket
  let lengst = stegnr(onsket)
  if (aktiv) {
    if (visning?.onsket === onsket) {
      vist = visning.vist
      lengst = visning.lengst
    } else {
      vist = forsteUferdige(alleFeil, onsket, meldingPaa)
      lengst = Math.max(visning?.lengst ?? 0, stegnr(vist))
      settVisning({ onsket, vist, lengst })
    }
  }

  // Måtte kunden stoppe på et tidligere steg, rettes adressen etter det.
  useEffect(() => {
    if (!aktiv || vist === onsket) return
    const parametre = new URLSearchParams(window.location.search)
    parametre.set('steg', vist)
    window.history.replaceState(null, '', `?${parametre}`)
  }, [aktiv, vist, onsket])

  // Nytt steg: opp til toppen av kassen, og fokus på overskriften så
  // skjermlesere sier hvor kunden er. Første visning flytter ikke fokus.
  useEffect(() => {
    if (!aktiv) return
    const forrige = forrigeSteg.current
    forrigeSteg.current = vist
    if (forrige === null || forrige === vist) return
    const felt = fokusEtterBytte.current
    fokusEtterBytte.current = null
    if (felt) {
      fokuserFelt(felt, meldingerRef.current)
      return
    }
    const kasse = kasseRef.current
    const luft = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
    if (kasse && kasse.getBoundingClientRect().top < luft) {
      kasse.scrollIntoView({ block: 'start', behavior: 'instant' })
    }
    overskriftRef.current?.focus({ preventScroll: true })
  }, [aktiv, vist])

  /** Nytt steg i adressen. Next sørger for at useSearchParams følger med. */
  function naviger(til: StegId, fokusFelt: string | null = null) {
    fokusEtterBytte.current = fokusFelt
    // Et dobbeltklikk skal ikke gi to like innslag i historikken.
    if (new URLSearchParams(window.location.search).get('steg') === til) return
    window.history.pushState(null, '', `?steg=${til}`)
  }

  function visFeil(nye: Feil, tekst: string) {
    const forste = feltrekkefolge.find((k) => nye[k]) ?? Object.keys(nye)[0]
    // Feilen kan høre til et tidligere steg, f.eks. når serveren svarer.
    const maal = (forste ? stegForFelt(forste, meldingPaa) : null) ?? vist
    settFeil(nye)
    settToppfeil({ steg: maal, tekst })
    if (maal !== vist) {
      naviger(maal, forste)
      return
    }
    requestAnimationFrame(() => fokuserFelt(forste, meldingerRef.current))
  }

  /** Bakover går alltid. Fremover må stegene imellom være i orden. */
  function gaaTil(maal: StegId) {
    if (sender) return
    const fra = stegnr(vist)
    const til = stegnr(maal)
    if (til === fra) return
    if (til > fra) {
      for (const s of stegliste.slice(fra, til)) {
        const egne = feilISteg(alleFeil, s.id, meldingPaa)
        if (harFeil(egne)) {
          visFeil(egne, MANGLER)
          return
        }
      }
      settFeil({})
    }
    settToppfeil(null)
    naviger(maal)
  }

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Før siste steg er «Neste» eneste sendeknapp, også ved Enter i et felt.
    if (vist !== 'bekreft') {
      gaaTil(stegliste[stegnr(vist) + 1].id)
      return
    }
    if (sender) return
    const knapp = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const metode = knapp?.value === 'vipps' || knapp?.value === 'kort' ? knapp.value : null
    const nyVei: Vei = metode ? 'betaling' : 'foresporsel'

    const lokale = sjekk(nyVei, liste, kunde, valgtLevering, adresse, godtar, angreKreves, angreAnmodning, melding)
    if (harFeil(lokale)) {
      visFeil(lokale, MANGLER)
      return
    }

    settFeil({})
    settToppfeil(null)
    settSender(metode ?? 'foresporsel')

    const kundeData = {
      type: liste.kundetype,
      navn: kunde.navn,
      telefon: kunde.telefon,
      epost: kunde.epost,
      ...(bedrift ? { firma: kunde.firma, orgnr: kunde.orgnr } : {}),
    }
    const leveringData =
      valgtLevering === 'levering' ? { type: 'levering' as const, ...adresse } : { type: 'henting' as const }
    const felles = { nettside, tid: Date.now() - start.current }

    try {
      if (metode) {
        const svar = await fetch('/api/betaling', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...felles,
            linjer: liste.linjer,
            fra: liste.fra,
            til: liste.til,
            levering: leveringData,
            kunde: kundeData,
            metode,
            godtarVilkar: godtar,
            startForAngrefrist: angreKreves ? angreAnmodning : undefined,
          }),
        })
        const data = (await svar.json()) as { videre?: string; feil?: string; felt?: Feil }
        if (!svar.ok || !data.videre) {
          settSender(false)
          visFeil(data.felt ?? {}, data.feil ?? 'Noe gikk galt. Prøv igjen.')
          return
        }
        window.location.assign(data.videre)
        return
      }

      const svar = await fetch('/api/foresporsel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...felles,
          linjer: liste.linjer,
          ...(liste.fra && liste.til ? { fra: liste.fra, til: liste.til } : {}),
          levering: leveringData,
          kunde: kundeData,
          melding,
        }),
      })
      const data = (await svar.json()) as { referanse?: string; test?: boolean; feil?: string; felt?: Feil }
      settSender(false)
      if (!svar.ok || !data.referanse) {
        visFeil(data.felt ?? {}, data.feil ?? 'Noe gikk galt. Prøv igjen.')
        return
      }
      settSendt({ referanse: data.referanse, test: !!data.test, telefon: kunde.telefon })
      leieliste.tom()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      settSender(false)
      visFeil({}, `Fikk ikke kontakt med serveren. Sjekk nettet, eller ring oss på ${firma.telefonVisning}.`)
    }
  }

  if (sendt) return <ForesporselSendt {...sendt} />

  // Listen ligger i nettleseren. Før den er lest, vises ingenting som kan
  // blinke feil («tom liste»).
  if (!klar) {
    return (
      <p className={`etikett ${styles.henter}`} aria-live="polite">
        Henter leielisten …
      </p>
    )
  }

  if (rader.length === 0) {
    return (
      <div className={styles.tom}>
        <p className="underoverskrift">Leielisten er tom.</p>
        <p className="dempet">Finn utstyret du trenger, og legg det i listen. Eller send en forespørsel med det du lurer på.</p>
        <div className={styles.tomKnapper}>
          <Link href="/maskiner" className="knapp">
            Se utvalget <Pil />
          </Link>
          <Link href="/kontakt" className="knapp knapp--omriss">
            Send forespørsel <Pil />
          </Link>
        </div>
      </div>
    )
  }

  const settKundefelt = (felt: keyof Kunde) => (verdi: string) => settKunde((k) => ({ ...k, [felt]: verdi }))
  const settAdressefelt = (felt: keyof Adresse) => (verdi: string) => settAdresse((a) => ({ ...a, [felt]: verdi }))

  const nr = stegnr(vist)
  const steg = stegliste[nr]
  const forrige = nr > 0 ? stegliste[nr - 1] : null
  const neste = nr < stegliste.length - 1 ? stegliste[nr + 1] : null

  return (
    <form
      ref={kasseRef}
      className={styles.kasse}
      onSubmit={send}
      noValidate
      aria-busy={sender ? true : undefined}
      onKeyDown={(e) => {
        // Enter i et felt på siste steg skal ikke starte en betaling ved et
        // uhell. På stegene før betyr Enter «Neste».
        const mal = e.target as HTMLElement
        if (e.key === 'Enter' && mal.tagName === 'INPUT' && vist === 'bekreft') e.preventDefault()
      }}
    >
      <Honningkrukke verdi={nettside} endre={settNettside} />

      <div className={styles.kolonne}>
        <Fremdrift naa={vist} lengst={lengst} gaaTil={gaaTil} />

        <section key={vist} className={styles.steg} aria-labelledby="kasse-steg-tittel">
          <div className={styles.stegHode}>
            <h2
              id="kasse-steg-tittel"
              ref={overskriftRef}
              tabIndex={-1}
              className={`overskrift ${styles.stegtittel}`}
            >
              <span className="skjult">
                Steg {nr + 1} av {stegliste.length}:{' '}
              </span>
              {steg.tittel}
            </h2>
            {vist === 'bekreft' && (
              <p className="dempet">
                Sjekk at alt stemmer før du {valgtVei === 'betaling' ? 'betaler' : 'sender'}.
              </p>
            )}
          </div>

          <div ref={meldingerRef} tabIndex={-1} className={styles.meldinger}>
            {avbrutt && toppfeil?.steg !== vist && (
              <p className={styles.info} role="status">
                Betalingen ble avbrutt, og ingenting er trukket. Leielisten ligger her fortsatt.
                {vist !== 'bekreft' &&
                  harFeil(feilISteg(alleFeil, vist, meldingPaa)) &&
                  ' Opplysningene dine lagres ikke, så de må fylles inn på nytt.'}
              </p>
            )}
            {toppfeil?.steg === vist && (
              <p className={styles.toppfeil} role="alert">
                {toppfeil.tekst}
              </p>
            )}
          </div>

          {vist === 'utstyr' && <Utstyrsliste rader={rader} beregning={beregning} visPris={visPris} />}

          {vist === 'periode' && (
            <>
              <Periodevelger feil={{ fra: feil.fra, til: feil.til }} visDogn />
              <p className="hjelpetekst">
                Alt i listen leies for samme periode. Trenger du ulike datoer, skriv det i en forespørsel.
                {valgtVei === 'foresporsel' && ' Vet du ikke datoene ennå, kan du gå videre uten.'}
              </p>
            </>
          )}

          {vist === 'levering' && (
            <Leveringsvalg
              valgt={valgtLevering}
              settLevering={settLevering}
              maaLeveres={maaLeveres}
              adresse={adresse}
              settAdressefelt={settAdressefelt}
              feil={feil}
              visPris={visPris}
            />
          )}

          {vist === 'opplysninger' && (
            <Kundeopplysninger
              kundetype={liste.kundetype}
              kunde={kunde}
              settKundefelt={settKundefelt}
              vei={valgtVei}
              visMelding={meldingPaa === 'opplysninger'}
              melding={melding}
              settMelding={settMelding}
              feil={feil}
            />
          )}

          {vist === 'bekreft' && (
            <>
              <Oversikt
                rader={rader}
                beregning={beregning}
                fra={liste.fra}
                til={liste.til}
                levering={valgtLevering}
                adresse={adresse}
                kunde={kunde}
                bedrift={bedrift}
                melding={meldingPaa === 'opplysninger' ? melding.trim() || null : null}
                visPris={visPris}
                endre={gaaTil}
              />
              <Betalingsvalg
                vei={valgtVei}
                settVei={settVei}
                kanBetale={kanBetale}
                etterAvtale={etterAvtale}
                betalingApen={betalingApen}
                visMelding={meldingPaa === 'bekreft'}
                melding={melding}
                settMelding={settMelding}
                godtar={godtar}
                settGodtar={settGodtar}
                angreKreves={angreKreves}
                angreAnmodning={angreAnmodning}
                settAngreAnmodning={settAngreAnmodning}
                feil={feil}
              />
              <Totalboks
                beregning={beregning}
                vei={valgtVei}
                bedrift={bedrift}
                levering={valgtLevering}
                testmodus={testmodus}
              />
            </>
          )}

          {vist !== 'bekreft' && <Sumlinje beregning={beregning} bedrift={bedrift} />}

          <div className={styles.navigasjon}>
            {forrige && (
              <button type="button" className={`pil-lenke ${styles.tilbake}`} onClick={() => gaaTil(forrige.id)}>
                <Pil retning="venstre" />
                Tilbake
              </button>
            )}
            <div className={styles.handlinger}>
              {neste ? (
                <button type="submit" className="knapp">
                  Neste: {neste.navn}
                  <Pil />
                </button>
              ) : valgtVei === 'betaling' ? (
                <>
                  <button
                    type="submit"
                    value="vipps"
                    className="knapp knapp--vipps"
                    disabled={vipps === 'av' || !!sender}
                  >
                    {sender === 'vipps' ? 'Sender deg til Vipps …' : 'Betal med Vipps'}
                    <Pil />
                  </button>
                  <button type="submit" value="kort" className="knapp" disabled={kort === 'av' || !!sender}>
                    {sender === 'kort' ? 'Sender deg til betaling …' : 'Betal med kort'}
                    <Pil />
                  </button>
                </>
              ) : (
                <button type="submit" value="foresporsel" className="knapp" disabled={!!sender}>
                  {sender === 'foresporsel' ? 'Sender …' : 'Send forespørsel'}
                  <Pil />
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      <Sammendrag
        rader={rader}
        fra={liste.fra}
        til={liste.til}
        beregning={beregning}
        levering={valgtLevering}
        vei={valgtVei}
        bedrift={bedrift}
        visPris={visPris}
      />
    </form>
  )
}
