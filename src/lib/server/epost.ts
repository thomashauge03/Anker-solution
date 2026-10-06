import 'server-only'
import { firma } from '@/data/firma'
import { epostOppsett, erProduksjon, erTestmodus } from './oppsett'

export type Utsending = 'sendt' | 'test' | 'ikke-satt-opp' | 'feilet'

/**
 * Sender ren tekst-e-post med Resend. Uten nøkkel skrives e-posten til
 * terminalen lokalt. I produksjon logges aldri innholdet, bare at den ikke
 * gikk — loggene skal ikke inneholde persondata.
 */
export async function sendEpost(e: { til: string; emne: string; tekst: string; svarTil?: string }): Promise<Utsending> {
  const o = epostOppsett()
  if (!o.nokkel || !o.fra) {
    if (!erProduksjon) {
      console.info(`\n──── E-post (ikke sendt, testmodus) ────\nTil: ${e.til}\nEmne: ${e.emne}\n\n${e.tekst}\n────────────────────────────────────────\n`)
    } else {
      console.warn('[e-post] Resend er ikke satt opp. E-posten ble ikke sendt.')
    }
    return erTestmodus() ? 'test' : 'ikke-satt-opp'
  }
  try {
    const svar = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${o.nokkel}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: o.fra,
        to: [e.til],
        subject: e.emne,
        text: e.tekst,
        reply_to: e.svarTil,
      }),
      cache: 'no-store',
    })
    if (!svar.ok) {
      console.error(`[e-post] Resend svarte ${svar.status}`)
      return 'feilet'
    }
    return 'sendt'
  } catch {
    console.error('[e-post] Fikk ikke kontakt med Resend')
    return 'feilet'
  }
}

/** Innboksen forespørsler og bestillinger går til. */
export function firmaInnboks(): string {
  return epostOppsett().til || firma.epost
}
