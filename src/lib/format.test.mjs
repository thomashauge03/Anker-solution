import { test } from 'node:test'
import assert from 'node:assert/strict'
import { kroner, kronerFraOre } from './format.ts'

// Hardt mellomrom (U+00A0) mellom sifrene og foran «kr», så beløpet aldri
// deles over to linjer.
const nbsp = ' '

test('hele kroner skrives «1 590 kr», uten bindestrek', () => {
  assert.equal(kroner(1590), `1${nbsp}590${nbsp}kr`)
  assert.equal(kroner(0), `0${nbsp}kr`)
  assert.ok(!kroner(1590).includes('-'))
})

test('øre gir to desimaler og samme «kr» bak', () => {
  assert.equal(kroner(1272.5), `1${nbsp}272,50${nbsp}kr`)
  assert.equal(kronerFraOre(127250), `1${nbsp}272,50${nbsp}kr`)
})
