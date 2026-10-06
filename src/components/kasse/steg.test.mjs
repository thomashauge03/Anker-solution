import { test } from 'node:test'
import assert from 'node:assert/strict'
import { feilISteg, forsteUferdige, lesSteg, sjekk, stegForFelt, stegliste } from './steg.ts'

const liste = {
  linjer: [{ slug: 'motorsag-40', antall: 1 }],
  fra: '2026-10-20',
  til: '2026-10-22',
  kundetype: 'privat',
}
const tomKunde = { navn: '', telefon: '', epost: '', firma: '', orgnr: '' }
const kunde = { navn: 'Test Testesen', telefon: '400 00 000', epost: 'test@example.com', firma: '', orgnr: '' }
const ingenAdresse = { adresse: '', postnr: '', sted: '' }

const feilFor = (vei, l, k, levering = 'henting') =>
  sjekk(vei, l, k, levering, ingenAdresse, false, false, false, '')

test('steget leses fra adressen, ukjente verdier gir null', () => {
  assert.deepEqual(
    stegliste.map((s) => s.id),
    ['utstyr', 'periode', 'levering', 'opplysninger', 'bekreft'],
  )
  assert.equal(lesSteg('levering'), 'levering')
  assert.equal(lesSteg('betal'), null)
  assert.equal(lesSteg(null), null)
})

test('hvert felt hører til ett steg, meldingen der den vises', () => {
  assert.equal(stegForFelt('til', 'bekreft'), 'periode')
  assert.equal(stegForFelt('levering.postnr', 'bekreft'), 'levering')
  assert.equal(stegForFelt('kunde.orgnr', 'bekreft'), 'opplysninger')
  assert.equal(stegForFelt('godtarVilkar', 'bekreft'), 'bekreft')
  assert.equal(stegForFelt('melding', 'opplysninger'), 'opplysninger')
  assert.equal(stegForFelt('melding', 'bekreft'), 'bekreft')
  assert.equal(stegForFelt('linjer', 'bekreft'), null)
})

test('feilene deles per steg', () => {
  const alle = feilFor('betaling', { ...liste, fra: null, til: null }, tomKunde)
  assert.deepEqual(Object.keys(feilISteg(alle, 'periode', 'bekreft')), ['fra', 'til'])
  assert.deepEqual(Object.keys(feilISteg(alle, 'opplysninger', 'bekreft')), ['kunde.navn', 'kunde.telefon', 'kunde.epost'])
  assert.deepEqual(Object.keys(feilISteg(alle, 'bekreft', 'bekreft')), ['godtarVilkar'])
  assert.deepEqual(feilISteg(alle, 'utstyr', 'bekreft'), {})
})

test('ingen kommer forbi et steg som mangler noe', () => {
  // Uten opplysninger stopper bekreftelsen på steg 4.
  assert.equal(forsteUferdige(feilFor('betaling', liste, tomKunde), 'bekreft', 'bekreft'), 'opplysninger')
  // Uten datoer stopper betaling på perioden …
  const udatert = { ...liste, fra: null, til: null }
  assert.equal(forsteUferdige(feilFor('betaling', udatert, kunde), 'bekreft', 'bekreft'), 'periode')
  // … men en forespørsel kan sendes uten datoer.
  assert.equal(forsteUferdige(feilFor('foresporsel', udatert, kunde), 'bekreft', 'opplysninger'), 'bekreft')
  // Levering uten adresse stopper på leveringssteget.
  assert.equal(forsteUferdige(feilFor('betaling', liste, kunde, 'levering'), 'bekreft', 'bekreft'), 'levering')
  // Steget kunden står på, teller ikke med.
  assert.equal(forsteUferdige(feilFor('betaling', liste, tomKunde), 'opplysninger', 'bekreft'), 'opplysninger')
  // Vilkårene krysses av på siste steg, så de stopper ingen på vei dit.
  assert.equal(forsteUferdige(feilFor('betaling', liste, kunde), 'bekreft', 'bekreft'), 'bekreft')
})
