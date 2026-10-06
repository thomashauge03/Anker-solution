'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { firma } from '@/data/firma'
import { antallILista, useLeieliste } from '@/lib/leieliste'
import { Logo } from './Logo'
import { Pil } from './Pil'
import { Prisvalg } from './Prisvalg'
import styles from './Header.module.css'

const lenker = [
  { href: '/maskiner', tekst: 'Maskiner og utstyr' },
  { href: '/#slik-leier-du', tekst: 'Slik leier du' },
  { href: '/kontakt', tekst: 'Kontakt' },
]

export function Header() {
  const sti = usePathname()
  const antall = antallILista(useLeieliste())
  const [apen, settApen] = useState(false)

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
    <header className={styles.header}>
      <div className={`ramme ${styles.rad}`}>
        <Link href="/" className={styles.logo} aria-label="Anker Solutions, til forsiden" onClick={() => settApen(false)}>
          <Logo />
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
          </ul>
        </nav>

        <div className={styles.verktoy}>
          <div className={styles.prisvalg}>
            <Prisvalg />
          </div>
          <Link
            href="/leieliste"
            className={styles.leieliste}
            aria-current={sti === '/leieliste' ? 'page' : undefined}
            aria-label={`Leieliste, ${antall} ${antall === 1 ? 'enhet' : 'enheter'}`}
            onClick={() => settApen(false)}
          >
            <span className={styles.leielisteTekst} aria-hidden="true">
              Leieliste
            </span>
            <svg className={styles.leielisteIkon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M3 1.5h10v13H3zM5.5 5h5M5.5 8h5M5.5 11h3" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <span className={styles.teller} aria-hidden="true">
              {antall}
            </span>
          </Link>
          <button
            type="button"
            className={styles.menyknapp}
            aria-expanded={apen}
            aria-controls="mobilmeny"
            onClick={() => settApen((a) => !a)}
          >
            <span className={styles.menystreker} data-apen={apen} aria-hidden="true" />
            <span className={styles.menytekst}>{apen ? 'Lukk' : 'Meny'}</span>
          </button>
        </div>
      </div>

      <div id="mobilmeny" className={styles.mobilmeny} hidden={!apen}>
        <nav aria-label="Meny">
          <ul role="list" className={styles.mobillenker}>
            {[{ href: '/', tekst: 'Forside' }, ...lenker, { href: '/leieliste', tekst: 'Leieliste' }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => settApen(false)} aria-current={sti === l.href ? 'page' : undefined}>
                  {l.tekst}
                  <Pil storrelse={22} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.mobilbunn}>
          <p className="etikett">Vis priser for</p>
          <Prisvalg variant="mork" />
          <p className={styles.mobilkontakt}>
            <a href={`tel:${firma.telefon}`}>Tlf. {firma.telefonVisning}</a>
            <a href={`mailto:${firma.epost}`}>{firma.epost}</a>
          </p>
        </div>
      </div>
    </header>
  )
}
