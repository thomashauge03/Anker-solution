import Link from 'next/link'
import type { Maskin } from '@/data/maskiner'
import { Pil } from './Pil'
import { Piktogram } from './Piktogram'
import { MvaTekst, Pris } from './Pris'
import styles from './Maskinkort.module.css'

export function Maskinkort({ maskin, overskrift = 'h3' }: { maskin: Maskin; overskrift?: 'h2' | 'h3' }) {
  const Overskrift = overskrift
  return (
    <article className={styles.kort}>
      <div className={styles.topp}>
        <span className="etikett">{maskin.kode}</span>
        {maskin.kunForesporsel && <span className="merkelapp">Etter avtale</span>}
      </div>
      <div className={styles.bilde}>
        <Piktogram id={maskin.piktogram} skala={maskin.skala} />
      </div>
      <div className={styles.tekst}>
        <Overskrift className={styles.navn}>
          <Link href={`/maskiner/${maskin.slug}`} className={styles.lenke}>
            {maskin.navn}
          </Link>
        </Overskrift>
        <p className={styles.nokkeltall}>
          {maskin.nokkeltall[0]} <span aria-hidden="true">·</span> {maskin.nokkeltall[1]}
        </p>
      </div>
      <div className={styles.bunn}>
        <p className={styles.pris}>
          <span className={styles.belop}>
            {maskin.kunForesporsel && <span className={styles.fra}>fra </span>}
            <Pris kr={maskin.dognpris} />
          </span>
          <span className={styles.enhet}>
            per døgn, <MvaTekst />
          </span>
        </p>
        <span className={styles.pil} aria-hidden="true">
          <Pil storrelse={18} />
        </span>
      </div>
    </article>
  )
}
