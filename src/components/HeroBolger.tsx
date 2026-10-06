'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { Arbeidermelding } from './bolgeArbeider'
import { Bolgeanimasjon, type Lerretsmaal } from './bolgetegning'
import styles from './HeroBolger.module.css'

type Styring = {
  maal: (m: Lerretsmaal) => void
  kjor: (ja: boolean) => void
  stopp: () => void
}

const ROLIG = '(prefers-reduced-motion: reduce)'

function abonnerPaaRolig(varsle: () => void) {
  const mq = matchMedia(ROLIG)
  mq.addEventListener('change', varsle)
  return () => mq.removeEventListener('change', varsle)
}

/** Tegner på hovedtråden. Brukes bare der nettleseren ikke kan tegne i en egen tråd. */
function paaHovedtraden(flate: HTMLElement, maal: Lerretsmaal): Styring | null {
  const lerret = document.createElement('canvas')
  const ctx = lerret.getContext('2d')
  if (!ctx) return null
  flate.appendChild(lerret)
  const animasjon = new Bolgeanimasjon(lerret, ctx, maal)
  return {
    maal: (m) => animasjon.settMaal(m),
    kjor: (ja) => animasjon.kjor(ja),
    stopp: () => {
      animasjon.kjor(false)
      lerret.remove()
    },
  }
}

/** Tegner i en egen tråd, så scrolling og klikk aldri venter på animasjonen. */
function iEgenTraad(flate: HTMLElement, maal: Lerretsmaal, vedFeil: () => void): Styring | null {
  if (typeof Worker !== 'function' || !('transferControlToOffscreen' in HTMLCanvasElement.prototype)) return null
  // Nytt lerret hver gang: et lerret kan bare gis bort til en tråd én gang.
  const lerret = document.createElement('canvas')
  flate.appendChild(lerret)
  const arbeider = new Worker(new URL('./bolgeArbeider.ts', import.meta.url))
  const send = (m: Arbeidermelding, overfor: Transferable[] = []) => arbeider.postMessage(m, overfor)
  const avlastet = lerret.transferControlToOffscreen()
  send({ type: 'start', lerret: avlastet, ...maal }, [avlastet])
  arbeider.addEventListener('error', vedFeil)
  return {
    maal: (m) => send({ type: 'maal', ...m }),
    kjor: (ja) => send({ type: 'kjor', ja }),
    stopp: () => {
      arbeider.terminate()
      lerret.remove()
    },
  }
}

/**
 * Levende bakgrunn: et bånd av svarte bølgestreker som beveger seg sakte.
 * Står stille når den er utenfor skjermen, når fanen er skjult, når
 * brukeren har bedt om mindre bevegelse, og når noen trykker på pause.
 */
export function HeroBolger() {
  const flateRef = useRef<HTMLDivElement>(null)
  const [pauset, settPauset] = useState(false)
  const rolig = useSyncExternalStore(abonnerPaaRolig, () => matchMedia(ROLIG).matches, () => false)
  const pausetRef = useRef(false)
  const oppdaterRef = useRef<() => void>(() => {})

  useEffect(() => {
    const flate = flateRef.current
    if (!flate) return
    const maal = (): Lerretsmaal => ({
      bredde: Math.round(flate.clientWidth),
      hoyde: Math.round(flate.clientHeight),
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    })

    let synlig = true
    let styring: Styring | null = null
    const oppdater = () =>
      styring?.kjor(synlig && !document.hidden && !pausetRef.current && !matchMedia(ROLIG).matches)

    // Klarer ikke tråden å starte, tegner vi på hovedtråden i stedet.
    const byttTilHovedtraden = () => {
      styring?.stopp()
      styring = paaHovedtraden(flate, maal())
      oppdater()
    }
    styring = iEgenTraad(flate, maal(), byttTilHovedtraden) ?? paaHovedtraden(flate, maal())
    oppdaterRef.current = oppdater

    const storrelse = new ResizeObserver(() => styring?.maal(maal()))
    storrelse.observe(flate)
    const synsfelt = new IntersectionObserver(([o]) => {
      synlig = o.isIntersecting
      oppdater()
    })
    synsfelt.observe(flate)
    const bevegelsesvalg = matchMedia(ROLIG)
    document.addEventListener('visibilitychange', oppdater)
    bevegelsesvalg.addEventListener('change', oppdater)
    oppdater()

    return () => {
      storrelse.disconnect()
      synsfelt.disconnect()
      document.removeEventListener('visibilitychange', oppdater)
      bevegelsesvalg.removeEventListener('change', oppdater)
      oppdaterRef.current = () => {}
      styring?.stopp()
    }
  }, [])

  useEffect(() => {
    pausetRef.current = pauset
    oppdaterRef.current()
  }, [pauset])

  return (
    <div className={styles.bolger}>
      <div ref={flateRef} className={styles.flate} aria-hidden="true" />
      {!rolig && (
        <button
          type="button"
          className={styles.pause}
          aria-pressed={pauset}
          title={pauset ? 'Start bevegelsen' : 'Stopp bevegelsen'}
          onClick={() => settPauset((p) => !p)}
        >
          <span className="skjult">Stopp bevegelsen i bakgrunnen</span>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
            {pauset ? (
              <path d="M3.5 1.5v11l9-5.5z" fill="currentColor" />
            ) : (
              <path d="M3.5 2v10M10.5 2v10" stroke="currentColor" strokeWidth="2.4" />
            )}
          </svg>
        </button>
      )}
    </div>
  )
}
