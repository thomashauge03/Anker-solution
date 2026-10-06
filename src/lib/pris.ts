// Prisregning. Delt mellom nettleseren (visning) og serveren (betaling),
// så kunden ser nøyaktig det beløpet som trekkes. Alt regnes i øre.

import { antallDogn } from './dato.ts'

export const MVA_SATS = 0.25

export type Prisgrunnlag = { dognpris: number; ukepris: number }

/**
 * Leie for én enhet i hele kroner inkl. mva. Hele uker koster ukepris.
 * Resten av dagene koster døgnpris, men aldri mer enn en ukepris, så fra
 * fire døgn betaler kunden ukepris.
 */
export function leiepris(p: Prisgrunnlag, dogn: number): number {
  if (!Number.isInteger(dogn) || dogn < 1) {
    throw new RangeError(`Ugyldig antall døgn: ${dogn}`)
  }
  const uker = Math.floor(dogn / 7)
  const rest = dogn % 7
  return uker * p.ukepris + Math.min(rest * p.dognpris, p.ukepris)
}

/** Antall døgn før ukeprisen slår inn for resten av uka. */
export function dognTilUkepris(p: Prisgrunnlag): number {
  return Math.ceil(p.ukepris / p.dognpris)
}

/** Beløp i øre eks. mva, regnet fra hele kroner inkl. mva. */
export function eksMvaOre(inklKroner: number): number {
  return Math.round((inklKroner * 100) / (1 + MVA_SATS))
}

export type Bestillingslinje = { slug: string; antall: number }

export type Leveringsvalg = { type: 'henting' } | { type: 'levering' }

export type Linjeberegning = {
  slug: string
  kode: string
  navn: string
  antall: number
  /** Pris for hele perioden per enhet, hele kroner inkl. mva. */
  enhetspris: number
  /** antall × enhetspris, hele kroner inkl. mva. */
  sum: number
}

export type Beregning = {
  dogn: number
  linjer: Linjeberegning[]
  /** Hele kroner inkl. mva, 0 ved henting. */
  levering: number
  totalInklOre: number
  totalEksOre: number
  mvaOre: number
}

type Oppslag = (slug: string) => (Prisgrunnlag & { kode: string; navn: string }) | undefined

/**
 * Regner ut hele bestillingen. Kaster hvis en maskin ikke finnes, så
 * kalleren skal ha validert slugene først.
 */
export function beregnBestilling(
  inn: { linjer: Bestillingslinje[]; fra: string; til: string; levering: Leveringsvalg },
  finn: Oppslag,
  leveringspris: number,
): Beregning {
  const dogn = antallDogn(inn.fra, inn.til)
  const linjer = inn.linjer.map((l): Linjeberegning => {
    const m = finn(l.slug)
    if (!m) throw new Error(`Ukjent maskin: ${l.slug}`)
    const enhetspris = leiepris(m, dogn)
    return { slug: l.slug, kode: m.kode, navn: m.navn, antall: l.antall, enhetspris, sum: enhetspris * l.antall }
  })
  const levering = inn.levering.type === 'levering' ? leveringspris : 0
  const totalInklOre = (linjer.reduce((s, l) => s + l.sum, 0) + levering) * 100
  const totalEksOre = Math.round(totalInklOre / (1 + MVA_SATS))
  return { dogn, linjer, levering, totalInklOre, totalEksOre, mvaOre: totalInklOre - totalEksOre }
}
