// Datoer reises som 'ÅÅÅÅ-MM-DD' gjennom hele appen. Regning skjer i UTC
// midnatt, så sommertid aldri gir et døgn på 23 eller 25 timer.

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/
const DOGN_MS = 86_400_000

export function erIsoDato(verdi: unknown): verdi is string {
  if (typeof verdi !== 'string') return false
  const treff = ISO.exec(verdi)
  if (!treff) return false
  const [, aar, maaned, dag] = treff.map(Number)
  const d = new Date(Date.UTC(aar, maaned - 1, dag))
  return d.getUTCFullYear() === aar && d.getUTCMonth() === maaned - 1 && d.getUTCDate() === dag
}

function tilUtc(iso: string): number {
  const [aar, maaned, dag] = iso.split('-').map(Number)
  return Date.UTC(aar, maaned - 1, dag)
}

function fraUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

/** Dagens dato i Norge, uansett hvilken tidssone serveren står i. */
export function iDagINorge(naa: Date = new Date()): string {
  // sv-SE formaterer som ÅÅÅÅ-MM-DD.
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Oslo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(naa)
}

export function leggTilDager(iso: string, dager: number): string {
  return fraUtc(tilUtc(iso) + dager * DOGN_MS)
}

export function dagerMellom(fra: string, til: string): number {
  return Math.round((tilUtc(til) - tilUtc(fra)) / DOGN_MS)
}

/**
 * Antall døgn kunden betaler for. Hentes det 14. og leveres 16., er det to
 * døgn. Hentes og leveres det samme dag, er det ett.
 */
export function antallDogn(fra: string, til: string): number {
  return Math.max(1, dagerMellom(fra, til))
}

const kortDato = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const dagOgMaaned = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', timeZone: 'UTC' })
const langDato = new Intl.DateTimeFormat('nb-NO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})

/** «14. okt.» */
export function formaterDato(iso: string): string {
  return kortDato.format(new Date(tilUtc(iso)))
}

/** «tirsdag 14. oktober» */
export function formaterLangDato(iso: string): string {
  return langDato.format(new Date(tilUtc(iso)))
}

/** «14.–16. okt.» innen samme måned, ellers «30. okt.–2. nov.» */
export function formaterPeriode(fra: string, til: string): string {
  if (fra === til) return formaterDato(fra)
  if (fra.slice(0, 7) === til.slice(0, 7)) {
    return `${dagOgMaaned.format(new Date(tilUtc(fra)))}–${formaterDato(til)}`
  }
  return `${formaterDato(fra)}–${formaterDato(til)}`
}
