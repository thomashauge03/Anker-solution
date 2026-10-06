const heltall = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 })
const desimal = new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** «1 590,-» for hele kroner, «1 272,50» ellers. */
export function kroner(belop: number): string {
  if (Number.isInteger(belop)) return `${heltall.format(belop)},-`
  return desimal.format(belop)
}

export function kronerFraOre(ore: number): string {
  return kroner(ore / 100)
}

/** Telefonnummer til visning: «400 00 000». */
export function formaterMobil(siffer: string): string {
  const s = siffer.replace(/\D/g, '').replace(/^47(?=\d{8}$)/, '')
  if (s.length !== 8) return siffer
  return `${s.slice(0, 3)} ${s.slice(3, 5)} ${s.slice(5)}`
}

export function flertall(antall: number, en: string, flere: string): string {
  return `${antall} ${antall === 1 ? en : flere}`
}
