import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Bestillingsboks } from '@/components/Bestillingsboks'
import { Maskinkort } from '@/components/Maskinkort'
import kortStil from '@/components/Maskinkort.module.css'
import { Piktogram } from '@/components/Piktogram'
import { MvaTekst, Pris } from '@/components/Pris'
import { firma } from '@/data/firma'
import { finnKategori, finnMaskin, maskiner } from '@/data/maskiner'
import { dognTilUkepris } from '@/lib/pris'
import styles from './maskin.module.css'

export const dynamicParams = false

export function generateStaticParams() {
  return maskiner.map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: PageProps<'/maskiner/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const maskin = finnMaskin(slug)
  if (!maskin) return {}
  return {
    title: `Lei ${maskin.navn.charAt(0).toLowerCase()}${maskin.navn.slice(1)}`,
    description: `${maskin.beskrivelse} Fra ${maskin.dognpris} kr per døgn inkl. mva.`,
  }
}

export default async function Maskinside({ params }: PageProps<'/maskiner/[slug]'>) {
  const { slug } = await params
  const maskin = finnMaskin(slug)
  if (!maskin) notFound()
  const kategori = finnKategori(maskin.kategori)
  const relaterte = (maskin.relaterte ?? []).map(finnMaskin).filter((m) => m !== undefined)

  return (
    <>
      <div className="ramme">
        <nav aria-label="Brødsmuler" className={styles.smuler}>
          <ol role="list">
            <li>
              <Link href="/maskiner">Maskiner</Link>
            </li>
            {kategori && (
              <li>
                <Link href={`/maskiner?kategori=${kategori.id}`}>{kategori.navn}</Link>
              </li>
            )}
            <li aria-current="page">{maskin.kode}</li>
          </ol>
        </nav>
      </div>

      <div className={`ramme ${styles.topp}`}>
        <div className={styles.bildekolonne}>
          <figure className={styles.bilde}>
            <div className={styles.bildeTopp}>
              <span className="etikett">{maskin.kode}</span>
              <span className="etikett">{kategori?.navn}</span>
            </div>
            <Piktogram id={maskin.piktogram} skala={maskin.skala} tittel={`Piktogram av ${maskin.navn.toLowerCase()}`} />
            <figcaption className={styles.bildetekst}>
              {maskin.nokkeltall[0]} · {maskin.nokkeltall[1]}
            </figcaption>
          </figure>
          <dl className={styles.fakta}>
            <div>
              <dt className="etikett">Henting</dt>
              <dd>
                {maskin.kreverLevering
                  ? 'Leveres av oss'
                  : `Fra kl. ${firma.apningstider[0].tid.split('–')[0]}, ${firma.adresse.gate}`}
              </dd>
            </div>
            <div>
              <dt className="etikett">Levering</dt>
              <dd>
                {maskin.kunForesporsel ? (
                  'Pris etter avstand'
                ) : (
                  <>
                    <Pris kr={firma.levering.prisInklMva} /> innen {firma.levering.radiusKm}&nbsp;km
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt className="etikett">Til utleie</dt>
              <dd>{maskin.antall} stk.</dd>
            </div>
          </dl>
        </div>

        <div className={styles.infokolonne}>
          <div className={styles.innledning}>
            {maskin.kunForesporsel && <p className="merkelapp merkelapp--fylt">Leies ut etter avtale</p>}
            <h1 className={`tittel ${styles.navn}`}>{maskin.navn}</h1>
            <p className={styles.beskrivelse}>{maskin.beskrivelse}</p>
          </div>

          <div>
            <dl className={styles.priser}>
              <div>
                <dt className="etikett">Døgn</dt>
                <dd>
                  {maskin.kunForesporsel && <span className={styles.fra}>fra </span>}
                  <Pris kr={maskin.dognpris} />
                </dd>
              </div>
              <div>
                <dt className="etikett">Uke</dt>
                <dd>
                  {maskin.kunForesporsel && <span className={styles.fra}>fra </span>}
                  <Pris kr={maskin.ukepris} />
                </dd>
              </div>
            </dl>
            <p className={styles.prismerknad}>
              Priser <MvaTekst />. Leier du {dognTilUkepris(maskin)} døgn eller mer, betaler du ukepris.
            </p>
          </div>

          <Bestillingsboks
            slug={maskin.slug}
            navn={maskin.navn}
            dognpris={maskin.dognpris}
            ukepris={maskin.ukepris}
            antall={maskin.antall}
            kunForesporsel={maskin.kunForesporsel ?? false}
            kreverLevering={maskin.kreverLevering ?? false}
          />
        </div>
      </div>

      <div className={`ramme ${styles.detaljer}`}>
        <section aria-labelledby="spesifikasjoner">
          <h2 id="spesifikasjoner" className={styles.detaljtittel}>
            Spesifikasjoner
          </h2>
          <dl className={styles.spesifikasjoner}>
            {maskin.spesifikasjoner.map(([navn, verdi]) => (
              <div key={navn}>
                <dt>{navn}</dt>
                <dd className="mono">{verdi}</dd>
              </div>
            ))}
          </dl>
        </section>

        {(maskin.inkludert || maskin.merknader) && (
          <div className={styles.tillegg}>
            {maskin.inkludert && (
              <section aria-labelledby="inkludert">
                <h2 id="inkludert" className={styles.detaljtittel}>
                  Med i leien
                </h2>
                <ul role="list" className={styles.liste}>
                  {maskin.inkludert.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </section>
            )}
            {maskin.merknader && (
              <section aria-labelledby="godt-a-vite">
                <h2 id="godt-a-vite" className={styles.detaljtittel}>
                  Godt å vite
                </h2>
                <ul role="list" className={`${styles.liste} ${styles.merknader}`}>
                  {maskin.merknader.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>

      {relaterte.length > 0 && (
        <section className="ramme seksjon" aria-labelledby="passer-med">
          <div className="seksjonshode">
            <h2 id="passer-med" className="overskrift">
              Passer sammen med
            </h2>
          </div>
          <div className={`${kortStil.rutenett} ${styles.relaterte}`}>
            {relaterte.map((m) => (
              <Maskinkort key={m.slug} maskin={m} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
