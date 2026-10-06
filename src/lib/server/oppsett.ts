import 'server-only'
import { erPaa, nettstedBase } from '@/lib/miljo'

// Leser miljøvariablene ett sted, så resten av koden slipper å vite navnene.

export type Modus = 'ekte' | 'test' | 'av'

const env = process.env

/**
 * Testmodus simulerer betaling og skriver e-post til loggen i stedet for å
 * sende den. Den er alltid på lokalt, og kan slås på i produksjon med
 * TESTMODUS=på — f.eks. for å vise siden til Anker Solutions før avtalene
 * med Vipps og Stripe er på plass. Uten nøkler og uten testmodus er
 * betaling av, og kunden kan bare sende forespørsel.
 */
export function erTestmodus(): boolean {
  return env.NODE_ENV !== 'production' || erPaa(env.TESTMODUS)
}

const testmodus = erTestmodus

export function vippsModus(): Modus {
  if (env.VIPPS_CLIENT_ID && env.VIPPS_CLIENT_SECRET && env.VIPPS_SUBSCRIPTION_KEY && env.VIPPS_MSN) return 'ekte'
  return testmodus() ? 'test' : 'av'
}

export function kortModus(): Modus {
  if (env.STRIPE_SECRET_KEY) return 'ekte'
  return testmodus() ? 'test' : 'av'
}

export function vippsNokler() {
  return {
    clientId: env.VIPPS_CLIENT_ID ?? '',
    clientSecret: env.VIPPS_CLIENT_SECRET ?? '',
    subscriptionKey: env.VIPPS_SUBSCRIPTION_KEY ?? '',
    msn: env.VIPPS_MSN ?? '',
    base: env.VIPPS_MILJO === 'produksjon' ? 'https://api.vipps.no' : 'https://apitest.vipps.no',
  }
}

export function stripeNokkel(): string {
  return env.STRIPE_SECRET_KEY ?? ''
}

export function epostOppsett() {
  return {
    nokkel: env.RESEND_API_KEY ?? '',
    fra: env.VARSEL_FRA ?? '',
    til: env.VARSEL_TIL ?? '',
  }
}

/**
 * Adressen kunden sendes tilbake til fra Vipps og Stripe. Hentes aldri fra
 * Host-headeren i produksjon, siden den kan forfalskes.
 */
export function nettstedUrl(foresporselUrl: string): string {
  const satt = nettstedBase()
  if (satt) return satt
  if (env.NODE_ENV === 'production') throw new Error('NETTSTED_URL mangler')
  return new URL(foresporselUrl).origin
}

export const erProduksjon = env.NODE_ENV === 'production'
