import { Vector3 } from 'three'
import { useWorkbench, type ViewId, type World } from './store'

// The camera pose is shared by every viewport, so the variants are always seen from one angle.
// It changes every frame while orbiting, so it lives here as a mutable value and not in the store.

export const pose = { position: new Vector3(), target: new Vector3() }

type Preset = { position: [number, number, number]; target: [number, number, number] }
const at = (x: number, y: number, z: number, target: [number, number, number] = [0, 0, 0]) =>
  ({ position: [x, y, z], target }) as Preset

const PRESETS: Record<World, Record<Exclude<ViewId, 'free' | 'story'>, Preset>> = {
  machine: {
    iso: at(6, 4, 7.5),
    front: at(0, 0, 10.5),
    side: at(10.5, 0, 0),
    // Not exactly overhead: the camera cannot look straight down its own up axis.
    top: at(0, 10.5, 0.001),
  },
  // The city is a tile about seven units across. `front` is the way the visitor looks: across the
  // bay, along -z, from about 30 degrees up, like the calm drone of EXPERIENCE. `top` is the map,
  // with the far side of the bay at the top.
  city: {
    iso: at(8, 7, 10),
    front: at(0, 5.2, 8.6, [0, 0, -0.8]),
    side: at(13, 2.5, 0, [0, 0.3, 0]),
    top: at(0, 15, 0.001),
  },
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

export function applyView(view: ViewId, world: World = useWorkbench.getState().world) {
  if (view === 'free' || view === 'story') return
  const preset = PRESETS[world][view]
  pose.position.set(...preset.position)
  pose.target.set(...preset.target)
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
