import Link from 'next/link'
import { adresseLinje, firma } from '@/data/firma'
import { Logo } from './Logo'
import styles from './Footer.module.css'

export function Footer() {
  const aar = new Date().getFullYear()
  const aapne = firma.apningstider.filter((a) => a.tid !== 'Stengt')
  return (
    <footer className={styles.footer}>
      <div className={`ramme ${styles.rutenett}`}>
        <Logo variant="hel" className={styles.logo} />

        <div className={styles.kolonner}>
          <div>
            <h2 className={styles.tittel}>Kontakt</h2>
            <ul role="list" className={styles.liste}>
              <li>
                <a href={`tel:${firma.telefon}`}>{firma.telefonVisning}</a>
              </li>
              <li>
                <a href={`mailto:${firma.epost}`}>{firma.epost}</a>
              </li>
              <li className={styles.dempet}>{adresseLinje}</li>
            </ul>
          </div>
          <div>
            <h2 className={styles.tittel}>Åpent</h2>
            <ul role="list" className={styles.liste}>
              {aapne.map((a) => (
                <li key={a.dager}>
                  {a.kort} {a.tid}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={styles.tittel}>Mer</h2>
            <ul role="list" className={styles.liste}>
              <li>
                <Link href="/maskiner">Maskiner og utstyr</Link>
              </li>
              <li>
                <Link href="/vilkar">Leievilkår og angrerett</Link>
              </li>
              <li>
                <Link href="/personvern">Personvern</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p className={`ramme ${styles.bunn}`}>
        © {aar} {firma.juridiskNavn} · Org.nr. {firma.orgnr}
        {firma.mvaRegistrert ? ' MVA' : ''} · {firma.register} · Forretningskontor {firma.forretningskontor}
      </p>
    </footer>
  )
}
