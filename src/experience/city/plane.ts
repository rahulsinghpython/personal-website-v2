import type { Vector3 } from 'three'
import { beats } from '../../content/beats'

// The plane leaving Changi (docs/DECISIONS.md, D54): at the Core beat it crosses the sky over the
// bay, westward from Changi and climbing, for the line about taking the software abroad. It flies
// with the scroll and nothing else, so at the beat it is always where that line's pin is.

const CORE = beats.indexOf('core')

/** Where it is at the Core beat, how far it flies in a beat, and the beats it is seen between. */
const PLANE = {
  at: [-0.1, 1.38, -1.1],
  perBeat: [-1.6, 0.35, -0.6],
  from: CORE - 0.45,
  to: CORE + 0.75,
  fade: 0.2,
} as const

/** Which way it flies, as a unit vector. */
export const PLANE_HEADING = (() => {
  const [x, y, z] = PLANE.perBeat
  const length = Math.hypot(x, y, z)
  return [x / length, y / length, z / length] as const
})()

/** Puts the plane's place at `beat` in `out`. */
export function planeAt(beat: number, out: Vector3) {
  const k = beat - CORE
  return out.set(
    PLANE.at[0] + PLANE.perBeat[0] * k,
    PLANE.at[1] + PLANE.perBeat[1] * k,
    PLANE.at[2] + PLANE.perBeat[2] * k,
  )
}

/** How far behind the plane its pin stands, in the city's units. */
const BEHIND = 0.16

/**
 * Where its pin stands at `beat`: on the contrail a little behind it, so the pin's ring does not
 * hide the plane it points at.
 */
export function planePinAt(beat: number, out: Vector3) {
  planeAt(beat, out)
  return out.set(
    out.x - PLANE_HEADING[0] * BEHIND,
    out.y - PLANE_HEADING[1] * BEHIND,
    out.z - PLANE_HEADING[2] * BEHIND,
  )
}

/** How far the plane is shown at `beat`, from 0 to 1: it comes and goes round the Core beat. */
export function planeShown(beat: number) {
  const t = Math.min(1, (beat - PLANE.from) / PLANE.fade, (PLANE.to - beat) / PLANE.fade)
  const c = Math.max(0, t)
  return c * c * (3 - 2 * c)
}
