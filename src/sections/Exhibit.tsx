import { lazy, Suspense, useState } from 'react'
import { exhibit } from '../content/exhibit'
import { INDEX_PATH, RESUME_PATH } from '../routes'
import { Header } from './Header'
import { useOnScreen } from './onScreen'
import { Optional } from './Scene'

// The exhibit's scene, by its own dynamic import, as the story's is (./Scene.tsx). It shares the
// city's code with the story, so a visitor who has seen one has most of the other.
// oxlint-disable-next-line no-restricted-imports -- the exhibit's one lazy import
const ExhibitScene = lazy(() => import('../experience/Exhibit'))

const LINKS = [
  { href: '/', label: 'Story' },
  { href: INDEX_PATH, label: 'Index' },
  { href: RESUME_PATH, label: 'Resume' },
]

/**
 * The exhibit (D48): the city whole and lit, with no story, to look round. The canvas fills the
 * window and takes the pointer; the caption is text over it, as everywhere, and readable without
 * the scene.
 */
export function Exhibit() {
  const onScreen = useOnScreen()
  const [pins, setPins] = useState<HTMLDivElement | null>(null)
  const [failed, setFailed] = useState(false)

  return (
    <>
      {onScreen && !failed && (
        <>
          <div aria-hidden="true" className="fixed inset-0 h-lvh print:hidden">
            <Optional onFail={() => setFailed(true)}>
              <Suspense fallback={null}>
                <ExhibitScene pins={pins} />
              </Suspense>
            </Optional>
          </div>
          <div
            ref={setPins}
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 top-0 z-5 h-lvh overflow-hidden print:hidden"
          />
        </>
      )}
      <Header links={LINKS} />
      <main className="caption pointer-events-none fixed inset-x-0 bottom-0 px-6 pt-24 pb-10 sm:px-10 sm:pb-12">
        <div className="max-w-md">
          <p className="readout text-lit">{exhibit.label}</p>
          <h1 className="statement mt-2">{exhibit.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-dim">{exhibit.caption}</p>
          {onScreen && !failed ? (
            <p className="readout mt-4">{exhibit.how}</p>
          ) : (
            <p className="readout mt-4">{exhibit.missing}</p>
          )}
        </div>
      </main>
    </>
  )
}
