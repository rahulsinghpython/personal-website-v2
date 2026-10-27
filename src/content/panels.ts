// Mirrors "The Whole beat's panels" in docs/CONTENT.md. Change the doc first.
// What opens when a job is chosen at the Whole beat (docs/DECISIONS.md, D56): its project, what it
// did, and the pictures cleared to be shown, beside the job's subject in the city. The pictures
// are the old site's, cleared by Rahul on 2026-10-08, resized into public/work/. Nothing of the
// Cognizant work may be shown, so its panel is words only.

import type { EraId, PartId } from './eras'

/** The id of a job's panel, which its line at Whole and its subject in the city open. */
export const panelId = (part: PartId) => `work-${part}`

export type Picture = {
  src: string
  /** What is in it, for a visitor who cannot see it. */
  alt: string
  /** What it shows, under it. */
  caption: string
  width: number
  height: number
}

export type Film = Picture & {
  /** A still from it, shown until the visitor plays it. */
  poster: string
}

export type Panel = {
  /** The project's name, where the work had one. */
  name?: string
  /** What it did, in a line or two. */
  summary: string
  /** Its claims, said again, for a job with nothing to show. */
  claims?: boolean
  /** Why there is nothing to see, where there is not. */
  note?: string
  film?: Film
  pictures: readonly Picture[]
}

const at = (era: string, name: string) => `/work/${era}/${name}.webp`

export const panels: Record<EraId, Panel> = {
  s2t: {
    summary:
      'Led the API development team, and presented the software on international business trips.',
    pictures: [
      {
        src: at('s2t', 'road-show'),
        alt: 'The S2T team standing in front of their stand on a road show.',
        caption: 'On the road show',
        width: 1065,
        height: 881,
      },
      {
        src: at('s2t', 'road-show-booth'),
        alt: 'The S2T stand on a road show, the team in front of it.',
        caption: 'The stand',
        width: 960,
        height: 1280,
      },
      {
        src: at('s2t', 'singapore-team'),
        alt: 'The Singapore team round a table at dinner.',
        caption: 'The Singapore team',
        width: 960,
        height: 1280,
      },
    ],
  },
  etavolt: {
    name: 'LiDAR point-cloud-to-mesh software',
    summary:
      'Builds 3D meshes from point clouds and LiDAR scans, in React, Three.js and Python. Made for solar: roofs reconstructed in 3D, analysed, and panel placement optimised. Two development cycles shipped. One of the meshes is the Science Centre.',
    film: {
      src: '/work/etavolt/mesh-from-lidar.mp4',
      poster: at('etavolt', 'mesh-from-lidar'),
      alt: 'A building in white LiDAR points, seen from one side and another as its mesh is built.',
      caption: 'A mesh built from LiDAR',
      width: 604,
      height: 600,
    },
    pictures: [
      {
        src: at('etavolt', 'roofs-in-3d'),
        alt: 'A block of buildings reconstructed in grey 3D, solar panels in red across one roof.',
        caption: 'Roofs reconstructed in 3D',
        width: 1280,
        height: 613,
      },
      {
        src: at('etavolt', 'science-centre-mesh'),
        alt: 'The Science Centre as a dark grey mesh, seen from above.',
        caption: 'The Science Centre, as a mesh',
        width: 937,
        height: 726,
      },
      {
        src: at('etavolt', 'roof-analysis'),
        alt: 'A roof shaded from purple to yellow, panels outlined over it.',
        caption: 'Solar roof analysis',
        width: 537,
        height: 409,
      },
      {
        src: at('etavolt', 'panel-placement'),
        alt: "A grid over a roof's outline, the panels that fit filled in blue.",
        caption: 'Panels placed on a complex roof',
        width: 1020,
        height: 780,
      },
      {
        src: at('etavolt', 'optimising-panels'),
        alt: 'A grid of panels in red over a roof outlined in blue, the best ones filled in green.',
        caption: 'Optimising where the panels go',
        width: 488,
        height: 336,
      },
    ],
  },
  uniad: {
    name: 'Tuition centre management platform',
    summary:
      'An enterprise product for tuition centres: students, lesson bookings on a calendar synced across users, invoicing and PDF generation, over one relational database.',
    pictures: [
      {
        src: at('uniad', 'dashboard'),
        alt: 'The admin dashboard: counts of students and classes, revenue and attendance charts.',
        caption: 'Dashboard',
        width: 1280,
        height: 1031,
      },
      {
        src: at('uniad', 'calendar'),
        alt: 'A week of lessons on a calendar, in coloured blocks.',
        caption: 'Calendar synced across users',
        width: 1280,
        height: 827,
      },
      {
        src: at('uniad', 'students'),
        alt: 'A table of students with their levels, classes and status.',
        caption: 'Students',
        width: 1280,
        height: 756,
      },
      {
        src: at('uniad', 'invoicing'),
        alt: 'A table of invoices with their amounts, dates and status.',
        caption: 'Invoicing',
        width: 1280,
        height: 833,
      },
      {
        src: at('uniad', 'pdf-generation'),
        alt: 'A new invoice being filled in, ready to save as a PDF.',
        caption: 'PDF generation',
        width: 1280,
        height: 1050,
      },
    ],
  },
  cognizant: {
    summary: 'AI products for government, built with data scientists and rolled out across it.',
    claims: true,
    note: 'Government work: none of it can be shown.',
    pictures: [],
  },
}
