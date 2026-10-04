import { IndexView } from './index-view/IndexView'
import { pageFor } from './routes'
import { Story } from './sections/Story'

/** `path` is passed in, not read from `location`, so the same tree renders at build time. */
export function App({ path }: { path: string }) {
  return pageFor(path) === 'index' ? <IndexView /> : <Story />
}
