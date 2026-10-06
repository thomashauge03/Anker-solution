import type { Metadata } from 'next'
import Link from 'next/link'
import { Dokument, type Avsnitt } from '@/components/Dokument'
import { adresseLinje, firma } from '@/data/firma'
import styles from './vilkar.module.css'

export const metadata: Metadata = {
  title: 'Leievilkår og angrerett',
  description: 'Vilkår for leie av maskiner og utstyr fra Anker Solutions, med angrerett og angreskjema.',
}

const avsnitt: Avsnitt[] = [
  {
    id: 'avtalen',
    tittel: 'Om avtalen',
    innhold: (
      <>
        <p>
          Vilkårene gjelder leie av maskiner og utstyr fra {firma.juridiskNavn}, org.nr. {firma.orgnr}, {adresseLinje}{' '}
          («vi»). Den som leier, kalles «du» eller leietaker.
        </p>
        <p>
          Leier du som privatperson, gjelder forbrukerreglene i tillegg til disse vilkårene, blant annet angrerettloven.
          Ingenting i vilkårene begrenser rettighetene du har etter loven.
        </p>
      </>
    ),
  },
  {
    id: 'bestilling',
    tittel: 'Bestilling, forespørsel og bekreftelse',
    innhold: (
      <>
        <h3>Bestilling med betaling</h3>
        <p>
          Når du trykker «Betal med Vipps» eller «Betal med kort», sender du en bindende bestilling, og beløpet
          reserveres. Leieavtalen er inngått når vi har bekreftet bestillingen på e-post. Kan vi ikke levere, gir vi
          beskjed, og hele reservasjonen frigjøres.
        </p>
        <h3>Forespørsel</h3>
        <p>
          En forespørsel er ikke bindende for noen av oss. Du får et tilbud med pris og tidspunkt, og avtalen er
          inngått når du har takket ja.
        </p>
      </>
    ),
  },
  {
    id: 'priser',
    tittel: 'Priser og betaling',
    innhold: (
      <>
        <ul>
          <li>Prisene er per døgn (24 timer fra henting). Leier du fire døgn eller mer, betaler du ukepris.</li>
          <li>
            Priser til privatpersoner vises inkl. mva. Velger du «Bedrift», vises prisene eks. mva, og mva kommer i
            tillegg.
          </li>
          <li>
            Levering og henting innen {firma.levering.radiusKm}&nbsp;km koster {firma.levering.prisInklMva}&nbsp;kr
            inkl.&nbsp;mva.
            Lenger unna avtales pris i forespørselen.
          </li>
          <li>
            Beløpet reserveres på Vipps eller kortet når du bestiller, og trekkes når vi har bekreftet leien.
          </li>
          <li>
            Tillegg som kan komme etter leien: drivstoff som ikke er fylt opp, vask av skittent utstyr, og slitasje på
            blad og forbruksdeler etter prislisten. Du får alltid en spesifisert oversikt.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'henting',
    tittel: 'Henting, retur og forsinkelse',
    innhold: (
      <>
        <p>
          Utstyret hentes og leveres på {adresseLinje} i åpningstiden, med mindre levering er avtalt. Ta med gyldig
          legitimasjon. Vi går gjennom utstyret sammen med deg ved utlevering.
        </p>
        <p>
          Utstyret leveres tilbake til avtalt tid, rengjort og med full tank. Leveres det for sent, betaler du for de
          ekstra døgnene. Trenger du utstyret lenger, ring oss så tidlig som mulig.
        </p>
      </>
    ),
  },
  {
    id: 'ansvar',
    tittel: 'Ditt ansvar i leieperioden',
    innhold: (
      <ul>
        <li>Bruk utstyret slik det er beregnet for, og følg bruksanvisningen og sikkerhetsreglene.</li>
        <li>
          Brukes maskiner i arbeid, skal føreren ha den opplæringen som kreves. For gravemaskiner og lastere gjelder
          krav om dokumentert sikkerhetsopplæring.
        </li>
        <li>Utstyret skal ikke lånes ut eller leies videre uten at vi har avtalt det.</li>
        <li>Sikre utstyret mot tyveri når det ikke er i bruk.</li>
        <li>
          Meld fra straks om skade, tyveri eller feil. Du er ansvarlig for skade og tap som skyldes uaktsom bruk,
          etter alminnelige erstatningsregler.
        </li>
      </ul>
    ),
  },
  {
    id: 'avbestilling',
    tittel: 'Avbestilling',
    innhold: (
      <>
        <p>
          Avbestiller du senest 24 timer før henting, frigjør vi hele beløpet. Ved senere avbestilling kan vi kreve
          betalt for ett døgn.
        </p>
        <p>Er du forbruker, har du i tillegg angrerett, se neste punkt.</p>
      </>
    ),
  },
  {
    id: 'angrerett',
    tittel: 'Angrerett for privatpersoner',
    innhold: (
      <>
        <p>
          Leier du som privatperson på nett, har du 14 dagers angrerett etter angrerettloven. Fristen regnes fra den
          dagen avtalen inngås.
        </p>
        <p>
          Skal leien starte før de 14 dagene er gått, ber vi deg om å bekrefte at du ønsker det når du bestiller.
          Angrer du etter at leien har startet, betaler du for den delen av leieperioden du har brukt. Angreretten
          faller bort når leieperioden er over.
        </p>
        <h3>Slik bruker du angreretten</h3>
        <p>
          Gi oss beskjed før fristen går ut — på e-post til <a href={`mailto:${firma.epost}`}>{firma.epost}</a>, på
          telefon {firma.telefonVisning}, eller med skjemaet under. Du trenger ikke oppgi noen grunn. Vi betaler
          tilbake det du har betalt senest 14 dager etter at vi fikk beskjed, til samme betalingsmåte.
        </p>

        <div className={styles.angreskjema} role="group" aria-labelledby="angreskjema-tittel">
          <p id="angreskjema-tittel" className="etikett">
            Angreskjema
          </p>
          <p className="dempet">Fyll ut og send skjemaet bare hvis du vil gå fra avtalen.</p>
          <dl>
            <div>
              <dt>Til</dt>
              <dd>
                {firma.juridiskNavn}, {adresseLinje}, {firma.epost}
              </dd>
            </div>
            <div>
              <dt>Melding</dt>
              <dd>
                Jeg/vi (*) underretter herved om at jeg/vi (*) ønsker å gå fra min/vår (*) avtale om kjøp av følgende
                tjenester (*):
              </dd>
            </div>
            <div>
              <dt>Bestilt den</dt>
              <dd className={styles.linje} />
            </div>
            <div>
              <dt>Forbrukerens navn</dt>
              <dd className={styles.linje} />
            </div>
            <div>
              <dt>Forbrukerens adresse</dt>
              <dd className={styles.linje} />
            </div>
            <div>
              <dt>Underskrift</dt>
              <dd className={styles.linje}>
                <span className="dempet">(kun hvis skjemaet sendes på papir)</span>
              </dd>
            </div>
            <div>
              <dt>Dato</dt>
              <dd className={styles.linje} />
            </div>
          </dl>
          <p className="dempet">(*) Stryk det som ikke passer.</p>
        </div>
      </>
    ),
  },
  {
    id: 'feil',
    tittel: 'Feil ved utstyret',
    innhold: (
      <p>
        Virker ikke utstyret som det skal, og det ikke skyldes deg, gi beskjed med en gang. Vi reparerer eller bytter
        det så raskt vi kan. Du betaler ikke for tiden utstyret ikke kunne brukes.
      </p>
    ),
  },
  {
    id: 'personopplysninger',
    tittel: 'Personopplysninger',
    innhold: (
      <p>
        Vi bruker opplysningene dine til å håndtere leien. Les mer i{' '}
        <Link href="/personvern">personvernerklæringen</Link>.
      </p>
    ),
  },
  {
    id: 'tvister',
    tittel: 'Klage og tvister',
    innhold: (
      <p>
        Ta kontakt med oss først, så finner vi som regel en løsning. Er du forbruker og vi ikke blir enige, kan du
        klage til Forbrukerrådet. Saken kan deretter bringes inn for Forbrukerklageutvalget. Norsk rett gjelder for
        avtalen.
      </p>
    ),
  },
]

export default function Vilkarside() {
  return (
    <Dokument
      etikett="Vilkår"
      tittel="Leievilkår"
      ingress={<p>Kort og tydelig: dette gjelder når du leier utstyr av oss.</p>}
      oppdatert="6. oktober 2026"
      merknad={
        <p>
          <strong>Utkast.</strong> Vilkårene er et forslag og må gjennomgås av {firma.navn} før siden tas i bruk —
          særlig avbestilling, tillegg og ansvar ved skade.
        </p>
      }
      avsnitt={avsnitt}
    />
  )
}
