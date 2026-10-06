import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bolgeknippe } from './bolger.ts'

/** Alle y-verdier i en SVG-bane (annethvert tall etter M/C). */
function yVerdier(d) {
  const tall = d.match(/-?\d+(\.\d+)?/g).map(Number)
  return tall.filter((_, i) => i % 2 === 1)
}

test('samme form gir samme bølge, ulik form gir ulik bølge', () => {
  assert.deepEqual(bolgeknippe({ form: 3 }), bolgeknippe({ form: 3 }))
  assert.notDeepEqual(bolgeknippe({ form: 3 }), bolgeknippe({ form: 4 }))
})

test('strekene holder seg innenfor høyden', () => {
  for (let form = 1; form <= 40; form++) {
    for (const valg of [{ hoyde: 64 }, { antall: 18, bredde: 1000, hoyde: 400, avstand: 11, vri: true }]) {
      const baner = bolgeknippe({ form, ...valg })
      for (const d of baner) {
        for (const y of yVerdier(d)) {
          // Kontrollpunktene i Bézier-kurvene kan stikke litt utenfor; selve
          // streken gjør det ikke.
          assert.ok(y > -12 && y < valg.hoyde + 12, `form ${form}: y=${y}`)
        }
      }
    }
  }
})

test('knippet har riktig antall streker og starter i venstre kant', () => {
  const baner = bolgeknippe({ form: 1, antall: 5 })
  assert.equal(baner.length, 5)
  for (const d of baner) assert.match(d, /^M0 /)
})
