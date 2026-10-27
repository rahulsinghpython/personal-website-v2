import { Vector3, type PerspectiveCamera } from 'three'
import { beats } from '../../content/beats'
import { claimId, eras, type PinId } from '../../content/eras'
import { cue } from '../cue'
import { planCity, VIADUCT, type Block } from './city'
import { planePinAt } from './plane'
import type { CityValues, Layout } from './layouts'
import type { Vec2 } from './plan'

// The pins (docs/DECISIONS.md, D45): each claim of a job pinned to its proof in the city, like a
// surveyor's notes on a scan. The page says every claim; a pin only repeats a few of its words
// where they can be seen to be true. They are HTML, placed over the canvas on every frame the
// scene draws by projecting a point in the city to the window, and never go through React.
//
// A job's pins light one after another as its beat arrives, in the scroll that already brings it
// in, each with its line on the page (../cue.ts), and at rest they are all out. Pointing at a
// claim, on the page or in the city, opens its pin in place: the corner nearest the pin stays
// put, so it never moves out from under the pointer.

type Vec3 = [x: number, y: number, z: number]

/** Which way a pin's tag goes from it on screen: north-east, north-west, south-east, south-west. */
type Side = 'ne' | 'nw' | 'se' | 'sw'

/** Where each pin's tag goes, chosen by eye from each beat's pose so the tags keep apart. */
const SIDES: Record<PinId, Side> = {
  streets: 'se',
  services: 'sw',
  legacy: 'sw',
  cloud: 'se',
  mesh: 'ne',
  roofs: 'se',
  hall: 'sw',
  platform: 'nw',
  blk: 'nw',
  database: 'nw',
  tuition: 'se',
  viaduct: 'se',
  crown: 'nw',
  tower: 'ne',
  charts: 'nw',
  rollout: 'se',
  plane: 'sw',
}

/** The pin that stands for a whole job at the Whole beat. */
const JOB_PINS: Record<(typeof eras)[number]['part'], PinId> = {
  core: 'streets',
  scanner: 'mesh',
  rings: 'blk',
  lens: 'crown',
}

/** How high over a building's roof its pin stands. */
const OVER = 0.03

/** Where the pins are in the city, worked out from its plan so they move with it. */
export function pinPlaces(layout: Layout, values: CityValues) {
  const plan = planCity(layout, values)
  const top = (block: Block, up = OVER): Vec3 => [block.x, block.h + up, block.z]
  const taken = new Set<Block>()
  const nearest = (blocks: Block[], [x, z]: Vec2) => {
    let best: Block | undefined
    for (const block of blocks) {
      if (taken.has(block)) continue
      if (!best || Math.hypot(block.x - x, block.z - z) < Math.hypot(best.x - x, best.z - z))
        best = block
    }
    taken.add(best!)
    return best!
  }
  const tallest = plan.cbd.reduce((a, b) => (b.h > a.h ? b : a))
  taken.add(tallest)

  // The Science Centre's pieces, as src/experience/city/landmarks.ts draws them, never turned.
  const size = values.landmarks.size!
  const [sx, sz] = layout.landmarks.science.at
  const science = (x: number, y: number, z: number): Vec3 => [
    sx + x * size,
    y * size,
    sz + z * size,
  ]

  // The database's five systems: the blocks round BLK 2024, and its pin over the middle of them.
  const spread = Array.from({ length: 5 }, () =>
    top(nearest(plan.heartland, [plan.rings.x, plan.rings.z])),
  )
  const middle = spread.reduce(
    (sum, [x, y, z]) => [sum[0] + x / 5, sum[1] + y / 5, sum[2] + z / 5],
    [0, 0, 0],
  )

  const viaduct = layout.mrt.reduce((a, b) =>
    Math.hypot(b[0] - 1.3, b[1] - 2.4) < Math.hypot(a[0] - 1.3, a[1] - 2.4) ? b : a,
  )

  const at: Record<PinId, Vec3> = {
    streets: [-1.85, 0.02, -0.5],
    services: top(nearest(plan.cbd, [-2.2, -0.3])),
    legacy: top(nearest(plan.cbd, [-1.2, -0.2])),
    cloud: top(tallest),
    mesh: science(0.17, 0.36, -0.2),
    roofs: science(0.48, 0.08, 0),
    hall: science(-0.05, 0.12, 0.12),
    platform: top(nearest(plan.heartland, [-0.9, 2])),
    blk: top(plan.rings),
    database: [middle[0], middle[1] + 0.45, middle[2]],
    tuition: top(nearest(plan.heartland, [0.3, 2.9])),
    viaduct: [viaduct[0], VIADUCT + 0.02, viaduct[1]],
    crown: top(plan.lens),
    tower: [plan.lens.x, plan.lens.h * 0.55, plan.lens.z],
    charts: top(nearest(plan.cbd, [-2.0, -0.6])),
    rollout: top(nearest(plan.cbd, [-1.1, -0.6])),
    // Where the plane is at the Core beat. It moves on; `follow` below keeps the pin on it.
    plane: planePinAt(beats.indexOf('core'), new Vector3()).toArray(),
  }
  return { at, spread }
}

