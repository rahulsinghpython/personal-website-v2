import type { ShaderMaterial, Vector3 } from 'three'
import { defaultValues } from '../params'
import { GROUPS } from './city'
import { layouts, type CityValues } from './layouts'
import { CITY_LOOKS } from './points'
import { cityStory } from './story'

// What the home page and the exhibit both draw the city with: the sketched layout at its chosen
// numbers, in look A (D40, D42), and how the story's state reaches the points.

export const layout = layouts[0]!
export const look = CITY_LOOKS[0]!
export const values = Object.fromEntries(
  Object.entries(layout.params).map(([group, schema]) => [group, defaultValues(schema)]),
) as CityValues

/** The page's background (--color-void), so the canvas can be opaque. */
export const VOID = '#0a0a0a'

/**
 * Copies the story into a points material. Called every frame, so it makes nothing new. `focus`
 * is how far the camera is from what it looks at, the story's unless the camera is the visitor's.
 */
export function applyCity(
  material: ShaderMaterial,
  flow: [number, number, number],
  focus = cityStory.camera.distance,
) {
  const uniforms = material.uniforms
  uniforms.uRise!.value = cityStory.rise
  uniforms.uPour!.value = cityStory.pour
  uniforms.uWindows!.value = cityStory.windows
  const lit = uniforms.uLit!.value as number[]
  const gain = uniforms.uGain!.value as number[]
  for (let i = 0; i < GROUPS.length; i++) {
    lit[i] = cityStory.lit[i]!
    gain[i] = cityStory.gain[i]!
  }
  uniforms.uFocus!.value = focus
  ;(uniforms.uFlow!.value as Vector3).set(...flow)
}
