'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { adresseLinje, firma } from '@/data/firma'
import { finnMaskin, type Maskin } from '@/data/maskiner'
import { formaterPeriode } from '@/lib/dato'
import { formaterMobil, kroner, kronerFraOre } from '@/lib/format'
import { leieliste, useErKlient, useLeieliste, type Leieliste } from '@/lib/leieliste'
import { beregnBestilling, eksMvaOre } from '@/lib/pris'
import {
  erGyldigOrgnr,
  erGyldigTelefon,
  normaliserTelefon,
  serUtSomEpost,
  starterForAngrefrist,
} from '@/lib/regler'
import { Periodevelger } from './Periodevelger'
import { Pil } from './Pil'
import { Piktogram } from './Piktogram'
import { Honningkrukke, Tekstfelt, Tekstomraade } from './Skjemafelt'
import styles from './Kasse.module.css'

type Modus = 'ekte' | 'test' | 'av'
type Vei = 'betaling' | 'foresporsel'
type Feil = Record<string, string>

type Props = { vipps: Modus; kort: Modus; avbrutt: boolean }

type Kunde = { navn: string; telefon: string; epost: string; firma: string; orgnr: string }
type Adresse = { adresse: string; postnr: string; sted: string }

/** Rask sjekk i nettleseren. Serveren sjekker alt på nytt. */
function sjekk(
  vei: Vei,
  liste: Leieliste,
  kunde: Kunde,
  levering: 'henting' | 'levering',
  adresse: Adresse,
  godtar: boolean,
  angreKreves: boolean,
  angreAnmodning: boolean,
  melding: string,
): Feil {
  const f: Feil = {}
  if (vei === 'betaling' || liste.fra || liste.til) {
    if (!liste.fra) f.fra = 'Velg dato for henting.'
    if (!liste.til) f.til = 'Velg dato for retur.'
  }
  if (levering === 'levering') {
    if (adresse.adresse.trim().length < 3) f['levering.adresse'] = 'Skriv leveringsadressen.'
    if (!/^\d{4}$/.test(adresse.postnr.trim())) f['levering.postnr'] = 'Postnummer har fire siffer.'
    if (adresse.sted.trim().length < 2) f['levering.sted'] = 'Skriv poststed.'
  }
  if (kunde.navn.trim().length < 2) f['kunde.navn'] = 'Skriv fullt navn.'
  if (!erGyldigTelefon(normaliserTelefon(kunde.telefon))) f['kunde.telefon'] = 'Skriv et norsk telefonnummer med åtte siffer.'
  if (vei === 'betaling' && !serUtSomEpost(kunde.epost)) f['kunde.epost'] = 'Skriv e-postadressen kvitteringen skal til.'
  if (vei === 'foresporsel' && kunde.epost.trim() && !serUtSomEpost(kunde.epost)) f['kunde.epost'] = 'Skriv en gyldig e-postadresse.'
  if (liste.kundetype === 'bedrift') {
    if (kunde.firma.trim().length < 2) f['kunde.firma'] = 'Skriv firmanavnet.'
    if (!erGyldigOrgnr(kunde.orgnr)) f['kunde.orgnr'] = 'Org.nr. har ni siffer. Sjekk at det er riktig.'
  }
  if (vei === 'betaling') {
    if (!godtar) f.godtarVilkar = 'Du må godta leievilkårene.'
    if (angreKreves && !angreAnmodning) f.startForAngrefrist = 'Kryss av for at leien kan starte før angrefristen er ute.'
  }
  if (vei === 'foresporsel' && liste.linjer.length === 0 && melding.trim().length < 10) {
    f.melding = 'Fortell kort hva du trenger.'
  }
  return f
}

// Rekkefølgen feltene står i på siden, så fokus havner på den første feilen.
const feltrekkefolge = [
  'fra',
  'til',
  'levering',
  'levering.adresse',
  'levering.postnr',
  'levering.sted',
  'kunde.navn',
  'kunde.telefon',
  'kunde.epost',
  'kunde.firma',
  'kunde.orgnr',
  'melding',
  'godtarVilkar',
  'startForAngrefrist',
]

