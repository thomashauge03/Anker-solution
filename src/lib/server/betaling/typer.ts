export type Betalingsmetode = 'vipps' | 'kort'

/** Det kunden ser når hen kommer tilbake. «reservert» er det vanlige. */
export type Betalingsstatus = 'reservert' | 'betalt' | 'venter' | 'avbrutt' | 'ukjent'

export type NyBetaling = {
  referanse: string
  /** Hele beløpet i øre inkl. mva. */
  belopOre: number
  /** Kort tekst som kunden ser i Vipps eller på kortutskriften. */
  beskrivelse: string
  linjer: { navn: string; antall: number; enhetOre: number }[]
  epost: string
  telefon: string
  returUrl: string
  avbruttUrl: string
}

export interface Betalingsleverandor {
  /** Lager betalingen og gir adressen kunden skal sendes til. */
  opprett(b: NyBetaling): Promise<{ videreUrl: string }>
  /** Spør leverandøren om status. Parametrene er det som kom tilbake i adressen. */
  status(referanse: string, parametre: URLSearchParams): Promise<Betalingsstatus>
}

export class Betalingsfeil extends Error {
  constructor(
    melding: string,
    readonly detaljer?: unknown,
  ) {
    super(melding)
    this.name = 'Betalingsfeil'
  }
}
