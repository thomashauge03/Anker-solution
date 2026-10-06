// Validering av alt som kommer inn fra skjemaene. Brukes av serveren;
// nettleseren gjør de samme sjekkene enklere for å gi rask tilbakemelding.

import { z } from 'zod'
import { dagerMellom, erIsoDato, iDagINorge } from './dato.ts'
import {
  erGyldigOrgnr,
  erGyldigTelefon,
  MAKS_DAGER_FRAM,
  MAKS_DOGN,
  normaliserTelefon,
  starterForAngrefrist,
} from './regler.ts'

export { erGyldigOrgnr, normaliserTelefon, starterForAngrefrist } from './regler.ts'

z.config(z.locales.no())

const tekst = (min: number, max: number, melding: string) =>
  z.string().trim().min(min, melding).max(max, `Høyst ${max} tegn.`)

const telefon = z
  .string()
  .transform(normaliserTelefon)
  .refine(erGyldigTelefon, 'Skriv et norsk telefonnummer med åtte siffer.')

const epost = z
  .string()
  .trim()
  .toLowerCase()
  .max(200, 'For lang e-postadresse.')
  .pipe(z.email('Skriv en gyldig e-postadresse.'))

const valgfriEpost = z
  .string()
  .trim()
  .toLowerCase()
  .max(200, 'For lang e-postadresse.')
  .refine((v) => v === '' || z.email().safeParse(v).success, 'Skriv en gyldig e-postadresse.')
  .transform((v) => v || undefined)

const linje = z.object({
  slug: z.string().min(1).max(60),
  antall: z.number().int().min(1).max(20),
})

const levering = z.discriminatedUnion('type', [
  z.object({ type: z.literal('henting') }),
  z.object({
    type: z.literal('levering'),
    adresse: tekst(3, 120, 'Skriv leveringsadressen.'),
    postnr: z.string().trim().regex(/^\d{4}$/, 'Postnummer har fire siffer.'),
    sted: tekst(2, 60, 'Skriv poststed.'),
  }),
])

const kundeGrunnlag = z.object({
  type: z.enum(['privat', 'bedrift']),
  navn: tekst(2, 100, 'Skriv fullt navn.'),
  telefon,
  firma: z.string().trim().max(120, 'Høyst 120 tegn.').optional(),
  orgnr: z.string().trim().max(20).optional(),
})

type Kontekst = z.RefinementCtx

function sjekkBedrift(k: { type: string; firma?: string; orgnr?: string }, ctx: Kontekst) {
  if (k.type !== 'bedrift') return
  if (!k.firma || k.firma.length < 2) {
    ctx.addIssue({ code: 'custom', path: ['kunde', 'firma'], message: 'Skriv firmanavnet.' })
  }
  if (!erGyldigOrgnr(k.orgnr)) {
    ctx.addIssue({ code: 'custom', path: ['kunde', 'orgnr'], message: 'Org.nr. har ni siffer. Sjekk at det er riktig.' })
  }
}

function sjekkPeriode(fra: unknown, til: unknown, idag: string, ctx: Kontekst) {
  if (!erIsoDato(fra)) {
    ctx.addIssue({ code: 'custom', path: ['fra'], message: 'Velg dato for henting.' })
    return
  }
  if (!erIsoDato(til)) {
    ctx.addIssue({ code: 'custom', path: ['til'], message: 'Velg dato for retur.' })
    return
  }
  if (fra < idag) {
    ctx.addIssue({ code: 'custom', path: ['fra'], message: 'Hentedatoen har vært.' })
  } else if (dagerMellom(idag, fra) > MAKS_DAGER_FRAM) {
    ctx.addIssue({ code: 'custom', path: ['fra'], message: 'Vi tar imot bestillinger inntil ett år fram.' })
  }
  if (til < fra) {
    ctx.addIssue({ code: 'custom', path: ['til'], message: 'Retur kan ikke være før henting.' })
  } else if (dagerMellom(fra, til) > MAKS_DOGN) {
    ctx.addIssue({
      code: 'custom',
      path: ['til'],
      message: `Lengre leie enn ${MAKS_DOGN} døgn avtales i en forespørsel.`,
    })
  }
}

/** Bestilling som skal betales med Vipps eller kort. */
export function betalingsskjema(idag: string = iDagINorge()) {
  return z
    .object({
      linjer: z.array(linje).min(1, 'Leielisten er tom.').max(20),
      fra: z.string(),
      til: z.string(),
      levering,
      kunde: kundeGrunnlag.extend({ epost }),
      metode: z.enum(['vipps', 'kort']),
      godtarVilkar: z.literal(true, 'Du må godta leievilkårene.'),
      startForAngrefrist: z.boolean().optional(),
    })
    .superRefine((d, ctx) => {
      sjekkPeriode(d.fra, d.til, idag, ctx)
      sjekkBedrift(d.kunde, ctx)
      if (
        d.kunde?.type === 'privat' &&
        erIsoDato(d.fra) &&
        starterForAngrefrist(d.fra, idag) &&
        d.startForAngrefrist !== true
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['startForAngrefrist'],
          message: 'Leien starter før angrefristen er ute. Kryss av for at du ber om det.',
        })
      }
    })
}

/** Forespørsel — med utstyr fra leielisten, eller bare en melding. */
export function foresporselsskjema(idag: string = iDagINorge()) {
  return z
    .object({
      linjer: z.array(linje).max(20).default([]),
      fra: z.string().optional(),
      til: z.string().optional(),
      levering: levering.optional(),
      kunde: kundeGrunnlag.extend({ epost: valgfriEpost.optional() }),
      melding: z.string().trim().max(2000, 'Høyst 2000 tegn.').default(''),
    })
    .superRefine((d, ctx) => {
      if (d.fra || d.til) sjekkPeriode(d.fra, d.til, idag, ctx)
      sjekkBedrift(d.kunde, ctx)
      if (d.linjer.length === 0 && d.melding.length < 10) {
        ctx.addIssue({ code: 'custom', path: ['melding'], message: 'Fortell kort hva du trenger.' })
      }
    })
}

export type Betalingsdata = z.output<ReturnType<typeof betalingsskjema>>
export type Foresporselsdata = z.output<ReturnType<typeof foresporselsskjema>>

/** Første feilmelding per felt, med punktum-sti som nøkkel: «kunde.telefon». */
export function feltfeil(feil: z.ZodError): Record<string, string> {
  const ut: Record<string, string> = {}
  for (const i of feil.issues) {
    const nokkel = i.path.join('.') || '_'
    if (!(nokkel in ut)) ut[nokkel] = i.message
  }
  return ut
}
