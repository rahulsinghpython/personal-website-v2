import { create } from 'zustand'
import { defaultValues, type PartId } from '../src/experience/machine/part'
import { variants } from '../src/experience/machine/variants'
import { TIERS, type Tier } from '../src/state/tiers'

export type Shading = 'flat' | 'shaded'
export type ViewId = 'iso' | 'front' | 'side' | 'top' | 'free'
export type Focus = PartId | 'all'

/** Every parameter value, as variant, then part, then parameter name. */
export type Params = Record<string, Record<string, Record<string, number>>>

export type WorkbenchState = {
  variant: string
  tier: Tier
  view: ViewId
  /** Flat is the silhouette test: one grey, no shading. Shaded shows the form inside the outline. */
  shading: Shading
  /** Draw one part at full brightness and dim the other three. */
  focus: Focus
  /** Show every variant side by side, sharing one camera. */
  compare: boolean
  /** Shrink the viewports, for the thumbnail test. */
  thumb: boolean
  /** Make each viewport the size of a phone screen, to see what a phone would be given. */
  phone: boolean
  panel: boolean
  /** Render at the tier's pixel-ratio cap even when this display's own ratio is lower. */
  capDpr: boolean
  params: Params
  setParam: (variant: string, part: PartId, key: string, value: number) => void
  resetVariant: (variant: string) => void
}

function defaultParams(): Params {
  return Object.fromEntries(
    variants.map((machine) => [
      machine.id,
      Object.fromEntries(machine.parts.map((part) => [part.id, defaultValues(part.params)])),
    ]),
  )
}

const DEFAULTS = {
  variant: variants[0]!.id,
  tier: 'high' as Tier,
  view: 'iso' as ViewId,
  shading: 'shaded' as Shading,
  focus: 'all' as Focus,
  compare: false,
  thumb: false,
  phone: false,
  panel: true,
  capDpr: false,
}

const oneOf = <T extends string>(value: string | null, allowed: readonly T[]): T | undefined =>
  allowed.includes(value as T) ? (value as T) : undefined

/** The state is kept in the URL so a view can be reloaded, screenshotted and sent to someone. */
function fromUrl() {
  const query = new URLSearchParams(location.search)
  const flag = (key: string, fallback: boolean) =>
    query.has(key) ? query.get(key) !== '0' : fallback
  const params = defaultParams()
  for (const entry of query.get('p')?.split(',') ?? []) {
    const [path, value] = entry.split(':')
    const [variant, part, key] = path?.split('.') ?? []
    const values = params[variant ?? '']?.[part ?? '']
    if (values && key && key in values && Number.isFinite(Number(value)))
      values[key] = Number(value)
  }
  return {
    variant:
      oneOf(
        query.get('variant'),
        variants.map((v) => v.id),
      ) ?? DEFAULTS.variant,
    tier: oneOf(query.get('tier'), Object.keys(TIERS) as Tier[]) ?? DEFAULTS.tier,
    view:
      oneOf(query.get('view'), ['iso', 'front', 'side', 'top', 'free'] as const) ??
      (query.has('cam') ? 'free' : DEFAULTS.view),
    shading: oneOf(query.get('shading'), ['flat', 'shaded'] as const) ?? DEFAULTS.shading,
    focus:
      oneOf(query.get('focus'), ['all', 'core', 'scanner', 'rings', 'lens'] as const) ??
      DEFAULTS.focus,
    compare: flag('compare', DEFAULTS.compare),
    thumb: flag('thumb', DEFAULTS.thumb),
    phone: flag('phone', DEFAULTS.phone),
    panel: flag('panel', DEFAULTS.panel),
    capDpr: flag('capdpr', DEFAULTS.capDpr),
    params,
  }
}

export const useWorkbench = create<WorkbenchState>()((set) => ({
  ...fromUrl(),
  setParam: (variant, part, key, value) =>
    set((state) => {
      const parts = state.params[variant]
      const values = parts?.[part]
      if (!parts || !values || values[key] === value) return state
      return {
        params: { ...state.params, [variant]: { ...parts, [part]: { ...values, [key]: value } } },
      }
    }),
  resetVariant: (variant) =>
    set((state) => ({ params: { ...state.params, [variant]: defaultParams()[variant]! } })),
}))

/** Rewrites the query string, leaving what camera.ts and cloud.ts own as it is. */
function toUrl(state: WorkbenchState) {
  const query = new URLSearchParams()
  const text = {
    variant: state.variant,
    tier: state.tier,
    view: state.view,
    shading: state.shading,
    focus: state.focus,
  }
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

  const base = defaultParams()
  const changed: string[] = []
  for (const [variant, parts] of Object.entries(state.params))
    for (const [part, values] of Object.entries(parts))
      for (const [key, value] of Object.entries(values))
        if (value !== base[variant]?.[part]?.[key])
          changed.push(`${variant}.${part}.${key}:${+value.toFixed(4)}`)
  if (changed.length > 0) query.set('p', changed.join(','))

  const current = new URLSearchParams(location.search)
  const cam = current.get('cam')
  if (cam && state.view === 'free') query.set('cam', cam)
  // Owned by cloud.ts.
  for (const key of ['draw', 'pts']) {
    const value = current.get(key)
    if (value) query.set(key, value)
  }
  const search = query.toString().replaceAll('%3A', ':').replaceAll('%2C', ',')
  history.replaceState(null, '', search ? `?${search}` : location.pathname)
}

useWorkbench.subscribe(toUrl)
