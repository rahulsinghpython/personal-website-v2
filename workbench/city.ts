import { create } from 'zustand'
import type { Piece } from '../src/experience/city/city'
import {
  layouts,
  type CityGroup,
  type CityValues,
  type Layout,
} from '../src/experience/city/layouts'
import { CITY_LOOKS, type CityLook } from '../src/experience/city/points'
import { defaultValues } from '../src/experience/params'

// The city's state on the workbench: which layout, its numbers, and what is shown. Kept apart from
// the Machine's in ./store.ts, because the city is not made of the Machine's four parts.

/** Draw one district at full brightness and dim the rest, so they can be told apart in grey. */
export type Show = 'all' | 'water' | 'landmarks' | 'cbd' | 'heartland' | 'subjects'

/** The solid pieces each Show lights. `water` lights the water itself. */
export const SHOWN: Record<Exclude<Show, 'all'>, Piece[]> = {
  water: [],
  landmarks: ['landmarks'],
  cbd: ['cbd', 'lens'],
  heartland: ['heartland', 'rings', 'science', 'mrt'],
  // What each job's beat is about: the river (Core), the Science Centre (Scanner), BLK 2024
  // (Rings), the tower (Lens).
  subjects: ['science', 'rings', 'lens'],
}

export type CityState = {
  layout: string
  show: Show
  /** How far the city has risen from the map: 0 is the flat plan, 1 is every building standing. */
  rise: number
  /** The map in thin lines on the ground. */
  map: boolean
  /** The traffic, the river and the train moving on their own clock, as well as with the beat. */
  motion: boolean
  /** Every layout's numbers: layout, then group, then name. */
  params: Record<string, CityValues>
  /** Which look the city is drawn in as points, and every look's numbers (the points round). */
  look: string
  looks: Record<string, CityLook>
  setParam: (layout: string, group: CityGroup, key: string, value: number) => void
  resetLayout: (layout: string) => void
}

/** The numbers of a look a slider can change. */
export const LOOK_KEYS = [
  'count',
  'size',
  'brightness',
  'boost',
  'windows',
  'walls',
  'edges',
  'roofs',
  'outline',
  'thin',
  'blocks',
  'landmarks',
  'roads',
  'water',
  'mrt',
] as const satisfies readonly (keyof CityLook)[]

const defaultLooks = () =>
  Object.fromEntries(CITY_LOOKS.map((look) => [look.id, structuredClone(look)]))

/** The query keys this file owns; ./store.ts leaves them alone when it rewrites the URL. */
export const CITY_KEYS = ['layout', 'show', 'rise', 'map', 'motion', 'c', 'look', 'cl']

export const layoutValues = (layout: Layout): CityValues =>
  Object.fromEntries(
    Object.entries(layout.params).map(([group, schema]) => [group, defaultValues(schema)]),
  ) as CityValues

const defaultParams = () =>
  Object.fromEntries(layouts.map((layout) => [layout.id, layoutValues(layout)]))

const DEFAULTS = {
  layout: layouts[0]!.id,
  show: 'all' as Show,
  rise: 1,
  map: true,
  motion: true,
  look: CITY_LOOKS[0]!.id,
}
const SHOWS: Show[] = ['all', 'water', 'landmarks', 'cbd', 'heartland', 'subjects']

/** `show=cbd&rise=0.5&map=0&c=A.cbd.height:1.2,…&look=B&cl=B.size:0.006,…` in the URL. */
function fromUrl() {
  const query = new URLSearchParams(location.search)
  const params = defaultParams()
  for (const entry of query.get('c')?.split(',') ?? []) {
    const [path, value] = entry.split(':')
    const [layout, group, key] = path?.split('.') ?? []
    const values = params[layout ?? '']?.[group as CityGroup]
    if (values && key && key in values && Number.isFinite(Number(value)))
      values[key] = Number(value)
  }
  const looks = defaultLooks()
  for (const entry of query.get('cl')?.split(',') ?? []) {
    const [path, value] = entry.split(':')
    const [look, key] = path?.split('.') ?? []
    const values = looks[look ?? ''] as Record<string, number | string> | undefined
    if (values && LOOK_KEYS.includes(key as never) && Number.isFinite(Number(value)))
      values[key!] = Number(value)
  }
  const look = query.get('look')
  const layout = query.get('layout')
  const show = query.get('show') as Show
  const rise = Number(query.get('rise'))
  return {
    layout: layouts.some((each) => each.id === layout) ? layout! : DEFAULTS.layout,
    show: SHOWS.includes(show) ? show : DEFAULTS.show,
    rise: query.has('rise') && Number.isFinite(rise) ? Math.min(1, Math.max(0, rise)) : 1,
    map: query.get('map') !== '0',
    motion: query.get('motion') !== '0',
    params,
    look: look && look in looks ? look : DEFAULTS.look,
    looks,
  }
}

export const useCity = create<CityState>()((set) => ({
  ...fromUrl(),
  setParam: (layout, group, key, value) =>
    set((state) => {
      const groups = state.params[layout]
      const values = groups?.[group]
      if (!groups || !values || values[key] === value) return state
      return {
        params: { ...state.params, [layout]: { ...groups, [group]: { ...values, [key]: value } } },
      }
    }),
  resetLayout: (layout) =>
    set((state) => ({ params: { ...state.params, [layout]: defaultParams()[layout]! } })),
}))

useCity.subscribe((state) => {
  const query = new URLSearchParams(location.search)
  const put = (key: string, value: string | null) =>
    value === null ? query.delete(key) : query.set(key, value)
  put('layout', state.layout === DEFAULTS.layout ? null : state.layout)
  put('show', state.show === DEFAULTS.show ? null : state.show)
  put('rise', state.rise === DEFAULTS.rise ? null : String(+state.rise.toFixed(3)))
  put('map', state.map ? null : '0')
  put('motion', state.motion ? null : '0')
  const base = defaultParams()
  const changed: string[] = []
  for (const [layout, groups] of Object.entries(state.params))
    for (const [group, values] of Object.entries(groups))
      for (const [key, value] of Object.entries(values))
        if (value !== base[layout]?.[group as CityGroup]?.[key])
          changed.push(`${layout}.${group}.${key}:${+value.toFixed(4)}`)
  put('c', changed.length > 0 ? changed.join(',') : null)
  put('look', state.look === DEFAULTS.look ? null : state.look)
  const looks = defaultLooks()
  const tuned: string[] = []
  for (const [id, look] of Object.entries(state.looks))
    for (const key of LOOK_KEYS)
      if (look[key] !== looks[id]?.[key]) tuned.push(`${id}.${key}:${+look[key].toFixed(4)}`)
  put('cl', tuned.length > 0 ? tuned.join(',') : null)
  const search = query.toString().replaceAll('%3A', ':').replaceAll('%2C', ',')
  history.replaceState(null, '', search ? `?${search}` : location.pathname)
})
