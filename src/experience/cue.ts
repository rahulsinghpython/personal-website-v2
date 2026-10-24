// When a beat's words come and go (docs/DECISIONS.md, D46). The text on the page and the pins in
// the city keep one time, so each claim's line and its pin arrive together.
//
// On the way to a beat the camera moves first and the city does what it does, rising or lighting.
// Only near the end of the way does the beat's heading come in, then its lines one after another,
// each with its pin. Leaving, they stay a moment, then all go together, early on the way to the
// next beat.

/** Share of the way to the next beat the words stay whole past their beat, so a scroll that rests
 * a little beyond it still reads (D47), and the share over which they then fade. */
const STAY = 0.12
const LEAVE = 0.3
/** Share of the way to a beat at which its heading starts to come in, and how long it takes. */
const HEADING = 0.6
const HEADING_TAKES = 0.2
/** Share of the way at which the first line starts, how far behind it the last starts, and how long each takes. */
const LINES = 0.7
const LINES_SPREAD = 0.16
const LINE_TAKES = 0.12

export const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

/**
 * How far out a beat's word is at `beat`, from 0 to 1. `at` is the beat's place in the story;
 * `index` is which of its `count` lines, or -1 for its heading. With reduced motion, whole beats
 * cut in and out, halfway.
 */
export function cue(beat: number, at: number, index: number, count: number, still: boolean) {
  const away = beat - at
  if (still) return Math.abs(away) < 0.5 ? 1 : 0
  if (away >= 0) return 1 - smooth((away - STAY) / LEAVE)
  const coming = 1 + away
  if (index < 0) return smooth((coming - HEADING) / HEADING_TAKES)
  return smooth((coming - LINES - (LINES_SPREAD * index) / Math.max(1, count)) / LINE_TAKES)
}
