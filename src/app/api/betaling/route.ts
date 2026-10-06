import { firma } from '@/data/firma'
import { finnMaskin } from '@/data/maskiner'
import { formaterPeriode } from '@/lib/dato'
import { beregnBestilling } from '@/lib/pris'
import { Betalingsfeil, leverandor } from '@/lib/server/betaling'
import { firmaInnboks, sendEpost } from '@/lib/server/epost'
import { bestillingTilFirma } from '@/lib/server/epostmaler'
import { innenforGrense, klientIp } from '@/lib/server/grense'
import { erProduksjon, nettstedUrl } from '@/lib/server/oppsett'
import { forsegle, KAPSEL_COOKIE, KAPSEL_LEVETID_S, type Ordrekapsel } from '@/lib/server/ordrekapsel'
import { lagReferanse } from '@/lib/server/referanse'
import { erRobot, lesJson, maaLeveres, sjekkUtstyr, svar } from '@/lib/server/sjekk'
import { betalingsskjema, feltfeil } from '@/lib/validering'

export async function POST(req: Request) {
  if (!innenforGrense(`betaling:${klientIp(req)}`, 10, 10 * 60_000)) {
    return svar({ feil: `For mange forsøk på kort tid. Vent litt, eller ring oss på ${firma.telefonVisning}.` }, 429)
  }

  const kropp = await lesJson(req)
  if (erRobot(kropp)) return svar({ feil: 'Bestillingen ble avvist. Prøv igjen.' }, 400)

  const r = betalingsskjema().safeParse(kropp)
  if (!r.success) return svar({ feil: 'Sjekk feltene som er merket.', felt: feltfeil(r.error) }, 400)
  const d = r.data

  const utstyrsfeil = sjekkUtstyr(d.linjer, true)
  if (utstyrsfeil) return svar({ feil: utstyrsfeil.feil }, utstyrsfeil.status)

  const leveres = maaLeveres(d.linjer)
  if (leveres.length > 0 && d.levering.type === 'henting') {
    return svar(
      { feil: 'Noe av utstyret må leveres av oss.', felt: { levering: `${leveres.join(', ')} må leveres. Velg levering.` } },
      400,
    )
  }

  const valg = leverandor(d.metode)
  if (!valg) {
    return svar(
      { feil: `Betaling med ${d.metode === 'vipps' ? 'Vipps' : 'kort'} er ikke åpnet ennå. Send leielisten som forespørsel.` },
      503,
    )
  }

  // Prisen regnes alltid her. Beløp fra nettleseren brukes ikke.
  const b = beregnBestilling(d, finnMaskin, firma.levering.prisInklMva)
  const referanse = lagReferanse()
  const base = nettstedUrl(req.url)
  const koder = b.linjer.map((l) => (l.antall > 1 ? `${l.kode} ×${l.antall}` : l.kode)).join(', ')

  let videreUrl: string
  try {
    ;({ videreUrl } = await valg.lev.opprett({
      referanse,
      belopOre: b.totalInklOre,
      beskrivelse: `Leie ${referanse}: ${koder}, ${formaterPeriode(d.fra, d.til)}`,
      linjer: [
        ...b.linjer.map((l) => ({
          navn: `${l.navn} (${l.kode}), ${b.dogn} døgn`,
          antall: l.antall,
          enhetOre: l.enhetspris * 100,
        })),
        ...(b.levering ? [{ navn: 'Levering og henting', antall: 1, enhetOre: b.levering * 100 }] : []),
      ],
      epost: d.kunde.epost,
      telefon: d.kunde.telefon,
      returUrl: `${base}/betaling/status?ref=${referanse}&metode=${d.metode}`,
      avbruttUrl: `${base}/leieliste?avbrutt=1`,
    }))
  } catch (e) {
    const status = e instanceof Betalingsfeil ? (e.detaljer as { status?: number })?.status : undefined
    console.error(`[betaling] Kunne ikke opprette ${d.metode}-betaling ${referanse}`, status ?? '')
    return svar(
      { feil: 'Vi fikk ikke kontakt med betalingsløsningen. Prøv igjen, eller send leielisten som forespørsel.' },
      502,
    )
  }

  // Firmaet får hele bestillingen nå, så den ikke går tapt om kunden
  // kommer tilbake fra Vipps i en annen nettleser.
  await sendEpost({
    til: firmaInnboks(),
    ...bestillingTilFirma(referanse, d, b, 'venter', valg.test),
    svarTil: d.kunde.epost,
  })

  const kapsel: Ordrekapsel = { referanse, test: valg.test, opprettet: Date.now(), data: d }
  const res = svar({ videre: videreUrl })
  res.cookies.set(KAPSEL_COOKIE, forsegle(kapsel), {
    httpOnly: true,
    secure: erProduksjon,
    sameSite: 'lax',
    path: '/',
    maxAge: KAPSEL_LEVETID_S,
  })
  return res
}
