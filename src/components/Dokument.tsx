import type { ReactNode } from 'react'
import styles from './Dokument.module.css'

export type Avsnitt = { id: string; tittel: string; innhold: ReactNode }

/** Lange tekster (vilkår, personvern) med nummererte avsnitt og innholdsliste. */
export function Dokument({
  etikett,
  tittel,
  ingress,
  oppdatert,
  merknad,
  avsnitt,
}: {
  etikett: string
  tittel: string
  ingress: ReactNode
  oppdatert: string
  merknad?: ReactNode
  avsnitt: Avsnitt[]
}) {
  return (
    <div className={`ramme ${styles.dokument}`}>
      <header className={`sidehode ${styles.hode}`}>
        <p className="etikett">{etikett}</p>
        <h1 className="tittel">{tittel}</h1>
        <div className="ingress">{ingress}</div>
        <p className="etikett dempet">Sist oppdatert {oppdatert}</p>
        {merknad && <div className="utkast">{merknad}</div>}
      </header>

      <div className={styles.rutenett}>
        <nav aria-label="Innhold" className={styles.innhold}>
          <p className="etikett">Innhold</p>
          <ol role="list">
            {avsnitt.map((a, i) => (
              <li key={a.id}>
                <a href={`#${a.id}`}>
                  <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                  {a.tittel}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.tekst}>
          {avsnitt.map((a, i) => (
            <section key={a.id} id={a.id} aria-labelledby={`${a.id}-tittel`} className={styles.avsnitt}>
              <h2 id={`${a.id}-tittel`}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                {a.tittel}
              </h2>
              {a.innhold}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
