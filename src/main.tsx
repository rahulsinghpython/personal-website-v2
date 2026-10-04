import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import type { PrerenderArguments, PrerenderResult } from 'vite-prerender-plugin'
import { App } from './App'
import { description, INDEX_PATH, pageFor, titleFor } from './routes'
import './styles/index.css'

function tree(path: string) {
  return (
    <StrictMode>
      <App path={path} />
    </StrictMode>
  )
}

// This module is also loaded in Node at build time, to call prerender() below.
if (typeof window !== 'undefined') {
  const root = document.getElementById('root')!
  // Built pages arrive prerendered and are hydrated. The dev server serves an empty root.
  if (root.hasChildNodes()) hydrateRoot(root, tree(location.pathname))
  else createRoot(root).render(tree(location.pathname))
}

/** Called by vite-prerender-plugin once per page during `vite build`. */
export async function prerender({ url }: PrerenderArguments): Promise<PrerenderResult> {
  // Server-only, so imported here to keep it out of the client bundle. The edge build, because
  // the browser build opens a MessageChannel on import and `vite build` would never exit.
  const { renderToString } = await import('react-dom/server.edge')

  return {
    html: renderToString(tree(url)),
    links: new Set([INDEX_PATH]),
    head: {
      lang: 'en',
      title: titleFor(pageFor(url)),
      elements: new Set([{ type: 'meta', props: { name: 'description', content: description } }]),
    },
  }
}
