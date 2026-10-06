import styles from './Tegning.module.css'

// Teknisk tegning av en minigraver, sett fra siden. Streker tegnes opp når
// siden lastes (pathLength=1 gjør animasjonen lik for alle former), og
// målsetting, henvisninger og tegningshode kommer til slutt.
//
// Tallene i målsettingen hører til MG-17 i src/data/maskiner.ts.

type Del = { d: string; forsinkelse: number }

function Strek({ d, forsinkelse, tykk }: Del & { tykk?: boolean }) {
  return (
    <path
      d={d}
      pathLength={1}
      className={`${styles.strek} ${tykk ? styles.tykk : ''}`}
      style={{ ['--d' as string]: `${forsinkelse}ms` }}
    />
  )
}

function Sirkel({ x, y, r, forsinkelse }: { x: number; y: number; r: number; forsinkelse: number }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={r}
      pathLength={1}
      className={styles.strek}
      style={{ ['--d' as string]: `${forsinkelse}ms` }}
    />
  )
}

// Bakkeskravur: korte skrå streker under bakkelinja.
const skravur = Array.from({ length: 47 }, (_, i) => 44 + i * 12)

export function Tegning() {
  return (
    <figure className={styles.figur}>
      <svg
        viewBox="0 0 640 440"
        className={styles.svg}
        role="img"
        aria-labelledby="tegning-tittel"
      >
        <title id="tegning-tittel">
          Teknisk tegning av minigraver MG-17 sett fra siden, 2 400 mm høy og 3 800 mm lang.
        </title>

        {/* Bakke */}
        <g className={styles.bakke}>
          <path d="M30 340H612" />
          {skravur.map((x) => (
            <path key={x} d={`M${x} 340l-8 8`} className={styles.tynn} />
          ))}
        </g>

        {/* Understell */}
        <g>
          <Strek d="M169 302H291a19 19 0 0 1 0 38H169a19 19 0 0 1 0-38Z" forsinkelse={0} tykk />
          <Strek d="M169 309H291a12 12 0 0 1 0 24H169a12 12 0 0 1 0-24Z" forsinkelse={120} />
          <Sirkel x={169} y={321} r={12} forsinkelse={220} />
          <Sirkel x={169} y={321} r={4} forsinkelse={260} />
          <Sirkel x={291} y={321} r={12} forsinkelse={220} />
          <Sirkel x={291} y={321} r={4} forsinkelse={260} />
          <Sirkel x={204} y={327} r={5} forsinkelse={300} />
          <Sirkel x={230} y={327} r={5} forsinkelse={330} />
          <Sirkel x={256} y={327} r={5} forsinkelse={360} />
          {/* Skjær */}
          <Strek d="M296 314 326 318" forsinkelse={380} />
          <Strek d="M326 300H338V340H322Q332 322 326 300Z" forsinkelse={400} tykk />
        </g>

        {/* Overvogn */}
        <g>
          <Strek d="M190 292H280V302H190Z" forsinkelse={420} />
          <Strek d="M300 292H164C150 292 140 284 140 270V262C140 255 145 250 152 250H300Z" forsinkelse={480} tykk />
          <Strek d="M152 262H182M152 268H182M152 274H182" forsinkelse={600} />
        </g>

        {/* Førerhus */}
        <g>
          <Strek d="M190 250V112Q190 104 198 104H254Q262 104 264 112L280 196V250" forsinkelse={620} tykk />
          <Strek d="M198 116H252L267 195V238H198Z" forsinkelse={760} />
          <Strek d="M232 116V238M238 182H246" forsinkelse={860} />
        </g>

        {/* Bom med sylinder */}
        <g>
          <Strek d="M300 252H318L322 288H300Z" forsinkelse={820} />
          <Strek d="M306 254Q352 160 422 116L440 136Q372 186 326 272Z" forsinkelse={880} tykk />
          <Strek d="M324.3 288.5 349.6 244.5 341 239.5 315.7 283.5Z" forsinkelse={1000} />
          <Strek d="M345.3 242 366 206" forsinkelse={1060} />
          <Sirkel x={316} y={263} r={5} forsinkelse={1080} />
        </g>

        {/* Stikke med sylinder */}
        <g>
          <Strek d="M419.5 100.8 436.5 95.2 491.7 269.8 478.4 274.2Z" forsinkelse={1040} tykk />
          <Strek d="M381 143.4 401 125.4 395 118.6 375 136.6Z" forsinkelse={1140} />
          <Strek d="M398 122 424 99" forsinkelse={1180} />
          <Sirkel x={432} y={126} r={6} forsinkelse={1200} />
        </g>

        {/* Skuffe */}
        <g>
          <Strek d="M478 266C506 262 524 280 518 304L510 324 488 328 491 314C475 304 470 284 478 266Z" forsinkelse={1200} tykk />
          <Strek d="M481 252 503 264" forsinkelse={1280} />
          <Sirkel x={485} y={272} r={4} forsinkelse={1300} />
          <path d="M488 328 484 335 493 330ZM498 326.5 496 333.5 504 328Z" className={styles.tenner} />
        </g>

        {/* Målsetting: høyde */}
        <g className={styles.maal}>
          <path d="M100 104H182M100 340H146" className={styles.tynn} />
          <path d="M108 104V340" />
          <path d="M103 109 113 99M103 345 113 335" />
          <text x="98" y="222" transform="rotate(-90 98 222)" textAnchor="middle">
            2 400
          </text>
        </g>

        {/* Målsetting: lengde */}
        <g className={styles.maal}>
          <path d="M140 296V386M520 318V386" className={styles.tynn} />
          <path d="M140 378H520" />
          <path d="M135 383 145 373M515 383 525 373" />
          <text x="330" y="371" textAnchor="middle">
            3 800
          </text>
        </g>

        {/* Henvisninger */}
        <g className={styles.henvisning}>
          <path d="M226 132 172 64" className={styles.tynn} />
          <circle cx="166" cy="56" r="10" />
          <text x="166" y="60" textAnchor="middle">1</text>

          <path d="M372 196 372 64" className={styles.tynn} />
          <circle cx="372" cy="56" r="10" />
          <text x="372" y="60" textAnchor="middle">2</text>

          <path d="M462 182 532 150" className={styles.tynn} />
          <circle cx="541" cy="146" r="10" />
          <text x="541" y="150" textAnchor="middle">3</text>

          <path d="M519 296 566 272" className={styles.tynn} />
          <circle cx="575" cy="268" r="10" />
          <text x="575" y="272" textAnchor="middle">4</text>
        </g>

        {/* Tegningshode */}
        <g className={styles.hode}>
          <path d="M420 396H630V436H420ZM540 396V436M420 416H630" className={styles.tynn} />
          <text x="428" y="410" className={styles.hodeStor}>MG-17</text>
          <text x="428" y="430">MINIGRAVER 1,7 T</text>
          <text x="548" y="410">M 1:25</text>
          <text x="548" y="430">MÅL I MM</text>
          <text x="32" y="410">1 FØRERHUS · 2 BOM</text>
          <text x="32" y="430">3 STIKKE · 4 SKUFFE</text>
        </g>
      </svg>
    </figure>
  )
}
