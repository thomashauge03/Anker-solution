import Link from 'next/link'
import { firma } from '@/data/firma'
import { kategorier, maskiner } from '@/data/maskiner'
import { Pil } from './Pil'
import { Pris } from './Pris'
import styles from './Hero.module.css'

// Forsiden: hva vi gjør til venstre, de viktigste fakta til høyre.
export function Hero() {
  return (
    <section className={`ramme ${styles.hero}`} aria-labelledby="hero-tittel">
      <div className={styles.tekst}>
        <p className="etikett dempet">Maskinutleie for privat og bedrift</p>
        <h1 id="hero-tittel" className={`tittel ${styles.tittel}`}>
          Lei maskiner og utstyr — fra gravemaskin til motorsag.
        </h1>
        <p className="ingress">
          Per døgn eller uke. Betal med Vipps eller kort, eller send en forespørsel om store maskiner, fører og
          levering.
        </p>
        <div className={styles.knapper}>
          <Link href="/maskiner" className="knapp">
            Se utvalget <Pil />
          </Link>
          <Link href="/kontakt" className="pil-lenke">
            Send forespørsel <Pil />
          </Link>
        </div>
      </div>

      <dl className={styles.fakta}>
        <div>
          <dt>{maskiner.length}</dt>
          <dd>maskiner og verktøy i {kategorier.length} kategorier</dd>
        </div>
        <div>
          <dt>Ukepris</dt>
          <dd>fra fire døgn, resten av uka er med</dd>
        </div>
        <div>
          <dt>Vipps og kort</dt>
          <dd>Beløpet trekkes først når leien er bekreftet</dd>
        </div>
        <div>
          <dt>
            <Pris kr={firma.levering.prisInklMva} />
          </dt>
          <dd>Levering og henting innen {firma.levering.radiusKm}&nbsp;km</dd>
        </div>
      </dl>
    </section>
  )
}
