import { cues, statements } from '../content/beats'
import { yearRange } from '../content/dates'
import { eras } from '../content/eras'
import { panelId } from '../content/panels'
import { opens, site } from '../content/site'
import { EXHIBIT_PATH, INDEX_PATH, RESUME_PATH } from '../routes'
import { Beat } from './Beat'
import { EraBeat } from './EraBeat'
import { Header } from './Header'
import { JobPanels } from './JobPanels'
import { Scene } from './Scene'

const LINKS = [
  { href: EXHIBIT_PATH, label: 'Exhibit' },
  { href: INDEX_PATH, label: 'Index' },
  { href: RESUME_PATH, label: 'Resume' },
]

/** The content layer: the eight beats, in story order. */
export function Story() {
  return (
    <>
      <Scene />
      <Header links={LINKS} />
      <main>
        {/* The one hint the opening gives: that the page goes on. It says nothing of what is
            here (VISION, principle 2): a chevron bounces the way the page goes, and it fades on the
            first scroll (D48). */}
        <Beat
          id="found"
          centred
          foot={
            // Also a link to the next beat, for a visitor who clicks rather than scrolls.
            <a href="#signal" className="scroll-cue" aria-label={cues.scroll}>
              <span className="readout">
                <span className="cue-wheel">{cues.scroll}</span>
                <span className="cue-touch">{cues.swipe}</span>
              </span>
              <span className="cue-arrow" aria-hidden="true">
                <svg viewBox="0 0 28 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 2l12 12L26 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          }
        >
          {/* A size up from the other statements: it stands alone in the middle (D37). */}
          <h1 id="found-title" className="statement text-xl sm:text-2xl">
            {statements.found}
          </h1>
        </Beat>

        <Beat id="signal">
          <h2 id="signal-title" className="statement">
            {statements.signal}
          </h2>
        </Beat>

        {eras.map((era) => (
          <EraBeat key={era.id} era={era} />
        ))}

        <Beat id="whole" banded dwell>
          <p className="readout text-lit">The whole career</p>
          <h2 id="whole-title" className="headline mt-3">
            {statements.whole}
          </h2>
          {/* The same as clicking a job's subject in the city: each opens the job's panel
              (D56). Each job's tag in the city has the same name, so pointing at either lights
              both (D45). */}
          <ol className="claims mt-6" aria-label="Jobs">
            {eras.map((era, index) => (
              <li key={era.id} data-claim={`job-${era.part}`}>
                <span className="readout">{String(index + 1).padStart(2, '0')}</span>
                <button type="button" popoverTarget={panelId(era.part)} className="job-open">
                  {era.field}
                  <span className="readout block">{`${era.company} / ${yearRange(era)}`}</span>
                </button>
              </li>
            ))}
          </ol>
          {/* Turning the city is the exhibit's, where a drag fights no scroll (D56). */}
          <a
            href={EXHIBIT_PATH}
            className="readout mt-6 inline-block py-1 text-cold hover:text-lit"
          >
            Look round the city
          </a>
        </Beat>

        {/* Banded like a job: the links are what the story ends on, and the city is lit behind them. */}
        <Beat id="contact" banded>
          <h2 id="contact-title" className="statement">
            {statements.contact}
          </h2>
          <ul className="contact mt-6">
            {site.contact.map((link) => (
              <li key={link.id}>
                <a href={link.href} {...opens(link)}>
                  <span className="readout">{link.label}</span>
                  <span className="break-all">{link.text}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="readout mt-8">{`${site.name} / ${site.title} / ${site.location}`}</p>
        </Beat>
      </main>
      <JobPanels />
    </>
  )
}
