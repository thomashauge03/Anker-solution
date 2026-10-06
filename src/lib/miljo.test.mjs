import { test } from 'node:test'
import assert from 'node:assert/strict'
import { erPaa } from './miljo.ts'

test('testmodus kan slås på med vanlige verdier, også uten æøå', () => {
  for (const v of ['på', 'PÅ', 'pa', 'ja', '1', 'true', ' on ', '1\r\n']) assert.equal(erPaa(v), true, v)
  for (const v of [undefined, '', '0', 'nei', 'av', 'false']) assert.equal(erPaa(v), false, String(v))
})
