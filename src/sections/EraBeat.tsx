import { statements } from '../content/beats'
import { yearRange } from '../content/dates'
import { claimId, eras, type Era } from '../content/eras'
import { Beat } from './Beat'

/**
 * Core, Scanner, Rings and Lens: one job each, all the same shape (docs/DECISIONS.md, D45). The
 * headline leads with the work, the company and role are small print, and every claim is its own
 * numbered line. The scene pins each claim to its proof in the city, under the same name, so
 * pointing at either lights both. Without the scene this is the whole of it.
 */
export function EraBeat({ era }: { era: Era }) {
  return (
    <Beat id={era.part} banded dwell>
      <p className="readout text-lit">{`Job ${eras.indexOf(era) + 1} of ${eras.length} / ${era.field}`}</p>
      <h2 id={`${era.part}-title`} className="headline mt-3">
        {statements[era.part]}
      </h2>
      <p className="readout mt-3">{`${era.company} / ${era.role} / ${yearRange(era)}`}</p>
      <ol className="claims mt-6">
        {era.claims.map((claim, index) => (
          <li key={claim.text} data-claim={claimId(era, index)}>
            <span className="readout">{String(index + 1).padStart(2, '0')}</span>
            <span>{claim.text}</span>
          </li>
        ))}
      </ol>
    </Beat>
  )
}
