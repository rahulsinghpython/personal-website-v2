import { site } from './content/site'

/** The Index cannot live at /index, which is the home page's own file name. */
export const INDEX_PATH = '/plain'

export type Page = 'story' | 'index'

export function pageFor(path: string): Page {
  return path.replace(/\/+$/, '') === INDEX_PATH ? 'index' : 'story'
}

export function titleFor(page: Page): string {
  return page === 'index' ? `${site.name} / Index` : site.name
}

export const description = `${site.name}. ${site.title}, ${site.location}.`
