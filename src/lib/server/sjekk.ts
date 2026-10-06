import 'server-only'
import { NextResponse } from 'next/server'
import { finnMaskin } from '@/data/maskiner'

export function svar(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
}

/**
 * Skjulte felt mot roboter: «nettside» skal være tomt, og skjemaet må ha
 * vært åpent i minst tre sekunder. Ingen captcha, ingen tredjepart.
 */
export function erRobot(kropp: unknown): boolean {
  if (!kropp || typeof kropp !== 'object') return true
  const k = kropp as Record<string, unknown>
  if (typeof k.nettside === 'string' && k.nettside.trim() !== '') return true
  if (typeof k.tid !== 'number' || k.tid < 3000) return true
  return false
}

export async function lesJson(req: Request): Promise<unknown> {
  const lengde = Number(req.headers.get('content-length') ?? 0)
  if (lengde > 32_000) return null
  try {
    return await req.json()
  } catch {
    return null
  }
}

type Linje = { slug: string; antall: number }

export function sjekkUtstyr(linjer: Linje[], forBetaling: boolean): { feil: string; status: number } | null {
  if (new Set(linjer.map((l) => l.slug)).size !== linjer.length) {
    return { feil: 'Samme utstyr står flere ganger i listen.', status: 400 }
  }
  for (const l of linjer) {
    const m = finnMaskin(l.slug)
    if (!m) {
      return { feil: 'Leielisten har utstyr som ikke finnes lenger. Fjern det og prøv igjen.', status: 400 }
    }
    if (l.antall > m.antall) return { feil: `Vi har bare ${m.antall} stk. av ${m.navn}.`, status: 400 }
    if (forBetaling && m.kunForesporsel) {
      return { feil: `${m.navn} leies bare ut etter avtale. Send leielisten som forespørsel.`, status: 409 }
    }
  }
  return null
}

/** Maskiner som må leveres av oss. */
export function maaLeveres(linjer: Linje[]): string[] {
  return linjer
    .map((l) => finnMaskin(l.slug))
    .filter((m) => m?.kreverLevering)
    .map((m) => m!.navn)
}
