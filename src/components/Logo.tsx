import { firma } from '@/data/firma'
import styles from './Logo.module.css'

// Logoen er tegnet for hånd av Anker Solutions, og tegnet opp på nytt som
// jevne streker i samme komposisjon: ankeret som A, «nker», buen og
// «SOLUTION». Fargen er currentColor, så den virker på hvitt og svart.
// Kildefiler (SVG og PNG) ligger i merkevare/.

const leggOgBein = 'M188 694 V34 L503 528'
const stokk = 'M98 348 H390'
const armer = [
  'M70 552 C88 620 138 696 188 698 C238 696 270 620 288 548',
  'M50 588 L64 528 L120 542',
  'M238 532 L292 514 L300 576',
]
const nker = [
  'M569 342 V528',
  'M569 412 C569 362 604 336 648 336 C688 336 706 360 706 404 V528',
  'M810 206 V530',
  'M944 338 L830 418',
  'M854 446 L956 536',
  'M1024 414 H1168 C1168 356 1136 329 1096 329 C1046 329 1022 368 1022 424 C1022 494 1054 528 1098 528 C1130 528 1156 520 1176 508',
  'M1259 346 V520',
  'M1259 404 C1260 366 1298 350 1334 352 C1356 353 1372 359 1388 354',
]
const solution = [
  'M300 826 C292 812 278 806 260 806 C236 806 220 818 220 836 C220 854 238 860 260 864 C286 869 304 878 304 895 C304 910 286 916 262 916 C240 916 222 908 212 896',
  'M410 812 C438 812 460 832 460 859 C460 886 438 906 410 906 C382 906 360 886 360 859 C360 832 382 812 410 812 Z',
  'M512 814 V902 H588',
  'M627 814 V874 C627 900 645 914 664 914 C686 914 701 900 701 874 V814',
  'M730 822 H842 M776 824 V906',
  'M883 818 V902',
  'M997 809 C1023 809 1044 832 1044 861 C1044 890 1023 913 997 913 C971 913 950 890 950 861 C950 832 971 809 997 809 Z',
  'M1105 904 V818 L1189 902 V804',
]
// Buen under «Anker»: tykkest på midten, avrundet i endene.
const bue =
  'M54.2 889.2 C386.9 592.5 911.6 581.4 1287.8 800.8 L1289.6 801.8 L1295.6 803 L1301.4 801.3 L1305.8 797.2 L1307.9 791.5 L1307.2 785.4 L1303.8 780.4 L1302.2 779.2 C930.7 514 355.8 530 35.8 870.8 L34.5 872.4 L32.2 878 L32.6 884 L35.8 889.2 L41 892.4 L47 892.8 L52.6 890.5 Z'

const strek = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function Anker() {
  return (
    <g {...strek}>
      <path d={leggOgBein} strokeWidth={48} />
      <path d={stokk} strokeWidth={36} />
      {armer.map((d) => (
        <path key={d} d={d} strokeWidth={40} />
      ))}
    </g>
  )
}

function Nker() {
  return (
    <g {...strek} strokeWidth={36}>
      {nker.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
  )
}

function Solution({ bredde, transform }: { bredde: number; transform?: string }) {
  return (
    <g {...strek} strokeWidth={bredde} transform={transform}>
      {solution.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
  )
}

// SOLUTION skaleres i den liggende varianten, så versalhøyden blir lik
// x-høyden i «nker». Strektykkelsen holdes lik.
const S = 1.745

const varianter = {
  /** Hele logoen, slik den er tegnet. */
  hel: {
    viewBox: '18 4 1396 932',
    innhold: (
      <>
        <Anker />
        <Nker />
        <Solution bredde={26} />
        <path d={bue} fill="currentColor" />
      </>
    ),
  },
  /** På én linje, til toppmenyen der hele logoen blir for liten. */
  liggende: {
    viewBox: '30 4 3280 720',
    innhold: (
      <>
        <Anker />
        <Nker />
        <Solution bredde={36 / S} transform={`translate(1199 -1071) scale(${S})`} />
      </>
    ),
  },
  /** Bare ankeret. */
  merke: {
    viewBox: '18 4 520 720',
    innhold: <Anker />,
  },
}

export function Logo({
  variant = 'liggende',
  className,
  dekorativ = false,
}: {
  variant?: keyof typeof varianter
  className?: string
  /** Sett når logoen står i en lenke som allerede har et navn. */
  dekorativ?: boolean
}) {
  const v = varianter[variant]
  return (
    <svg
      viewBox={v.viewBox}
      className={`${styles.logo} ${className ?? ''}`}
      role={dekorativ ? undefined : 'img'}
      aria-label={dekorativ ? undefined : firma.navn}
      aria-hidden={dekorativ ? true : undefined}
      focusable="false"
    >
      {v.innhold}
    </svg>
  )
}
