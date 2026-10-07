import { statements } from '../content/beats'
import { yearRange } from '../content/dates'
import { eras } from '../content/eras'
import { site } from '../content/site'
import { INDEX_PATH } from '../routes'
import { Beat } from './Beat'
import { EraBeat } from './EraBeat'
import { Scene } from './Scene'

/** The content layer: the eight beats, in story order. */
export function Story() {
  return (
    <>
      <Scene />
      <header className="fixed top-0 right-0 z-10 p-3 sm:p-7">
        <a href={INDEX_PATH} className="readout block p-3 text-cold">
          Index
        </a>
      </header>
      <main>
        <Beat id="found">
          <h1 id="found-title" className="statement">
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

        <Beat id="whole">
          <h2 id="whole-title" className="statement">
            {statements.whole}
          </h2>
          {/* The DOM equivalent of clicking a part on the Machine. */}
          <nav aria-label="Eras" className="mt-8">
            <ul>
              {eras.map((era) => (
                <li key={era.id}>
                  <a href={`#${era.part}`} className="readout block py-2 text-cold">
                    {`${yearRange(era)} / ${era.company} / ${era.role}`}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Beat>

        <Beat id="contact">
          <h2 id="contact-title" className="statement">
            {statements.contact}
          </h2>
          <ul className="mt-8">
            {site.contact.map((link) => (
              <li key={link.id}>
                <a href={link.href} className="readout block py-2 text-cold">
                  {`${link.label} / ${link.text}`}
                </a>
              </li>
            ))}
          </ul>
          <p className="readout mt-8">{`${site.name} / ${site.title} / ${site.location}`}</p>
        </Beat>
      </main>
    </>
  )
}
