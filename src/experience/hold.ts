import { beats } from '../content/beats'
import { cue } from './cue'

// The beats' text held still (docs/DECISIONS.md, D46). Without the scene the text scrolls with
// the page, each beat's in its own section. With it, each beat's text is held in one place on
// the window instead of rolling up it like the credits of a film, and the story swaps them: the
// heading comes in once the camera has arrived, then the lines one after another, each with its
// pin in the city (./cue.ts). The sections stay where they are and keep the scroll as long as it
// was.
//
// The opening line is left to scroll: it crumbles where it stands (D37). A text too tall to be
// held in the window scrolls too, so none of it is ever out of reach.

/** How far the heading and the lines rise as they come in, in CSS pixels. */
const DRIFT = 8
/** Room a held text keeps above it, in CSS pixels, so the top of the window stays the city's. */
const ROOM = 96

type Shown = { element: HTMLElement; opacity: number; drift: number }

type Held = {
  index: number
  section: HTMLElement
  panel: Shown
  lines: Shown[]
}

const shown = (element: HTMLElement): Shown => ({ element, opacity: -1, drift: NaN })

/** Writes how far out an element is, only when it changed. */
function show(item: Shown, opacity: number, drift: number) {
  const o = Math.round(opacity * 100) / 100
  if (o !== item.opacity) {
    item.element.style.opacity = o === 1 ? '' : String(o)
    item.opacity = o
  }
  const d = Math.round(drift * 2) / 2
  if (d !== item.drift) {
    item.element.style.translate = d ? `0 ${d}px` : ''
    item.drift = d
  }
}

/** Holds the beats' text in place. `place` sets what shows at `beat`; call it on every frame. */
export function holdText() {
  const root = document.documentElement
  const held: Held[] = []
  for (const section of document.querySelectorAll<HTMLElement>('[data-beat]')) {
    const index = beats.indexOf(section.dataset.beat as (typeof beats)[number])
    const panel = section.querySelector<HTMLElement>('[data-panel]')
    if (index < 1 || !panel) continue
    const lines = Array.from(panel.querySelectorAll<HTMLElement>('.claims > li'), shown)
    held.push({ index, section, panel: shown(panel), lines })
  }
  root.classList.add('held')

  // A text taller than the window, less the room above it, scrolls as it would without the scene.
  const fit = () => {
    for (const { panel } of held)
      panel.element.classList.toggle('loose', panel.element.offsetHeight > innerHeight - ROOM)
  }
  fit()
  const resized = new ResizeObserver(fit)
  for (const { panel } of held) resized.observe(panel.element)
  addEventListener('resize', fit)

  // A link reached by the keyboard in a text that is not showing: scroll to its beat.
  const focused = (event: FocusEvent) => {
    const item = held.find(({ panel }) => panel.element.contains(event.target as Node))
    if (!item || item.panel.element.classList.contains('loose') || item.panel.opacity > 0.5) return
    scrollTo({ top: item.section.offsetTop + item.section.offsetHeight - innerHeight })
  }
  document.addEventListener('focusin', focused)

  function place(beat: number, still: boolean) {
    for (const { index, panel, lines } of held) {
      if (panel.element.classList.contains('loose')) {
        show(panel, 1, 0)
        for (const line of lines) show(line, 1, 0)
        continue
      }
      const heading = cue(beat, index, -1, lines.length, still)
      const leaving = beat > index
      show(panel, heading, leaving ? -(1 - heading) * DRIFT : (1 - heading) * DRIFT)
      // Text that is not showing cannot be pointed at, and does not catch the pointer meant for
      // the city. A screen reader still reads it: it reads the page, not the window.
      panel.element.style.pointerEvents = heading < 0.5 ? 'none' : ''
      lines.forEach((line, k) => {
        // Leaving, the lines go with the heading, so they are left as they are.
        const out = leaving ? 1 : cue(beat, index, k, lines.length, still)
        show(line, out, (1 - out) * DRIFT * 0.75)
      })
    }
  }

  return {
    place,
    dispose() {
      resized.disconnect()
      removeEventListener('resize', fit)
      document.removeEventListener('focusin', focused)
      root.classList.remove('held')
      for (const { panel, lines } of held) {
        panel.element.classList.remove('loose')
        for (const item of [panel, ...lines]) {
          item.element.style.opacity = item.element.style.translate = ''
        }
        panel.element.style.pointerEvents = ''
      }
    },
  }
}

export type HeldText = ReturnType<typeof holdText>
