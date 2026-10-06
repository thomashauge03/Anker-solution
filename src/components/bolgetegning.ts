// Den levende bakgrunnen øverst på forsiden: et bånd av svarte streker som
// bølger og vrir seg sakte, som høydekurver i terreng. Brukes både i en egen
// tråd (bolgeArbeider.ts) og, der nettleseren ikke støtter det, på hovedtråden.

export type Lerretsmaal = { bredde: number; hoyde: number; dpr: number }
type Tegneflate = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
type Lerret = HTMLCanvasElement | OffscreenCanvas

/** Starttid i sekunder, valgt så det første bildet allerede har en fin vri. */
const STARTTID = 14
/** Hvor fort båndet beveger seg. 1 er svært rolig. */
const FART = 1.5

/** Tegner ett bilde av båndet ved tiden `tid` (sekunder). */
export function tegnBolgefelt(ctx: Tegneflate, { bredde: B, hoyde: H, dpr }: Lerretsmaal, tid: number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, B, H)
  if (B < 2 || H < 2) return

  const smal = B < 700
  const antall = smal ? 16 : 26
  const steg = smal ? 8 : 6
  const grunnavstand = Math.max(4.5, H * (smal ? 0.03 : 0.0165))
  const t = tid * FART
  const halv = (antall - 1) / 2

  ctx.lineWidth = smal ? 1 : 1.15
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#0b0b0b'

  for (let i = 0; i < antall; i++) {
    const k = i - halv
    const kant = Math.abs(k) / halv // 0 midt i båndet, 1 ytterst
    ctx.globalAlpha = 0.92 - 0.68 * kant
    ctx.beginPath()
    for (let x = -steg; x <= B + steg; x += steg) {
      const u = x / B
      const midt =
        H * (smal ? 0.5 : 0.56) +
        H * (smal ? 0.16 : 0.18) * Math.sin(u * 5.2 + t * 0.12) +
        H * 0.06 * Math.sin(u * 11.7 - t * 0.19 + 1.3)
      // Avstanden går gjennom null og skifter fortegn: båndet vrir seg.
      const vri = Math.sin(u * 4.1 + t * 0.085 + 0.6)
      const avstand = grunnavstand * (0.28 + 0.72 * vri)
      const krus = grunnavstand * 0.5 * Math.sin(u * 17 + t * 0.33 + i * 0.42) * (0.25 + 0.75 * kant)
      const y = midt + k * avstand + krus
      if (x === -steg) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

const nesteBilde = (f: (naa: number) => void): number =>
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame(f)
    : (setTimeout(() => f(performance.now()), 16) as unknown as number)

const avbrytBilde = (id: number) =>
  typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame(id) : clearTimeout(id)

/** Holder tiden og bildeløkka for ett lerret. */
export class Bolgeanimasjon {
  private lerret: Lerret
  private ctx: Tegneflate
  private maal: Lerretsmaal
  private tid = STARTTID
  private forrige = 0
  private ramme: number | undefined
  private kjorer = false

  constructor(lerret: Lerret, ctx: Tegneflate, maal: Lerretsmaal) {
    this.lerret = lerret
    this.ctx = ctx
    this.maal = maal
    this.settMaal(maal)
  }

  settMaal(maal: Lerretsmaal) {
    this.maal = maal
    this.lerret.width = Math.max(1, Math.round(maal.bredde * maal.dpr))
    this.lerret.height = Math.max(1, Math.round(maal.hoyde * maal.dpr))
    tegnBolgefelt(this.ctx, maal, this.tid)
  }

  kjor(ja: boolean) {
    if (ja === this.kjorer) return
    this.kjorer = ja
    if (ja) {
      this.forrige = 0
      this.ramme = nesteBilde(this.steg)
    } else if (this.ramme !== undefined) {
      avbrytBilde(this.ramme)
      this.ramme = undefined
    }
  }

  private steg = (naa: number) => {
    if (!this.kjorer) return
    // Et langt opphold (treg maskin, fane i bakgrunnen) bremser bevegelsen
    // i stedet for å få båndet til å hoppe.
    const dt = this.forrige ? Math.min((naa - this.forrige) / 1000, 0.05) : 0
    this.forrige = naa
    this.tid += dt
    tegnBolgefelt(this.ctx, this.maal, this.tid)
    this.ramme = nesteBilde(this.steg)
  }
}
