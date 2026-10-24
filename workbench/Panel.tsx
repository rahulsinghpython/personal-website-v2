import { useEffect, useRef } from 'react'
import { Pane } from 'tweakpane'
import { layouts, type CityGroup } from '../src/experience/city/layouts'
import { CITY_LOOKS } from '../src/experience/city/points'
import { applyView } from './camera'
import { LOOK_KEYS, useCity, type CityState } from './city'
import { useCloud } from './cloud'
import { benchmark, stats } from './stats'
import { useWorkbench, type WorkbenchState } from './store'

const SETTINGS = ['tier', 'view', 'shading', 'compare', 'thumb', 'phone', 'capDpr'] as const
type Settings = Pick<WorkbenchState, (typeof SETTINGS)[number]>

const pick = (state: WorkbenchState): Settings =>
  Object.fromEntries(SETTINGS.map((key) => [key, state[key]])) as Settings

/** The views. `story` is the sketch's camera at the scrubber's beat. */
const VIEWS: Record<string, WorkbenchState['view']> = {
  'three-quarter': 'iso',
  'across the bay': 'front',
  side: 'side',
  'the map': 'top',
  free: 'free',
  story: 'story',
}

/**
 * The control panel. Tweakpane edits plain objects, so the panel keeps its own copies of the
 * store's values, writes changes back to the store, and refreshes when the store changes
 * from somewhere else (the URL, the console, a reset).
 */
export function Panel() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const pane = new Pane({ container: container.current!, title: 'Workbench' })
    const cleanups = [addSettings(pane), addCity(pane), addReadout(pane)]
    return () => {
      for (const cleanup of cleanups) cleanup()
      pane.dispose()
    }
  }, [])

  return <div className="panel" ref={container} />
}

function addSettings(pane: Pane) {
  const store = useWorkbench
  const settings = pick(store.getState())
  const bindings = [
    pane.addBinding(settings, 'tier', { options: { high: 'high', mid: 'mid', low: 'low' } }),
    pane.addBinding(settings, 'view', { options: VIEWS }),
    pane.addBinding(settings, 'shading', { options: { shaded: 'shaded', flat: 'flat' } }),
    pane.addBinding(settings, 'compare', { label: 'side by side' }),
    pane.addBinding(settings, 'thumb', { label: 'thumbnail' }),
    pane.addBinding(settings, 'phone', { label: 'phone size' }),
    pane.addBinding(settings, 'capDpr', { label: 'tier dpr' }),
  ]
  for (const binding of bindings)
    binding.on('change', () => {
      const state = store.getState()
      const changed = SETTINGS.filter((key) => settings[key] !== state[key])
      if (changed.length === 0) return
      store.setState(pick({ ...state, ...settings }))
      if (changed.includes('view')) applyView(settings.view)
    })

  return store.subscribe((state) => {
    Object.assign(settings, pick(state))
    pane.refresh()
  })
}

/** The beat scrubber. Off, the city is shown outside the story, risen as far as the slider says. */
function addStory(pane: Pane) {
  const store = useWorkbench
  const scrub = { on: store.getState().beat !== null, beat: store.getState().beat ?? 0 }
  const folder = pane.addFolder({ title: 'Story' })
  folder.addBinding(scrub, 'on', { label: 'in the story' })
  folder.addBinding(scrub, 'beat', { min: 0, max: 7, step: 0.01 })
  folder.on('change', () => {
    const beat = scrub.on ? scrub.beat : null
    if (beat !== store.getState().beat) store.setState({ beat })
  })
  return store.subscribe((state) => {
    scrub.on = state.beat !== null
    if (state.beat !== null) scrub.beat = state.beat
    pane.refresh()
  })
}

