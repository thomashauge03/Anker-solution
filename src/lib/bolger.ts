// Bølgestrekene som deler opp sidene. Samme form gir alltid samme bølge, så
// serveren tegner dem som ren SVG, og hver skillelinje kan få sitt eget forløp.

type Punkt = [number, number]

/** Liten, forutsigbar tallgenerator (mulberry32): samme start gir samme rekke. */
function tallrekke(start: number): () => number {
  let a = start >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const avrund = (n: number) => Math.round(n * 10) / 10

/** Glatt bane gjennom punktene: Catmull-Rom regnet om til kubiske Bézier-kurver. */
export function glattBane(p: Punkt[]): string {
  let d = `M${avrund(p[0][0])} ${avrund(p[0][1])}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i]
    const p1 = p[i]
    const p2 = p[i + 1]
    const p3 = p[i + 2] ?? p2
    const k1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const k2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${avrund(k1[0])} ${avrund(k1[1])} ${avrund(k2[0])} ${avrund(k2[1])} ${avrund(p2[0])} ${avrund(p2[1])}`
  }
  return d
}

/**
 * Et knippe streker som følger hverandre, som høydekurver i terreng.
 * Avstanden mellom strekene varierer langs bredden, så knippet snevres inn
 * og vider seg ut. Koordinatene ligger i et `bredde` × `hoyde`-rom.
 */
export function bolgeknippe({
  form,
  antall = 3,
  bredde = 1440,
  hoyde = 64,
  avstand = 6,
  vri = false,
}: {
  form: number
  antall?: number
  bredde?: number
  hoyde?: number
  avstand?: number
  /** Avstanden går gjennom null, så knippet vrir seg som et bånd. */
  vri?: boolean
}): string[] {
  const tall = tallrekke(form * 7919 + 17)
  const bolger1 = 0.6 + tall() * 0.7 // antall store bølger over bredden
  const bolger2 = 1.7 + tall() * 1.4
  const fase1 = tall() * Math.PI * 2
  const fase2 = tall() * Math.PI * 2
  const fase3 = tall() * Math.PI * 2
  // Plass til knippet og utslaget innenfor høyden.
  const utslag = Math.max(0, hoyde / 2 - (avstand * (antall - 1)) / 2 - 3)

  const baner: string[] = []
  const steg = bredde / 60
  for (let i = 0; i < antall; i++) {
    const forskyvning = i - (antall - 1) / 2
    const punkter: Punkt[] = []
    for (let x = 0; x <= bredde + 0.5; x += steg) {
      const u = x / bredde
      const spredning = vri
        ? 0.28 + 0.72 * Math.sin(u * Math.PI * 1.3 + fase3)
        : 0.6 + 0.4 * Math.sin(u * Math.PI * 1.8 + fase3)
      const y =
        hoyde / 2 +
        utslag * 0.72 * Math.sin(u * bolger1 * Math.PI * 2 + fase1) +
        utslag * 0.28 * Math.sin(u * bolger2 * Math.PI * 2 + fase2) +
        forskyvning * avstand * spredning
      punkter.push([x, y])
    }
    baner.push(glattBane(punkter))
  }
  return baner
}
