import { useSyncExternalStore } from 'react'

const never = () => () => {}

/**
 * False while prerendering and hydrating, true once the page is on screen. For what cannot be in
 * the built HTML: the scene, which is not asked for until then, and anything that needs scripts.
 */
export const useOnScreen = () =>
  useSyncExternalStore(
    never,
    () => true,
    () => false,
  )
