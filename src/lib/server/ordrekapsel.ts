import 'server-only'
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import type { Betalingsdata } from '@/lib/validering'

export type Ordrekapsel = {
  referanse: string
  /** Laget i testmodus: bekreftes av testsiden, ikke av Vipps eller Stripe. */
  test: boolean
  opprettet: number
  data: Betalingsdata
}

// Mens kunden er hos Vipps eller Stripe, ligger bestillingen kryptert i en
// HttpOnly-cookie. Da trenger vi ingen database for å vite hva som ble
// bestilt når kunden kommer tilbake, og nettleseren kan verken lese eller
// endre innholdet (AES-256-GCM oppdager enhver endring).

export const KAPSEL_COOKIE = 'anker_ordre'
export const KAPSEL_LEVETID_S = 60 * 60

let midlertidigNokkel: Buffer | null = null

function nokkel(): Buffer {
  const satt = process.env.ORDRE_NOKKEL
  if (satt) {
    const n = Buffer.from(satt, 'base64')
    if (n.length !== 32) throw new Error('ORDRE_NOKKEL må være 32 byte i base64')
    return n
  }
  if (process.env.NODE_ENV === 'production') throw new Error('ORDRE_NOKKEL mangler')
  // Lokalt: en nøkkel per serverstart. Holder for utvikling.
  midlertidigNokkel ??= randomBytes(32)
  return midlertidigNokkel
}

export function forsegle(data: unknown): string {
  const iv = randomBytes(12)
  const chiffer = createCipheriv('aes-256-gcm', nokkel(), iv)
  const kryptert = Buffer.concat([chiffer.update(JSON.stringify(data), 'utf8'), chiffer.final()])
  const merke = chiffer.getAuthTag()
  return Buffer.concat([iv, merke, kryptert]).toString('base64url')
}

/** Gir null hvis kapselen er ugyldig, endret eller laget med en annen nøkkel. */
export function aapne<T>(kapsel: string | undefined): T | null {
  if (!kapsel) return null
  try {
    const raa = Buffer.from(kapsel, 'base64url')
    if (raa.length < 29) return null
    const iv = raa.subarray(0, 12)
    const merke = raa.subarray(12, 28)
    const kryptert = raa.subarray(28)
    const dechiffer = createDecipheriv('aes-256-gcm', nokkel(), iv)
    dechiffer.setAuthTag(merke)
    const klar = Buffer.concat([dechiffer.update(kryptert), dechiffer.final()]).toString('utf8')
    return JSON.parse(klar) as T
  } catch {
    return null
  }
}
