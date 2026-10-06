import Link from 'next/link'
import { HeroSok } from '@/components/HeroSok'
import { Kategoriindeks } from '@/components/Kategoriindeks'
import { Maskinkort } from '@/components/Maskinkort'
import kortStil from '@/components/Maskinkort.module.css'
import { Pil } from '@/components/Pil'
import { MvaTekst, Pris } from '@/components/Pris'
import { Tegning } from '@/components/Tegning'
import { adresseLinje, firma } from '@/data/firma'
import { kategorier, maskiner } from '@/data/maskiner'
import styles from './page.module.css'

export default function Forside() {
  const ofteLeid = maskiner.filter((m) => m.ofteLeid)

  return (
    <>
      <section className={`ramme ${styles.hero}`} aria-labelledby="hero-tittel">
        <div className={styles.heroTekst}>
          <p className={`etikett inn ${styles.heroEtikett}`}>Maskinutleie · privat og bedrift</p>
          <h1 id="hero-tittel" className={`inn ${styles.heroTittel}`} style={{ ['--forsinkelse' as string]: '80ms' }}>
            Fra gravemaskin <br />
            til motorsag.
          </h1>
          <p className="ingress inn" style={{ ['--forsinkelse' as string]: '160ms' }}>
            Lei utstyret du trenger for jobben – for ett døgn eller flere uker. Betal med Vipps eller kort, eller
            send en forespørsel, så ordner vi pris, transport og fører.
          </p>
        </div>
        <div className={styles.heroTegning}>
          <Tegning />
        </div>
        <div className={`inn ${styles.heroSok}`} style={{ ['--forsinkelse' as string]: '240ms' }}>
          <HeroSok />
        </div>
      </section>

      <section className={styles.fakta} aria-label="Kort fortalt">
        <dl className={`ramme ${styles.faktaRad}`}>
          <div>
            <dt className="etikett">Pris</dt>
            <dd>Per døgn. Leier du fire døgn eller mer, betaler du ukepris.</dd>
          </div>
          <div>
            <dt className="etikett">Betaling</dt>
            <dd>Vipps eller kort. Beløpet trekkes først når leien er bekreftet.</dd>
          </div>
          <div>
            <dt className="etikett">Levering</dt>
            <dd>
              <Pris kr={firma.levering.prisInklMva} /> <MvaTekst /> innen {firma.levering.radiusKm} km. Lenger unna
              etter avtale.
            </dd>
          </div>
          <div>
            <dt className="etikett">Utvalg</dt>
            <dd>
              {maskiner.length} maskiner og verktøy i {kategorier.length} kategorier.
            </dd>
          </div>
        </dl>
      </section>

      <section className="ramme seksjon" aria-labelledby="utvalget">
        <div className="seksjonshode">
          <h2 id="utvalget" className="overskrift">
            Utvalget
          </h2>
          <Link href="/maskiner" className="pil-lenke">
            Se alt utstyr <Pil />
          </Link>
        </div>
        <Kategoriindeks />
      </section>

      <section className={styles.toVeier} aria-labelledby="to-maater">
        <div className="ramme">
          <h2 id="to-maater" className={`overskrift ${styles.toVeierTittel}`}>
            To måter å leie på
          </h2>
          <div className={styles.veier}>
            <article className={styles.vei}>
              <p className="etikett">Rett på</p>
              <h3 className={styles.veiTittel}>Book og betal</h3>
              <p className={styles.veiIngress}>
                For verktøy og mindre maskiner. Velg datoer, legg utstyret i leielisten og betal med Vipps eller kort.
              </p>
              <ul role="list" className={styles.punkter}>
                <li>
                  <span>Beløpet reserveres når du betaler, og trekkes først når vi har bekreftet leien.</span>
                </li>
                <li>
                  <span>
                    Levering innen {firma.levering.radiusKm} km: <Pris kr={firma.levering.prisInklMva} /> <MvaTekst />.
                    Eller hent selv hos oss.
                  </span>
                </li>
                <li>
                  <span>Kvittering og bekreftelse på e-post.</span>
                </li>
              </ul>
              <Link href="/maskiner" className="knapp">
                Se utvalget <Pil />
              </Link>
            </article>
            <article className={styles.vei}>
              <p className="etikett">Etter avtale</p>
              <h3 className={styles.veiTittel}>Send forespørsel</h3>
              <p className={styles.veiIngress}>
                For store maskiner, leie med fører, lange perioder eller levering lenger unna. Forespørselen er ikke
                bindende.
              </p>
              <ul role="list" className={styles.punkter}>
                <li>
                  <span>Du får pris og ledig dato fra oss, vanligvis {firma.svartid}.</span>
                </li>
                <li>
                  <span>Maskiner merket «Etter avtale» leies bare ut på denne måten.</span>
                </li>
                <li>
                  <span>Bedrift? Spør gjerne om faktura.</span>
                </li>
              </ul>
              <Link href="/kontakt" className="knapp knapp--omriss">
                Send forespørsel <Pil />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="ramme seksjon" aria-labelledby="ofte-leid">
        <div className="seksjonshode">
          <h2 id="ofte-leid" className="overskrift">
            Ofte leid
          </h2>
          <Link href="/maskiner" className="pil-lenke">
            Alle maskiner <Pil />
          </Link>
        </div>
        <div className={`${kortStil.rutenett} ${styles.ofteLeid}`}>
          {ofteLeid.map((m) => (
            <Maskinkort key={m.slug} maskin={m} />
          ))}
        </div>
      </section>

      <section id="slik-leier-du" className={`ramme ${styles.slik}`} aria-labelledby="slik-tittel">
        <div className="seksjonshode">
          <h2 id="slik-tittel" className="overskrift">
            Slik leier du
          </h2>
        </div>
        <ol role="list" className={styles.steg}>
          <li>
            <span className={styles.stegNr}>01</span>
            <h3 className="underoverskrift">Velg utstyr og datoer</h3>
            <p>Prisen er per døgn. Leier du fire døgn eller mer, betaler du ukepris.</p>
          </li>
          <li>
            <span className={styles.stegNr}>02</span>
            <h3 className="underoverskrift">Betal eller spør</h3>
            <p>Betal med Vipps eller kort, eller send en forespørsel uten forpliktelser.</p>
          </li>
          <li>
            <span className={styles.stegNr}>03</span>
            <h3 className="underoverskrift">Hent eller få det levert</h3>
            <p>
              Hent på lageret i {adresseLinje}, eller få det levert innen {firma.levering.radiusKm} km.
            </p>
          </li>
          <li>
            <span className={styles.stegNr}>04</span>
            <h3 className="underoverskrift">Lever tilbake</h3>
            <p>Innen avtalt tid, rengjort og med full tank. Da slipper du tillegg for vask og drivstoff.</p>
          </li>
        </ol>
      </section>

      <section className={styles.cta} aria-labelledby="cta-tittel">
        <div className={`ramme ${styles.ctaRad}`}>
          <h2 id="cta-tittel" className="tittel">
            Finner du ikke det du trenger?
          </h2>
          <div className={styles.ctaTekst}>
            <p>
              Fortell oss hva jobben er, så foreslår vi utstyr og gir deg en pris. Vi svarer {firma.svartid}.
            </p>
            <div className={styles.ctaKnapper}>
              <Link href="/kontakt" className="knapp knapp--lys">
                Send forespørsel <Pil />
              </Link>
              <a href={`tel:${firma.telefon}`} className={`knapp ${styles.ctaRing}`}>
                Ring {firma.telefonVisning}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
