import { Vector3, type Camera } from 'three'
import { beats } from '../../content/beats'
import type { PartId, PinId } from '../../content/eras'
import { readScroll } from '../../state/progress'
import type { Pose } from '../camera/camera'
import type { CityValues, Layout } from './layouts'
import { pinPlaces } from './pins'
import { CITY_POSES } from './story'

// The Whole beat (docs/DECISIONS.md, D56). Choosing a job, by its line on the page, its tag in the
// city or its subject, opens the job's panel (src/sections/JobPanels.tsx), and while it is open
// the camera glides to the job's subject, to where the job's own beat looked at it from. Closing
// it, by its button, Escape, a click elsewhere or a scroll away from Whole, glides it back. The
// visitor causes every move (rule 2), and the story under it is unchanged.

const WHOLE = beats.indexOf('whole')
const LAST = beats.length - 1

/** Seconds the glide takes, there or back. */
const GLIDE = 1.3
/** How far the scroll may leave Whole, in beats, before an open panel closes. */
const LEAVE = 0.3
/** How near Whole the story must be, in beats, for a click on the city to choose a job. */
const NEAR_WHOLE = 0.12
/** How close a click must come to a job's subject, in CSS pixels. */
const REACH = 64

/** Where each job's subject can be clicked: the pins on it. */
const SUBJECTS: Record<PartId, PinId[]> = {
  core: ['streets'],
  scanner: ['mesh', 'roofs', 'hall'],
  rings: ['blk', 'tuition'],
  lens: ['crown', 'tower'],
}

const smooth = (x: number) => x * x * (3 - 2 * x)
const KEYS = ['x', 'y', 'z', 'azimuth', 'elevation', 'distance'] as const

/** The page's words, links and panels: a click or a hover there is not on the city. */
const ON_PAGE = 'a, button, input, select, textarea, label, summary, p, li, h1, h2, h3, [popover]'

export function watchWhole(
  layout: Layout,
  values: CityValues,
  view: () => { camera: Camera; size: { width: number; height: number } },
  beat: () => number,
  moved: () => void,
) {
  const { at } = pinPlaces(layout, values)
  const subjects = (Object.keys(SUBJECTS) as PartId[]).map((part) => ({
    part,
    points: SUBJECTS[part].map((pin) => new Vector3(...at[pin])),
  }))

  let focus: PartId | null = null
  /** Where the glide began, or null when the camera is not gliding. */
  let from: Pose | null = null
  let t = 1
  /** How far the camera is from the whole city towards a job, from 0 to 1, for the tags. */
  let away = 0
  const shown: Pose = { ...CITY_POSES.whole }

  const panelOf = (part: PartId) => document.querySelector<HTMLElement>(`[data-work="${part}"]`)
  const open = (part: PartId) => {
    const panel = panelOf(part)
    if (panel && !panel.matches(':popover-open')) panel.showPopover()
  }

  // The panel opening or closing, however it was done: it is the one place the focus is set.
  const toggled = (event: Event) => {
    const panel = event.target
    if (!(panel instanceof HTMLElement) || !panel.dataset.work) return
    const opened = (event as ToggleEvent).newState === 'open'
    const part = panel.dataset.work as PartId
    if (!opened && focus !== part) return
    focus = opened ? part : null
    from = { ...shown }
    t = 0
    moved()
  }

  // A scroll away from Whole closes the panel: the story moves on, and the camera with it.
  const scrolled = () => {
    if (!focus || Math.abs(readScroll() * LAST - WHOLE) <= LEAVE) return
    panelOf(focus)?.hidePopover()
  }

  /** The job whose subject or tag is under the window point, at Whole. */
  const projected = new Vector3()
  const find = (event: MouseEvent): PartId | null => {
    if (Math.abs(beat() - WHOLE) > NEAR_WHOLE) return null
    const target = event.target instanceof Element ? event.target : null
    const tag = target?.closest<HTMLElement>('.pin-job')?.dataset.claim
    if (tag) return tag.replace('job-', '') as PartId
    if (target?.closest(ON_PAGE)) return null
    const { camera, size } = view()
    let best: PartId | null = null
    let nearest = REACH
    for (const { part, points } of subjects)
      for (const point of points) {
        projected.copy(point).project(camera)
        if (projected.z > 1) continue
        const x = ((projected.x + 1) / 2) * size.width
        const y = ((1 - projected.y) / 2) * size.height
        const off = Math.hypot(event.clientX - x, event.clientY - y)
        if (off < nearest) {
          nearest = off
          best = part
        }
      }
    return best
  }
  const click = (event: MouseEvent) => {
    const part = find(event)
    if (part) open(part)
  }
  // A mouse over a job's subject shows the hand: it can be clicked.
  const root = document.documentElement
  let hand = false
  const point = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    const over = !!find(event)
    if (over === hand) return
    hand = over
    root.style.cursor = over ? 'pointer' : ''
  }

  document.addEventListener('toggle', toggled, true)
  addEventListener('scroll', scrolled, { passive: true })
  addEventListener('click', click)
  addEventListener('pointermove', point, { passive: true })

  return {
    /** The job whose panel is open, and how far the camera has gone to it, for the tags. */
    get focus() {
      return { part: focus, away }
    },
    /**
     * Takes the camera the story put at this frame and moves it towards the open job's subject,
     * `dt` seconds on. With reduced motion it cuts. Says whether it is still gliding.
     */
    step(dt: number, camera: Pose, still: boolean) {
      away = Math.min(1, Math.max(0, away + (focus ? 1 : -1) * (still ? 1 : dt / GLIDE)))
      const goal = focus ? CITY_POSES[focus] : camera
      if (from && !still && t < 1) {
        t = Math.min(1, t + dt / GLIDE)
        const k = smooth(t)
        for (const key of KEYS) camera[key] = from[key] + (goal[key] - from[key]) * k
      } else {
        from = null
        if (focus) Object.assign(camera, goal)
      }
      Object.assign(shown, camera)
      return from !== null || (away > 0 && away < 1)
    },
    dispose() {
      document.removeEventListener('toggle', toggled, true)
      removeEventListener('scroll', scrolled)
      removeEventListener('click', click)
      removeEventListener('pointermove', point)
      if (hand) root.style.cursor = ''
    },
  }
}

export type Whole = ReturnType<typeof watchWhole>
