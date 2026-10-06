'use client'

import { kroner } from '@/lib/format'
import { useKundetype } from '@/lib/leieliste'
import { eksMvaOre } from '@/lib/pris'

/**
 * Viser en pris lagret inkl. mva. Bedriftskunder ser den eks. mva.
 * Forbrukere skal alltid se totalpris inkl. avgifter (prisopplysningsforskriften).
 */
export function Pris({ kr, className }: { kr: number; className?: string }) {
  const type = useKundetype()
  return <span className={className}>{kroner(type === 'bedrift' ? eksMvaOre(kr) / 100 : kr)}</span>
}

export function MvaTekst() {
  const type = useKundetype()
  // Hardt mellomrom, så «eks.» og «mva» aldri havner på hver sin linje.
  return <>{type === 'bedrift' ? 'eks. mva' : 'inkl. mva'}</>
}
