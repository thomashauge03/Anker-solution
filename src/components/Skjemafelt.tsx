'use client'

import type { HTMLInputAutoCompleteAttribute, HTMLAttributes } from 'react'

type Felles = {
  id: string
  etikett: string
  verdi: string
  endre: (verdi: string) => void
  feil?: string
  hjelp?: string
  valgfri?: boolean
  maks?: number
}

function beskrivelse(id: string, feil?: string, hjelp?: string) {
  return [hjelp && `${id}-hjelp`, feil && `${id}-feil`].filter(Boolean).join(' ') || undefined
}

function Etikett({ id, etikett, valgfri }: { id: string; etikett: string; valgfri?: boolean }) {
  return (
    <label htmlFor={id}>
      {etikett}
      {valgfri && <span className="dempet"> (valgfritt)</span>}
    </label>
  )
}

function Tillegg({ id, feil, hjelp }: { id: string; feil?: string; hjelp?: string }) {
  return (
    <>
      {hjelp && (
        <p id={`${id}-hjelp`} className="hjelpetekst">
          {hjelp}
        </p>
      )}
      {feil && (
        <p id={`${id}-feil`} className="feilmelding">
          {feil}
        </p>
      )}
    </>
  )
}

export function Tekstfelt({
  id,
  etikett,
  verdi,
  endre,
  feil,
  hjelp,
  valgfri,
  maks = 120,
  type = 'text',
  autoComplete,
  inputMode,
  className,
}: Felles & {
  type?: 'text' | 'email' | 'tel'
  autoComplete?: HTMLInputAutoCompleteAttribute
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
  className?: string
}) {
  return (
    <div className={`felt ${className ?? ''}`}>
      <Etikett id={id} etikett={etikett} valgfri={valgfri} />
      <input
        id={id}
        name={id}
        type={type}
        className="inndata"
        value={verdi}
        onChange={(e) => endre(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maks}
        aria-invalid={feil ? true : undefined}
        aria-describedby={beskrivelse(id, feil, hjelp)}
      />
      <Tillegg id={id} feil={feil} hjelp={hjelp} />
    </div>
  )
}

export function Tekstomraade({ id, etikett, verdi, endre, feil, hjelp, valgfri, maks = 2000 }: Felles) {
  return (
    <div className="felt">
      <Etikett id={id} etikett={etikett} valgfri={valgfri} />
      <textarea
        id={id}
        name={id}
        className="inndata"
        value={verdi}
        onChange={(e) => endre(e.target.value)}
        maxLength={maks}
        rows={5}
        aria-invalid={feil ? true : undefined}
        aria-describedby={beskrivelse(id, feil, hjelp)}
      />
      <Tillegg id={id} feil={feil} hjelp={hjelp} />
    </div>
  )
}

/** Skjult felt for roboter. Mennesker ser det ikke og fyller det ikke ut. */
export function Honningkrukke({ verdi, endre }: { verdi: string; endre: (v: string) => void }) {
  return (
    <div className="honningkrukke" aria-hidden="true">
      <label htmlFor="nettside">Nettside</label>
      <input
        id="nettside"
        name="nettside"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={verdi}
        onChange={(e) => endre(e.target.value)}
      />
    </div>
  )
}