/** The city's controls: the layout greybox of Phase 3b, and the sketch's story. */
function addCity(pane: Pane) {
  // With the story on, the city lands and rises with the beat, and the rise slider waits.
  const unsubscribeStory = addStory(pane)
  const store = useCity
  const pickOwn = (state: CityState) => ({
    show: state.show,
    rise: state.rise,
    map: state.map,
    motion: state.motion,
  })
  const own = pickOwn(store.getState())
  const folder = pane.addFolder({ title: 'City' })
  folder.addBinding(own, 'show', {
    options: {
      all: 'all',
      water: 'water',
      landmarks: 'landmarks',
      cbd: 'cbd',
      heartland: 'heartland',
      'what each job lights': 'subjects',
    },
  })
  folder.addBinding(own, 'rise', { label: 'risen from the map', min: 0, max: 1, step: 0.01 })
  folder.addBinding(own, 'map', { label: 'map lines' })
  folder.addBinding(own, 'motion', { label: 'moves on its own' })
  folder.on('change', () => store.setState({ ...own }))

  // One tab per layout, one folder per group, one slider per number.
  const values = structuredClone(store.getState().params)
  const tabs = pane.addTab({ pages: layouts.map((layout) => ({ title: layout.id })) })
  layouts.forEach((layout, index) => {
    const page = tabs.pages[index]!
    for (const [group, schema] of Object.entries(layout.params)) {
      const groupFolder = page.addFolder({ title: group })
      for (const [key, spec] of Object.entries(schema))
        groupFolder
          .addBinding(values[layout.id]![group as CityGroup], key, {
            min: spec.min,
            max: spec.max,
            step: spec.step,
          })
          .on('change', (event) =>
            store.getState().setParam(layout.id, group as CityGroup, key, event.value),
          )
    }
    page
      .addButton({ title: `Copy ${layout.id}'s values` })
      .on('click', () =>
        navigator.clipboard.writeText(JSON.stringify(store.getState().params[layout.id], null, 2)),
      )
    page
      .addButton({ title: `Reset ${layout.id}` })
      .on('click', () => store.getState().resetLayout(layout.id))
  })
  // Tweakpane also fires this while the pane is disposed, which must not change the layout.
  let live = true
  tabs.on('select', (event) => {
    const picked = layouts[event.index]
    if (live && picked) store.setState({ layout: picked.id })
  })
  const select = (id: string) => {
    const page = tabs.pages[layouts.findIndex((layout) => layout.id === id)]
    if (page && !page.selected) page.selected = true
  }
  select(store.getState().layout)

  const unsubscribe = store.subscribe((state) => {
    Object.assign(own, pickOwn(state))
    for (const [layout, groups] of Object.entries(state.params))
      for (const [group, groupValues] of Object.entries(groups))
        Object.assign(values[layout]![group as CityGroup], groupValues)
    select(state.layout)
    pane.refresh()
  })
  const unsubscribePoints = addCityPoints(pane)
  return () => {
    live = false
    unsubscribe()
    unsubscribeStory()
    unsubscribePoints()
  }
}

/** The ranges of a look's sliders. */
const LOOK_RANGES: Record<(typeof LOOK_KEYS)[number], [min: number, max: number, step: number]> = {
  count: [5_000, 600_000, 5_000],
  size: [0.002, 0.03, 0.0005],
  brightness: [0.05, 3, 0.01],
  boost: [0, 0.8, 0.01],
  windows: [0, 1, 0.01],
  walls: [0, 1, 0.01],
  edges: [0, 1, 0.01],
  roofs: [0, 1, 0.01],
  outline: [0, 1, 0.01],
  thin: [0, 1, 0.01],
  blocks: [0, 1, 0.01],
  landmarks: [0, 1, 0.01],
  roads: [0, 0.3, 0.005],
  water: [0, 0.3, 0.005],
  mrt: [0, 0.1, 0.005],
}

