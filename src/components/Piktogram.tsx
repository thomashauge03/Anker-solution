import type { ReactNode } from 'react'
import type { PiktogramId } from '@/data/maskiner'

// Piktogrammer i samme stil som merkingen på en maskin: massive silhuetter
// på en bakkelinje. Fyll er currentColor; «hull» (vinduer, navkapsler) har
// fargen i --hull, så hele figuren kan inverteres med to CSS-variabler.
//
// Byttes ut med ekte bilder når Anker Solutions har dem: se Maskinbilde.

const H = 'var(--hull)'

const strek = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function Hjul({ x, y, r, nav }: { x: number; y: number; r: number; nav?: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} />
      <circle cx={x} cy={y} r={nav ?? r * 0.34} fill={H} />
    </>
  )
}

const figurer: Record<PiktogramId, ReactNode> = {
  graver: (
    <>
      <rect x="16" y="58" width="50" height="14" rx="7" />
      <rect x="23" y="62.5" width="36" height="5" rx="2.5" fill={H} />
      <circle cx="30.5" cy="65" r="1.4" />
      <circle cx="41" cy="65" r="1.4" />
      <circle cx="51.5" cy="65" r="1.4" />
      <path d="M67 60h4l1.5 12H66z" />
      <rect x="27" y="54" width="30" height="4.5" />
      <path d="M13 55v-8a7 7 0 0 1 7-7h43v15z" />
      <path d="M23 41V17h19l6.5 12.5V41z" />
      <path d="M26 20.5h14.2l5 9.6V37H26z" fill={H} />
      <path d="M58 47C62 30 70 19 81 13" {...strek} strokeWidth="7" />
      <path d="M81 13 95 40" {...strek} strokeWidth="5" />
      <path d="M93 37c8 1 12 8 10 17l-2 7H89l2-6c-3-5-2-13 2-18z" />
    </>
  ),
  laster: (
    <>
      <path d="M12 54V41a3 3 0 0 1 3-3h24v16z" />
      <path d="M38 54V15h21l3 39z" />
      <path d="M41.5 18.5h14.5l2 18H41.5z" fill={H} />
      <rect x="30" y="47" width="56" height="9" />
      <path d="M60 44 88 54" {...strek} strokeWidth="6" />
      <path d="M86 41h11c3 11 7 21 14 30H90c-3-9-5-19-4-30z" />
      <Hjul x={31} y={61} r={11} />
      <Hjul x={77} y={61} r={11} />
    </>
  ),
  dumper: (
    <>
      <rect x="22" y="48" width="70" height="8" />
      <path d="M54 30l46-4-7 26H58z" />
      <path d="M26 48V24h14v24" {...strek} strokeWidth="3.5" strokeLinecap="butt" />
      <rect x="28" y="40" width="11" height="8" />
      <path d="M43 44l6-8" {...strek} strokeWidth="2.5" />
      <Hjul x={34} y={62} r={10} />
      <Hjul x={82} y={62} r={10} />
    </>
  ),
  beltedumper: (
    <>
      <rect x="28" y="59" width="56" height="13" rx="6.5" />
      <rect x="34" y="63" width="44" height="5" rx="2.5" fill={H} />
      <path d="M48 33l47-3-8 28H52z" />
      <rect x="28" y="46" width="22" height="13" />
      <path d="M30 48 15 31" {...strek} strokeWidth="3.5" />
      <path d="M10 31h9" {...strek} strokeWidth="4" />
    </>
  ),
  vibroplate: (
    <>
      <path d="M30 66h56l4 6H26z" />
      <rect x="38" y="50" width="40" height="16" />
      <rect x="44" y="40" width="26" height="10" rx="2" />
      <path d="M44 56h28" stroke={H} strokeWidth="1.5" />
      <path d="M40 52 19 28" {...strek} strokeWidth="3.5" />
      <path d="M13 28h10" {...strek} strokeWidth="4" />
    </>
  ),
  stamper: (
    <>
      <rect x="45" y="66" width="32" height="6" />
      <path d="M54 66V46h14v20z" />
      <path d="M56 50h10M56 54h10M56 58h10M56 62h10" stroke={H} strokeWidth="1.5" />
      <rect x="44" y="28" width="34" height="18" rx="3" />
      <path d="M41 40V16h40v24" {...strek} strokeWidth="3.5" />
    </>
  ),
  motorsag: (
    <>
      <path d="M24 50h31l4 7v15H24z" />
      <path d="M26 53c-8 0-11 3-11 9v4c0 4 2 6 6 6h5" {...strek} strokeWidth="4" />
      <path d="M31 50c0-12 18-15 24-3" {...strek} strokeWidth="4" />
      <path d="M57 58l46 2.5a3.5 3.5 0 0 1 0 7L57 70z" />
      <path d="M61 64.2h40" stroke={H} strokeWidth="1.2" strokeDasharray="2 2" />
      <path d="M30 58h14M30 62h14" stroke={H} strokeWidth="1.5" />
    </>
  ),
  stangsag: (
    <>
      <path d="M26 61 95 19" {...strek} strokeWidth="3" />
      <path d="M11 69l14-10 6 7-14 9z" />
      <path d="M31 58l6-4" {...strek} strokeWidth="6" />
      <path d="M91 17l7-4 4 6-7 4z" />
      <path d="M98 13l14-8 2 3-14 9z" />
    </>
  ),
  flishugger: (
    <>
      <path d="M11 64 38 58" {...strek} strokeWidth="3" />
      <circle cx="9" cy="64.5" r="2.6" />
      <rect x="40" y="60" width="3" height="12" />
      <rect x="36" y="42" width="40" height="18" />
      <path d="M76 44l26-12 6 18-28 10z" />
      <path d="M46 42c0-18 10-25 26-25" {...strek} strokeWidth="6" />
      <path d="M71 12l8 4-2 7-6-2z" />
      <Hjul x={57} y={63} r={9} />
    </>
  ),
  stubbefres: (
    <>
      <rect x="30" y="40" width="30" height="18" rx="2" />
      <path d="M56 50 85 58" {...strek} strokeWidth="6" />
      <circle cx="88" cy="61" r="11" />
      <circle cx="88" cy="61" r="3" fill={H} />
      <path d="M74 54a15 15 0 0 1 28 0" {...strek} strokeWidth="3.5" strokeLinecap="butt" />
      <path d="M32 44 13 25" {...strek} strokeWidth="3.5" />
      <path d="M8 25h10" {...strek} strokeWidth="4" />
      <Hjul x={40} y={64} r={8} />
    </>
  ),
  jordfreser: (
    <>
      <rect x="57" y="34" width="26" height="18" rx="2" />
      <rect x="61" y="29" width="15" height="5" rx="1.5" />
      <circle cx="74" cy="62" r="10" />
      <path d="M74 53v18M65 62h18M67.6 55.6l12.8 12.8M80.4 55.6 67.6 68.4" stroke={H} strokeWidth="1.4" />
      <path d="M59 59a15 15 0 0 1 30 0" {...strek} strokeWidth="3.5" strokeLinecap="butt" />
      <path d="M59 44 23 22" {...strek} strokeWidth="3.5" />
      <path d="M17 22h11" {...strek} strokeWidth="4" />
      <path d="M50 53v19" {...strek} strokeWidth="3" />
    </>
  ),
  borhammer: (
    <>
      <path d="M36 44h40l6 5v12H36z" />
      <path d="M38 49H27a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h11v-9" {...strek} strokeWidth="5" />
      <rect x="82" y="51" width="8" height="8" />
      <rect x="90" y="54" width="24" height="2.4" />
      <path d="M68 62l3.5 9" {...strek} strokeWidth="4" />
      <path d="M42 50h28" stroke={H} strokeWidth="1.5" />
    </>
  ),
  meiselhammer: (
    <>
      <rect x="34" y="14" width="56" height="7" rx="3.5" />
      <path d="M45 21h5v8h-5zM74 21h5v8h-5z" />
      <rect x="42" y="28" width="40" height="17" rx="2" />
      <path d="M47 34h30M47 39h30" stroke={H} strokeWidth="1.5" />
      <rect x="52" y="45" width="20" height="15" />
      <rect x="59" y="60" width="6" height="12" />
    </>
  ),
  kappsag: (
    <>
      <path d="M14 48h30l4 6v18H14z" />
      <path d="M18 48c0-12 16-15 24-5" {...strek} strokeWidth="4" />
      <path d="M46 54l36-6v10l-36 6z" />
      <circle cx="88" cy="55" r="17" />
      <circle cx="88" cy="55" r="13.5" fill={H} />
      <circle cx="88" cy="55" r="4.5" />
      <path d="M71.5 55a16.5 16.5 0 0 1 29-10.7" {...strek} strokeWidth="5" strokeLinecap="butt" />
      <path d="M20 58h20M20 62h20" stroke={H} strokeWidth="1.5" />
    </>
  ),
  spyler: (
    <>
      <path d="M28 58h56" {...strek} strokeWidth="3" />
      <path d="M30 58 24 18" {...strek} strokeWidth="3" />
      <path d="M19 18h10" {...strek} strokeWidth="4" />
      <rect x="80" y="58" width="3" height="14" />
      <rect x="40" y="34" width="30" height="22" rx="3" />
      <rect x="44" y="28" width="20" height="6" rx="2" />
      <path d="M45 41h20M45 46h20" stroke={H} strokeWidth="1.5" />
      <rect x="70" y="44" width="14" height="12" />
      <circle cx="99" cy="54" r="8" {...strek} strokeWidth="3" />
      <Hjul x={36} y={64} r={8} />
    </>
  ),
  aggregat: (
    <>
      <rect x="22" y="28" width="76" height="40" rx="4" {...strek} strokeWidth="3.5" />
      <path d="M27 68v4M93 68v4" {...strek} strokeWidth="4" strokeLinecap="butt" />
      <rect x="28" y="33" width="44" height="9" rx="2" />
      <rect x="28" y="45" width="34" height="19" />
      <rect x="64" y="45" width="28" height="19" />
      <circle cx="72" cy="54.5" r="2.6" fill={H} />
      <circle cx="83" cy="54.5" r="2.6" fill={H} />
      <path d="M32 50h26M32 54.5h26M32 59h26" stroke={H} strokeWidth="1.2" />
    </>
  ),
  kompressor: (
    <>
      <path d="M31 52 11 62" {...strek} strokeWidth="3" />
      <circle cx="9" cy="62.5" r="3" />
      <circle cx="17" cy="68" r="4" />
      <rect x="86" y="58" width="3" height="14" />
      <rect x="30" y="28" width="64" height="30" rx="7" />
      <path d="M40 36h40M40 41h40M40 46h40" stroke={H} strokeWidth="1.5" />
      <Hjul x={60} y={62} r={10} />
    </>
  ),
  varmer: (
    <>
      <rect x="40" y="10" width="6" height="22" />
      <path d="M37 10h12" {...strek} strokeWidth="3" />
      <rect x="26" y="30" width="62" height="24" rx="12" />
      <path d="M58 40h22M58 44h22" stroke={H} strokeWidth="1.5" />
      <rect x="88" y="35" width="12" height="14" />
      <rect x="28" y="56" width="58" height="9" rx="2" />
      <circle cx="36" cy="68" r="4" />
      <circle cx="78" cy="68" r="4" />
    </>
  ),
  torker: (
    <>
      <path d="M44 24V12h32v12" {...strek} strokeWidth="3.5" />
      <rect x="40" y="22" width="40" height="44" rx="3" />
      <path d="M46 30h28M46 35h28M46 40h28M46 45h28" stroke={H} strokeWidth="1.5" />
      <rect x="47" y="52" width="10" height="6" fill={H} />
      <path d="M80 58c12 0 16 6 18 14" {...strek} strokeWidth="2.5" />
      <circle cx="47" cy="68" r="4" />
      <circle cx="73" cy="68" r="4" />
    </>
  ),
  henger: (
    <>
      <path d="M27 54 8 62" {...strek} strokeWidth="3" />
      <circle cx="6" cy="62.5" r="2.6" />
      <circle cx="14" cy="68" r="3.6" />
      <rect x="26" y="40" width="80" height="16" />
      <path d="M30 45h72" stroke={H} strokeWidth="1.5" />
      <path d="M54 58a12 12 0 0 1 24 0" {...strek} strokeWidth="3" strokeLinecap="butt" />
      <Hjul x={66} y={63} r={9} />
    </>
  ),
  maskinhenger: (
    <>
      <path d="M21 54 5 62" {...strek} strokeWidth="3" />
      <circle cx="4" cy="62.5" r="2.6" />
      <circle cx="12" cy="68" r="3.6" />
      <rect x="20" y="50" width="78" height="6" />
      <path d="M98 50l15 22h-5L96 56z" />
      <path d="M24 50v-6M94 50v-6" {...strek} strokeWidth="2.5" strokeLinecap="butt" />
      <Hjul x={55} y={64} r={8} />
      <Hjul x={73} y={64} r={8} />
    </>
  ),
}

export function Piktogram({
  id,
  skala = 1,
  className,
  tittel,
}: {
  id: PiktogramId
  skala?: number
  className?: string
  /** Gis bare der piktogrammet bærer mening alene. Ellers er det pynt. */
  tittel?: string
}) {
  const s = Math.max(0.5, Math.min(1, skala))
  return (
    <svg
      viewBox="0 0 120 80"
      className={className}
      fill="currentColor"
      role={tittel ? 'img' : undefined}
      aria-hidden={tittel ? undefined : true}
      aria-label={tittel}
      focusable="false"
    >
      <g transform={s === 1 ? undefined : `translate(60 72) scale(${s}) translate(-60 -72)`}>{figurer[id]}</g>
      <path d="M2 72.5h116" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