const feltId: Record<string, string> = {
  'levering.adresse': 'kasse-adresse',
  'levering.postnr': 'kasse-postnr',
  'levering.sted': 'kasse-sted',
  'kunde.navn': 'kasse-navn',
  'kunde.telefon': 'kasse-telefon',
  'kunde.epost': 'kasse-epost',
  'kunde.firma': 'kasse-firma',
  'kunde.orgnr': 'kasse-orgnr',
  melding: 'kasse-melding',
  godtarVilkar: 'kasse-vilkar',
  startForAngrefrist: 'kasse-angrerett',
  levering: 'kasse-levering-henting',
}

export function Kasse({ vipps, kort, avbrutt }: Props) {
  const liste = useLeieliste()
  const klar = useErKlient()
  const [vei, settVei] = useState<Vei>('betaling')
  const [levering, settLevering] = useState<'henting' | 'levering'>('henting')
  const [adresse, settAdresse] = useState<Adresse>({ adresse: '', postnr: '', sted: '' })
  const [kunde, settKunde] = useState<Kunde>({ navn: '', telefon: '', epost: '', firma: '', orgnr: '' })
  const [melding, settMelding] = useState('')
  const [godtar, settGodtar] = useState(false)
  const [angreAnmodning, settAngreAnmodning] = useState(false)
  const [nettside, settNettside] = useState('')
  const [feil, settFeil] = useState<Feil>({})
  const [toppfeil, settToppfeil] = useState<string | null>(null)
  const [sender, settSender] = useState<false | 'vipps' | 'kort' | 'foresporsel'>(false)
  const [sendt, settSendt] = useState<{ referanse: string; test: boolean; telefon: string } | null>(null)
  const start = useRef(0)
  const toppRef = useRef<HTMLDivElement>(null)
  const kundetypeId = useId()

  useEffect(() => {
    start.current = Date.now()
  }, [])

  const rader = liste.linjer
    .map((linje) => ({ linje, maskin: finnMaskin(linje.slug) }))
    .filter((r): r is { linje: typeof r.linje; maskin: Maskin } => r.maskin !== undefined)

  const etterAvtale = rader.filter((r) => r.maskin.kunForesporsel)
  const maaLeveres = rader.filter((r) => r.maskin.kreverLevering)
  const betalingApen = vipps !== 'av' || kort !== 'av'
  const kanBetale = etterAvtale.length === 0 && betalingApen && rader.length > 0
  const valgtVei: Vei = kanBetale ? vei : 'foresporsel'
  const valgtLevering = maaLeveres.length > 0 ? 'levering' : levering
  const bedrift = liste.kundetype === 'bedrift'
  const angreKreves = !bedrift && valgtVei === 'betaling' && !!liste.fra && starterForAngrefrist(liste.fra)
  const testmodus = (vipps === 'test' || kort === 'test') && valgtVei === 'betaling'

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

  function visFeil(nye: Feil, melding: string) {
    settFeil(nye)
    settToppfeil(melding)
    const forste = feltrekkefolge.find((k) => nye[k]) ?? Object.keys(nye)[0]
    requestAnimationFrame(() => {
      const el =
        (forste === 'fra' || forste === 'til'
          ? document.querySelector<HTMLInputElement>(`[aria-describedby$="-${forste}-feil"]`)
          : document.getElementById(feltId[forste] ?? '')) ?? toppRef.current
      el?.focus()
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
  }

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sender) return
    const knapp = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const metode = knapp?.value === 'vipps' || knapp?.value === 'kort' ? knapp.value : null
    const nyVei: Vei = metode ? 'betaling' : 'foresporsel'

    const lokale = sjekk(nyVei, liste, kunde, valgtLevering, adresse, godtar, angreKreves, angreAnmodning, melding)
    if (Object.keys(lokale).length > 0) {
      visFeil(lokale, 'Noen felt mangler eller er feil. De er merket under.')
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

  return (
    <form
      className={styles.kasse}
      onSubmit={send}
      noValidate
      aria-busy={sender ? true : undefined}
      onKeyDown={(e) => {
        // Enter i et tekstfelt skal ikke starte en betaling ved et uhell.
        const mal = e.target as HTMLElement
        if (e.key === 'Enter' && mal.tagName === 'INPUT') e.preventDefault()
      }}
    >
      <Honningkrukke verdi={nettside} endre={settNettside} />

      <div className={styles.skjema}>
        <div ref={toppRef} tabIndex={-1} className={styles.meldinger}>
          {avbrutt && !toppfeil && (
            <p className={styles.info} role="status">
              Betalingen ble avbrutt, og ingenting er trukket. Leielisten ligger her fortsatt.
            </p>
          )}
          {toppfeil && (
            <p className={styles.toppfeil} role="alert">
              {toppfeil}
            </p>
          )}
        </div>

        {/* 1 Utstyr */}
        <section className={styles.steg} aria-labelledby="steg-utstyr">
          <h2 id="steg-utstyr" className={styles.stegtittel}>
            <span>01</span> Utstyr
          </h2>
          <ul role="list" className={styles.linjer}>
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
        </section>

        {/* 2 Periode */}
        <section className={styles.steg} aria-labelledby="steg-periode">
          <h2 id="steg-periode" className={styles.stegtittel}>
            <span>02</span> Leieperiode
          </h2>
          <Periodevelger feil={{ fra: feil.fra, til: feil.til }} visDogn />
          <p className="hjelpetekst">
            Alt i listen leies for samme periode. Trenger du ulike datoer, skriv det i en forespørsel.
          </p>
        </section>

        {/* 3 Levering */}
        <section className={styles.steg} aria-labelledby="steg-levering">
          <h2 id="steg-levering" className={styles.stegtittel}>
            <span>03</span> Henting eller levering
          </h2>
          <fieldset className={styles.valgkort} aria-describedby={feil.levering ? 'kasse-levering-feil' : undefined}>
            <legend className="skjult">Henting eller levering</legend>
            <label className={styles.valg} data-av={maaLeveres.length > 0 || undefined}>
              <input
                id="kasse-levering-henting"
                type="radio"
                name="levering"
                value="henting"
                checked={valgtLevering === 'henting'}
                onChange={() => settLevering('henting')}
                disabled={maaLeveres.length > 0}
              />
              <span className={styles.valgTekst}>
                <strong>Jeg henter selv</strong>
                <span>{adresseLinje}</span>
              </span>
              <span className={styles.valgPris}>0,-</span>
            </label>
            <label className={styles.valg}>
              <input
                type="radio"
                name="levering"
                value="levering"
                checked={valgtLevering === 'levering'}
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
          {valgtLevering === 'levering' && (
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
        </section>

        {/* 4 Kunde */}
        <section className={styles.steg} aria-labelledby="steg-kunde">
          <h2 id="steg-kunde" className={styles.stegtittel}>
            <span>04</span> Dine opplysninger
          </h2>
          <fieldset className={styles.kundetype}>
            <legend className="felt-etikett">Jeg leier som</legend>
            {(['privat', 'bedrift'] as const).map((t) => (
              <label key={t} className={styles.kundetypeValg}>
                <input
                  type="radio"
                  name={`${kundetypeId}-kundetype`}
                  value={t}
                  checked={liste.kundetype === t}
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
              valgfri={valgtVei === 'foresporsel'}
              hjelp={valgtVei === 'betaling' ? 'Kvitteringen og bekreftelsen sendes hit.' : undefined}
              maks={200}
              className={styles.helBredde}
            />
          </div>
        </section>

        {/* 5 Betal eller spør */}
        <section className={styles.steg} aria-labelledby="steg-videre">
          <h2 id="steg-videre" className={styles.stegtittel}>
            <span>05</span> Betal nå eller send forespørsel
          </h2>
          <fieldset className={styles.valgkort}>
            <legend className="skjult">Hvordan vil du gå videre?</legend>
            <label className={styles.valg} data-av={!kanBetale || undefined}>
              <input
                type="radio"
                name="vei"
                value="betaling"
                checked={valgtVei === 'betaling'}
                onChange={() => settVei('betaling')}
                disabled={!kanBetale}
              />
              <span className={styles.valgTekst}>
                <strong>Betal nå</strong>
                <span>
                  Med Vipps eller kort. Beløpet reserveres, og trekkes først når vi har bekreftet leien.
                </span>
              </span>
            </label>
            <label className={styles.valg}>
              <input
                type="radio"
                name="vei"
                value="foresporsel"
                checked={valgtVei === 'foresporsel'}
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
              {etterAvtale.map((r) => r.maskin.navn).join(', ')} leies ut etter avtale, så listen sendes som
              forespørsel.
            </p>
          )}
          {etterAvtale.length === 0 && !betalingApen && (
            <p className="hjelpetekst">Betaling på nett er ikke åpnet ennå. Send listen som forespørsel.</p>
          )}

          {valgtVei === 'foresporsel' ? (
            <Tekstomraade
              id="kasse-melding"
              etikett="Melding"
              verdi={melding}
              endre={settMelding}
              feil={feil.melding}
              valgfri
              hjelp="F.eks. hvor jobben er, om dere trenger fører, eller andre datoer."
            />
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
                      Jeg ber om at leien starter før angrefristen på 14 dager er ute. Jeg vet at angreretten faller
                      bort når leieperioden er over, og at jeg betaler for dagene jeg har brukt hvis jeg angrer
                      underveis.{' '}
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
        </section>
      </div>

      {/* Sammendrag */}
      <aside className={styles.sammendrag} aria-labelledby="sammendrag-tittel">
        <div className={styles.sammendragInnhold}>
          <h2 id="sammendrag-tittel" className={styles.sammendragTittel}>
            Sammendrag
          </h2>
          {liste.fra && liste.til ? (
            <p className={styles.periode}>
              <span className="mono">{formaterPeriode(liste.fra, liste.til)}</span>
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
                  <dd className="mono">{sum !== undefined ? visPris(sum) : '–'}</dd>
                </div>
              )
            })}
            <div>
              <dt>{valgtLevering === 'levering' ? 'Levering og henting' : 'Henting'}</dt>
              <dd className="mono">
                {valgtLevering === 'levering' ? visPris(firma.levering.prisInklMva) : '0,-'}
              </dd>
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
                <dt>{valgtVei === 'betaling' ? 'Å betale' : 'Veiledende pris'}</dt>
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

          <div className={styles.handling}>
            {valgtVei === 'betaling' ? (
              <>
                <button
                  type="submit"
                  value="vipps"
                  className="knapp knapp--vipps knapp--bred"
                  disabled={vipps === 'av' || !!sender}
                >
                  {sender === 'vipps' ? 'Sender deg til Vipps …' : 'Betal med Vipps'}
                  <Pil />
                </button>
                <button type="submit" value="kort" className="knapp knapp--bred" disabled={kort === 'av' || !!sender}>
                  {sender === 'kort' ? 'Sender deg til betaling …' : 'Betal med kort'}
                  <Pil />
                </button>
                <p className={styles.handlingTekst}>
                  Beløpet reserveres nå og trekkes når vi har bekreftet leien. Kan vi ikke levere, frigjøres hele
                  beløpet.
                </p>
                {testmodus && (
                  <p className={styles.test}>
                    <strong>Testmodus.</strong> Betalingen simuleres — ingen penger trekkes.
                  </p>
                )}
              </>
            ) : (
              <>
                <button type="submit" value="foresporsel" className="knapp knapp--bred" disabled={!!sender}>
                  {sender === 'foresporsel' ? 'Sender …' : 'Send forespørsel'}
                  <Pil />
                </button>
                <p className={styles.handlingTekst}>Forespørselen er ikke bindende. Du betaler ingenting nå.</p>
              </>
            )}
          </div>
        </div>
      </aside>
    </form>
  )
}

function ForesporselSendt({ referanse, test, telefon }: { referanse: string; test: boolean; telefon: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => ref.current?.focus(), [])
  return (
    <div className={styles.kvittering}>
      <p className="etikett">Referanse {referanse}</p>
      <h2 ref={ref} tabIndex={-1} className="tittel">
        Forespørselen er sendt.
      </h2>
      <p className="ingress">
        Takk! Vi ringer deg på {formaterMobil(normaliserTelefon(telefon))} {firma.svartid} med pris og ledig dato.
        Du har ikke bestilt noe ennå.
      </p>
      {test && (
        <p className={styles.test}>
          <strong>Testmodus.</strong> E-posten ble skrevet til serverloggen i stedet for å bli sendt.
        </p>
      )}
      <div className={styles.tomKnapper}>
        <Link href="/maskiner" className="knapp">
          Se mer utstyr <Pil />
        </Link>
        <Link href="/" className="knapp knapp--omriss">
          Til forsiden
        </Link>
      </div>
    </div>
  )
}
