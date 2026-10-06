import 'server-only'
import { vippsNokler } from '../oppsett'
import { Betalingsfeil, type Betalingsleverandor, type Betalingsstatus, type NyBetaling } from './typer'

// Vipps MobilePay ePayment API, flyten «WEB_REDIRECT».
// Dokumentasjon: https://developer.vippsmobilepay.com/docs/APIs/epayment-api/
//
// Betalingen blir RESERVERT når kunden godkjenner i Vipps-appen. Beløpet
// trekkes først når Anker Solutions «capturer» den — i dag fra
// portal.vippsmobilepay.com etter at leien er bekreftet.
//
// Feltnavnene under er Vipps sine og beholder engelsk skrivemåte.

let token: { verdi: string; utloper: number } | null = null

function systemhoder() {
  return {
    'Vipps-System-Name': 'anker-solutions',
    'Vipps-System-Version': '1.0.0',
    'Vipps-System-Plugin-Name': 'anker-solutions-nettside',
    'Vipps-System-Plugin-Version': '1.0.0',
  }
}

async function hentToken(): Promise<string> {
  if (token && token.utloper > Date.now() + 60_000) return token.verdi
  const n = vippsNokler()
  const svar = await fetch(`${n.base}/accesstoken/get`, {
    method: 'POST',
    headers: {
      client_id: n.clientId,
      client_secret: n.clientSecret,
      'Ocp-Apim-Subscription-Key': n.subscriptionKey,
      'Merchant-Serial-Number': n.msn,
      ...systemhoder(),
    },
    cache: 'no-store',
  })
  if (!svar.ok) throw new Betalingsfeil('Fikk ikke tilgang til Vipps', { status: svar.status })
  const data = (await svar.json()) as { access_token: string; expires_in: string | number }
  token = { verdi: data.access_token, utloper: Date.now() + Number(data.expires_in) * 1000 }
  return token.verdi
}

async function hoder(ekstra: Record<string, string> = {}) {
  const n = vippsNokler()
  return {
    Authorization: `Bearer ${await hentToken()}`,
    'Ocp-Apim-Subscription-Key': n.subscriptionKey,
    'Merchant-Serial-Number': n.msn,
    'Content-Type': 'application/json',
    ...systemhoder(),
    ...ekstra,
  }
}

export const vipps: Betalingsleverandor = {
  async opprett(b: NyBetaling) {
    const n = vippsNokler()
    const svar = await fetch(`${n.base}/epayment/v1/payments`, {
      method: 'POST',
      headers: await hoder({ 'Idempotency-Key': b.referanse }),
      body: JSON.stringify({
        amount: { currency: 'NOK', value: b.belopOre },
        paymentMethod: { type: 'WALLET' },
        // Fyller inn nummeret i Vipps, så kunden slipper å skrive det igjen.
        customer: /^[49]\d{7}$/.test(b.telefon) ? { phoneNumber: `47${b.telefon}` } : undefined,
        reference: b.referanse,
        returnUrl: b.returUrl,
        userFlow: 'WEB_REDIRECT',
        paymentDescription: b.beskrivelse.slice(0, 100),
      }),
      cache: 'no-store',
    })
    if (!svar.ok) {
      throw new Betalingsfeil('Vipps avviste betalingen', { status: svar.status, svar: await svar.text() })
    }
    const data = (await svar.json()) as { redirectUrl: string }
    return { videreUrl: data.redirectUrl }
  },

  async status(referanse: string): Promise<Betalingsstatus> {
    const n = vippsNokler()
    const svar = await fetch(`${n.base}/epayment/v1/payments/${encodeURIComponent(referanse)}`, {
      headers: await hoder(),
      cache: 'no-store',
    })
    if (svar.status === 404) return 'ukjent'
    if (!svar.ok) throw new Betalingsfeil('Fikk ikke status fra Vipps', { status: svar.status })
    const data = (await svar.json()) as {
      state: 'CREATED' | 'AUTHORIZED' | 'ABORTED' | 'EXPIRED' | 'TERMINATED'
      aggregate?: { capturedAmount?: { value: number } }
    }
    if (data.state === 'AUTHORIZED') {
      return (data.aggregate?.capturedAmount?.value ?? 0) > 0 ? 'betalt' : 'reservert'
    }
    if (data.state === 'CREATED') return 'venter'
    return 'avbrutt'
  },
}
