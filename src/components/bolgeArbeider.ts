// Egen tråd for den levende bakgrunnen. All tegning skjer her, så
// hovedtråden — scrolling og klikk — aldri venter på animasjonen.
import { Bolgeanimasjon, type Lerretsmaal } from './bolgetegning'

export type Arbeidermelding =
  | ({ type: 'start'; lerret: OffscreenCanvas } & Lerretsmaal)
  | ({ type: 'maal' } & Lerretsmaal)
  | { type: 'kjor'; ja: boolean }

let animasjon: Bolgeanimasjon | null = null

addEventListener('message', (e: MessageEvent<Arbeidermelding>) => {
  const m = e.data
  if (m.type === 'start') {
    const ctx = m.lerret.getContext('2d')
    if (ctx) animasjon = new Bolgeanimasjon(m.lerret, ctx, { bredde: m.bredde, hoyde: m.hoyde, dpr: m.dpr })
  } else if (m.type === 'maal') {
    animasjon?.settMaal({ bredde: m.bredde, hoyde: m.hoyde, dpr: m.dpr })
  } else if (m.type === 'kjor') {
    animasjon?.kjor(m.ja)
  }
})
