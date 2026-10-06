import 'server-only'
import { adresseLinje, firma } from '@/data/firma'
import { finnMaskin } from '@/data/maskiner'
import { formaterPeriode } from '@/lib/dato'
import { formaterMobil, kroner, kronerFraOre } from '@/lib/format'
import type { Beregning } from '@/lib/pris'
import type { Betalingsdata, Foresporselsdata } from '@/lib/validering'

// E-postene er ren tekst. Det leses godt i alle e-postprogrammer, og det
// kunden har skrevet kan aldri bli tolket som HTML.

type Kunde = Betalingsdata['kunde'] | Foresporselsdata['kunde']
type Levering = Betalingsdata['levering'] | Foresporselsdata['levering']

const STREK = '────────────────────────────────────────'

function kundeblokk(k: Kunde): string {
  const linjer = [`Navn:     ${k.navn}`]
  if (k.type === 'bedrift') linjer.push(`Firma:    ${k.firma ?? ''}, org.nr. ${k.orgnr ?? ''}`)
  linjer.push(`Telefon:  ${formaterMobil(k.telefon)}`)
  if (k.epost) linjer.push(`E-post:   ${k.epost}`)
  linjer.push(`Kunde:    ${k.type === 'bedrift' ? 'Bedrift' : 'Privat'}`)
  return linjer.join('\n')
}

function leveringstekst(l: Levering): string {
  if (!l) return 'Ikke oppgitt'
  if (l.type === 'henting') return `Henter selv (${adresseLinje})`
  return `Levering til ${l.adresse}, ${l.postnr} ${l.sted}`
}

function utstyrsblokk(b: Beregning): string {
  const linjer = b.linjer.map(
    (l) => `  ${l.antall} × ${l.navn} (${l.kode})`.padEnd(46, ' ') + kroner(l.sum).padStart(12, ' '),
  )
  if (b.levering) linjer.push('  Levering og henting'.padEnd(46, ' ') + kroner(b.levering).padStart(12, ' '))
  linjer.push(`  ${STREK.slice(0, 56)}`)
  linjer.push('  Totalt inkl. mva'.padEnd(46, ' ') + kronerFraOre(b.totalInklOre).padStart(12, ' '))
  linjer.push('  Herav mva 25 %'.padEnd(46, ' ') + kronerFraOre(b.mvaOre).padStart(12, ' '))
  return linjer.join('\n')
}

function periodetekst(fra: string, til: string, dogn: number): string {
  return `${formaterPeriode(fra, til)} (${dogn} døgn)`
}

export function foresporselTilFirma(
  referanse: string,
  d: Foresporselsdata,
  beregning: Beregning | null,
): { emne: string; tekst: string } {
  const deler = [
    `Ny forespørsel ${referanse}`,
    STREK,
    kundeblokk(d.kunde),
    '',
  ]
  if (d.fra && d.til) deler.push(`Periode:  ${formaterPeriode(d.fra, d.til)}`)
  if (d.levering) deler.push(`Levering: ${leveringstekst(d.levering)}`)
  if (beregning) {
    deler.push('', 'Utstyr (veiledende pris fra nettsiden):', utstyrsblokk(beregning))
  } else if (d.linjer.length) {
    deler.push(
      '',
      'Utstyr (uten datoer, så ingen pris er regnet ut):',
      ...d.linjer.map((l) => {
        const m = finnMaskin(l.slug)
        return `  ${l.antall} × ${m ? `${m.navn} (${m.kode})` : l.slug}`
      }),
    )
  }
  if (d.melding) deler.push('', 'Melding fra kunden:', d.melding)
  deler.push('', STREK, `Forespørselen er ikke bindende. Svar kunden ${firma.svartid}.`)
  return { emne: `Ny forespørsel ${referanse}`, tekst: deler.join('\n') }
}

