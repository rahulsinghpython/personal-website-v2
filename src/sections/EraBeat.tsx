import { statements } from '../content/beats'
import { yearRange } from '../content/dates'
import type { Era } from '../content/eras'
import { projectsFor } from '../content/projects'
import { Beat } from './Beat'

/** Core, Scanner, Rings and Lens: one era each, all the same shape. */
export function EraBeat({ era }: { era: Era }) {
  return (
    <Beat id={era.part}>
      <h2 id={`${era.part}-title`} className="readout">
        {`${yearRange(era)} / ${era.company} / ${era.role}`}
      </h2>
      <p className="statement mt-4">{statements[era.part]}</p>
      <ul className="mt-8 space-y-3 text-sm leading-relaxed text-dim">
        {projectsFor(era.id).map((project) => (
          <li key={project.id}>
            <span className="readout block text-cold">{project.name}</span>
            {project.summary}
          </li>
        ))}
        {era.work.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </Beat>
  )
}