/** The points round: solid or points, and one tab per look with its numbers. */
function addCityPoints(pane: Pane) {
  const draw = { draw: useCloud.getState().draw }
  pane
    .addBinding(draw, 'draw', { options: { solid: 'solid', points: 'points' } })
    .on('change', (event) => useCloud.setState({ draw: event.value }))
  const folder = pane.addFolder({ title: 'Points' })
  const values = structuredClone(useCity.getState().looks)
  const tabs = folder.addTab({
    pages: CITY_LOOKS.map((look) => ({ title: `${look.id} ${look.label}` })),
  })
  CITY_LOOKS.forEach((look, index) => {
    const page = tabs.pages[index]!
    for (const key of LOOK_KEYS) {
      const [min, max, step] = LOOK_RANGES[key]
      page.addBinding(values[look.id]!, key, { min, max, step }).on('change', (event) =>
        useCity.setState((state) => ({
          looks: { ...state.looks, [look.id]: { ...state.looks[look.id]!, [key]: event.value } },
        })),
      )
    }
    page
      .addButton({ title: `Copy ${look.id}'s values` })
      .on('click', () =>
        navigator.clipboard.writeText(JSON.stringify(useCity.getState().looks[look.id], null, 2)),
      )
    page.addButton({ title: `Reset ${look.id}` }).on('click', () =>
      useCity.setState((state) => ({
        looks: { ...state.looks, [look.id]: structuredClone(look) },
      })),
    )
  })
  let live = true
  tabs.on('select', (event) => {
    const picked = CITY_LOOKS[event.index]
    if (live && picked) useCity.setState({ look: picked.id })
  })
  const select = (id: string) => {
    const page = tabs.pages[CITY_LOOKS.findIndex((look) => look.id === id)]
    if (page && !page.selected) page.selected = true
  }
  select(useCity.getState().look)
  const unsubscribeCity = useCity.subscribe((state) => {
    for (const [id, look] of Object.entries(state.looks)) Object.assign(values[id]!, look)
    select(state.look)
    pane.refresh()
  })
  const unsubscribeCloud = useCloud.subscribe((state) => {
    draw.draw = state.draw
    pane.refresh()
  })
  return () => {
    live = false
    unsubscribeCity()
    unsubscribeCloud()
  }
}

function addReadout(pane: Pane) {
  const result = { benchmark: 'Not run yet.' }
  const readout = pane.addFolder({ title: 'Readout' })
  const graph = { readonly: true, view: 'graph', rows: 2, interval: 100 } as const
  readout.addBinding(stats, 'fps', { ...graph, min: 0, max: 180 })
  readout.addBinding(stats, 'cpuMs', { ...graph, label: 'cpu ms', min: 0, max: 8 })
  readout.addBinding(stats, 'gpuMs', { ...graph, label: 'gpu ms', min: 0, max: 8 })
  const number = { readonly: true, interval: 250, format: (n: number) => n.toFixed(0) } as const
  readout.addBinding(stats, 'drawCalls', { ...number, label: 'draw calls' })
  readout.addBinding(stats, 'triangles', number)
  readout.addBinding(stats, 'points', number)
  readout.addBinding(stats, 'frames', { ...number, label: 'frames drawn' })
  readout.addBinding(stats, 'pixelRatio', { readonly: true, label: 'pixel ratio' })
  readout.addBinding(stats, 'buildMs', { readonly: true, label: 'build ms' })
  readout.addButton({ title: 'Run benchmark' }).on('click', async () => {
    result.benchmark = 'Running…'
    const report = await benchmark()
    console.log('Benchmark', report)
    const gpu = report.gpuMs ? `${report.gpuMs.median} / ${report.gpuMs.p95}` : 'unavailable'
    result.benchmark = [
      `cpu ms  ${report.cpuMs.median} / ${report.cpuMs.p95}`,
      `gpu ms  ${gpu}`,
      `gap ms  ${report.intervalMs.median} / ${report.intervalMs.p95}`,
      '(median / 95th percentile)',
    ].join('\n')
  })
  readout.addBinding(result, 'benchmark', {
    readonly: true,
    multiline: true,
    rows: 4,
    label: undefined,
    interval: 250,
  })
  return () => {}
}
