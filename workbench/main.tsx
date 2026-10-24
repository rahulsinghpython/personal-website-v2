import { createRoot } from 'react-dom/client'
import { layouts } from '../src/experience/city/layouts'
import { variants } from '../src/experience/machine/variants'
import { applyView, poseFromUrl } from './camera'
import { useCity } from './city'
import { useCloud } from './cloud'
import { benchmark, stats, type BenchmarkReport } from './stats'
import { useWorkbench, type WorkbenchState } from './store'
import { Workbench } from './Workbench'
import './workbench.css'

// Development only. This page is not an input to `vite build`, so none of it ships;
// scripts/check-size.mjs fails the build if it ever does.

declare global {
  interface Window {
    /** For driving the workbench from the console or the Chrome DevTools MCP. */
    __workbench: {
      get: () => WorkbenchState
      set: (partial: Partial<WorkbenchState>) => void
      benchmark: (options?: { frames?: number; warmup?: number }) => Promise<BenchmarkReport>
      stats: typeof stats
      cloud: typeof useCloud
      city: typeof useCity
      variants: string[]
      layouts: string[]
    }
  }
}

if (!poseFromUrl()) {
  const view = useWorkbench.getState().view
  applyView(view === 'free' ? 'iso' : view)
}

// A free camera placed for one world is the wrong size for the other, so switching world from a
// free camera starts from the three-quarter view.
useWorkbench.subscribe((state, previous) => {
  if (state.world === previous.world) return
  const view = state.view === 'free' ? 'iso' : state.view
  if (view !== state.view) useWorkbench.setState({ view })
  applyView(view)
})

window.__workbench = {
  get: useWorkbench.getState,
  set: (partial) => {
    const before = useWorkbench.getState().world
    useWorkbench.setState(partial)
    // A change of world applies its own view, above.
    if (partial.view && useWorkbench.getState().world === before) applyView(partial.view)
  },
  benchmark,
  stats,
  cloud: useCloud,
  city: useCity,
  variants: variants.map((machine) => machine.id),
  layouts: layouts.map((layout) => layout.id),
}

createRoot(document.getElementById('root')!).render(<Workbench />)
