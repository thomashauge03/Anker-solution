import 'server-only'
import { kortModus, vippsModus } from '../oppsett'
import { demo } from './demo'
import { stripe } from './stripe'
import type { Betalingsleverandor, Betalingsmetode } from './typer'
import { vipps } from './vipps'

export * from './typer'

/** Gir leverandøren for metoden, eller null hvis den er slått av. */
export function leverandor(metode: Betalingsmetode): { lev: Betalingsleverandor; test: boolean } | null {
  const modus = metode === 'vipps' ? vippsModus() : kortModus()
  if (modus === 'av') return null
  if (modus === 'test') return { lev: demo(metode), test: true }
  return { lev: metode === 'vipps' ? vipps : stripe, test: false }
}
