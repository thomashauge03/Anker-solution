'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { firma } from '@/data/firma'
import { antallILista, useLeieliste } from '@/lib/leieliste'
import { Logo } from './Logo'
import { Pil } from './Pil'
import styles from './Header.module.css'

const lenker = [
  { href: '/maskiner', tekst: 'Maskiner' },
  { href: '/#slik-leier-du', tekst: 'Slik leier du' },
  { href: '/kontakt', tekst: 'Kontakt' },
]

export function Header() {
  const sti = usePathname()
  const antall = antallILista(useLeieliste())
  const [apen, settApen] = useState(false)
  // Menyen legges rett under toppen, enten båndet over er synlig eller ikke.
  const [menyTopp, settMenyTopp] = useState(0)
  const headerRef = useRef<HTMLElement>(null)

  function vekslMeny() {
    settMenyTopp(headerRef.current?.getBoundingClientRect().bottom ?? 0)
    settApen((a) => !a)
  }

  // Lukk menyen med Esc, og hold siden bak i ro mens den er åpen.
  useEffect(() => {
    if (!apen) return
    const vedTast = (e: KeyboardEvent) => {
      if (e.key === 'Escape') settApen(false)
    }
    document.addEventListener('keydown', vedTast)
    const forrige = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', vedTast)
      document.body.style.overflow = forrige
    }
  }, [apen])

  const erAktiv = (href: string) => !href.includes('#') && (sti === href || sti.startsWith(`${href}/`))

  return (
    <header className={styles.header} ref={headerRef}>
      <div className={`ramme ${styles.rad}`}>
        <Link href="/" className={styles.logo} aria-label="Anker Solutions, til forsiden" onClick={() => settApen(false)}>
          <Logo variant="hel" dekorativ className={styles.logoBilde} />
        </Link>

        <nav aria-label="Hovedmeny" className={styles.nav}>
          <ul role="list">
            {lenker.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={styles.navlenke} aria-current={erAktiv(l.href) ? 'page' : undefined}>
                  {l.tekst}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/leieliste"
                className={styles.navlenke}
                aria-current={sti === '/leieliste' ? 'page' : undefined}
                aria-label={`Leieliste, ${antall} ${antall === 1 ? 'enhet' : 'enheter'}`}
              >
                <span aria-hidden="true">Leieliste</span>
                <span className={styles.teller} aria-hidden="true" data-tom={antall === 0 || undefined}>
                  {antall}
                </span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className={styles.mobil}>
          <Link
            href="/leieliste"
            className={styles.mobilListe}
            aria-label={`Leieliste, ${antall} ${antall === 1 ? 'enhet' : 'enheter'}`}
            onClick={() => settApen(false)}
          >
            <span className={styles.teller} aria-hidden="true" data-tom={antall === 0 || undefined}>
              {antall}
            </span>
          </Link>
          <button
            type="button"
            className={styles.menyknapp}
            aria-expanded={apen}
            aria-controls="mobilmeny"
            onClick={vekslMeny}
          >
            <span className={styles.menystreker} data-apen={apen} aria-hidden="true" />
            <span className="skjult">{apen ? 'Lukk menyen' : 'Meny'}</span>
          </button>
        </div>
      </div>

      <div id="mobilmeny" className={styles.mobilmeny} hidden={!apen} style={{ top: menyTopp }}>
        <nav aria-label="Meny">
          <ul role="list" className={styles.mobillenker}>
            {[{ href: '/', tekst: 'Forside' }, ...lenker, { href: '/leieliste', tekst: 'Leieliste' }].map((l, i) => (
              <li key={l.href} style={{ ['--i' as string]: i }}>
                <Link href={l.href} onClick={() => settApen(false)} aria-current={sti === l.href ? 'page' : undefined}>
                  {l.tekst}
                  <Pil storrelse={26} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className={styles.mobilkontakt}>
          <a href={`tel:${firma.telefon}`}>Tlf. {firma.telefonVisning}</a>
          <a href={`mailto:${firma.epost}`}>{firma.epost}</a>
        </p>
      </div>
    </header>
  )
}
