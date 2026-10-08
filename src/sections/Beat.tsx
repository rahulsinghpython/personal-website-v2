import type { ReactNode } from 'react'
import type { BeatId } from '../content/beats'

/**
 * One step of the story. Text sits at the edge; the centre is left for the Machine. `centred` is
 * for the opening line, which stands in the middle of the window because there is no Machine yet:
 * it is what the Machine is made from (docs/DECISIONS.md, D37).
 */
export function Beat({
  id,
  centred = false,
  children,
}: {
  id: BeatId
  centred?: boolean
  children: ReactNode
}) {
  return (
    <section
      id={id}
      data-beat={id}
      aria-labelledby={`${id}-title`}
      className={`flex min-h-svh flex-col px-6 py-16 sm:px-10 ${
        centred ? 'items-center justify-center text-center' : 'justify-end'
      }`}
    >
      <div className="max-w-xl">{children}</div>
    </section>
  )
}
