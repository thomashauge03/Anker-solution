import { bolgeknippe } from '@/lib/bolger'

const ANTALL = 18

/**
 * Et stillestående bånd av bølgestreker, samme motiv som den levende
 * bakgrunnen på forsiden. Ren SVG fra serveren. Strekene midt i båndet er
 * mørkest, de ytterste blekest.
 */
export function Bolgefelt({ form = 1, className }: { form?: number; className?: string }) {
  const baner = bolgeknippe({ form, antall: ANTALL, bredde: 1000, hoyde: 400, avstand: 11, vri: true })
  const halv = (ANTALL - 1) / 2
  return (
    <div className={className} aria-hidden="true">
      <svg
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
        focusable="false"
        style={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}
      >
        {baner.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.15}
            strokeOpacity={0.92 - (0.68 * Math.abs(i - halv)) / halv}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  )
}
