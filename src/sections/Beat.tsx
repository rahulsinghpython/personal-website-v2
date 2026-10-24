import type { ReactNode } from 'react'
import type { BeatId } from '../content/beats'

/**
 * One step of the story. Text sits at the edge; the rest of the window is left for the city.
 * `centred` is for the opening line, which stands in the middle of the window because there is
 * no city yet: it is what the city is made from (docs/DECISIONS.md, D37). `banded` lays a dark
 * band behind the text, so a job's lines read over the city lit behind them (D45). With the scene,
 * the text in `data-panel` is held still on the window and swapped as the story moves (D46).
 * `dwell` gives the beat more scroll, spent on its claims arriving (src/state/progress.ts).
 */
export function Beat({
  id,
  centred = false,
  banded = false,
  dwell = false,
  children,
}: {
  id: BeatId
  centred?: boolean
  banded?: boolean
  dwell?: boolean
  children: ReactNode
}) {
  return (
    <section
      id={id}
      data-beat={id}
      data-dwell={dwell || undefined}
      aria-labelledby={`${id}-title`}
      className={`flex flex-col px-6 py-16 sm:px-10 ${dwell ? 'min-h-[130svh]' : 'min-h-svh'} ${
        centred ? 'items-center justify-center text-center' : 'justify-end'
      } ${banded ? 'band' : ''}`}
    >
      <div data-panel className="max-w-xl">
        {children}
      </div>
    </section>
  )
}
