// Mirrors the Projects table in docs/CONTENT.md. Change the doc first.
// Projects live inside their era, never in a list of their own (VISION, principle 1).
// No personal projects in this release (D15).

import type { EraId } from './eras'

export type Project = {
  id: string
  era: EraId
  name: string
  summary: string
}

export const projects: readonly Project[] = [
  {
    id: 'point-cloud-to-mesh',
    era: 'etavolt',
    name: 'LiDAR point-cloud-to-mesh software',
    summary:
      'Builds 3D meshes from point clouds and LiDAR scans, in React, Three.js and Python. Made for solar: roofs reconstructed in 3D, analysed, and panel placement optimised. Two development cycles shipped. One of the meshes is the Science Centre.',
  },
  {
    id: 'tuition-platform',
    era: 'uniad',
    name: 'Tuition centre management platform',
    summary: 'An enterprise product for tuition centres.',
  },
]

export function projectsFor(era: EraId): readonly Project[] {
  return projects.filter((project) => project.era === era)
}
