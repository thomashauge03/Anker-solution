import Link from 'next/link'
import { Bolgeskille } from '@/components/Bolgeskille'
import { Hero } from '@/components/Hero'
import { Kategoriindeks } from '@/components/Kategoriindeks'
import { Maskinkort } from '@/components/Maskinkort'
import { Pil } from '@/components/Pil'
import { firma } from '@/data/firma'
import { maskiner } from '@/data/maskiner'
import styles from './page.module.css'

const steg = [
  {
    tittel: 'Velg utstyr og datoer',
    tekst: 'Pris per døgn. Leier du fire døgn eller mer, betaler du ukepris.',
  },
  {
    tittel: 'Gå gjennom kassen',
    tekst: 'Ett steg om gangen. Betal med Vipps eller kort, eller send en forespørsel om store maskiner og fører.',
  },
  {
    tittel: 'Hent eller få det levert',
    tekst: `Hent på lageret, eller få utstyret levert innen ${firma.levering.radiusKm} km.`,
  },
]

export default function Forside() {
  // Fire kort: fire i bredden på stor skjerm, to og to på mobil.
  const ofteLeid = maskiner.filter((m) => m.ofteLeid).slice(0, 4)

  return (
    <>
      <Hero />
      <Bolgeskille form={1} />

      <section className="ramme blokk" aria-labelledby="utvalget">
        <p className="blokk-etikett">Utvalg</p>
        <div className="blokk-innhold">
          <div className="blokk-hode">
            <h2 id="utvalget" className="overskrift">
              Maskiner og utstyr til leie
            </h2>
            <Link href="/maskiner" className="pil-lenke">
              Se alt utstyr <Pil />
            </Link>
          </div>
          <Kategoriindeks />
        </div>
      </section>

      <div className="mork">
        <section id="slik-leier-du" className="ramme blokk" aria-labelledby="slik-tittel">
          <p className="blokk-etikett">Slik leier du</p>
          <div className="blokk-innhold">
            <h2 id="slik-tittel" className="overskrift">
              Fra bestilling til henting
            </h2>
            <ol role="list" className={styles.steg}>
              {steg.map((s, i) => (
                <li key={s.tittel}>
                  <span className={styles.stegNr} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className={styles.stegTittel}>{s.tittel}</h3>
                  <p className={styles.stegTekst}>{s.tekst}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      <section className="ramme blokk" aria-labelledby="ofte-leid">
        <p className="blokk-etikett">Populært</p>
        <div className="blokk-innhold">
          <div className="blokk-hode">
            <h2 id="ofte-leid" className="overskrift">
              Ofte leid
            </h2>
            <Link href="/maskiner" className="pil-lenke">
              Alle maskiner <Pil />
            </Link>
          </div>
          <div className={styles.kort}>
            {ofteLeid.map((m) => (
              <Maskinkort key={m.slug} maskin={m} />
            ))}
          </div>
        </div>
      </section>

      <Bolgeskille form={2} />

      <section className="ramme blokk" aria-labelledby="kontakt-tittel">
        <p className="blokk-etikett">Kontakt</p>
        <div className={`blokk-innhold ${styles.kontakt}`}>
          <div>
            <h2 id="kontakt-tittel" className="overskrift">
              Finner du ikke det du trenger?
            </h2>
            <p className={styles.kontaktTekst}>
              Fortell hva jobben er, så foreslår vi utstyr og gir deg en pris. Vi svarer {firma.svartid}.
            </p>
          </div>
          <div className={styles.kontaktKnapper}>
            <Link href="/kontakt" className="knapp">
              Spør oss <Pil />
            </Link>
            <a href={`tel:${firma.telefon}`} className="knapp knapp--omriss">
              Ring {firma.telefonVisning}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
