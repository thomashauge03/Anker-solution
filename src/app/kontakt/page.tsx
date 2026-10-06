import type { Metadata } from 'next'
import { KontaktSkjema } from '@/components/KontaktSkjema'
import { MvaTekst, Pris } from '@/components/Pris'
import { firma } from '@/data/firma'
import { finnMaskin } from '@/data/maskiner'
import styles from './kontakt.module.css'

export const metadata: Metadata = {
  title: 'Kontakt og forespørsel',
  description: 'Send en forespørsel om leie, levering eller fører. Vi svarer samme virkedag.',
}

export default async function Kontaktside({ searchParams }: PageProps<'/kontakt'>) {
  const { maskin: slug } = await searchParams
  const maskin = typeof slug === 'string' ? finnMaskin(slug) : undefined

  return (
    <div className={`ramme ${styles.side}`}>
      <header className="sidehode">
        <p className="etikett">Kontakt</p>
        <h1 className="tittel">Spør oss om leie</h1>
        <p className="ingress">
          Store maskiner, fører, lang leie eller levering lenger unna — fortell hva jobben er, så får du pris og
          ledig dato. Forespørselen er ikke bindende.
        </p>
      </header>

      <div className={styles.rutenett}>
        <KontaktSkjema maskin={maskin ? { slug: maskin.slug, navn: maskin.navn, kode: maskin.kode } : null} />

        <aside className={styles.info} aria-label="Kontaktinformasjon">
          <div className={styles.blokk}>
            <p className="etikett">Ring oss</p>
            <a href={`tel:${firma.telefon}`} className={styles.telefon}>
              {firma.telefonVisning}
            </a>
            <a href={`mailto:${firma.epost}`}>{firma.epost}</a>
          </div>
          <div className={styles.blokk}>
            <p className="etikett">Lager og henting</p>
            <address>
              {firma.adresse.gate}
              <br />
              {firma.adresse.postnr} {firma.adresse.sted}
            </address>
          </div>
          <div className={styles.blokk}>
            <p className="etikett">Åpningstider</p>
            <dl className={styles.tider}>
              {firma.apningstider.map((a) => (
                <div key={a.dager}>
                  <dt>{a.dager}</dt>
                  <dd className="mono">{a.tid}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={styles.blokk}>
            <p className="etikett">Levering</p>
            <p>
              Innen {firma.levering.radiusKm}&nbsp;km: <Pris kr={firma.levering.prisInklMva} /> <MvaTekst />. Lenger unna
              avtaler vi pris i forespørselen.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
