import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Betalingsstatus } from '@/components/Betalingsstatus'

export const metadata: Metadata = {
  title: 'Bestilling',
  robots: { index: false },
}

export default function Statusside() {
  return (
    <div className="ramme" style={{ paddingBlock: 'clamp(40px, 6vw, 88px)' }}>
      <Suspense fallback={<p className="etikett">Sjekker betalingen …</p>}>
        <Betalingsstatus />
      </Suspense>
    </div>
  )
}
