import 'server-only'

// Enkelt tak på antall forsøk per IP. Lever i minnet til én serverinstans,
// så det stopper slurvete roboter, ikke et målrettet angrep. Trengs mer, bør
// det flyttes til en delt lagring (f.eks. Vercel KV eller Upstash).

const vinduer = new Map<string, number[]>()

export function innenforGrense(nokkel: string, maks: number, vinduMs: number): boolean {
  const naa = Date.now()
  const nylige = (vinduer.get(nokkel) ?? []).filter((t) => naa - t < vinduMs)
  if (nylige.length >= maks) {
    vinduer.set(nokkel, nylige)
    return false
  }
  nylige.push(naa)
  vinduer.set(nokkel, nylige)
  // Hold kartet lite.
  if (vinduer.size > 5000) {
    for (const [k, t] of vinduer) {
      if (t.every((x) => naa - x >= vinduMs)) vinduer.delete(k)
    }
  }
  return true
}

export function klientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'ukjent'
}
