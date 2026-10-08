import { CRUMBLE, seeded } from './machine/points'

// The opening line as ink: where the letters of the Found heading are on the page, so that points
// can stand on them, and the line can be rubbed out as those points leave (docs/DECISIONS.md, D37).
//
// The heading stays what it is, real text in the page. Nothing here draws it; this only reads
// where the browser has put it.

export type Ink = {
  line: HTMLElement
  /**
   * Three numbers a grain: how far across and down from the line's corner it stands, in CSS
   * pixels, and when it leaves, from 0 to 1.
   */
  grains: Float32Array
  /** Rubs the line out from its left end to its right. Held still, and moved by `rubOut`. */
  rub: Animation
}

/** How finely the letters are read: this many samples across one CSS pixel. */
const DETAIL = 4
/** How far across the line the rubbing-out fades in, in CSS pixels. */
const SOFT = 14
/** The length of the rubbing-out as the browser counts it. Nothing plays it, so any number does. */
const RUB = 1000

/** How far the line is rubbed out, as a length a browser can move smoothly. */
const RUBBED = '--rubbed'
let registered = false

/**
 * An animation that rubs `line` out from `left` to `right`, in CSS pixels from its corner. It is
 * never played: `rubOut` sets how far along it is. Moving it that way writes no style and makes
 * no string, so it can be done on every frame. It moves a length and not the mask itself,
 * because a mask named in a keyframe is worked out once and does not follow the length.
 */
function rubber(line: HTMLElement, left: number, right: number) {
  if (!registered) {
    CSS.registerProperty({ name: RUBBED, syntax: '<length>', inherits: false, initialValue: '0px' })
    registered = true
  }
  const rub = line.animate([{ [RUBBED]: `${left - SOFT}px` }, { [RUBBED]: `${right}px` }], {
    duration: RUB,
    fill: 'both',
  })
  rub.cancel()
  return rub
}

/** The line seen through a gap that starts where it has been rubbed out to. */
const MASK = `linear-gradient(to right, transparent var(${RUBBED}), #000 calc(var(${RUBBED}) + ${SOFT}px))`

/**
 * Finds `count` places on the ink of `line`. Each letter is drawn where the browser drew it, in
 * the font the browser used, onto a canvas that is never shown, and the places are picked from
 * the pixels that came out inked. Null if there is no ink to find.
 */
export function sampleInk(line: HTMLElement, count: number): Ink | null {
  const box = line.getBoundingClientRect()
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(box.width * DETAIL)
  canvas.height = Math.ceil(box.height * DETAIL)
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context || !canvas.width || !canvas.height || count < 1) return null
  if (!('registerProperty' in CSS)) return null

  const style = getComputedStyle(line)
  context.scale(DETAIL, DETAIL)
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  // A letter's box starts at the top of the font, and a canvas draws from the baseline.
  const ascent = context.measureText('H').fontBoundingBoxAscent
  const capitals = style.textTransform === 'uppercase'
  const letter = document.createRange()
  const texts = document.createTreeWalker(line, NodeFilter.SHOW_TEXT)
  for (let node = texts.nextNode(); node; node = texts.nextNode()) {
    const text = node.textContent ?? ''
    for (let i = 0; i < text.length; i++) {
      letter.setStart(node, i)
      letter.setEnd(node, i + 1)
      const at = letter.getBoundingClientRect()
      if (!at.width) continue
      const drawn = capitals ? text[i]!.toUpperCase() : text[i]!
      context.fillText(drawn, at.left - box.left, at.top - box.top + ascent)
    }
  }

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  const inked: number[] = []
  let left = canvas.width
  let right = 0
  for (let i = 0; i < canvas.width * canvas.height; i++) {
    if (pixels[i * 4 + 3]! < 128) continue
    inked.push(i)
    left = Math.min(left, i % canvas.width)
    right = Math.max(right, i % canvas.width)
  }
  if (!inked.length) return null

  const random = seeded(3)
  const grains = new Float32Array(count * 3)
  const width = Math.max(1, right - left)
  for (let i = 0; i < count; i++) {
    const pixel = inked[Math.floor(random() * inked.length)]!
    const x = (pixel % canvas.width) + random()
    const y = Math.floor(pixel / canvas.width) + random()
    grains[i * 3] = x / DETAIL
    grains[i * 3 + 1] = y / DETAIL
    grains[i * 3 + 2] = (CRUMBLE.sweep * (x - left)) / width + (1 - CRUMBLE.sweep) * random()
  }
  return { line, grains, rub: rubber(line, left / DETAIL, (right + 1) / DETAIL) }
}

/**
 * Rubs the line out as far as it has crumbled, from its left end, a moment ahead of the first
 * grain to leave each letter: what is left standing there is the grains. At 0 the line is as the
 * page drew it, with nothing of ours on it.
 */
export function rubOut(ink: Ink, crumble: number) {
  const { rub } = ink
  if (crumble <= 0) {
    if (rub.playState !== 'idle') {
      rub.cancel()
      ink.line.style.maskImage = ''
    }
    return
  }
  if (rub.playState === 'idle') {
    rub.pause()
    ink.line.style.maskImage = MASK
  }
  // The first grain to leave a letter goes when the crumbling has reached this share of the way.
  rub.currentTime = RUB * Math.min(1, crumble / (CRUMBLE.sweep * (1 - CRUMBLE.span)))
}
