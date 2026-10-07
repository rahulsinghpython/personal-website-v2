// Progress: how far through the story the visitor is, from 0 (Found) to 1 (Contact).
//
// It changes on every frame while the page scrolls, so it is a plain value read inside the frame
// loop and never goes through React (see "State" in docs/ARCHITECTURE.md).

export const progress = {
  /** Where the scroll position says the story is. */
  target: 0,
  /** Where the scene is. It chases the target, which is what makes the Machine feel smooth. */
  eased: 0,
}

/** The scroll position at which each beat's text has fully arrived, in story order. */
let arrivals: number[] = []

/**
 * Finds where each beat arrives: the scroll position that puts the bottom of its section at the
 * bottom of the window, which is where its text sits. Measured from the sections and not taken
 * as an even share of the page, so the scene stays in step with the text when one beat's section
 * is taller than another's, as on a phone.
 */
export function measure() {
  arrivals = Array.from(document.querySelectorAll<HTMLElement>('[data-beat]'), (section) =>
    Math.max(0, section.offsetTop + section.offsetHeight - innerHeight),
  )
}

/** Progress at the current scroll position. */
export function readScroll(): number {
  const last = arrivals.length - 1
  if (last < 1) return 0
  let beat = 0
  while (beat < last - 1 && scrollY >= arrivals[beat + 1]!) beat++
  const from = arrivals[beat]!
  const to = arrivals[beat + 1]!
  const within = to > from ? (scrollY - from) / (to - from) : scrollY >= to ? 1 : 0
  return (beat + Math.min(1, Math.max(0, within))) / last
}