/** One thing placed at a point in the city: a pin, a job's tag at Whole, or one of the five systems. */
type Placed = {
  element: HTMLElement
  at: Vector3
  /** How far it is out at a beat, from 0 to 1. */
  shown: (beat: number, still: boolean) => number
  /** What was last written, so a frame where nothing moved writes nothing. */
  x: number
  y: number
  opacity: number
  /**
   * A pin's tag, and its box from the pin as it is now, open or closed. Measured only when it
   * comes out, opens, closes or the window changes size, so most frames read no layout.
   */
  tag?: HTMLElement
  /** For a pin on something that moves, where that thing is at a beat. */
  follow?: (beat: number, out: Vector3) => void
  box?: { left: number; top: number; width: number; height: number } | null
  shift?: string
}

/** How close to the window's edge a tag may come, in CSS pixels. */
const MARGIN = 8

/** Milliseconds the pointer rests on a pin in the city before it opens. */
const RESTING = 220

const measure = (tag: HTMLElement) => ({
  left: tag.offsetLeft,
  top: tag.offsetTop,
  width: tag.offsetWidth,
  height: tag.offsetHeight,
})

/**
 * Slides a tag back inside a window of this size, only as far as it would cross the edge. Open or
 * closed, a tag hangs from the same corner and is kept inside the same edges, and an open tag is
 * never smaller than its closed one, so the open tag still covers where the closed one was: the
 * pointer that opened it is still on it.
 */
function keepInside(item: Placed, width: number, height: number) {
  if (!item.tag) return
  let dx = 0
  let dy = 0
  if (item.box) {
    const left = item.x + item.box.left
    const top = item.y + item.box.top
    if (left + item.box.width > width - MARGIN) dx = width - MARGIN - left - item.box.width
    if (left + dx < MARGIN) dx = MARGIN - left
    if (top + item.box.height > height - MARGIN) dy = height - MARGIN - top - item.box.height
    if (top + dy < MARGIN) dy = MARGIN - top
  }
  const shift = dx || dy ? `${Math.round(dx)}px ${Math.round(dy)}px` : ''
  if (shift !== item.shift) {
    item.tag.style.translate = shift
    item.shift = shift
  }
}

/**
 * How far the pin of a job's `index`th of `count` claims is out at `beat`: with its line on the
 * page, once the camera has arrived and the city has risen (../cue.ts, D46).
 */
const cascade = (arrives: number, index: number, count: number) => (beat: number, still: boolean) =>
  cue(beat, arrives, index, count, still)

function element(tag: string, className: string, text?: string) {
  const made = document.createElement(tag)
  made.className = className
  if (text) made.textContent = text
  return made
}

/**
 * Puts the pins in `layer`. `place` moves them to where the camera sees their points; call it on
 * every frame the scene draws. Pointing at a claim lights it wherever it is on the page.
 */
