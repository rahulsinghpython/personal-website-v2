import { create } from 'zustand'

/**
 * Whether the city is drawn as the greybox or as points. The points' own numbers are the looks,
 * in ./city.ts.
 */
export type CloudState = {
  /** `solid` is the greybox; `points` is the cloud sampled from it. */
  draw: 'solid' | 'points'
}

/** `draw=points` in the URL. */
export const useCloud = create<CloudState>()(() => ({
  draw: new URLSearchParams(location.search).get('draw') === 'points' ? 'points' : 'solid',
}))

useCloud.subscribe((state) => {
  const query = new URLSearchParams(location.search)
  if (state.draw === 'points') query.set('draw', 'points')
  else query.delete('draw')
  const search = query.toString().replaceAll('%3A', ':').replaceAll('%2C', ',')
  history.replaceState(null, '', search ? `?${search}` : location.pathname)
})
