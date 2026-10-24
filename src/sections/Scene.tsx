import { Component, lazy, Suspense, useState, type ReactNode } from 'react'
import { useOnScreen } from './onScreen'

// The one place the page reaches the scene. It is a dynamic import, so three.js and everything
// under src/experience/ arrive in their own chunk, after the text is on screen.
// oxlint-disable-next-line no-restricted-imports -- the one lazy import the rule's message allows
const Experience = lazy(() => import('../experience/Experience'))

/** If the scene cannot start (no WebGL, or the chunk fails to load), the page carries on without it. */
export class Optional extends Component<
  { children: ReactNode; onFail?: () => void },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFail?.()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** The scene layer: a canvas fixed behind the content. It holds nothing the text does not say. */
export function Scene() {
  const wanted = useOnScreen()
  const [pins, setPins] = useState<HTMLDivElement | null>(null)
  if (!wanted) return null

  // As tall as the window is with the browser's toolbar hidden, and no taller or shorter as the
  // toolbar comes and goes. A phone or tablet hides it on the first scroll down, and a canvas
  // that followed it would be resized on every frame of that, which is a new drawing buffer each
  // time.
  //
  // The pins (D45) are drawn over the text, so they can be pointed at, in a layer the same size as
  // the canvas, so a point in the city lands on the same pixel in both. Only the pins themselves
  // take the pointer. They repeat the claims' text, which the page already says.
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh print:hidden"
      >
        <Optional>
          <Suspense fallback={null}>
            <Experience pins={pins} />
          </Suspense>
        </Optional>
      </div>
      <div
        ref={setPins}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-5 h-lvh overflow-hidden print:hidden"
      />
    </>
  )
}
