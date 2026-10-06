// Regler som både nettleseren og serveren trenger. Ingen avhengigheter,
// så de kan brukes i klientkomponenter uten å dra med zod.

import { dagerMellom, iDagINorge } from './dato.ts'

export const MAKS_DOGN = 90
export const MAKS_DAGER_FRAM = 365
/** Angrefristen for tjenester etter angrerettloven: 14 dager fra avtalen inngås. */
export const ANGREFRIST_DAGER = 14

export function normaliserTelefon(verdi: string): string {
  return verdi.replace(/[\s.()-]/g, '').replace(/^(\+47|0047)/, '')
}

export function erGyldigTelefon(siffer: string): boolean {
  return /^[2-9]\d{7}$/.test(siffer)
}

/** Organisasjonsnummer: ni siffer, siste er kontrollsiffer (modulus 11). */
export function erGyldigOrgnr(verdi: string | undefined): boolean {
  if (!verdi) return false
  const s = verdi.replace(/\s/g, '')
  if (!/^\d{9}$/.test(s)) return false
  const vekter = [3, 2, 7, 6, 5, 4, 3, 2]
  const sum = vekter.reduce((acc, v, i) => acc + v * Number(s[i]), 0)
  const rest = sum % 11
  const kontroll = rest === 0 ? 0 : 11 - rest
  return kontroll !== 10 && kontroll === Number(s[8])
}

/**
 * Må forbrukeren be om at leien starter før angrefristen er ute? Det gjelder
 * når hentedagen er nærmere enn 14 dager fram. Angrerettloven krever da en
 * uttrykkelig anmodning fra forbrukeren.
 */
export function starterForAngrefrist(fra: string, idag: string = iDagINorge()): boolean {
  return dagerMellom(idag, fra) < ANGREFRIST_DAGER
}

const enkelEpost = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Grov sjekk for nettleseren. Serveren sjekker strengere med zod. */
export function serUtSomEpost(verdi: string): boolean {
  return enkelEpost.test(verdi.trim())
}
