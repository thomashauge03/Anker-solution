'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { firma } from '@/data/firma'
import { iDagINorge, leggTilDager } from '@/lib/dato'
import { formaterMobil } from '@/lib/format'
import { leieliste, useKundetype } from '@/lib/leieliste'
import { erGyldigOrgnr, erGyldigTelefon, MAKS_DAGER_FRAM, normaliserTelefon, serUtSomEpost } from '@/lib/regler'
import { Pil } from './Pil'
import { Honningkrukke, Tekstfelt, Tekstomraade } from './Skjemafelt'
import styles from './KontaktSkjema.module.css'

type Feil = Record<string, string>

const feltId: Record<string, string> = {
  melding: 'kontakt-melding',
  fra: 'kontakt-fra',
  til: 'kontakt-til',
  'kunde.navn': 'kontakt-navn',
  'kunde.telefon': 'kontakt-telefon',
  'kunde.epost': 'kontakt-epost',
  'kunde.firma': 'kontakt-firma',
  'kunde.orgnr': 'kontakt-orgnr',
}

export function KontaktSkjema({ maskin }: { maskin: { slug: string; navn: string; kode: string } | null }) {
  const kundetype = useKundetype()
  const [gjelder, settGjelder] = useState(maskin)
  const [melding, settMelding] = useState('')
  const [fra, settFra] = useState('')
  const [til, settTil] = useState('')
  const [kunde, settKunde] = useState({ navn: '', telefon: '', epost: '', firma: '', orgnr: '' })
  const [nettside, settNettside] = useState('')
  const [feil, settFeil] = useState<Feil>({})
  const [toppfeil, settToppfeil] = useState<string | null>(null)
  const [sender, settSender] = useState(false)
  const [sendt, settSendt] = useState<{ referanse: string; test: boolean } | null>(null)
  const start = useRef(0)
  const kvitteringRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    start.current = Date.now()
  }, [])

  useEffect(() => {
    if (sendt) kvitteringRef.current?.focus()
  }, [sendt])

  const bedrift = kundetype === 'bedrift'
  const idag = iDagINorge()

  function sjekk(): Feil {
    const f: Feil = {}
    if (!gjelder && melding.trim().length < 10) f.melding = 'Fortell kort hva du trenger.'
    if ((fra && !til) || (!fra && til)) f[fra ? 'til' : 'fra'] = 'Fyll inn begge datoene, eller ingen.'
    if (fra && til && til < fra) f.til = 'Retur kan ikke være før henting.'
    if (kunde.navn.trim().length < 2) f['kunde.navn'] = 'Skriv fullt navn.'
    if (!erGyldigTelefon(normaliserTelefon(kunde.telefon))) f['kunde.telefon'] = 'Skriv et norsk telefonnummer med åtte siffer.'
    if (kunde.epost.trim() && !serUtSomEpost(kunde.epost)) f['kunde.epost'] = 'Skriv en gyldig e-postadresse.'
    if (bedrift) {
      if (kunde.firma.trim().length < 2) f['kunde.firma'] = 'Skriv firmanavnet.'
      if (!erGyldigOrgnr(kunde.orgnr)) f['kunde.orgnr'] = 'Org.nr. har ni siffer. Sjekk at det er riktig.'
    }
    return f
  }

  function visFeil(nye: Feil, tekst: string) {
    settFeil(nye)
    settToppfeil(tekst)
    const forste = Object.keys(feltId).find((k) => nye[k])
    if (forste) requestAnimationFrame(() => document.getElementById(feltId[forste])?.focus())
  }

  async function send(e: FormEvent) {
    e.preventDefault()
    if (sender) return
    const lokale = sjekk()
    if (Object.keys(lokale).length) {
      visFeil(lokale, 'Noen felt mangler eller er feil.')
      return
    }
    settSender(true)
    settFeil({})
    settToppfeil(null)
    try {
      const svar = await fetch('/api/foresporsel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nettside,
          tid: Date.now() - start.current,
          linjer: gjelder ? [{ slug: gjelder.slug, antall: 1 }] : [],
          ...(fra && til ? { fra, til } : {}),
          kunde: {
            type: kundetype,
            navn: kunde.navn,
            telefon: kunde.telefon,
            epost: kunde.epost,
            ...(bedrift ? { firma: kunde.firma, orgnr: kunde.orgnr } : {}),
          },
          melding,
        }),
      })
      const data = (await svar.json()) as { referanse?: string; test?: boolean; feil?: string; felt?: Feil }
      settSender(false)
      if (!svar.ok || !data.referanse) {
        visFeil(data.felt ?? {}, data.feil ?? 'Noe gikk galt. Prøv igjen.')
        return
      }
      settSendt({ referanse: data.referanse, test: !!data.test })
    } catch {
      settSender(false)
      visFeil({}, `Fikk ikke kontakt med serveren. Ring oss på ${firma.telefonVisning}.`)
    }
  }

  if (sendt) {
    return (
      <div className={styles.kvittering} role="status">
        <p className="etikett">Referanse {sendt.referanse}</p>
        <h2 ref={kvitteringRef} tabIndex={-1} className="overskrift">
          Takk, forespørselen er sendt.
        </h2>
        <p>
          Vi ringer deg på {formaterMobil(normaliserTelefon(kunde.telefon))} {firma.svartid}.
          {kunde.epost.trim() ? ` Du får også en kvittering på ${kunde.epost.trim()}.` : ''}
        </p>
        {sendt.test && (
          <p className={styles.test}>
            <strong>Testmodus.</strong> E-posten ble skrevet til serverloggen i stedet for å bli sendt.
          </p>
        )}
        <Link href="/maskiner" className="knapp">
          Se utvalget <Pil />
        </Link>
      </div>
    )
  }

  const settKundefelt = (felt: keyof typeof kunde) => (verdi: string) => settKunde((k) => ({ ...k, [felt]: verdi }))

  return (
    <form className={styles.skjema} onSubmit={send} noValidate aria-busy={sender || undefined}>
      <Honningkrukke verdi={nettside} endre={settNettside} />
      <h2 className="skjult">Forespørsel</h2>

      {toppfeil && (
        <p className={styles.toppfeil} role="alert">
          {toppfeil}
        </p>
      )}

      {gjelder && (
        <div className={styles.gjelder}>
          <p>
            <span className="etikett">Gjelder</span>
            <strong>{gjelder.navn}</strong> <span className="mono dempet">{gjelder.kode}</span>
          </p>
          <button type="button" onClick={() => settGjelder(null)} aria-label={`Fjern ${gjelder.navn} fra forespørselen`}>
            Fjern
          </button>
        </div>
      )}

      <Tekstomraade
        id="kontakt-melding"
        etikett={gjelder ? 'Melding' : 'Hva trenger du?'}
        verdi={melding}
        endre={settMelding}
        feil={feil.melding}
        valgfri={!!gjelder}
        hjelp="Hva skal gjøres, hvor er jobben, og trenger dere fører eller transport?"
      />

      <fieldset className={styles.periode}>
        <legend className="felt-etikett">
          Når trenger du det? <span className="dempet">(valgfritt)</span>
        </legend>
        <div className="felt">
          <label htmlFor="kontakt-fra">Fra</label>
          <input
            id="kontakt-fra"
            type="date"
            className="inndata"
            min={idag}
            max={leggTilDager(idag, MAKS_DAGER_FRAM)}
            value={fra}
            onChange={(e) => {
              settFra(e.target.value)
              if (e.target.value && (!til || til < e.target.value)) settTil(leggTilDager(e.target.value, 1))
            }}
            aria-invalid={feil.fra ? true : undefined}
            aria-describedby={feil.fra ? 'kontakt-fra-feil' : undefined}
          />
          {feil.fra && (
            <p id="kontakt-fra-feil" className="feilmelding">
              {feil.fra}
            </p>
          )}
        </div>
        <div className="felt">
          <label htmlFor="kontakt-til">Til</label>
          <input
            id="kontakt-til"
            type="date"
            className="inndata"
            min={fra || idag}
            value={til}
            onChange={(e) => settTil(e.target.value)}
            aria-invalid={feil.til ? true : undefined}
            aria-describedby={feil.til ? 'kontakt-til-feil' : undefined}
          />
          {feil.til && (
            <p id="kontakt-til-feil" className="feilmelding">
              {feil.til}
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className={styles.kundetype}>
        <legend className="felt-etikett">Jeg er</legend>
        {(['privat', 'bedrift'] as const).map((t) => (
          <label key={t} className={styles.kundetypeValg}>
            <input
              type="radio"
              name="kontakt-kundetype"
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
              id="kontakt-firma"
              etikett="Firmanavn"
              verdi={kunde.firma}
              endre={settKundefelt('firma')}
              feil={feil['kunde.firma']}
              autoComplete="organization"
            />
            <Tekstfelt
              id="kontakt-orgnr"
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
          id="kontakt-navn"
          etikett={bedrift ? 'Kontaktperson' : 'Fullt navn'}
          verdi={kunde.navn}
          endre={settKundefelt('navn')}
          feil={feil['kunde.navn']}
          autoComplete="name"
          maks={100}
        />
        <Tekstfelt
          id="kontakt-telefon"
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
          id="kontakt-epost"
          etikett="E-post"
          type="email"
          verdi={kunde.epost}
          endre={settKundefelt('epost')}
          feil={feil['kunde.epost']}
          autoComplete="email"
          valgfri
          maks={200}
          className={styles.helBredde}
        />
      </div>

      <div className={styles.bunn}>
        <button type="submit" className="knapp" disabled={sender}>
          {sender ? 'Sender …' : 'Send forespørsel'} <Pil />
        </button>
        <p className="hjelpetekst">
          Vi bruker opplysningene bare til å svare deg. Les mer i <Link href="/personvern">personvernerklæringen</Link>.
        </p>
      </div>
    </form>
  )
}
