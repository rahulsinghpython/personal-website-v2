import { Vector3 } from 'three'
import type { ViewId } from './store'

// The camera pose is shared by every viewport, so the variants are always seen from one angle.
// It changes every frame while orbiting, so it lives here as a mutable value and not in the store.

export const pose = { position: new Vector3(), target: new Vector3() }

const PRESETS: Record<Exclude<ViewId, 'free' | 'story'>, [number, number, number]> = {
  iso: [6, 4, 7.5],
  front: [0, 0, 10.5],
  side: [10.5, 0, 0],
  // Not exactly overhead: the camera cannot look straight down its own up axis.
  top: [0, 10.5, 0.001],
}

type Listener = (from: object | null) => void
const listeners = new Set<Listener>()

export function onPose(listener: Listener) {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

/** Tells every viewport except `from` to take the shared pose. */
export function announcePose(from: object | null) {
  for (const listener of listeners) listener(from)
}

export function applyView(view: ViewId) {
  if (view === 'free' || view === 'story') return
  pose.position.set(...PRESETS[view])
  pose.target.set(0, 0, 0)
  announcePose(null)
}

/** `cam=x,y,z,tx,ty,tz` in the URL: a free camera position worth coming back to. */
export function poseFromUrl(): boolean {
  const numbers = new URLSearchParams(location.search).get('cam')?.split(',').map(Number)
  if (numbers?.length !== 6 || !numbers.every(Number.isFinite)) return false
  pose.position.fromArray(numbers, 0)
  pose.target.fromArray(numbers, 3)
  return true
}

export function poseToUrl() {
  const query = new URLSearchParams(location.search)
  const numbers = [...pose.position.toArray(), ...pose.target.toArray()]
  query.set('view', 'free')
  query.set('cam', numbers.map((n) => +n.toFixed(3)).join(','))
  const search = query.toString().replaceAll('%3A', ':').replaceAll('%2C', ',')
  history.replaceState(null, '', `?${search}`)
}
