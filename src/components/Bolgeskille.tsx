import { bolgeknippe } from '@/lib/bolger'
import styles from './Bolgeskille.module.css'

/**
 * Tre svarte bølgestreker i full bredde som skiller seksjoner. Ren SVG fra
 * serveren, uten skript. `form` gir hver skillelinje sitt eget forløp.
 */
export function Bolgeskille({ form = 1, className }: { form?: number; className?: string }) {
  const baner = bolgeknippe({ form })
  return (
    <div className={className ? `${styles.skille} ${className}` : styles.skille} aria-hidden="true">
      <svg viewBox="0 0 1440 64" preserveAspectRatio="none" focusable="false">
        {baner.map((d, i) => (
          <path key={i} d={d} vectorEffect="non-scaling-stroke" strokeWidth={i === 1 ? 2 : 1} />
        ))}
      </svg>
    </div>
  )
}
