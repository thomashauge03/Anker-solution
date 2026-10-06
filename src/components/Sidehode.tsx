import type { ReactNode } from 'react'
import { Bolgefelt } from './Bolgefelt'
import styles from './Sidehode.module.css'

/**
 * Toppen av en underside: etikett, blokkete tittel og ingress til venstre,
 * og et stille bånd av bølgestreker til høyre, så siden ikke står tom.
 */
export function Sidehode({
  etikett,
  tittel,
  form = 1,
  smal = false,
  children,
}: {
  etikett: string
  tittel: string
  /** Forløpet til bølgestrekene; ulike sider får ulike bånd. */
  form?: number
  /** Smalere tekstkolonne, for lange dokumenter. */
  smal?: boolean
  children?: ReactNode
}) {
  return (
    <div className={styles.topp}>
      <Bolgefelt form={form} className={styles.felt} />
      <header className={`ramme sidehode ${styles.hode}`}>
        <div className={smal ? `${styles.tekst} ${styles.smal}` : styles.tekst}>
          <p className="etikett">{etikett}</p>
          <h1 className="tittel">{tittel}</h1>
          {children}
        </div>
      </header>
    </div>
  )
}