export function foresporselKvittering(referanse: string, d: Foresporselsdata): { emne: string; tekst: string } {
  const tekst = [
    `Hei ${d.kunde.navn.split(' ')[0]},`,
    '',
    `takk for forespørselen. Vi har fått den, og svarer deg ${firma.svartid} på telefon ${formaterMobil(d.kunde.telefon)}${d.kunde.epost ? ' eller e-post' : ''}.`,
    '',
    `Referanse: ${referanse}`,
    'Forespørselen er ikke bindende. Du har ikke bestilt noe ennå.',
    '',
    'Vennlig hilsen',
    firma.navn,
    `Tlf. ${firma.telefonVisning} · ${firma.epost}`,
    adresseLinje,
  ].join('\n')
  return { emne: `Vi har fått forespørselen din (${referanse})`, tekst }
}

export function bestillingTilFirma(
  referanse: string,
  d: Betalingsdata,
  b: Beregning,
  status: 'venter' | 'reservert' | 'betalt',
  test: boolean,
): { emne: string; tekst: string } {
  const metode = d.metode === 'vipps' ? 'Vipps' : 'kort (Stripe)'
  const portal = d.metode === 'vipps' ? 'portal.vippsmobilepay.com' : 'dashboard.stripe.com'
  const testmerke = test ? '[TEST] ' : ''

  if (status !== 'venter') {
    const tekst = [
      `${testmerke}Betalingen for ${referanse} er reservert med ${metode}: ${kronerFraOre(b.totalInklOre)}.`,
      '',
      `Når leien er bekreftet: trekk beløpet (capture) i ${portal}.`,
      'Kan dere ikke levere: avbryt betalingen der, så frigjøres beløpet.',
      test ? '\nDette er en testbestilling. Ingen penger er reservert.' : '',
    ].join('\n')
    return { emne: `${testmerke}Betalt: ${referanse}`, tekst }
  }

  const tekst = [
    `${testmerke}Ny bestilling ${referanse} — venter på betaling med ${metode}`,
    STREK,
    kundeblokk(d.kunde),
    '',
    `Periode:  ${periodetekst(d.fra, d.til, b.dogn)}`,
    `Levering: ${leveringstekst(d.levering)}`,
    '',
    'Utstyr:',
    utstyrsblokk(b),
    '',
    STREK,
    `Kunden er sendt videre til ${metode}. Du får en ny e-post når betalingen er reservert.`,
    `Kommer den ikke, sjekk referansen ${referanse} i ${portal} før du bekrefter.`,
    d.kunde.type === 'privat' && d.startForAngrefrist
      ? 'Kunden har bedt om at leien starter før angrefristen er ute.'
      : '',
  ].join('\n')
  return { emne: `${testmerke}Ny bestilling ${referanse}`, tekst }
}

export function bestillingKvittering(
  referanse: string,
  d: Betalingsdata,
  b: Beregning,
  test: boolean,
  nettsted: string,
): { emne: string; tekst: string } {
  const metode = d.metode === 'vipps' ? 'Vipps' : 'kortet ditt'
  const tekst = [
    test ? '[TEST — ingen penger er reservert]\n' : '',
    `Hei ${d.kunde.navn.split(' ')[0]},`,
    '',
    `takk for bestillingen. ${kronerFraOre(b.totalInklOre)} er reservert på ${metode}.`,
    'Beløpet trekkes først når vi har bekreftet at utstyret er klart.',
    '',
    `Referanse: ${referanse}`,
    `Periode:   ${periodetekst(d.fra, d.til, b.dogn)}`,
    `Levering:  ${leveringstekst(d.levering)}`,
    '',
    utstyrsblokk(b),
    '',
    'Åpningstider:',
    ...firma.apningstider.map((a) => `  ${a.dager}: ${a.tid}`),
    '',
    'Leievilkår, angrerett og angreskjema:',
    `${nettsted}/vilkar`,
    '',
    'Vennlig hilsen',
    firma.navn,
    `Tlf. ${firma.telefonVisning} · ${firma.epost}`,
    `${firma.juridiskNavn} · Org.nr. ${firma.orgnr}`,
  ].join('\n')
  return { emne: `${test ? '[TEST] ' : ''}Bestillingen din hos ${firma.navn} (${referanse})`, tekst }
}
