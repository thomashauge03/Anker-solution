import Link from 'next/link'
import { kategorier, maskinerIKategori } from '@/data/maskiner'
import { flertall } from '@/lib/format'
import { Pil } from './Pil'
import { Pris } from './Pris'
import styles from './Kategoriindeks.module.css'

/** Utvalget som en ryddig liste, én rad per kategori. */
export function Kategoriindeks() {
  return (
    <ol role="list" className={styles.indeks}>
      {kategorier.map((k) => {
        const utvalg = maskinerIKategori(k.id)
        const fra = Math.min(...utvalg.map((m) => m.dognpris))
        return (
          <li key={k.id}>
            <Link href={`/maskiner?kategori=${k.id}`} className={styles.rad}>
              <span className={styles.nr}>{k.nr}</span>
              <span className={styles.navn}>{k.navn}</span>
              <span className={styles.antall}>{flertall(utvalg.length, 'modell', 'modeller')}</span>
              <span className={styles.fra}>
                fra <Pris kr={fra} />
              </span>
              <span className={styles.pil} aria-hidden="true">
                <Pil storrelse={18} />
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
