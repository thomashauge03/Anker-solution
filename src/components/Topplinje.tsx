import { firma } from '@/data/firma'
import styles from './Topplinje.module.css'

export function Topplinje() {
  const tider = firma.apningstider
    .filter((a) => a.tid !== 'Stengt')
    .map((a) => `${a.kort} ${a.tid}`)
    .join(' · ')
  return (
    <div className={styles.topplinje}>
      <div className={`ramme ${styles.rad}`}>
        <p>
          <span className={styles.prikk} aria-hidden="true" />
          Åpent {tider}
        </p>
        <p className={styles.kontakt}>
          <a href={`tel:${firma.telefon}`}>Tlf. {firma.telefonVisning}</a>
          <a href={`mailto:${firma.epost}`} className={styles.epost}>
            {firma.epost}
          </a>
        </p>
      </div>
    </div>
  )
}
