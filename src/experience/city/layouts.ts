import { param, type ParamSchema } from '../params'
import type { LandmarkId } from './landmarks'
import { circle, rect, type Vec2 } from './plan'

// Where everything in the city stands. A layout is data: the water, the roads, the districts and
// a place for each landmark. ./city.ts turns it into blocks and shapes.

/** The groups of numbers the workbench can tune a layout by. */
export type CityGroup = 'water' | 'cbd' | 'heartland' | 'landmarks'
export type CitySchema = Record<CityGroup, ParamSchema>
export type CityValues = Record<CityGroup, Record<string, number>>

/** Where a landmark stands, and how far it is turned from facing the visitor, in radians. */
export type Placement = { at: Vec2; turn: number }

export type Layout = {
  id: string
  label: string
  seed: number
  /** Half the width of the square tile of map the city is cut from. */
  extent: number
  /** The bay's shore, as a closed outline. */
  bay: Vec2[]
  /** The river's centre line, from upstream to where it runs into the bay. */
  river: Vec2[]
  roads: Vec2[][]
  /** The line of the MRT viaduct. */
  mrt: Vec2[]
  /** The outline of the CBD. Its towers are on a tighter grid than the heartland's blocks. */
  cbd: Vec2[]
  /** The Lens's tower is the CBD tower nearest this point. Made up; never a real building. */
  tower: Vec2
  /** The block numbered BLK 2024, whose windows light at the Rings beat, is the one nearest here. */
  blk: Vec2
  /** Parks and grounds, where no ordinary block stands. */
  open: Vec2[][]
  landmarks: Record<LandmarkId, Placement>
  params: CitySchema
}

const schema = (values: {
  river: number
  cbdSpacing: number
  cbdHeight: number
  tower: number
  hdbHeight: number
}): CitySchema => ({
  water: { river: param(values.river, 0.08, 0.4) },
  cbd: {
    spacing: param(values.cbdSpacing, 0.22, 0.5),
    size: param(0.19, 0.1, 0.3),
    height: param(values.cbdHeight, 0.4, 2.4),
    tower: param(values.tower, 0.8, 2.6),
    empty: param(0.12, 0, 0.6),
  },
  heartland: {
    spacing: param(0.55, 0.35, 0.9),
    height: param(values.hdbHeight, 0.15, 1),
    slabs: param(0.7, 0, 1),
    empty: param(0.12, 0, 0.6),
  },
  landmarks: { size: param(1, 0.5, 1.6) },
})

/**
 * The city as sketched in workbench/city-sketches.html, "From the map", which Rahul picked (D38
 * to D40). The story's camera is built round this composition. The bay is a round basin, the
 * river comes in from the near left, the CBD stands on the left, the Flyer and the Esplanade on
 * the right. Pinnacle@Duxton, added after the sketch, stands in the heartland beside BLK 2024,
 * where the Rings beat sees both; the Science Centre is the sketch's scanned roof, in front, on
 * open ground.
 */
const sketched: Layout = {
  id: 'A',
  label: 'as sketched',
  seed: 89,
  extent: 3.6,
  bay: circle([0, -0.2], 1.1),
  river: [
    [-3.2, 2.4],
    [-2.35, 1.75],
    [-1.8, 1.05],
    [-1.25, 0.5],
    [-0.85, 0.15],
  ],
  roads: [
    [
      [-3.3, 1.65],
      [3.3, 1.65],
    ],
    [
      [-3.3, 2.2],
      [3.3, 2.2],
    ],
    [
      [-3.3, 2.75],
      [3.3, 2.75],
    ],
    [
      [-3.3, -3.05],
      [3.3, -3.05],
    ],
    [
      [-2.75, -3.3],
      [-2.75, 3.3],
    ],
    [
      [2.75, -3.3],
      [2.75, 3.3],
    ],
    [
      [2.2, -0.6],
      [2.2, 3.3],
    ],
    [
      [-2.45, -1.2],
      [-1.1, -1.2],
    ],
    [
      [-2.45, -0.5],
      [-1.15, -0.5],
    ],
    [
      [-1.85, -1.6],
      [-1.85, 0.1],
    ],
  ],
  mrt: Array.from({ length: 13 }, (_, k) => {
    const angle = (0.15 + (k / 12) * 0.75) * Math.PI
    return [Math.cos(angle) * 2.78, Math.sin(angle) * 2.78] as Vec2
  }),
  cbd: rect(-2.5, -1.65, -0.85, 0),
  tower: [-1.55, -0.8],
  blk: [1.1, 2.0],
  open: [
    rect(-0.7, -3.0, 2.3, -0.75),
    rect(0.5, -0.9, 2.4, 1.35),
    // The Science Centre's grounds, so the Scanner beat sees its roof clear.
    rect(-1.2, 2.0, 0.7, 3.6),
  ],
  landmarks: {
    mbs: { at: [0.45, -1.6], turn: 0 },
    artscience: { at: [-0.45, -1.05], turn: 0 },
    supertrees: { at: [1.49, -2.36], turn: 0 },
    flyer: { at: [1.85, -0.3], turn: 0.95 },
    esplanade: { at: [1.15, 0.6], turn: 0.96 },
    merlion: { at: [-0.78, 0.42], turn: 2.24 },
    pinnacle: { at: [1.6, 1.5], turn: 0 },
    science: { at: [0.05, 2.35], turn: 0 },
  },
  params: schema({ river: 0.16, cbdSpacing: 0.34, cbdHeight: 1.35, tower: 1.6, hdbHeight: 0.5 }),
}

/** The layout of the city. One, now Rahul has picked it (docs/DECISIONS.md, D40). */
export const layouts: Layout[] = [sketched]
