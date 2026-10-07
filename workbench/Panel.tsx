import { useEffect, useRef } from 'react'
import { Pane } from 'tweakpane'
import type { PartId } from '../src/experience/machine/part'
import { POINT_LOOK } from '../src/experience/machine/points'
import { variants } from '../src/experience/machine/variants'
import { applyView } from './camera'
import { useCloud } from './cloud'
import { benchmark, stats } from './stats'
import { useWorkbench, type WorkbenchState } from './store'

const SETTINGS = [
  'tier',
  'view',
  'shading',
  'focus',
  'compare',
  'thumb',
  'phone',
  'capDpr',
] as const
type Settings = Pick<WorkbenchState, (typeof SETTINGS)[number]>

const pick = (state: WorkbenchState): Settings =>
  Object.fromEntries(SETTINGS.map((key) => [key, state[key]])) as Settings

/**
 * The control panel. Tweakpane edits plain objects, so the panel keeps its own copies of the
 * store's values, writes changes back to the store, and refreshes when the store changes
 * from somewhere else (the URL, the console, a reset).
 */
export function Panel() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const store = useWorkbench
    const pane = new Pane({ container: container.current!, title: 'Workbench' })
    const settings = pick(store.getState())
    const values = structuredClone(store.getState().params)
    const result = { benchmark: 'Not run yet.' }

    pane.addBinding(settings, 'tier', { options: { high: 'high', mid: 'mid', low: 'low' } })
    pane.addBinding(settings, 'view', {
      options: {
        'three-quarter': 'iso',
        front: 'front',
        side: 'side',
        top: 'top',
        free: 'free',
        story: 'story',
      },
    })
    pane.addBinding(settings, 'shading', { options: { shaded: 'shaded', flat: 'flat' } })
    pane.addBinding(settings, 'focus', {
      label: 'show part',
      options: { all: 'all', core: 'core', scanner: 'scanner', rings: 'rings', lens: 'lens' },
    })
    pane.addBinding(settings, 'compare', { label: 'side by side' })
    pane.addBinding(settings, 'thumb', { label: 'thumbnail' })
    pane.addBinding(settings, 'phone', { label: 'phone size' })
    pane.addBinding(settings, 'capDpr', { label: 'tier dpr' })

    // Round 6. With the story off the Machine is whole and dormant, as the earlier rounds saw it.
    const scrub = { on: store.getState().beat !== null, beat: store.getState().beat ?? 0 }
    const storyFolder = pane.addFolder({ title: 'Story' })
    storyFolder.addBinding(scrub, 'on', { label: 'in the story' })
    storyFolder.addBinding(scrub, 'beat', { min: 0, max: 7, step: 0.01 })

    // The cloud. `share` is how much of the point budget a part gets for its size.
    const cloud = structuredClone(useCloud.getState())
    pane.addBinding(cloud, 'draw', { options: { solid: 'solid', points: 'points' } })
    const points = pane.addFolder({ title: 'Points' })
    points.addBinding(cloud, 'density', { min: 0.02, max: 1, step: 0.01 })
    points.addBinding(cloud, 'size', {
      min: 0.004,
      max: 0.05,
      step: 0.001,
      format: (value: number) => value.toFixed(3),
    })
    points.addBinding(cloud, 'brightness', { min: 0.05, max: 2, step: 0.01 })
    points.addBinding(cloud, 'boost', { label: 'low-count boost', min: 0, max: 0.8, step: 0.01 })
    points.addBinding(cloud, 'thin', { label: 'thin-piece lift', min: 0, max: 1, step: 0.01 })
    for (const part of ['core', 'scanner', 'rings', 'lens'] as const)
      points.addBinding(cloud.weights, part, {
        label: `${part} share`,
        min: 0.2,
        max: 20,
        step: 0.1,
      })
    points.addButton({ title: 'Reset to the chosen look' }).on('click', () => {
      useCloud.setState(structuredClone(POINT_LOOK))
    })
    const unsubscribeCloud = useCloud.subscribe((state) => {
      if (JSON.stringify(cloud) === JSON.stringify(state)) return
      // In place: the share sliders are bound to this `weights` object, not to a replacement.
      const { weights, ...rest } = state
      Object.assign(cloud, rest)
      Object.assign(cloud.weights, weights)
      pane.refresh()
    })

    // One tab per variant, one folder per part, one slider per parameter.
    const tabs = pane.addTab({ pages: variants.map((machine) => ({ title: machine.id })) })
    variants.forEach((machine, index) => {
      const page = tabs.pages[index]!
      for (const part of machine.parts) {
        const folder = page.addFolder({ title: part.id })
        for (const [key, spec] of Object.entries(part.params)) {
          folder
            .addBinding(values[machine.id]![part.id]!, key, {
              min: spec.min,
              max: spec.max,
              step: spec.step,
            })
            .on('change', (event) =>
              store.getState().setParam(machine.id, part.id as PartId, key, event.value),
            )
        }
      }
      page
        .addButton({ title: `Copy ${machine.id}'s values` })
        .on('click', () =>
          navigator.clipboard.writeText(
            JSON.stringify(store.getState().params[machine.id], null, 2),
          ),
        )
      page
        .addButton({ title: `Reset ${machine.id}` })
        .on('click', () => store.getState().resetVariant(machine.id))
    })
    tabs.on('select', (event) => store.setState({ variant: variants[event.index]!.id }))

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

    pane.on('change', () => {
      if (JSON.stringify(cloud) !== JSON.stringify(useCloud.getState()))
        useCloud.setState(structuredClone(cloud))
      const state = store.getState()
      const beat = scrub.on ? scrub.beat : null
      if (beat !== state.beat) store.setState({ beat })
      const changed = SETTINGS.filter((key) => settings[key] !== state[key])
      if (changed.length === 0) return
      store.setState(pick({ ...state, ...settings }))
      if (changed.includes('view')) applyView(settings.view)
    })

    const unsubscribe = store.subscribe((state) => {
      Object.assign(settings, pick(state))
      scrub.on = state.beat !== null
      if (state.beat !== null) scrub.beat = state.beat
      for (const [variant, parts] of Object.entries(state.params))
        for (const [part, partValues] of Object.entries(parts))
          Object.assign(values[variant]![part]!, partValues)
      const page = tabs.pages[variants.findIndex((machine) => machine.id === state.variant)]
      if (page && !page.selected) page.selected = true
      pane.refresh()
    })
    const start = tabs.pages[variants.findIndex((m) => m.id === store.getState().variant)]
    if (start) start.selected = true

    return () => {
      unsubscribe()
      unsubscribeCloud()
      pane.dispose()
    }
  }, [])

  return <div className="panel" ref={container} />
}
