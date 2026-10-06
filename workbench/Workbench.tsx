import { variants } from '../src/experience/machine/variants'
import { Panel } from './Panel'
import { useWorkbench } from './store'
import { Viewport } from './Viewport'

export function Workbench() {
  const variant = useWorkbench((state) => state.variant)
  const compare = useWorkbench((state) => state.compare)
  const thumb = useWorkbench((state) => state.thumb)
  const phone = useWorkbench((state) => state.phone)
  const panel = useWorkbench((state) => state.panel)
  const current = variants.find((machine) => machine.id === variant) ?? variants[0]!

  return (
    <div className="workbench" data-thumb={thumb} data-phone={phone}>
      <main className="viewports">
        {compare ? (
          variants.map((machine) => (
            <Viewport key={machine.id} machine={machine} main={machine === current} />
          ))
        ) : (
          // One canvas that swaps its contents, so switching variant keeps the WebGL context.
          <Viewport key="single" machine={current} main />
        )}
      </main>
      {panel && <Panel />}
    </div>
  )
}
