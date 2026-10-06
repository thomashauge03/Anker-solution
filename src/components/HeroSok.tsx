'use client'

import Form from 'next/form'
import { Periodevelger } from './Periodevelger'
import { Pil } from './Pil'
import styles from './HeroSok.module.css'

/** Søk på forsiden. Datoene lagres i leielisten; bare søkeordet går i adressen. */
export function HeroSok() {
  return (
    <Form action="/maskiner" className={styles.sok} role="search" aria-label="Finn utstyr">
      <div className={`felt ${styles.sokefelt}`}>
        <label htmlFor="hero-sok">Hva skal du leie?</label>
        <input
          id="hero-sok"
          name="sok"
          type="search"
          className="inndata"
          placeholder="F.eks. minigraver, vibroplate"
          autoComplete="off"
          enterKeyHint="search"
        />
      </div>
      <div className={styles.datoer}>
        <Periodevelger kompakt />
      </div>
      <button type="submit" className={`knapp ${styles.knapp}`}>
        Finn utstyr
        <Pil />
      </button>
    </Form>
  )
}
