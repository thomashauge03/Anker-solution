import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  antallDogn,
  dagerMellom,
  erIsoDato,
  formaterPeriode,
  iDagINorge,
  leggTilDager,
} from './dato.ts'

test('gyldige og ugyldige datoer', () => {
  assert.equal(erIsoDato('2026-10-14'), true)
  assert.equal(erIsoDato('2028-02-29'), true)
  assert.equal(erIsoDato('2026-02-29'), false)
  assert.equal(erIsoDato('2026-13-01'), false)
  assert.equal(erIsoDato('14.10.2026'), false)
  assert.equal(erIsoDato(undefined), false)
})

test('døgn: samme dag er ett døgn, ellers dager mellom', () => {
  assert.equal(antallDogn('2026-10-14', '2026-10-14'), 1)
  assert.equal(antallDogn('2026-10-14', '2026-10-15'), 1)
  assert.equal(antallDogn('2026-10-14', '2026-10-17'), 3)
})

test('sommertid slutter 25. oktober 2026 uten å gi et ekstra døgn', () => {
  assert.equal(dagerMellom('2026-10-24', '2026-10-26'), 2)
  assert.equal(dagerMellom('2026-03-28', '2026-03-30'), 2)
})

test('legge til dager over månedsskifte og nyttår', () => {
  assert.equal(leggTilDager('2026-10-30', 3), '2026-11-02')
  assert.equal(leggTilDager('2026-12-31', 1), '2027-01-01')
})

test('dagens dato regnes i norsk tid', () => {
  // 23:30 UTC 14. oktober er 01:30 15. oktober i Norge (sommertid).
  assert.equal(iDagINorge(new Date('2026-10-14T23:30:00Z')), '2026-10-15')
  // 22:30 UTC 14. januar er 23:30 samme dag i Norge (vintertid).
  assert.equal(iDagINorge(new Date('2026-01-14T22:30:00Z')), '2026-01-14')
})

test('periode skrives kort', () => {
  assert.equal(formaterPeriode('2026-10-14', '2026-10-16'), '14. til 16. okt.')
  assert.equal(formaterPeriode('2026-10-30', '2026-11-02'), '30. okt. til 2. nov.')
  assert.equal(formaterPeriode('2026-10-14', '2026-10-14'), '14. okt.')
})
