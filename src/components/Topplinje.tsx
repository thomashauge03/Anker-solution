import { firma } from '@/data/firma'
import styles from './Topplinje.module.css'

export function Topplinje() {
  const aapne = firma.apningstider.filter((a) => a.tid !== 'Stengt')
  const [forste, ...resten] = aapne
  return (
    <div className={styles.topplinje}>
      <div className={`ramme ${styles.rad}`}>
        <p>
          <span className={styles.prikk} aria-hidden="true" />
          <span>
            Åpent {forste.kort} {forste.tid}
            {/* På smale skjermer vises bare første linje av åpningstidene. */}
            <span className={styles.resten}>{resten.map((a) => ` · ${a.kort} ${a.tid}`).join('')}</span>
          </span>
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
