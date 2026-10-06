import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Testbetaling } from '@/components/Testbetaling'

export const metadata: Metadata = {
  title: 'Testbetaling',
  robots: { index: false },
}

export default function Testbetalingside() {
  return (
    <div className="ramme" style={{ paddingBlock: 'clamp(40px, 6vw, 88px)' }}>
      <Suspense fallback={null}>
        <Testbetaling />
      </Suspense>
    </div>
  )
}
