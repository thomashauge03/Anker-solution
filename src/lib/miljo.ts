// Miljøvariabler som både sider og API-ruter trenger. Leses på serveren
// (og ved bygging for statiske sider), aldri i nettleseren.

/** «på», «ja», «1», «true» og «on» betyr på. Tåler mellomrom og store bokstaver. */
export function erPaa(verdi: string | undefined): boolean {
  return !!verdi && ['på', 'pa', 'ja', '1', 'true', 'on'].includes(verdi.trim().toLowerCase())
}

/**
 * Demo: siden vises fram før avtalene er på plass. Betaling simuleres, e-post
 * sendes ikke, et bånd forteller det øverst, og søkemotorer holdes ute.
 */
export const erDemo = erPaa(process.env.TESTMODUS)

/** Adressen siden ligger på, uten skråstrek til slutt. */
export function nettstedBase(): string | null {
  const satt =
    process.env.NETTSTED_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}` : '')
  return satt ? satt.replace(/\/+$/, '') : null
}
