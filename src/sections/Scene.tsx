import { Component, lazy, Suspense, useSyncExternalStore, type ReactNode } from 'react'

// The one place the page reaches the scene. It is a dynamic import, so three.js and everything
// under src/experience/ arrive in their own chunk, after the text is on screen.
// oxlint-disable-next-line no-restricted-imports -- the one lazy import the rule's message allows
const Experience = lazy(() => import('../experience/Experience'))

/** If the scene cannot start (no WebGL, or the chunk fails to load), the page carries on without it. */
class Optional extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

const never = () => () => {}

/** The scene layer: a canvas fixed behind the content. It holds nothing the text does not say. */
export function Scene() {
  // False while prerendering and hydrating, so the scene is not in the built HTML and is not
  // asked for until the page is on screen.
  const wanted = useSyncExternalStore(
    never,
    () => true,
    () => false,
  )
  if (!wanted) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 print:hidden">
      <Optional>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Optional>
    </div>
  )
}
