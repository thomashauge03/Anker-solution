import { test } from 'node:test'
import assert from 'node:assert/strict'
import { beregnBestilling, dognTilUkepris, eksMvaOre, leiepris } from './pris.ts'

const graver = { kode: 'MG-17', navn: 'Minigraver 1,7 t', dognpris: 1590, ukepris: 6360 }
const sag = { kode: 'MS-40', navn: 'Motorsag 40 cm', dognpris: 390, ukepris: 1560 }
const finn = (slug) => ({ graver, sag })[slug]

test('ett til tre døgn koster døgnpris per døgn', () => {
  assert.equal(leiepris(graver, 1), 1590)
  assert.equal(leiepris(graver, 3), 4770)
})

test('fra fire døgn er det ukepris, og den er taket for resten av uka', () => {
  assert.equal(dognTilUkepris(graver), 4)
  assert.equal(leiepris(graver, 4), 6360)
  assert.equal(leiepris(graver, 6), 6360)
  assert.equal(leiepris(graver, 7), 6360)
})

test('over en uke: hele uker pluss resten', () => {
  assert.equal(leiepris(graver, 8), 6360 + 1590)
  assert.equal(leiepris(graver, 12), 6360 + 6360)
  assert.equal(leiepris(graver, 14), 2 * 6360)
})

test('ugyldig antall døgn kaster', () => {
  assert.throws(() => leiepris(graver, 0), RangeError)
  assert.throws(() => leiepris(graver, 1.5), RangeError)
})

test('eks. mva av hele kroner blir hele øre', () => {
  assert.equal(eksMvaOre(1590), 127200)
  assert.equal(eksMvaOre(1490), 119200)
})

test('bestilling: linjer, levering og mva-fordeling', () => {
  const b = beregnBestilling(
    {
      linjer: [
        { slug: 'graver', antall: 1 },
        { slug: 'sag', antall: 2 },
      ],
      fra: '2026-10-14',
      til: '2026-10-16',
      levering: { type: 'levering' },
    },
    finn,
    1490,
  )
  assert.equal(b.dogn, 2)
  assert.equal(b.linjer[0].sum, 3180)
  assert.equal(b.linjer[1].enhetspris, 780)
  assert.equal(b.linjer[1].sum, 1560)
  assert.equal(b.levering, 1490)
  assert.equal(b.totalInklOre, (3180 + 1560 + 1490) * 100)
  assert.equal(b.totalEksOre + b.mvaOre, b.totalInklOre)
  assert.equal(b.mvaOre, 124600)
})

test('henting gir ingen leveringskostnad', () => {
  const b = beregnBestilling(
    { linjer: [{ slug: 'sag', antall: 1 }], fra: '2026-10-14', til: '2026-10-14', levering: { type: 'henting' } },
    finn,
    1490,
  )
  assert.equal(b.dogn, 1)
  assert.equal(b.levering, 0)
  assert.equal(b.totalInklOre, 39000)
})

test('ukjent maskin kaster', () => {
  assert.throws(() =>
    beregnBestilling(
      { linjer: [{ slug: 'finnes-ikke', antall: 1 }], fra: '2026-10-14', til: '2026-10-15', levering: { type: 'henting' } },
      finn,
      1490,
    ),
  )
})
