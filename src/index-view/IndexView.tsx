import { monthRange } from '../content/dates'
import { eras } from '../content/eras'
import { projectsFor } from '../content/projects'
import { site } from '../content/site'

/** The Index: the same content as the story, plain, dense and printable. */
export function IndexView() {
  // Current roles first, which is the order a recruiter reads in.
  const newestFirst = [...eras].reverse()

  return (
    <>
      <header className="fixed top-0 right-0 p-3 sm:p-7 print:hidden">
        <a href="/" className="readout block p-3 text-cold">
          Back
        </a>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-16 sm:px-10 print:max-w-none print:p-0">
        <h1 className="statement">{site.name}</h1>
        <p className="readout mt-2 print:text-black">{`${site.title} / ${site.location}`}</p>
        <ul className="mt-6 text-sm">
          {site.contact.map((link) => (
            <li key={link.id}>
              <a href={link.href} className="block py-1.5 print:py-0">
                <span className="readout print:text-black">{`${link.label} / `}</span>
                {link.text}
              </a>
            </li>
          ))}
        </ul>

        {newestFirst.map((era) => (
          <section key={era.id} aria-labelledby={`${era.id}-title`} className="mt-12 print:mt-6">
            <h2 id={`${era.id}-title`} className="statement">
              {era.companyFull ? `${era.company} (${era.companyFull})` : era.company}
            </h2>
            <p className="readout mt-2 print:text-black">{`${era.role} / ${monthRange(era)}`}</p>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-dim print:text-black">
              {projectsFor(era.id).map((project) => (
                <li key={project.id}>
                  <span className="readout block text-cold print:text-black">{project.name}</span>
                  {project.summary}
                </li>
              ))}
              {era.work.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </>
  )
}
