import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  betalingsskjema,
  erGyldigOrgnr,
  feltfeil,
  foresporselsskjema,
  normaliserTelefon,
  starterForAngrefrist,
} from './validering.ts'

const IDAG = '2026-10-06'

const gyldigBetaling = {
  linjer: [{ slug: 'motorsag-40', antall: 1 }],
  fra: '2026-10-28',
  til: '2026-10-30',
  levering: { type: 'henting' },
  kunde: { type: 'privat', navn: 'Kari Nordmann', telefon: '412 34 567', epost: ' Kari@Eksempel.no ' },
  metode: 'vipps',
  godtarVilkar: true,
}

test('organisasjonsnummer sjekkes med modulus 11', () => {
  assert.equal(erGyldigOrgnr('923 609 016'), true)
  assert.equal(erGyldigOrgnr('974760673'), true)
  assert.equal(erGyldigOrgnr('923609017'), false)
  assert.equal(erGyldigOrgnr('12345678'), false)
  assert.equal(erGyldigOrgnr(undefined), false)
})

test('telefonnummer renses for mellomrom og landskode', () => {
  assert.equal(normaliserTelefon('+47 412 34 567'), '41234567')
  assert.equal(normaliserTelefon('0047-41234567'), '41234567')
})

test('gyldig betaling går gjennom og renses', () => {
  const r = betalingsskjema(IDAG).safeParse(gyldigBetaling)
  assert.equal(r.success, true)
  assert.equal(r.data.kunde.telefon, '41234567')
  assert.equal(r.data.kunde.epost, 'kari@eksempel.no')
})

test('vilkårene må godtas', () => {
  const r = betalingsskjema(IDAG).safeParse({ ...gyldigBetaling, godtarVilkar: false })
  assert.equal(r.success, false)
  assert.equal(feltfeil(r.error).godtarVilkar, 'Du må godta leievilkårene.')
})

test('privat leie som starter innen 14 dager krever uttrykkelig anmodning', () => {
  assert.equal(starterForAngrefrist('2026-10-10', IDAG), true)
  assert.equal(starterForAngrefrist('2026-10-20', IDAG), false)
  const uten = betalingsskjema(IDAG).safeParse({ ...gyldigBetaling, fra: '2026-10-08', til: '2026-10-09' })
  assert.equal(uten.success, false)
  assert.ok(feltfeil(uten.error).startForAngrefrist)
  const med = betalingsskjema(IDAG).safeParse({
    ...gyldigBetaling,
    fra: '2026-10-08',
    til: '2026-10-09',
    startForAngrefrist: true,
  })
  assert.equal(med.success, true)
})

test('bedrift trenger ikke anmodningen, men gyldig org.nr.', () => {
  const kunde = { ...gyldigBetaling.kunde, type: 'bedrift', firma: 'Graving AS', orgnr: '923609017' }
  const r = betalingsskjema(IDAG).safeParse({ ...gyldigBetaling, kunde, fra: '2026-10-08', til: '2026-10-09' })
  assert.equal(r.success, false)
  const feil = feltfeil(r.error)
  assert.ok(feil['kunde.orgnr'])
  assert.equal(feil.startForAngrefrist, undefined)
})

test('periode: fortid, retur før henting og for lang leie avvises', () => {
  const skjema = betalingsskjema(IDAG)
  assert.ok(feltfeil(skjema.safeParse({ ...gyldigBetaling, fra: '2026-10-01' }).error).fra)
  assert.ok(feltfeil(skjema.safeParse({ ...gyldigBetaling, til: '2026-10-27' }).error).til)
  assert.ok(feltfeil(skjema.safeParse({ ...gyldigBetaling, til: '2027-02-01' }).error).til)
})

test('levering krever adresse', () => {
  const r = betalingsskjema(IDAG).safeParse({ ...gyldigBetaling, levering: { type: 'levering', adresse: '', postnr: '12', sted: '' } })
  const feil = feltfeil(r.error)
  assert.ok(feil['levering.adresse'])
  assert.ok(feil['levering.postnr'])
})

test('forespørsel uten utstyr må ha en melding, e-post er valgfri', () => {
  const kunde = { type: 'privat', navn: 'Ola Nordmann', telefon: '91234567', epost: '' }
  const tom = foresporselsskjema(IDAG).safeParse({ kunde, melding: 'Hei' })
  assert.ok(feltfeil(tom.error).melding)
  const ok = foresporselsskjema(IDAG).safeParse({ kunde, melding: 'Trenger en graver i to uker i november.' })
  assert.equal(ok.success, true)
  assert.equal(ok.data.kunde.epost, undefined)
})
