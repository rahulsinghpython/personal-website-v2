import { site } from './content/site'

/** The Index cannot live at /index, which is the home page's own file name. */
export const INDEX_PATH = '/plain'

/** The city on its own, to look round, with no story (D48). */
export const EXHIBIT_PATH = '/exhibit'

/** The résumé: the PDF, shown and offered for download (D49). */
export const RESUME_PATH = '/resume'
/** The PDF itself, in public/. Replaced by hand; keep the name. */
export const RESUME_FILE = '/resume.pdf'

export type Page = 'story' | 'index' | 'exhibit' | 'resume'

export function pageFor(path: string): Page {
  const page = path.replace(/\/+$/, '')
  if (page === INDEX_PATH) return 'index'
  if (page === EXHIBIT_PATH) return 'exhibit'
  if (page === RESUME_PATH) return 'resume'
  return 'story'
}

export function titleFor(page: Page): string {
  if (page === 'index') return `${site.name} / Index`
  if (page === 'exhibit') return `${site.name} / The city`
  if (page === 'resume') return `${site.name} / Resume`
  return site.name
}

export const description = `${site.name}. ${site.title}, ${site.location}.`
