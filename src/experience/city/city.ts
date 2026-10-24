import {
  BufferGeometry,
  Float32BufferAttribute,
  PlaneGeometry,
  Shape,
  ShapeGeometry,
  Vector2,
} from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { box, rod } from '../shapes'
import { CLEAR, LANDMARKS, type LandmarkId } from './landmarks'
import type { CityValues, Layout } from './layouts'
import { along, distance, inside, offset, rng, type Vec2 } from './plan'

// The city from the map up (docs/DECISIONS.md, D39): the layout is a flat plan, every ordinary
// building is a block extruded from its footprint, and the landmarks are drawn with care.

/**
 * One ordinary building: a footprint centred on [x, z], its height, and `rise`, when it starts to
 * rise out of the map, from 0 (first) to 1 (last).
 */
export type Block = { x: number; z: number; w: number; d: number; h: number; rise: number }

/** The solid pieces of the city, each one draw call on the workbench. */
export type Piece = 'cbd' | 'lens' | 'heartland' | 'rings' | 'landmarks' | 'science' | 'mrt'

/**
 * What the city is lit by, as points: the solid pieces, and the roads and the water, which are
 * drawn only as points. The story lights and dims each group as a whole (./story.ts).
 */
export const GROUPS = [
  'cbd',
  'lens',
  'heartland',
  'rings',
  'landmarks',
  'science',
  'mrt',
  'train',
  'roads',
  'river',
  'bay',
] as const
export type Group = (typeof GROUPS)[number]

export type Plan = {
  cbd: Block[]
  heartland: Block[]
  /** The Lens's tower. */
  lens: Block
  /** BLK 2024. */
  rings: Block
}

export type CityModel = {
  /** The tile of land the city stands on. */
  ground: BufferGeometry
  /** The bay and the river, flat. */
  water: BufferGeometry
  /** The map in thin lines: the tile's edge, the shore, the banks, the roads, every footprint. */
  map: BufferGeometry
  solids: Record<Piece, BufferGeometry>
}

/** How high the viaduct's deck is. */
export const VIADUCT = 0.14

/** Where the blocks go. Kept apart from the shapes so the story can use it without them. */
export function planCity(layout: Layout, values: CityValues): Plan {
  const random = rng(layout.seed)
  const { cbd: town, heartland: land } = values
  const riverClear = values.water.river! / 2

  const wet = (point: Vec2, margin: number) =>
    inside(point, layout.bay) ||
    distance(point, layout.bay, true) < margin ||
    distance(point, layout.river) < riverClear + margin
  const onRoad = (point: Vec2, margin: number) =>
    layout.roads.some((road) => distance(point, road) < margin)
  const byLandmark = (point: Vec2, scale: number) =>
    (Object.keys(layout.landmarks) as LandmarkId[]).some((id) => {
      const [x, z] = layout.landmarks[id].at
      return Math.hypot(point[0] - x, point[1] - z) < CLEAR[id] * scale
    })
  const size = values.landmarks.size!

  /** The lots of a grid centred on the bay, so it falls between the roads of a layout drawn to it. */
  const lots = (spacing: number): Vec2[] => {
    const edge = layout.extent - 0.15
    const count = Math.ceil(edge / spacing)
    const found: Vec2[] = []
    for (let i = -count - 1; i <= count; i++)
      for (let j = -count - 1; j <= count; j++) {
        const [x, z] = [(i + 0.5) * spacing, (j + 0.5) * spacing]
        if (Math.abs(x) <= edge && Math.abs(z) <= edge) found.push([x, z])
      }
    return found
  }
  // When each block rises is drawn from its own stream, so tuning the blocks keeps the order.
  const order = rng(7)

  // The CBD: a tight grid of towers inside its outline.
  const cbd: Block[] = []
  for (const point of lots(town.spacing!)) {
    if (!inside(point, layout.cbd)) continue
    const keep = !wet(point, 0.14) && !onRoad(point, 0.09) && !byLandmark(point, size)
    const empty = random() < town.empty!
    const side = town.size! * (0.8 + random() * 0.4)
    const h = town.height! * (0.37 + 0.63 * random() ** 1.5)
    const [x, z] = point
    if (keep && !empty) cbd.push({ x, z, w: side, d: side, h, rise: order() })
  }

  // The heartland: slabs and point blocks on a wider grid, wherever nothing else is.
  const heartland: Block[] = []
  for (const point of lots(land.spacing!)) {
    const keep =
      !wet(point, 0.3) &&
      !onRoad(point, 0.16) &&
      !inside(point, layout.cbd) &&
      distance(point, layout.cbd, true) > 0.25 &&
      !layout.open.some((area) => inside(point, area)) &&
      distance(point, layout.mrt) > 0.12 &&
      !byLandmark(point, size)
    const empty = random() < land.empty!
    const slab = random() < land.slabs!
    const across = random() < 0.5
    const side = 0.16 + random() * 0.08
    const h = land.height! * (0.45 + 0.55 * random())
    if (!keep || empty) continue
    const [x, z] = point
    const rise = order()
    if (slab) heartland.push({ x, z, w: across ? 0.12 : 0.42, d: across ? 0.42 : 0.12, h, rise })
    else heartland.push({ x, z, w: side, d: side, h: h * 1.15, rise })
  }

  const nearest = (blocks: Block[], [x, z]: Vec2) => {
    let best = 0
    blocks.forEach((block, k) => {
      const here = Math.hypot(block.x - x, block.z - z)
      if (here < Math.hypot(blocks[best]!.x - x, blocks[best]!.z - z)) best = k
    })
    return blocks.splice(best, 1)[0]!
  }
  const lens = nearest(cbd, layout.tower)
  Object.assign(lens, { w: town.size! * 1.25, d: town.size! * 1.25, h: town.tower! })
  const rings = nearest(heartland, layout.blk)

  return { cbd, heartland, lens, rings }
}

