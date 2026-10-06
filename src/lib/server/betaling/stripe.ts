import 'server-only'
import { stripeNokkel } from '../oppsett'
import { Betalingsfeil, type Betalingsleverandor, type Betalingsstatus, type NyBetaling } from './typer'

// Kortbetaling med Stripe Checkout, uten SDK: bare to kall.
// Dokumentasjon: https://docs.stripe.com/api/checkout/sessions
//
// capture_method=manual gjør at beløpet bare RESERVERES på kortet. Det
// trekkes når Anker Solutions «capturer» betalingen i dashboard.stripe.com
// etter å ha bekreftet leien. En kortreservasjon varer normalt i 7 dager.

const API = 'https://api.stripe.com/v1'

function skjema(felter: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(felter)) if (v !== undefined) p.append(k, String(v))
  return p.toString()
}

export const stripe: Betalingsleverandor = {
  async opprett(b: NyBetaling) {
    const felter: Record<string, string | number | undefined> = {
      mode: 'payment',
      'payment_method_types[0]': 'card',
      locale: 'nb',
      client_reference_id: b.referanse,
      customer_email: b.epost,
      // Stripe bytter selv ut {CHECKOUT_SESSION_ID} med økt-ID-en.
      success_url: `${b.returUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: b.avbruttUrl,
      'payment_intent_data[capture_method]': 'manual',
      'payment_intent_data[description]': b.beskrivelse,
      'payment_intent_data[metadata][referanse]': b.referanse,
      'metadata[referanse]': b.referanse,
    }
    b.linjer.forEach((l, i) => {
      felter[`line_items[${i}][quantity]`] = l.antall
      felter[`line_items[${i}][price_data][currency]`] = 'nok'
      felter[`line_items[${i}][price_data][unit_amount]`] = l.enhetOre
      felter[`line_items[${i}][price_data][product_data][name]`] = l.navn
    })

    const svar = await fetch(`${API}/checkout/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeNokkel()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': b.referanse,
      },
      body: skjema(felter),
      cache: 'no-store',
    })
    if (!svar.ok) {
      throw new Betalingsfeil('Stripe avviste betalingen', { status: svar.status, svar: await svar.text() })
    }
    const data = (await svar.json()) as { url: string }
    return { videreUrl: data.url }
  },

  async status(referanse: string, parametre: URLSearchParams): Promise<Betalingsstatus> {
    const okt = parametre.get('session_id')
    if (!okt || !/^cs_[A-Za-z0-9_]+$/.test(okt)) return 'ukjent'
    const svar = await fetch(`${API}/checkout/sessions/${okt}?expand[]=payment_intent`, {
      headers: { Authorization: `Bearer ${stripeNokkel()}` },
      cache: 'no-store',
    })
    if (svar.status === 404) return 'ukjent'
    if (!svar.ok) throw new Betalingsfeil('Fikk ikke status fra Stripe', { status: svar.status })
    const data = (await svar.json()) as {
      client_reference_id: string | null
      status: 'open' | 'complete' | 'expired'
      payment_intent: { status: string } | null
    }
    // Økta må høre til denne bestillingen, ellers kunne hvem som helst
    // gjenbruke en betalt økt.
    if (data.client_reference_id !== referanse) return 'ukjent'
    if (data.status === 'expired') return 'avbrutt'
    if (data.status === 'open') return 'venter'
    const pi = data.payment_intent?.status
    if (pi === 'requires_capture') return 'reservert'
    if (pi === 'succeeded') return 'betalt'
    if (pi === 'canceled') return 'avbrutt'
    return 'venter'
  },
}