export function mountPins(layer: HTMLElement, layout: Layout, values: CityValues) {
  const { at, spread } = pinPlaces(layout, values)
  const placed: Placed[] = []
  const add = (made: HTMLElement, point: Vec3, shown: Placed['shown']) => {
    made.style.visibility = 'hidden'
    layer.append(made)
    placed.push({ element: made, at: new Vector3(...point), shown, x: NaN, y: NaN, opacity: -1 })
  }

  const lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  lines.setAttribute('class', 'pin-lines')
  layer.append(lines)
  const strands: { line: SVGLineElement; from: Placed; to: Placed }[] = []

  eras.forEach((era, e) => {
    const arrives = beats.indexOf(era.part)
    era.claims.forEach((claim, index) => {
      if (!claim.pin) return
      const id = claimId(era, index)
      const pin = element('div', `pin pin-${SIDES[claim.pin]}`)
      pin.dataset.claim = id
      const tag = element('span', 'pin-tag')
      tag.append(
        element('span', 'pin-kind', claim.kind),
        element('span', 'pin-short', claim.tag),
        element('span', 'pin-full', claim.text),
      )
      pin.append(element('span', 'pin-dot', String(index + 1)), element('span', 'pin-lead'), tag)
      const shown = cascade(arrives, index, era.claims.length)
      add(pin, at[claim.pin], shown)
      const hub = placed.at(-1)!
      hub.tag = tag
      if (claim.pin === 'plane') hub.follow = planePinAt

      // Words drawn onto the blocks round the pin when it opens, each tied to it by a line.
      claim.spread?.forEach((word, k) => {
        const block = element('div', 'pin-spread')
        block.append(element('span', '', word))
        block.dataset.of = id
        add(block, spread[k]!, shown)
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.dataset.of = id
        lines.append(line)
        strands.push({ line, from: hub, to: placed.at(-1)! })
      })
    })

    // At Whole, one tag a job, at its subject.
    const whole = beats.indexOf('whole')
    const job = element('div', 'pin pin-job')
    job.dataset.claim = `job-${era.part}`
    job.append(element('span', 'pin-dot'), element('span', 'pin-name', era.field))
    // Each with its job's line on the page, as a claim's pin is.
    add(job, at[JOB_PINS[era.part]], (beat, still) => cue(beat, whole, e, eras.length, still))
  })

  const point = new Vector3()
  /** The window, as of the last frame placed. */
  let windowWidth = innerWidth
  let windowHeight = innerHeight

  /** Moves every pin to where `camera` sees it, at `beat`, from 0 (Found) to the last beat. */
  function place(
    camera: PerspectiveCamera,
    width: number,
    height: number,
    beat: number,
    still: boolean,
  ) {
    camera.updateMatrixWorld()
    // A new window size can reflow the tags: each is measured again when next it is out.
    if (width !== windowWidth || height !== windowHeight) for (const item of placed) item.box = null
    windowWidth = width
    windowHeight = height
    for (const item of placed) {
      let opacity = item.shown(beat, still)
      if (opacity > 0.001) {
        item.follow?.(beat, item.at)
        point.copy(item.at).project(camera)
        const x = Math.round(((point.x + 1) / 2) * width * 2) / 2
        const y = Math.round(((1 - point.y) / 2) * height * 2) / 2
        // Behind the camera, a point projects to the wrong side of the window. Out of the window,
        // a pin would point at nothing: its claim is still read in the list.
        if (point.z > 1 || x < 0 || x > width || y < 0 || y > height) opacity = 0
        if (x !== item.x || y !== item.y) {
          item.element.style.transform = `translate3d(${x}px, ${y}px, 0)`
          item.x = x
          item.y = y
        }
        if (item.tag) {
          item.box ??= measure(item.tag)
          keepInside(item, width, height)
        }
      } else opacity = 0
      opacity = Math.round(opacity * 100) / 100
      if (opacity !== item.opacity) {
        item.element.style.opacity = String(opacity)
        item.element.style.visibility = opacity > 0 ? '' : 'hidden'
        item.opacity = opacity
      }
    }
    for (const { line, from, to } of strands) {
      if (from.opacity <= 0) continue
      line.setAttribute('x1', String(from.x))
      line.setAttribute('y1', String(from.y))
      line.setAttribute('x2', String(to.x))
      line.setAttribute('y2', String(to.y))
    }
  }

  // Pointing. A mouse over a claim's line or its pin opens it; a tap opens it, and a second tap,
  // or one elsewhere, closes it. Closing waits a moment, so crossing from a pin to its line or
  // tag does not snap it shut. A pin in the city opens only once the pointer is still on it, so a
  // hand sweeping the Scanner's beam across the building (./scan.ts) opens none of the pins and
  // tags it passes over.
  let open: string | null = null
  let closing = 0
  let opening = 0
  let waiting: string | null = null
  const wait = (id: string | null) => {
    clearTimeout(opening)
    waiting = id
    if (id) opening = window.setTimeout(() => show(id), RESTING)
  }
  const show = (id: string | null) => {
    if (id === open) return
    const was = open
    open = id
    const group = id?.split('-')[0]
    for (const claim of document.querySelectorAll<HTMLElement>('[data-claim]')) {
      const mine = claim.dataset.claim === id
      claim.classList.toggle('on', mine)
      claim.classList.toggle('dim', !mine && claim.dataset.claim!.split('-')[0] === group)
    }
    for (const spread of document.querySelectorAll<Element>('[data-of]'))
      spread.classList.toggle('on', (spread as HTMLElement).dataset.of === id)
    // A tag that opened or closed has a new size: measured now, so it is kept inside at once,
    // without waiting for a frame.
    for (const item of placed) {
      if (!item.tag || item.opacity <= 0) continue
      const changed = item.element.dataset.claim === id || item.element.dataset.claim === was
      if (!changed) continue
      item.tag.style.translate = item.shift = ''
      item.box = measure(item.tag)
      keepInside(item, windowWidth, windowHeight)
    }
  }
  const claimAt = (target: EventTarget | null) =>
    (target instanceof Element && target.closest<HTMLElement>('[data-claim]')?.dataset.claim) ||
    null
  const over = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    const id = claimAt(event.target)
    clearTimeout(closing)
    const inCity = event.target instanceof Node && layer.contains(event.target)
    wait(id && inCity && id !== open ? id : null)
    if (id && !inCity) show(id)
    else if (!id && open) closing = window.setTimeout(() => show(null), 180)
  }
  // Still moving: the wait starts again.
  const moving = (event: PointerEvent) => {
    if (waiting && event.pointerType === 'mouse') wait(waiting)
  }
  const tap = (event: MouseEvent) => {
    const id = claimAt(event.target)
    // A link in a claim, as at Whole, goes where it goes.
    if (id && event.target instanceof Element && event.target.closest('a')) return
    clearTimeout(closing)
    show(id === open ? null : id)
  }
  document.addEventListener('pointerover', over, { passive: true })
  document.addEventListener('pointermove', moving, { passive: true })
  document.addEventListener('click', tap)

  return {
    place,
    dispose() {
      clearTimeout(closing)
      clearTimeout(opening)
      show(null)
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointermove', moving)
      document.removeEventListener('click', tap)
      layer.replaceChildren()
    },
  }
}

export type Pins = ReturnType<typeof mountPins>
