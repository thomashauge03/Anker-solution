import type { Metadata } from 'next'
import { Dokument, type Avsnitt } from '@/components/Dokument'
import { adresseLinje, firma } from '@/data/firma'

export const metadata: Metadata = {
  title: 'Personvern',
  description: 'Hvilke opplysninger Anker Solutions behandler, hvorfor, og hvilke rettigheter du har.',
}

const avsnitt: Avsnitt[] = [
  {
    id: 'ansvarlig',
    tittel: 'Hvem er ansvarlig',
    innhold: (
      <p>
        {firma.juridiskNavn} (org.nr. {firma.orgnr}), {adresseLinje}, er behandlingsansvarlig for opplysningene som
        samles inn på denne siden. Spørsmål om personvern sender du til{' '}
        <a href={`mailto:${firma.epost}`}>{firma.epost}</a>.
      </p>
    ),
  },
  {
    id: 'opplysninger',
    tittel: 'Hva vi samler inn, og hvorfor',
    innhold: (
      <dl>
        <div>
          <dt>Forespørsel</dt>
          <dd>
            Navn, mobilnummer, e-post (valgfritt), melding, utstyr og datoer. For bedrifter også firmanavn og org.nr.
            Formålet er å svare deg og eventuelt inngå en leieavtale. Grunnlag: avtale (GDPR art. 6 nr. 1 b).
          </dd>
        </div>
        <div>
          <dt>Bestilling</dt>
          <dd>
            Det samme som over, e-post og eventuelt leveringsadresse. Formålet er å levere leien og sende kvittering.
            Grunnlag: avtale (art. 6 nr. 1 b), og bokføringsloven for regnskapet (art. 6 nr. 1 c).
          </dd>
        </div>
        <div>
          <dt>Betaling</dt>
          <dd>
            Betalingen skjer hos Vipps MobilePay eller Stripe. Vi ser aldri kortnummeret ditt, bare at beløpet er
            reservert eller betalt.
          </dd>
        </div>
        <div>
          <dt>Tekniske logger</dt>
          <dd>
            Serveren registrerer IP-adresse og tidspunkt for å holde siden stabil og sikker. Grunnlag: berettiget
            interesse (art. 6 nr. 1 f). Loggene slettes automatisk etter kort tid.
          </dd>
        </div>
      </dl>
    ),
  },
  {
    id: 'informasjonskapsler',
    tittel: 'Informasjonskapsler og lokal lagring',
    innhold: (
      <>
        <p>Siden bruker ingen analyseverktøy, ingen annonsesporing og ingen tredjepartsskript.</p>
        <ul>
          <li>
            Leielisten, datoene og valget mellom privat og bedrift lagres i nettleseren din (localStorage). Det sendes
            ingen steder før du selv bestiller eller sender en forespørsel.
          </li>
          <li>
            Mens du betaler, lagrer vi bestillingen i en kryptert informasjonskapsel («anker_ordre»). Den slettes når
            betalingen er bekreftet, og senest etter én time.
          </li>
        </ul>
        <p>Begge deler er strengt nødvendige for tjenesten du ber om, og krever derfor ikke samtykke.</p>
      </>
    ),
  },
  {
    id: 'deling',
    tittel: 'Hvem vi deler med',
    innhold: (
      <>
        <p>Vi selger aldri opplysningene dine. Disse leverandørene behandler dem på våre vegne:</p>
        <dl>
          <div>
            <dt>Vercel</dt>
            <dd>
              Drifter nettsiden. Serverne står i Stockholm. Selskapet er amerikansk, og overføring til USA skjer etter
              EUs regler for slik overføring.
            </dd>
          </div>
          <div>
            <dt>Resend</dt>
            <dd>Sender e-post med forespørsler, bestillinger og kvitteringer.</dd>
          </div>
          <div>
            <dt>Vipps MobilePay</dt>
            <dd>Behandler betaling med Vipps.</dd>
          </div>
          <div>
            <dt>Stripe</dt>
            <dd>Behandler kortbetaling, gjennom Stripe Payments Europe i Irland.</dd>
          </div>
        </dl>
      </>
    ),
  },
  {
    id: 'lagring',
    tittel: 'Hvor lenge vi lagrer',
    innhold: (
      <ul>
        <li>Forespørsler som ikke blir til leie, sletter vi senest tre måneder etter at vi har svart.</li>
        <li>Bestillinger og kvitteringer oppbevares i fem år, slik bokføringsloven krever.</li>
      </ul>
    ),
  },
  {
    id: 'rettigheter',
    tittel: 'Dine rettigheter',
    innhold: (
      <>
        <p>
          Du kan be om innsyn i, retting av eller sletting av opplysningene om deg, og du kan protestere mot eller be
          om begrenset behandling. Skriv til <a href={`mailto:${firma.epost}`}>{firma.epost}</a>, så svarer vi innen
          én måned.
        </p>
        <p>
          Mener du at vi behandler opplysningene dine i strid med regelverket, kan du klage til Datatilsynet
          (datatilsynet.no).
        </p>
      </>
    ),
  },
]

export default function Personvernside() {
  return (
    <Dokument
      etikett="Personvern"
      tittel="Personvernerklæring"
      ingress={<p>Vi samler inn så lite som mulig, og bare det vi trenger for å leie ut utstyr til deg.</p>}
      oppdatert="6. oktober 2026"
      merknad={
        <p>
          <strong>Utkast.</strong> Før lansering må {firma.navn} fylle inn egne opplysninger, inngå databehandleravtaler
          med leverandørene og bekrefte grunnlaget for overføring til USA (Vercel og Resend).
        </p>
      }
      avsnitt={avsnitt}
    />
  )
}
