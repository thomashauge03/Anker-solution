'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { kategorier, maskiner, type KategoriId, type Maskin } from '@/data/maskiner'
import { Maskinkort } from './Maskinkort'
import kortStil from './Maskinkort.module.css'
import { Pil } from './Pil'
import { Prisvalg } from './Prisvalg'
import styles from './Katalog.module.css'

type Sortering = 'standard' | 'pris-lav' | 'pris-hoy' | 'navn'

const sorteringer: { verdi: Sortering; tekst: string }[] = [
  { verdi: 'standard', tekst: 'Etter kategori' },
  { verdi: 'pris-lav', tekst: 'Pris, lav til høy' },
  { verdi: 'pris-hoy', tekst: 'Pris, høy til lav' },
  { verdi: 'navn', tekst: 'Navn, A–Å' },
]

const smaa = (s: string) => s.toLocaleLowerCase('nb-NO')

function sokbarTekst(m: Maskin): string {
  const kategori = kategorier.find((k) => k.id === m.kategori)?.navn ?? ''
  return smaa([m.navn, m.kode, m.kort, m.beskrivelse, kategori, ...m.nokkeltall].join(' '))
}

const indeks = new Map(maskiner.map((m) => [m.slug, sokbarTekst(m)]))

/** Alle ord må finnes et sted i maskinens tekst. */
function treffer(m: Maskin, ord: string[]): boolean {
  const tekst = indeks.get(m.slug) ?? ''
  return ord.every((o) => tekst.includes(o))
}

function oppdaterAdresse(kategori: KategoriId | null, sok: string) {
  const p = new URLSearchParams()
  if (kategori) p.set('kategori', kategori)
  if (sok.trim()) p.set('sok', sok.trim())
  const sporring = p.toString()
  // Native history: Next holder adressen i synk uten en ny serverrunde.
  window.history.replaceState(null, '', sporring ? `/maskiner?${sporring}` : '/maskiner')
}

export function Katalog({ startKategori, startSok }: { startKategori: string | null; startSok: string }) {
  const [kategori, settKategori] = useState<KategoriId | null>(startKategori as KategoriId | null)
  const [sok, settSok] = useState(startSok)
  const [sortering, settSortering] = useState<Sortering>('standard')

  const ord = useMemo(() => smaa(sok).split(/\s+/).filter(Boolean), [sok])

  const treff = useMemo(() => {
    const filtrert = maskiner.filter((m) => (!kategori || m.kategori === kategori) && treffer(m, ord))
    const sortert = [...filtrert]
    if (sortering === 'pris-lav') sortert.sort((a, b) => a.dognpris - b.dognpris)
    if (sortering === 'pris-hoy') sortert.sort((a, b) => b.dognpris - a.dognpris)
    if (sortering === 'navn') sortert.sort((a, b) => a.navn.localeCompare(b.navn, 'nb'))
    return sortert
  }, [kategori, ord, sortering])

  // Uten søk og egen sortering vises utvalget gruppert som i en katalog.
  const grupper =
    sortering === 'standard' && ord.length === 0
      ? kategorier
          .map((k) => ({ kategori: k, maskiner: treff.filter((m) => m.kategori === k.id) }))
          .filter((g) => g.maskiner.length > 0)
      : null

  function velgKategori(id: KategoriId | null) {
    settKategori(id)
    oppdaterAdresse(id, sok)
  }

  function endreSok(verdi: string) {
    settSok(verdi)
    oppdaterAdresse(kategori, verdi)
  }

  const antallI = (id: KategoriId) => maskiner.filter((m) => m.kategori === id).length

  return (
    <div className={`ramme ${styles.katalog}`}>
      <aside className={styles.side} aria-label="Filtrer utvalget">
        <div>
          <h2 className={`etikett ${styles.sidetittel}`}>Kategori</h2>
          <ul role="list" className={styles.kategorier}>
            <li>
              <button type="button" aria-pressed={kategori === null} onClick={() => velgKategori(null)}>
                <span className={styles.knappNr}>00</span>
                <span className={styles.knappNavn}>Alt utstyr</span>
                <span className={styles.knappAntall}>{maskiner.length}</span>
              </button>
            </li>
            {kategorier.map((k) => (
              <li key={k.id}>
                <button type="button" aria-pressed={kategori === k.id} onClick={() => velgKategori(k.id)}>
                  <span className={styles.knappNr}>{k.nr}</span>
                  <span className={styles.knappNavn}>{k.navn}</span>
                  <span className={styles.knappAntall}>{antallI(k.id)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.prisvalg}>
          <p className="etikett">Vis priser for</p>
          <Prisvalg />
        </div>

        <div className={styles.hjelp}>
          <p>Finner du ikke det du leter etter?</p>
          <Link href="/kontakt" className="pil-lenke">
            Send en forespørsel <Pil />
          </Link>
        </div>
      </aside>

      <div className={styles.hoved}>
        <div className={styles.verktoy}>
          <div className={styles.sok}>
            <label htmlFor="katalog-sok" className="skjult">
              Søk i utvalget
            </label>
            <svg viewBox="0 0 16 16" className={styles.sokeikon} aria-hidden="true" focusable="false">
              <circle cx="6.5" cy="6.5" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5 15 15" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <input
              id="katalog-sok"
              type="search"
              className="inndata"
              placeholder="Søk: graver, vibroplate, 230 V …"
              value={sok}
              onChange={(e) => endreSok(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className={styles.sortering}>
            <label htmlFor="katalog-sortering" className="skjult">
              Sorter
            </label>
            <select
              id="katalog-sortering"
              className="inndata"
              value={sortering}
              onChange={(e) => settSortering(e.target.value as Sortering)}
            >
              {sorteringer.map((s) => (
                <option key={s.verdi} value={s.verdi}>
                  {s.tekst}
                </option>
              ))}
            </select>
          </div>
          <p className={styles.treff} aria-live="polite">
            {treff.length} treff
          </p>
        </div>

        {treff.length === 0 ? (
          <div className={styles.tomt}>
            <p className="underoverskrift">Ingen treff{sok.trim() ? ` på «${sok.trim()}»` : ''}.</p>
            <p>Vi har ikke alt på nettsiden. Fortell hva jobben er, så finner vi riktig utstyr.</p>
            <div className={styles.tomtKnapper}>
              <Link href="/kontakt" className="knapp">
                Send forespørsel <Pil />
              </Link>
              <button type="button" className="knapp knapp--omriss" onClick={() => { settSok(''); velgKategori(null) }}>
                Vis alt utstyr
              </button>
            </div>
          </div>
        ) : grupper ? (
          grupper.map((g) => (
            <section key={g.kategori.id} className={styles.gruppe} aria-labelledby={`gruppe-${g.kategori.id}`}>
              <h2 id={`gruppe-${g.kategori.id}`} className={styles.gruppetittel}>
                <span className="mono">{g.kategori.nr}</span>
                {g.kategori.navn}
              </h2>
              <div className={`${kortStil.rutenett} ${styles.rutenett}`}>
                {g.maskiner.map((m) => (
                  <Maskinkort key={m.slug} maskin={m} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <section aria-labelledby="resultater">
            <h2 id="resultater" className="skjult">
              Resultater
            </h2>
            <div className={`${kortStil.rutenett} ${styles.rutenett}`}>
              {treff.map((m) => (
                <Maskinkort key={m.slug} maskin={m} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
