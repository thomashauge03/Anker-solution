// Stegene i kassen, sjekken av feltene og hvilket steg hvert felt står på.
// Ren logikk uten React, så den kan testes med node:test. Derfor relative
// importer med .ts, som i src/lib.

import type { Maskin } from '../../data/maskiner.ts'
import type { Leielinje, Leieliste } from '../../lib/leieliste.ts'
import { erGyldigOrgnr, erGyldigTelefon, normaliserTelefon, serUtSomEpost } from '../../lib/regler.ts'

export type Vei = 'betaling' | 'foresporsel'
export type Levering = 'henting' | 'levering'
export type Feil = Record<string, string>
export type Kunde = { navn: string; telefon: string; epost: string; firma: string; orgnr: string }
export type Adresse = { adresse: string; postnr: string; sted: string }
export type Rad = { linje: Leielinje; maskin: Maskin }

/** Navnet står i fremdriften og på «Neste»-knappen, tittelen øverst i steget. */
export const stegliste = [
  { id: 'utstyr', navn: 'Utstyr', tittel: 'Utstyr' },
  { id: 'periode', navn: 'Periode', tittel: 'Leieperiode' },
  { id: 'levering', navn: 'Levering', tittel: 'Henting eller levering' },
  { id: 'opplysninger', navn: 'Opplysninger', tittel: 'Dine opplysninger' },
  { id: 'bekreft', navn: 'Bekreft', tittel: 'Se over og bekreft' },
] as const

export type StegId = (typeof stegliste)[number]['id']

/** Steget i adressen (?steg=…), eller null hvis det ikke finnes. */
export function lesSteg(verdi: string | null): StegId | null {
  return stegliste.find((s) => s.id === verdi)?.id ?? null
}

/** Plassen i rekken, fra 0. */
export function stegnr(id: StegId): number {
  return stegliste.findIndex((s) => s.id === id)
}

/** Rask sjekk i nettleseren. Serveren sjekker alt på nytt. */
export function sjekk(
  vei: Vei,
  liste: Leieliste,
  kunde: Kunde,
  levering: Levering,
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

// Rekkefølgen feltene står i, så fokus havner på den første feilen.
export const feltrekkefolge = [
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

export const feltId: Record<string, string> = {
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

const feltSteg: Record<string, StegId> = {
  fra: 'periode',
  til: 'periode',
  levering: 'levering',
  'levering.adresse': 'levering',
  'levering.postnr': 'levering',
  'levering.sted': 'levering',
  'kunde.navn': 'opplysninger',
  'kunde.telefon': 'opplysninger',
  'kunde.epost': 'opplysninger',
  'kunde.firma': 'opplysninger',
  'kunde.orgnr': 'opplysninger',
  godtarVilkar: 'bekreft',
  startForAngrefrist: 'bekreft',
}

/**
 * Steget et felt står på, eller null for feil uten felt. Meldingen står på
 * «Opplysninger» når listen bare kan bli en forespørsel, ellers under
 * valget på «Bekreft».
 */
export function stegForFelt(felt: string, meldingPaa: StegId): StegId | null {
  if (felt === 'melding') return meldingPaa
  return feltSteg[felt] ?? null
}

/** Feilene som hører til ett steg. */
export function feilISteg(feil: Feil, steg: StegId, meldingPaa: StegId): Feil {
  return Object.fromEntries(Object.entries(feil).filter(([felt]) => stegForFelt(felt, meldingPaa) === steg))
}

export function harFeil(feil: Feil): boolean {
  return Object.keys(feil).length > 0
}

/**
 * Steget som vises når kunden ber om `onsket`: det første steget foran som
 * mangler noe, ellers `onsket`. Ingen kan hoppe rett til bekreftelsen.
 */
export function forsteUferdige(feil: Feil, onsket: StegId, meldingPaa: StegId): StegId {
  for (const s of stegliste.slice(0, stegnr(onsket))) {
    if (harFeil(feilISteg(feil, s.id, meldingPaa))) return s.id
  }
  return onsket
}
