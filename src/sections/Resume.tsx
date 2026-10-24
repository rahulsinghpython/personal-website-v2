import { lazy, Suspense } from 'react'
import { resume } from '../content/resume'
import { site } from '../content/site'
import { EXHIBIT_PATH, INDEX_PATH, RESUME_FILE } from '../routes'
import { Header } from './Header'
import { useOnScreen } from './onScreen'
import { Optional } from './Scene'

// PDF.js arrives in its own chunk, after the page is on screen, as the scene does on the home page.
const PdfSheet = lazy(() => import('../resume/PdfSheet'))

const LINKS = [
  { href: '/', label: 'Story' },
  { href: EXHIBIT_PATH, label: 'Exhibit' },
  { href: INDEX_PATH, label: 'Index' },
]

/**
 * The résumé (D49): the PDF drawn as sheets on the dark page by PDF.js, the same on a phone as on
 * a laptop, with a download beside it. Without scripts, or if the PDF cannot be drawn, the page
 * still offers the file to open and to download.
 */
export function Resume() {
  const onScreen = useOnScreen()
  const opener = (
    <a href={RESUME_FILE} target="_blank" rel="noopener" className="readout text-lit">
      {resume.openPhone}
    </a>
  )
  // Said only when the PDF could not be drawn.
  const missing = (
    <div className="grid h-full place-content-center gap-3 p-8 text-center">
      <p className="text-sm text-dim">{resume.missing}</p>
      {opener}
    </div>
  )
  // The sheet's shape while PDF.js loads, so the page does not jump when the PDF arrives. Without
  // scripts it stays, with the file to open.
  const blank = (
    <div className="resume-page resume-blank grid place-content-center">
      <noscript>{opener}</noscript>
    </div>
  )

  return (
    <>
      <Header links={LINKS} backed />
      <main className="mx-auto grid max-w-6xl gap-10 px-6 pt-28 pb-16 sm:px-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="readout text-lit">{resume.label}</p>
          <h1 className="statement mt-2">{site.name}</h1>
          <p className="readout mt-2">{`${site.title} / ${site.location}`}</p>
          <div className="mt-8 grid gap-3">
            <a href={RESUME_FILE} download={resume.fileName} className="resume-action resume-main">
              {resume.download}
            </a>
            <a href={RESUME_FILE} target="_blank" rel="noopener" className="resume-action">
              {resume.open}
            </a>
          </div>
        </div>

        <div className="min-w-0">
          {onScreen ? (
            <Optional>
              <Suspense fallback={blank}>
                <PdfSheet file={RESUME_FILE} fallback={missing} />
              </Suspense>
            </Optional>
          ) : (
            blank
          )}
        </div>
      </main>
    </>
  )
}
