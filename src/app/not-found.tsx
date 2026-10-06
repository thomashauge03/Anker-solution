import Link from 'next/link'
import { Pil } from '@/components/Pil'
import { Piktogram } from '@/components/Piktogram'

export default function IkkeFunnet() {
  return (
    <div
      className="ramme"
      style={{ display: 'grid', gap: 24, justifyItems: 'start', paddingBlock: 'clamp(56px, 8vw, 120px)' }}
    >
      <p className="etikett">Feil 404</p>
      <h1 className="tittel">Her var det tomt.</h1>
      <p className="ingress">Siden finnes ikke, eller den er flyttet. Utstyret står der det pleier.</p>
      <div style={{ width: 'min(100%, 360px)', background: 'var(--flate)', padding: '24px 32px 12px' }}>
        <Piktogram id="henger" />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Link href="/maskiner" className="knapp">
          Se utvalget <Pil />
        </Link>
        <Link href="/" className="knapp knapp--omriss">
          Til forsiden
        </Link>
      </div>
    </div>
  )
}
