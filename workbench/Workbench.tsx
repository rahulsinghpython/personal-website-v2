import { layouts } from '../src/experience/city/layouts'
import { CITY_LOOKS } from '../src/experience/city/points'
import { variants } from '../src/experience/machine/variants'
import { useCity } from './city'
import { CityScene } from './CityScene'
import { useCloud } from './cloud'
import { Panel } from './Panel'
import { useWorkbench } from './store'
import { MachineScene, Viewport } from './Viewport'

export function Workbench() {
  const world = useWorkbench((state) => state.world)
  const variant = useWorkbench((state) => state.variant)
  const layout = useCity((state) => state.layout)
  const look = useCity((state) => state.look)
  const draw = useCloud((state) => state.draw)
  const compare = useWorkbench((state) => state.compare)
  const thumb = useWorkbench((state) => state.thumb)
  const phone = useWorkbench((state) => state.phone)
  const panel = useWorkbench((state) => state.panel)

  // Each option is drawn into its own viewport side by side, or the current one into a single
  // canvas that swaps its contents, so switching option keeps the WebGL context.
  // The city as points has one layout, so its options are the looks of the points round.
  const cityLayout = layouts.find((each) => each.id === layout) ?? layouts[0]!
  const options =
    world === 'city' && draw === 'points'
      ? CITY_LOOKS.map((each) => ({
          id: each.id,
          label: each.label,
          current: each.id === look,
          scene: <CityScene layout={cityLayout} look={each.id} />,
        }))
      : world === 'city'
        ? layouts.map((each) => ({
            id: each.id,
            label: each.label,
            current: each.id === layout,
            scene: <CityScene layout={each} />,
          }))
        : variants.map((machine) => ({
            id: machine.id,
            label: machine.label,
            current: machine.id === variant,
            scene: <MachineScene machine={machine} />,
          }))
  const current = options.find((option) => option.current) ?? options[0]!

  return (
    <div className="workbench" data-thumb={thumb} data-phone={phone}>
      <main className="viewports">
        {compare ? (
          options.map((option) => (
            <Viewport key={option.id} main={option === current} id={option.id} label={option.label}>
              {option.scene}
            </Viewport>
          ))
        ) : (
          <Viewport key="single" main id={current.id} label={current.label}>
            {current.scene}
          </Viewport>
        )}
      </main>
      {/* Rebuilt when the world changes, since the two have different controls. */}
      {panel && <Panel key={world} />}
    </div>
  )
}
