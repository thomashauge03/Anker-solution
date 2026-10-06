import type { Metadata } from 'next'
import { Bolgeskille } from '@/components/Bolgeskille'
import { KontaktSkjema } from '@/components/KontaktSkjema'
import { MvaTekst, Pris } from '@/components/Pris'
import { Sidehode } from '@/components/Sidehode'
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
    <>
      <Sidehode etikett="Kontakt" tittel="Spør oss" form={12}>
        <p className="ingress">
          Lurer du på noe om utstyr, fører, lang leie eller levering lenger unna? Skriv hva jobben er, så svarer vi{' '}
          {firma.svartid}. Vil du leie, legger du utstyret i leielisten og går gjennom kassen.
        </p>
      </Sidehode>
      <Bolgeskille form={6} />

      <div className={`ramme ${styles.side} ${styles.rutenett}`}>
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
    </>
  )
}
