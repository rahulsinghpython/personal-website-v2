import { yearRange } from '../content/dates'
import { eras } from '../content/eras'
import { panelId, panels, type Picture } from '../content/panels'

function Figure({ picture }: { picture: Picture }) {
  return (
    <figure>
      {/* The full picture in a tab of its own, for a screen too small to read in the panel. */}
      <a href={picture.src} target="_blank" rel="noopener" className="block">
        <img
          src={picture.src}
          alt={picture.alt}
          width={picture.width}
          height={picture.height}
          loading="lazy"
          decoding="async"
        />
      </a>
      <figcaption className="readout mt-2">{picture.caption}</figcaption>
    </figure>
  )
}

/**
 * The jobs' panels at the Whole beat (D56): a job's project, what it did, and what can be shown of
 * it. Native popovers, so they open and close with scripts off, on Escape and on a click outside;
 * with the scene, opening one glides the camera to the job's subject and closing it glides back
 * (src/experience/city/whole.ts). The pictures load only when their panel opens.
 */
export function JobPanels() {
  return eras.map((era, index) => {
    const panel = panels[era.id]
    const id = panelId(era.part)
    return (
      <section
        key={era.id}
        id={id}
        data-work={era.part}
        popover="auto"
        aria-labelledby={`${id}-title`}
        className="work"
      >
        <p className="readout text-lit">{`${String(index + 1).padStart(2, '0')} / ${era.field}`}</p>
        <h2 id={`${id}-title`} className="headline mt-3">
          {panel.name ?? era.field}
        </h2>
        <p className="readout mt-2">{`${era.company} / ${era.role} / ${yearRange(era)}`}</p>
        <p className="mt-5 text-[0.95rem] leading-relaxed text-cold">{panel.summary}</p>
        {panel.claims && (
          <ul className="mt-4 grid gap-2 text-sm leading-snug text-dim">
            {era.claims.map((claim) => (
              <li key={claim.text}>{claim.text}</li>
            ))}
          </ul>
        )}
        {panel.note && <p className="readout mt-6">{panel.note}</p>}
        {panel.film && (
          <figure className="mt-6">
            {/* Its sound track is silent, so there is nothing to caption. */}
            {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              controls
              muted
              playsInline
              preload="none"
              poster={panel.film.poster}
              width={panel.film.width}
              height={panel.film.height}
              aria-label={panel.film.alt}
            >
              <source src={panel.film.src} type="video/mp4" />
            </video>
            <figcaption className="readout mt-2">{panel.film.caption}</figcaption>
          </figure>
        )}
        {panel.pictures.length > 0 && (
          <div className="work-pictures mt-6">
            {panel.pictures.map((picture) => (
              <Figure key={picture.src} picture={picture} />
            ))}
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={`#${era.part}`} className="work-action">
            Read the job
          </a>
          <button
            type="button"
            popoverTarget={id}
            popoverTargetAction="hide"
            className="work-action"
          >
            Close
          </button>
        </div>
      </section>
    )
  })
}
