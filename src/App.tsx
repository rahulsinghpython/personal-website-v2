import { IndexView } from './index-view/IndexView'
import { pageFor } from './routes'
import { Exhibit } from './sections/Exhibit'
import { Resume } from './sections/Resume'
import { Story } from './sections/Story'

/** `path` is passed in, not read from `location`, so the same tree renders at build time. */
export function App({ path }: { path: string }) {
  const page = pageFor(path)
  if (page === 'index') return <IndexView />
  if (page === 'exhibit') return <Exhibit />
  if (page === 'resume') return <Resume />
  return <Story />
}
