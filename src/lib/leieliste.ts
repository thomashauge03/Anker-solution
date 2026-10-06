'use client'

// Leielisten og prisvisningen lever i nettleseren (localStorage). Det er
// «strengt nødvendig» lagring for en funksjon kunden selv tar i bruk, og
// krever ikke samtykke. Ingenting her sendes noe sted før kunden selv
// betaler eller sender en forespørsel.

import { useSyncExternalStore } from 'react'
import { erIsoDato, iDagINorge } from './dato.ts'

export type Kundetype = 'privat' | 'bedrift'

export type Leielinje = { slug: string; antall: number }

export type Leieliste = {
  linjer: Leielinje[]
  fra: string | null
  til: string | null
  kundetype: Kundetype
}

const NOKKEL = 'anker:leieliste:v1'
const MAKS_ANTALL = 20

const tom: Leieliste = { linjer: [], fra: null, til: null, kundetype: 'privat' }

let gjeldende: Leieliste | null = null
const lyttere = new Set<() => void>()

/** Leser og renser det som ligger lagret. Ugyldige deler forkastes. */
function les(): Leieliste {
  let data: unknown
  try {
    const raa = window.localStorage.getItem(NOKKEL)
    if (!raa) return tom
    data = JSON.parse(raa)
  } catch {
    return tom
  }
  if (!data || typeof data !== 'object') return tom
  const d = data as Record<string, unknown>

  const linjer = Array.isArray(d.linjer)
    ? d.linjer
        .filter(
          (l): l is Leielinje =>
            !!l &&
            typeof l === 'object' &&
            typeof (l as Leielinje).slug === 'string' &&
            Number.isInteger((l as Leielinje).antall) &&
            (l as Leielinje).antall >= 1,
        )
        .map((l) => ({ slug: l.slug, antall: Math.min(l.antall, MAKS_ANTALL) }))
    : []

  // En periode som har vært, er ikke lenger aktuell.
  const idag = iDagINorge()
  let fra = erIsoDato(d.fra) && d.fra >= idag ? d.fra : null
  let til = fra && erIsoDato(d.til) && d.til >= fra ? d.til : null
  if (!fra || !til) {
    fra = null
    til = null
  }

  return {
    linjer,
    fra,
    til,
    kundetype: d.kundetype === 'bedrift' ? 'bedrift' : 'privat',
  }
}

function hent(): Leieliste {
  if (gjeldende === null) gjeldende = les()
  return gjeldende
}

function sett(endre: (l: Leieliste) => Leieliste) {
  gjeldende = endre(hent())
  try {
    window.localStorage.setItem(NOKKEL, JSON.stringify(gjeldende))
  } catch {
    // Privat modus eller full lagring: listen virker likevel denne økta.
  }
  lyttere.forEach((l) => l())
}

function abonner(lytter: () => void) {
  lyttere.add(lytter)
  const vedEndringIAnnenFane = (e: StorageEvent) => {
    if (e.key !== NOKKEL) return
    gjeldende = les()
    lytter()
  }
  window.addEventListener('storage', vedEndringIAnnenFane)
  return () => {
    lyttere.delete(lytter)
    window.removeEventListener('storage', vedEndringIAnnenFane)
  }
}

/** Serveren og første tegning ser alltid en tom liste, så HTML-en stemmer. */
export function useLeieliste(): Leieliste {
  return useSyncExternalStore(abonner, hent, () => tom)
}

export function useKundetype(): Kundetype {
  return useSyncExternalStore(
    abonner,
    () => hent().kundetype,
    () => 'privat' as const,
  )
}

const ingenAbonnement = () => () => {}

/** False på serveren og under hydrering, true når nettleseren har tatt over. */
export function useErKlient(): boolean {
  return useSyncExternalStore(
    ingenAbonnement,
    () => true,
    () => false,
  )
}

export function antallILista(l: Leieliste): number {
  return l.linjer.reduce((sum, linje) => sum + linje.antall, 0)
}

export const leieliste = {
  leggTil(slug: string, antall = 1) {
    sett((l) => {
      const finnes = l.linjer.find((x) => x.slug === slug)
      const linjer = finnes
        ? l.linjer.map((x) => (x.slug === slug ? { ...x, antall: Math.min(x.antall + antall, MAKS_ANTALL) } : x))
        : [...l.linjer, { slug, antall: Math.min(antall, MAKS_ANTALL) }]
      return { ...l, linjer }
    })
  },
  settAntall(slug: string, antall: number) {
    sett((l) => ({
      ...l,
      linjer: l.linjer.map((x) => (x.slug === slug ? { ...x, antall: Math.max(1, Math.min(antall, MAKS_ANTALL)) } : x)),
    }))
  },
  fjern(slug: string) {
    sett((l) => ({ ...l, linjer: l.linjer.filter((x) => x.slug !== slug) }))
  },
  settPeriode(fra: string | null, til: string | null) {
    sett((l) => ({ ...l, fra, til }))
  },
  settKundetype(kundetype: Kundetype) {
    sett((l) => ({ ...l, kundetype }))
  },
  /** Etter fullført bestilling: tøm listen, behold prisvalget. */
  tom() {
    sett((l) => ({ ...tom, kundetype: l.kundetype }))
  },
}