/**
 * When each landmark rises out of the map, as in the sketch: Marina Bay Sands first, the Flyer
 * last of those round the bay. The scanned building waits for the middle.
 */
export const RISE: Record<LandmarkId, number> = {
  mbs: 0.1,
  merlion: 0.2,
  artscience: 0.25,
  pinnacle: 0.3,
  esplanade: 0.35,
  supertrees: 0.45,
  science: 0.5,
  flyer: 0.6,
}

/** Marks every vertex of a piece with when it starts to rise, for the shader to read. */
function rising(piece: BufferGeometry, rise: number): BufferGeometry {
  const count = piece.getAttribute('position').count
  piece.setAttribute('aRise', new Float32BufferAttribute(new Float32Array(count).fill(rise), 1))
  return piece
}

const blockGeometry = (blocks: Block[]) =>
  merge(blocks.map(({ x, z, w, d, h, rise }) => rising(box(w, h, d).translate(x, h / 2, z), rise)))

/** A block's footprint on the map. */
const corners = ({ x, z, w, d }: Block): Vec2[] => [
  [x - w / 2, z - d / 2],
  [x + w / 2, z - d / 2],
  [x + w / 2, z + d / 2],
  [x - w / 2, z + d / 2],
]

function merge(pieces: BufferGeometry[]): BufferGeometry {
  if (pieces.length === 0) return new BufferGeometry()
  // Some shapes come indexed and some do not; they can only be merged when they agree.
  // An indexed piece's attributes are expanded with it, the rise included.
  const flat = pieces.map((piece) => (piece.index ? piece.toNonIndexed() : piece))
  for (const piece of flat) piece.deleteAttribute('uv')
  const merged = mergeGeometries(flat)
  for (const piece of new Set([...pieces, ...flat])) piece.dispose()
  if (!merged) throw new Error('The city pieces cannot be merged into one geometry.')
  return merged
}

/** A landmark's pieces, scaled, turned and moved to where the layout puts it. */
export function placeLandmark(layout: Layout, id: LandmarkId, size: number): BufferGeometry[] {
  const { at, turn } = layout.landmarks[id]
  return LANDMARKS[id]().map((piece) =>
    piece.scale(size, size, size).rotateY(turn).translate(at[0], 0, at[1]),
  )
}

