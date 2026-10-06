import 'server-only'
import { randomInt } from 'node:crypto'

// Uten tegn som er lette å forveksle (0/O, 1/I/L), så referansen kan leses
// opp i telefonen. Vipps krever 8–50 tegn av typen [a-zA-Z0-9-].
const TEGN = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

export const REFERANSE = /^ANK-[2-9A-HJKMNP-Z]{6}$/

export function lagReferanse(): string {
  let kode = ''
  for (let i = 0; i < 6; i++) kode += TEGN[randomInt(TEGN.length)]
  return `ANK-${kode}`
}
