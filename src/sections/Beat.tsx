import type { ReactNode } from 'react'
import type { BeatId } from '../content/beats'

/** One step of the story. Text sits at the edge; the centre is left for the Machine. */
export function Beat({ id, children }: { id: BeatId; children: ReactNode }) {
  return (
    <section
      id={id}
      data-beat={id}
      aria-labelledby={`${id}-title`}
      className="flex min-h-svh flex-col justify-end px-6 py-16 sm:px-10"
    >
      <div className="max-w-xl">{children}</div>
    </section>
  )
}