function placeLandmarks(layout: Layout, ids: LandmarkId[], size: number): BufferGeometry[] {
  return ids.flatMap((id) =>
    placeLandmark(layout, id, size).map((piece) => rising(piece, RISE[id])),
  )
}

/** A flat outline on the ground, from points in the plan. */
function flat(outline: Vec2[]): BufferGeometry {
  // A shape is drawn in x and y; turned flat, its y becomes -z.
  const shape = new Shape(outline.map(([x, z]) => new Vector2(x, -z)))
  return new ShapeGeometry(shape).rotateX(-Math.PI / 2)
}

/** The river as a strip of water between its two banks. */
function strip(left: Vec2[], right: Vec2[]): BufferGeometry {
  const positions: number[] = []
  for (let i = 1; i < left.length; i++) {
    const [a, b, c, d] = [left[i - 1]!, left[i]!, right[i - 1]!, right[i]!]
    for (const [x, z] of [a, b, c, c, b, d]) positions.push(x, 0, z)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  return geometry
}

function mapLines(layout: Layout, plan: Plan, river: number): BufferGeometry {
  const positions: number[] = []
  const line = (points: Vec2[], closed = false) => {
    const count = closed ? points.length : points.length - 1
    for (let i = 0; i < count; i++) {
      const [ax, az] = points[i]!
      const [bx, bz] = points[(i + 1) % points.length]!
      positions.push(ax, 0, az, bx, 0, bz)
    }
  }
  const e = layout.extent
  line(
    [
      [-e, -e],
      [e, -e],
      [e, e],
      [-e, e],
    ],
    true,
  )
  line(layout.bay, true)
  line(offset(layout.river, river / 2))
  line(offset(layout.river, -river / 2))
  for (const road of layout.roads) line(road)
  for (const block of [...plan.cbd, ...plan.heartland, plan.lens, plan.rings])
    line(corners(block), true)
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

/** The viaduct's pieces: a deck on piers along the MRT's line. */
export function viaductPieces(line: Vec2[]): BufferGeometry[] {
  const points = along(line, 0.22)
  const deck = points
    .slice(1)
    .map((point, k) =>
      rod([points[k]![0], VIADUCT, points[k]![1]], [point[0], VIADUCT, point[1]], 0.022),
    )
  const piers = points.map(([x, z]) => rod([x, 0, z], [x, VIADUCT, z], 0.012))
  return [...deck, ...piers]
}

/** When the viaduct rises. */
export const VIADUCT_RISE = 0.4

/** The landmarks drawn as one piece; the Science Centre is the Scanner's subject, apart. */
export const AROUND_THE_BAY: LandmarkId[] = [
  'mbs',
  'artscience',
  'supertrees',
  'flyer',
  'esplanade',
  'merlion',
  'pinnacle',
]

export function buildCity(layout: Layout, values: CityValues): CityModel {
  const plan = planCity(layout, values)
  const river = values.water.river!
  const size = values.landmarks.size!
  const e = layout.extent
  const banks = [offset(layout.river, river / 2), offset(layout.river, -river / 2)] as const

  return {
    ground: new PlaneGeometry(2 * e, 2 * e).rotateX(-Math.PI / 2),
    water: merge([flat(layout.bay), strip(...banks)]),
    map: mapLines(layout, plan, river),
    solids: {
      cbd: blockGeometry(plan.cbd),
      lens: blockGeometry([plan.lens]),
      heartland: blockGeometry(plan.heartland),
      rings: blockGeometry([plan.rings]),
      landmarks: merge(placeLandmarks(layout, AROUND_THE_BAY, size)),
      science: merge(placeLandmarks(layout, ['science'], size)),
      mrt: merge(viaductPieces(layout.mrt).map((piece) => rising(piece, VIADUCT_RISE))),
    },
  }
}

export function disposeCity(model: CityModel) {
  for (const geometry of [model.ground, model.water, model.map, ...Object.values(model.solids)])
    geometry.dispose()
}
