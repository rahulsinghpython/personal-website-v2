import { createRoot } from 'react-dom/client'
import { variants } from '../src/experience/machine/variants'
import { applyView, poseFromUrl } from './camera'
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
      variants: string[]
    }
  }
}

if (!poseFromUrl()) {
  const view = useWorkbench.getState().view
  applyView(view === 'free' ? 'iso' : view)
}

window.__workbench = {
  get: useWorkbench.getState,
  set: (partial) => {
    useWorkbench.setState(partial)
    if (partial.view) applyView(partial.view)
  },
  benchmark,
  stats,
  cloud: useCloud,
  variants: variants.map((machine) => machine.id),
}

createRoot(document.getElementById('root')!).render(<Workbench />)
