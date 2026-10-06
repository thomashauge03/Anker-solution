import { cookies } from 'next/headers'
import { firma } from '@/data/firma'
import { finnMaskin } from '@/data/maskiner'
import { beregnBestilling } from '@/lib/pris'
import { Betalingsfeil, leverandor, type Betalingsmetode, type Betalingsstatus } from '@/lib/server/betaling'
import { demo } from '@/lib/server/betaling/demo'
import { firmaInnboks, sendEpost } from '@/lib/server/epost'
import { bestillingKvittering, bestillingTilFirma } from '@/lib/server/epostmaler'
import { innenforGrense, klientIp } from '@/lib/server/grense'
import { nettstedUrl } from '@/lib/server/oppsett'
import { aapne, KAPSEL_COOKIE, type Ordrekapsel } from '@/lib/server/ordrekapsel'
import { REFERANSE } from '@/lib/server/referanse'
import { lesJson, svar } from '@/lib/server/sjekk'

// Kalles fra kvitteringssiden når kunden kommer tilbake. POST fordi kallet
// sender e-post og sletter cookien — det skal ikke skje ved en forhåndsvisning.

export async function POST(req: Request) {
  if (!innenforGrense(`status:${klientIp(req)}`, 30, 10 * 60_000)) {
    return svar({ feil: 'For mange forsøk. Vent litt.' }, 429)
  }

  const kropp = (await lesJson(req)) as { parametre?: unknown } | null
  const parametre = new URLSearchParams(typeof kropp?.parametre === 'string' ? kropp.parametre.slice(0, 500) : '')
  const referanse = parametre.get('ref') ?? ''
  const metode = parametre.get('metode') as Betalingsmetode | null
  if (!REFERANSE.test(referanse) || (metode !== 'vipps' && metode !== 'kort')) {
    return svar({ feil: 'Ukjent bestilling.' }, 400)
  }

  const lager = await cookies()
  const kapsel = aapne<Ordrekapsel>(lager.get(KAPSEL_COOKIE)?.value)
  const egen = kapsel && kapsel.referanse === referanse && kapsel.data.metode === metode ? kapsel : null

  // En testbetaling kan bare bekreftes av nettleseren som startet den.
  const valg = egen?.test ? { lev: demo(metode), test: true } : leverandor(metode)
  if (!valg || (valg.test && !egen)) return svar({ status: 'ukjent' satisfies Betalingsstatus })

  let status: Betalingsstatus
  try {
    status = await valg.lev.status(referanse, parametre)
  } catch (e) {
    console.error(`[betaling] Fikk ikke status for ${referanse}`, e instanceof Betalingsfeil ? e.message : '')
    return svar({ feil: 'Vi fikk ikke svar fra betalingsløsningen. Last siden på nytt om litt.' }, 502)
  }

  if (!egen) return svar({ status, referanse })

  if (status === 'avbrutt') {
    lager.delete(KAPSEL_COOKIE)
    return svar({ status, referanse, test: egen.test })
  }
  if (status !== 'reservert' && status !== 'betalt') {
    return svar({ status, referanse, test: egen.test })
  }

  const d = egen.data
  const b = beregnBestilling(d, finnMaskin, firma.levering.prisInklMva)

  await sendEpost({ til: firmaInnboks(), ...bestillingTilFirma(referanse, d, b, status, egen.test) })
  await sendEpost({
    til: d.kunde.epost,
    ...bestillingKvittering(referanse, d, b, egen.test, nettstedUrl(req.url)),
    svarTil: firma.epost,
  })
  // Én gang per bestilling: ny lasting av siden sender ikke e-post igjen.
  lager.delete(KAPSEL_COOKIE)

  return svar({
    status,
    referanse,
    test: egen.test,
    ordre: {
      fra: d.fra,
      til: d.til,
      dogn: b.dogn,
      levering: d.levering.type,
      linjer: b.linjer.map((l) => ({ navn: l.navn, kode: l.kode, antall: l.antall, sum: l.sum })),
      leveringspris: b.levering,
      totalInklOre: b.totalInklOre,
      mvaOre: b.mvaOre,
      epost: d.kunde.epost,
    },
  })
}
