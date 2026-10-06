import Link from 'next/link'
import type { Maskin } from '@/data/maskiner'
import { Pil } from './Pil'
import { Piktogram } from './Piktogram'
import { Pris } from './Pris'
import styles from './Maskinkort.module.css'

/** `radPaMobil`: på smale skjermer vises kortet som en rad i en liste. */
export function Maskinkort({
  maskin,
  overskrift = 'h3',
  radPaMobil = false,
}: {
  maskin: Maskin
  overskrift?: 'h2' | 'h3'
  radPaMobil?: boolean
}) {
  const Overskrift = overskrift
  return (
    <article className={radPaMobil ? `${styles.kort} ${styles.radPaMobil}` : styles.kort}>
      <div className={styles.bilde}>
        <Piktogram id={maskin.piktogram} skala={maskin.skala} />
        {maskin.kunForesporsel && <span className={styles.merke}>Etter avtale</span>}
        <span className={styles.pil} aria-hidden="true">
          <Pil storrelse={18} />
        </span>
      </div>
      <div className={styles.tekst}>
        <Overskrift className={styles.navn}>
          <Link href={`/maskiner/${maskin.slug}`} className={styles.lenke}>
            {maskin.navn}
          </Link>
        </Overskrift>
        <p className={styles.pris}>
          {maskin.kunForesporsel && 'fra '}
          <Pris kr={maskin.dognpris} className={styles.belop} />
          <span className={styles.enhet}> / døgn</span>
        </p>
      </div>
    </article>
  )
}
