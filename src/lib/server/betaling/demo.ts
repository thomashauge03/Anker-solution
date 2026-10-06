import 'server-only'
import type { Betalingsleverandor, Betalingsmetode, NyBetaling } from './typer'

// Testmodus: ingen penger flyttes. Kunden sendes til en side på vårt eget
// nettsted som ligner betalingssteget, og velger selv om betalingen skal
// godkjennes eller avbrytes. Brukes når nøklene til Vipps eller Stripe mangler.

export function demo(metode: Betalingsmetode): Betalingsleverandor {
  return {
    async opprett(b: NyBetaling) {
      const p = new URLSearchParams({ ref: b.referanse, metode })
      return { videreUrl: `/betaling/test?${p}` }
    },
    async status(_referanse, parametre) {
      const valg = parametre.get('test')
      if (valg === 'godkjent') return 'reservert'
      if (valg === 'avbrutt') return 'avbrutt'
      return 'ukjent'
    },
  }
}
