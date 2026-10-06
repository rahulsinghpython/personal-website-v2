import { create } from 'zustand'
import { POINT_LOOK, type PointLook } from '../src/experience/machine/points'

/** How the Machine is drawn as points. Kept apart from the shape's own parameters. */
export type CloudState = PointLook & {
  /** `solid` is the greybox; `points` is the cloud sampled from it. */
  draw: 'solid' | 'points'
}

/** The sliders start from the look chosen in round 4. */
const DEFAULTS: CloudState = { draw: 'solid', ...structuredClone(POINT_LOOK) }

const KEYS = ['density', 'size', 'brightness', 'boost', 'thin'] as const
const PARTS = ['core', 'scanner', 'rings', 'lens'] as const

/** `draw=points&pts=density,size,brightness,boost,thin,core,scanner,rings,lens` in the URL. */
function fromUrl(): CloudState {
  const query = new URLSearchParams(location.search)
  const numbers = query.get('pts')?.split(',').map(Number) ?? []
  const state = structuredClone(DEFAULTS)
  if (query.get('draw') === 'points') state.draw = 'points'
  if (numbers.length === KEYS.length + PARTS.length && numbers.every(Number.isFinite)) {
    KEYS.forEach((key, i) => (state[key] = numbers[i]!))
    PARTS.forEach((part, i) => (state.weights[part] = numbers[KEYS.length + i]!))
  }
  return state
}

export const useCloud = create<CloudState>()(() => fromUrl())

useCloud.subscribe((state) => {
  const query = new URLSearchParams(location.search)
  const numbers = [...KEYS.map((key) => state[key]), ...PARTS.map((part) => state.weights[part])]
  const defaults = [
    ...KEYS.map((key) => DEFAULTS[key]),
    ...PARTS.map((part) => DEFAULTS.weights[part]),
  ]
  if (state.draw === 'points') query.set('draw', 'points')
  else query.delete('draw')
  // Rounded, because a slider snapping to its step leaves values like 0.013000000000000001.
  const rounded = numbers.map((n) => +n.toFixed(4))
  if (rounded.some((n, i) => n !== defaults[i])) query.set('pts', rounded.join(','))
  else query.delete('pts')
  const search = query.toString().replaceAll('%3A', ':').replaceAll('%2C', ',')
  history.replaceState(null, '', search ? `?${search}` : location.pathname)
})
