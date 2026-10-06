import Link from 'next/link'
import { adresseLinje, firma } from '@/data/firma'
import { Logo } from './Logo'
import styles from './Footer.module.css'

export function Footer() {
  const aar = new Date().getFullYear()
  return (
    <footer className={styles.footer}>
      <div className={`ramme ${styles.rutenett}`}>
        <div className={styles.merke}>
          <Logo variant="hel" className={styles.logo} />
          <p className={styles.slagord}>
            Utleie av maskiner og verktøy til privatpersoner og bedrifter.
          </p>
        </div>

        <div>
          <h2 className="etikett">Henting og besøk</h2>
          <address className={styles.adresse}>
            {firma.adresse.gate}
            <br />
            {firma.adresse.postnr} {firma.adresse.sted}
          </address>
          <dl className={styles.tider}>
            {firma.apningstider.map((a) => (
              <div key={a.dager}>
                <dt>{a.dager}</dt>
                <dd className="mono">{a.tid}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="etikett">Kontakt</h2>
          <ul role="list" className={styles.liste}>
            <li>
              <a href={`tel:${firma.telefon}`}>Tlf. {firma.telefonVisning}</a>
            </li>
            <li>
              <a href={`mailto:${firma.epost}`}>{firma.epost}</a>
            </li>
            <li>
              <Link href="/kontakt">Send en forespørsel</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="etikett">Snarveier</h2>
          <ul role="list" className={styles.liste}>
            <li>
              <Link href="/maskiner">Maskiner og utstyr</Link>
            </li>
            <li>
              <Link href="/leieliste">Leieliste</Link>
            </li>
            <li>
              <Link href="/vilkar">Leievilkår</Link>
            </li>
            <li>
              <Link href="/vilkar#angrerett">Angrerett og angreskjema</Link>
            </li>
            <li>
              <Link href="/personvern">Personvern</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={`ramme ${styles.bunn}`}>
        <p>
          © {aar} {firma.juridiskNavn} · Org.nr. {firma.orgnr}
          {firma.mvaRegistrert ? ' MVA' : ''} · {firma.register} · Forretningskontor {firma.forretningskontor}
        </p>
        <p className={styles.adresseKort}>{adresseLinje}</p>
      </div>
    </footer>
  )
}
