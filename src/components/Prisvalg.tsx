'use client'

import { useId } from 'react'
import { leieliste, useKundetype, type Kundetype } from '@/lib/leieliste'
import styles from './Prisvalg.module.css'

const valg: { verdi: Kundetype; tekst: string }[] = [
  { verdi: 'privat', tekst: 'Privat' },
  { verdi: 'bedrift', tekst: 'Bedrift' },
]

/** Privat viser priser inkl. mva, bedrift eks. mva. Gjelder hele siden. */
export function Prisvalg({ variant = 'lys', etikett = 'Vis priser for' }: { variant?: 'lys' | 'mork'; etikett?: string }) {
  const navn = useId()
  const type = useKundetype()
  return (
    <fieldset className={`${styles.valg} ${variant === 'mork' ? styles.mork : ''}`}>
      <legend className="skjult">{etikett}</legend>
      {valg.map((v) => (
        <label key={v.verdi} className={styles.alternativ}>
          <input
            type="radio"
            name={navn}
            value={v.verdi}
            checked={type === v.verdi}
            onChange={() => leieliste.settKundetype(v.verdi)}
          />
          <span>{v.tekst}</span>
        </label>
      ))}
    </fieldset>
  )
}
