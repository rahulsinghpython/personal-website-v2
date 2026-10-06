import { create } from 'zustand'
import type { PartWeights } from '../src/experience/machine/points'

/** Round 4: how the Machine is drawn as points. Kept apart from the shape's own parameters. */
export type CloudState = {
  /** `solid` is the greybox; `points` is the cloud sampled from it. */
  draw: 'solid' | 'points'
  /** Share of the tier's point budget in use, from 0 to 1. */
  density: number
  /** A point's width in CSS pixels at ten units from the camera. */
  size: number
  brightness: number
  /**
   * How much bigger and brighter each point gets as the count drops, so a low tier still reads.
   * 0 is no help; at 0.5 a quarter of the points are each twice as big and twice as bright.
   */
  boost: number
  weights: PartWeights
}

const DEFAULTS: CloudState = {
  draw: 'solid',
  density: 1,
  size: 1.8,
  brightness: 0.5,
  boost: 0.35,
  weights: { core: 1, scanner: 2.5, rings: 2.5, lens: 2 },
}

const KEYS = ['density', 'size', 'brightness', 'boost'] as const
const PARTS = ['core', 'scanner', 'rings', 'lens'] as const

/** `draw=points&pts=density,size,brightness,boost,core,scanner,rings,lens` in the URL. */
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
  if (numbers.some((n, i) => n !== defaults[i])) query.set('pts', numbers.join(','))
  else query.delete('pts')
  const search = query.toString().replaceAll('%3A', ':').replaceAll('%2C', ',')
  history.replaceState(null, '', search ? `?${search}` : location.pathname)
})
