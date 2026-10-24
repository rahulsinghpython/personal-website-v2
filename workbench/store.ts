import { create } from 'zustand'
import { TIERS, type Tier } from '../src/state/tiers'
import { CITY_KEYS } from './city'

// The workbench's own settings. The city's numbers, layout and look are in ./city.ts, and whether
// it is drawn solid or as points in ./cloud.ts.

export type Shading = 'flat' | 'shaded'
export type ViewId = 'iso' | 'front' | 'side' | 'top' | 'free' | 'story'

export type WorkbenchState = {
  tier: Tier
  view: ViewId
  /** Flat is the silhouette test: one grey, no shading. Shaded shows the form inside the outline. */
  shading: Shading
  /** Show every option side by side, sharing one camera. */
  compare: boolean
  /** Shrink the viewports, for the thumbnail test. */
  thumb: boolean
  /** Make each viewport the size of a phone screen, to see what a phone would be given. */
  phone: boolean
  panel: boolean
  /**
   * Where the story is, in beats: 0 is Found and 7 is Contact. Null shows the city outside the
   * story, risen as far as ./city.ts says.
   */
  beat: number | null
  /** Render at the tier's pixel-ratio cap even when this display's own ratio is lower. */
  capDpr: boolean
}

const DEFAULTS: WorkbenchState = {
  tier: 'high',
  view: 'iso',
  shading: 'shaded',
  compare: false,
  thumb: false,
  phone: false,
  panel: true,
  beat: null,
  capDpr: false,
}

const oneOf = <T extends string>(value: string | null, allowed: readonly T[]): T | undefined =>
  allowed.includes(value as T) ? (value as T) : undefined

/** The state is kept in the URL so a view can be reloaded, screenshotted and sent to someone. */
function fromUrl(): WorkbenchState {
  const query = new URLSearchParams(location.search)
  const flag = (key: string, fallback: boolean) =>
    query.has(key) ? query.get(key) !== '0' : fallback
  return {
    tier: oneOf(query.get('tier'), Object.keys(TIERS) as Tier[]) ?? DEFAULTS.tier,
    view:
      oneOf(query.get('view'), ['iso', 'front', 'side', 'top', 'free', 'story'] as const) ??
      (query.has('cam') ? 'free' : DEFAULTS.view),
    shading: oneOf(query.get('shading'), ['flat', 'shaded'] as const) ?? DEFAULTS.shading,
    compare: flag('compare', DEFAULTS.compare),
    thumb: flag('thumb', DEFAULTS.thumb),
    phone: flag('phone', DEFAULTS.phone),
    panel: flag('panel', DEFAULTS.panel),
    beat:
      query.has('beat') && Number.isFinite(Number(query.get('beat')))
        ? Number(query.get('beat'))
        : null,
    capDpr: flag('capdpr', DEFAULTS.capDpr),
  }
}

export const useWorkbench = create<WorkbenchState>()(() => fromUrl())

/** Rewrites the query string, leaving what camera.ts, cloud.ts and city.ts own as it is. */
function toUrl(state: WorkbenchState) {
  const query = new URLSearchParams()
  const text = { tier: state.tier, view: state.view, shading: state.shading }
  for (const [key, value] of Object.entries(text))
    if (value !== DEFAULTS[key as keyof typeof text]) query.set(key, value)
  const flags = {
    compare: state.compare,
    thumb: state.thumb,
    phone: state.phone,
    panel: state.panel,
    capdpr: state.capDpr,
  }
  const flagDefaults = { ...DEFAULTS, capdpr: DEFAULTS.capDpr }
  for (const [key, value] of Object.entries(flags))
    if (value !== flagDefaults[key as keyof typeof flags]) query.set(key, value ? '1' : '0')

  if (state.beat !== null) query.set('beat', String(+state.beat.toFixed(3)))

  const current = new URLSearchParams(location.search)
  const cam = current.get('cam')
  if (cam && state.view === 'free') query.set('cam', cam)
  for (const key of ['draw', ...CITY_KEYS]) {
    const value = current.get(key)
    if (value) query.set(key, value)
  }
  const search = query.toString().replaceAll('%3A', ':').replaceAll('%2C', ',')
  history.replaceState(null, '', search ? `?${search}` : location.pathname)
}

useWorkbench.subscribe(toUrl)
