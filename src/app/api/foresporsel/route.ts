import { firma } from '@/data/firma'
import { finnMaskin } from '@/data/maskiner'
import { beregnBestilling } from '@/lib/pris'
import { firmaInnboks, sendEpost } from '@/lib/server/epost'
import { foresporselKvittering, foresporselTilFirma } from '@/lib/server/epostmaler'
import { innenforGrense, klientIp } from '@/lib/server/grense'
import { lagReferanse } from '@/lib/server/referanse'
import { erRobot, lesJson, sjekkUtstyr, svar } from '@/lib/server/sjekk'
import { feltfeil, foresporselsskjema } from '@/lib/validering'

export async function POST(req: Request) {
  if (!innenforGrense(`foresporsel:${klientIp(req)}`, 5, 10 * 60_000)) {
    return svar({ feil: `For mange forsøk på kort tid. Vent litt, eller ring oss på ${firma.telefonVisning}.` }, 429)
  }

  const kropp = await lesJson(req)
  if (erRobot(kropp)) return svar({ feil: 'Forespørselen ble avvist. Prøv igjen.' }, 400)

  const r = foresporselsskjema().safeParse(kropp)
  if (!r.success) return svar({ feil: 'Sjekk feltene som er merket.', felt: feltfeil(r.error) }, 400)
  const d = r.data

  const utstyrsfeil = sjekkUtstyr(d.linjer, false)
  if (utstyrsfeil) return svar({ feil: utstyrsfeil.feil }, utstyrsfeil.status)

  const beregning =
    d.linjer.length > 0 && d.fra && d.til
      ? beregnBestilling(
          { linjer: d.linjer, fra: d.fra, til: d.til, levering: { type: d.levering?.type ?? 'henting' } },
          finnMaskin,
          firma.levering.prisInklMva,
        )
      : null

  const referanse = lagReferanse()
  const tilFirma = foresporselTilFirma(referanse, d, beregning)
  const utsending = await sendEpost({ til: firmaInnboks(), ...tilFirma, svarTil: d.kunde.epost })

  // Uten database finnes forespørselen bare i e-posten. Gikk den ikke,
  // må kunden få vite det. Ellers forsvinner den i stillhet.
  if (utsending === 'feilet' || utsending === 'ikke-satt-opp') {
    return svar(
      { feil: `Vi fikk ikke sendt forespørselen. Ring oss på ${firma.telefonVisning}, eller prøv igjen om litt.` },
      503,
    )
  }

  if (d.kunde.epost) {
    await sendEpost({ til: d.kunde.epost, ...foresporselKvittering(referanse, d) })
  }

  return svar({ ok: true, referanse, test: utsending === 'test' })
}
