import {
  AdditiveBlending,
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Mesh,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
} from 'three'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import {
  AROUND_THE_BAY,
  GROUPS,
  placeLandmark,
  planCity,
  RISE,
  VIADUCT,
  VIADUCT_RISE,
  viaductPieces,
  type Block,
  type Group,
} from './city'
import { SUPERTREES, type LandmarkId } from './landmarks'
import type { CityValues, Layout } from './layouts'
import { rng, type Vec2 } from './plan'
import type { Ink } from '../ink'
import { CRUMBLE } from '../ink'
import { POUR_SPAN, RISE_SPAN } from './story'
import { SCAN_GLSL, scanUniforms } from './scan'

// The city as points (docs/EXPERIENCE.md, "The city"): a city at night is its lights. Points are
// placed where they mean something, on windows, edges and roofs, and the rest is left dark. One
// geometry, one draw call, however many points there are.

/**
 * How the city is drawn as points: the numbers the points round settles. The three shares that
 * place a building's points are what tells the looks apart.
 */
export type CityLook = {
  id: string
  label: string
  /** Points drawn on the high tier. A tier with a smaller budget draws its budget. */
  count: number
  /** A point's width in the city's units. For scale, a window is about 0.045 across. */
  size: number
  brightness: number
  /** How much bigger and brighter each point gets as the count drops, as for the Machine. */
  boost: number
  /** How an ordinary building's points are spread, as shares of its own. */
  windows: number
  walls: number
  edges: number
  roofs: number
  /** The share of a landmark's points along its edges; the rest go over its surface. */
  outline: number
  /** How much more closely points are packed on a landmark's thin pieces than on broad ones. */
  thin: number
  /** The shares of all the points, by what they are on. */
  blocks: number
  landmarks: number
  roads: number
  water: number
  mrt: number
}

/**
 * The look Rahul picked in the points round (docs/DECISIONS.md, D42): the sketch's. Windows on a
 * grid, the walls between them dark, with corners and roofs. The scan and the outlines it was
 * shown beside are rows of numbers in D42, which put back through the workbench's `cl=` show them
 * again. It is a list so a later round can add looks beside it.
 */
export const CITY_LOOKS: CityLook[] = [
  {
    id: 'A',
    label: 'windows',
    count: 90_000,
    size: 0.0075,
    brightness: 0.75,
    boost: 0.35,
    windows: 0.7,
    walls: 0,
    edges: 0.18,
    roofs: 0.12,
    outline: 0.25,
    thin: 0.5,
    blocks: 0.48,
    landmarks: 0.36,
    roads: 0.08,
    water: 0.06,
    mrt: 0.02,
  },
]

/** The count the looks were set at; fewer points are each drawn bolder, so the whole stays as bright. */
export const cityLift = (look: CityLook, count: number) =>
  (look.count / Math.max(1, count)) ** look.boost

/** A car: how many points, how far apart, and how much dimmer each is than the one ahead. */
const CAR = { points: 4, gap: 0.011, trail: 0.55 }

/**
 * The train: how many points at most, how long each of its three cars is and the gap between
 * them, and how much longer its loop is than the track, which is how long it is out of sight.
 */
export const TRAIN = { points: 900, car: 0.13, gap: 0.015, wait: 1.6 }

/** The river's packets: how many streams across it, points to a packet, their spacing and fade. */
const PACKET = { streams: 5, points: 5, gap: 0.009, trail: 0.7 }

/**
 * The haze the opening line crumbles into: a wide, shallow cloud round where the camera looks at
 * Found (CITY_POSES in ./story.ts), reaching past the edges of a wide window.
 */
const HAZE = { x: 0, y: 4.3, z: 0.5, across: 4.6, up: 1.8, deep: 1.6 }

/** The share of a point's fall from the haze that is falling; the rest is spreading over the land. */
const FALL = 0.45

/** The most grains the opening line is given. */
export const CITY_GRAINS = 4000

/** A window's width and height, as the sketch spaced them. */
const WINDOW = { across: 0.045, up: 0.055 }

/**
 * The landmarks that are buildings full of rooms, so in a look with windows their walls are
 * windows too: the hotel towers and the flats. The others are a museum, trees, a wheel, a theatre
 * and a statue, and keep their surface.
 */
const WINDOWED: LandmarkId[] = ['mbs', 'pinnacle']

/** How bright each group is at rest, before the story lights or dims it. From the sketch. */
const REST: Record<Group, number> = {
  cbd: 0.62,
  lens: 0.62,
  heartland: 0.55,
  rings: 0.55,
  landmarks: 0.85,
  science: 0.9,
  mrt: 0.5,
  train: 1.2,
  roads: 0.8,
  river: 0.45,
  bay: 0.22,
}

/** How bright each kind of point on a building is, against the others. */
const KIND = { window: 1, wall: 0.8, edge: 1, roof: 0.7 }

/** A number from 0 to 1 for a whole number, the same every time: which windows light. */
function hash(n: number) {
  let t = Math.imul(n ^ (n >>> 16), 0x45d9f3b)
  t = Math.imul(t ^ (t >>> 16), 0x45d9f3b)
  return ((t ^ (t >>> 16)) >>> 0) / 4294967296
}

/**
 * What moves, and how (docs/DECISIONS.md, D43). A moving point travels `along` a line of length
 * `loop` at `speed`, from where it starts, `from`; the shader moves it. A car runs along its road;
 * the river's points and the train follow a line held in the material (`MOTION_LINES`), `aside`
 * of it.
 */
export const MOVING = { still: 0, car: 1, river: 2, train: 3 } as const

type Motion =
  | { kind: 'car'; from: number; loop: number; speed: number; start: Vec2; heading: Vec2 }
  | {
      kind: 'river' | 'train'
      from: number
      loop: number
      speed: number
      aside: number
      length: number
    }

/** Fills the cloud one point at a time. */
class Writer {
  readonly position: Float32Array
  readonly group: Float32Array
  readonly bright: Float32Array
  readonly rise: Float32Array
  readonly window: Float32Array
  readonly jitter: Float32Array
  /** How a point moves: its kind, where it starts along its line, the loop and its speed. */
  readonly move: Float32Array
  /** A car's road, as its start and heading; for the river and the train, how far aside and the line's length. */
  readonly path: Float32Array
  /** The opening: where a point hangs in the haze, where its rain hits the water, when it falls. */
  readonly dust: Float32Array
  readonly water: Float32Array
  readonly late: Float32Array
  written = 0

  constructor(
    readonly count: number,
    private readonly random: () => number,
  ) {
    this.position = new Float32Array(count * 3)
    this.group = new Float32Array(count)
    this.bright = new Float32Array(count)
    this.rise = new Float32Array(count)
    this.window = new Float32Array(count)
    this.jitter = new Float32Array(count)
    this.move = new Float32Array(count * 4)
    this.path = new Float32Array(count * 4)
    this.dust = new Float32Array(count * 3)
    this.water = new Float32Array(count * 2)
    this.late = new Float32Array(count)
  }

  /**
   * Gives every point written its part in the opening. It hangs somewhere in the haze, falls as
   * rain onto the nearest water, the river or the bay, and spreads from there to its place. The
   * nearer the water its place is, the sooner it falls, so the map spreads out from the river.
   */
  rain(layout: Layout, random: () => number) {
    const [cx, cz, radius] = circleOf(layout.bay)
    for (let i = 0; i < this.written; i++) {
      const height = random() * 2 - 1
      const angle = random() * Math.PI * 2
      // Thinning towards its edges, so the haze has no outline.
      const reach = Math.cbrt(random()) * (0.55 + 0.45 * random())
      const flat = Math.sqrt(1 - height * height) * reach
      this.dust.set(
        [
          HAZE.x + Math.cos(angle) * flat * HAZE.across,
          HAZE.y + height * reach * HAZE.up,
          HAZE.z + Math.sin(angle) * flat * HAZE.deep,
        ],
        i * 3,
      )
      const home: Vec2 = [this.position[i * 3]!, this.position[i * 3 + 2]!]
      const onRiver = nearestOn(layout.river, home)
      const fromBay = Math.hypot(home[0] - cx, home[1] - cz)
      const onBay: Vec2 =
        fromBay <= radius
          ? home
          : [cx + ((home[0] - cx) / fromBay) * radius, cz + ((home[1] - cz) / fromBay) * radius]
      const river = Math.hypot(home[0] - onRiver[0], home[1] - onRiver[1])
      const bay = Math.hypot(home[0] - onBay[0], home[1] - onBay[1])
      const water = river < bay ? onRiver : onBay
      this.water.set(water, i * 2)
      this.late[i] = 0.55 * Math.min(1, Math.min(river, bay) / 2.5) + 0.45 * random()
    }
  }

  put(x: number, y: number, z: number, group: Group, bright: number, rise: number, window = 0) {
    const i = this.written++
    this.position.set([x, y, z], i * 3)
    this.group[i] = GROUPS.indexOf(group)
    this.bright[i] = bright * REST[group]
    this.rise[i] = rise
    this.window[i] = window
    this.jitter[i] = this.random()
    return i
  }

  /** Marks the point just written as moving. */
  moves(motion: Motion) {
    const i = this.written - 1
    this.move.set([MOVING[motion.kind], motion.from, motion.loop, motion.speed], i * 4)
    if (motion.kind === 'car') this.path.set([...motion.start, ...motion.heading], i * 4)
    else this.path.set([motion.aside, motion.length, 0, 0], i * 4)
  }

  geometry(): BufferGeometry {
    const cloud = new BufferGeometry()
    const n = this.written
    cloud.setAttribute('position', new BufferAttribute(this.position.subarray(0, n * 3), 3))
    cloud.setAttribute('aGroup', new BufferAttribute(this.group.subarray(0, n), 1))
    cloud.setAttribute('aBright', new BufferAttribute(this.bright.subarray(0, n), 1))
    cloud.setAttribute('aRise', new BufferAttribute(this.rise.subarray(0, n), 1))
    cloud.setAttribute('aWindow', new BufferAttribute(this.window.subarray(0, n), 1))
    cloud.setAttribute('aJitter', new BufferAttribute(this.jitter.subarray(0, n), 1))
    cloud.setAttribute('aMove', new BufferAttribute(this.move.subarray(0, n * 4), 4))
    cloud.setAttribute('aPath', new BufferAttribute(this.path.subarray(0, n * 4), 4))
    cloud.setAttribute('aDust', new BufferAttribute(this.dust.subarray(0, n * 3), 3))
    cloud.setAttribute('aWater', new BufferAttribute(this.water.subarray(0, n * 2), 2))
    cloud.setAttribute('aLate', new BufferAttribute(this.late.subarray(0, n), 1))
    return cloud
  }
}

/** Splits `count` into whole quotas in proportion to `weights`, adding up to exactly `count`. */
function quotas(count: number, weights: number[]): number[] {
  const whole = weights.reduce((sum, w) => sum + w, 0) || 1
  let passed = 0
  let given = 0
  return weights.map((w) => {
    passed += w
    const until = Math.round((count * passed) / whole)
    const quota = until - given
    given = until
    return quota
  })
}

/** The middle of one cell of a grid of `length` split into cells about `cell` long, as a share. */
const lattice = (random: () => number, length: number, cell: number) => {
  const cells = Math.max(2, Math.round(length / cell))
  const k = Math.floor(random() * cells)
  return { at: (k + 0.5) / cells, k }
}

type Building = Block & { group: Group; index: number }

/**
 * One ordinary building's points: on the grid of its windows, evenly over its walls, along its
 * edges and over its roof, in the look's shares. A window's points all land on its middle, so it
 * reads as one light; `lights` says whether this building's windows can be lit by the story.
 */
function building(out: Writer, b: Building, count: number, look: CityLook, random: () => number) {
  const [windows, walls, edges, roofs] = quotas(count, [
    look.windows,
    look.walls,
    look.edges,
    look.roofs,
  ])
  const lights = b.group === 'heartland' || b.group === 'rings'
  // Which side a point is on, by how wide the side is: 0 and 1 face ±z, 2 and 3 face ±x.
  const side = () =>
    random() < b.w / (b.w + b.d) ? (random() < 0.5 ? 0 : 1) : random() < 0.5 ? 2 : 3
  const onSide = (face: number, a: number, y: number) => {
    const x0 = b.x - b.w / 2
    const z0 = b.z - b.d / 2
    if (face === 0) out.put(x0 + a * b.w, y, b.z + b.d / 2, ...rest())
    else if (face === 1) out.put(x0 + a * b.w, y, b.z - b.d / 2, ...rest())
    else if (face === 2) out.put(b.x + b.w / 2, y, z0 + a * b.d, ...rest())
    else out.put(b.x - b.w / 2, y, z0 + a * b.d, ...rest())
  }
  let kind: keyof typeof KIND = 'window'
  let window = 0
  const rest = () => [b.group, KIND[kind], b.rise, window] as const
  // In a look without windows the Rings beat lights whole blocks instead, in the same order.
  const block =
    lights && look.windows === 0 ? 0.001 + 0.999 * (0.6 * b.rise + 0.4 * hash(b.index)) : 0

  kind = 'window'
  for (let i = 0; i < windows!; i++) {
    const face = side()
    const across = lattice(random, face < 2 ? b.w : b.d, WINDOW.across)
    const up = lattice(random, b.h, WINDOW.up)
    // Block by block, then window by window: the blocks that rise first light first.
    const cell = hash(((b.index * 4 + face) * 1024 + across.k) * 1024 + up.k)
    window = lights ? 0.001 + 0.999 * (0.6 * b.rise + 0.4 * cell) : 0
    onSide(face, across.at, up.at * b.h)
  }
  window = block
  kind = 'wall'
  for (let i = 0; i < walls!; i++) onSide(side(), random(), random() * b.h)
  kind = 'edge'
  const corners = 4 * b.h
  const rim = 2 * (b.w + b.d)
  for (let i = 0; i < edges!; i++) {
    if (random() < corners / (corners + rim)) {
      const x = b.x + (random() < 0.5 ? -b.w : b.w) / 2
      const z = b.z + (random() < 0.5 ? -b.d : b.d) / 2
      out.put(x, random() * b.h, z, ...rest())
    } else {
      const face = side()
      onSide(face, random(), b.h)
    }
  }
  kind = 'roof'
  for (let i = 0; i < roofs!; i++)
    out.put(b.x + (random() - 0.5) * b.w, b.h, b.z + (random() - 0.5) * b.d, ...rest())
}

/** Surface area of a geometry whose triangles are not indexed. */
function surfaceArea(geometry: BufferGeometry) {
  const position = geometry.getAttribute('position')
  const a = new Vector3()
  const b = new Vector3()
  const c = new Vector3()
  let total = 0
  for (let i = 0; i < position.count; i += 3) {
    a.fromBufferAttribute(position, i)
    b.fromBufferAttribute(position, i + 1).sub(a)
    c.fromBufferAttribute(position, i + 2).sub(a)
    total += b.cross(c).length() / 2
  }
  return total
}

/** How thick a piece is: its area over its longest side, so a rod's comes out as its radius. */
function girth(geometry: BufferGeometry, area: number) {
  geometry.computeBoundingBox()
  const size = geometry.boundingBox!.getSize(new Vector3())
  return area / Math.max(size.x, size.y, size.z, 1e-6)
}

/** A piece's sharp edges as segments, and their total length. */
function edgesOf(geometry: BufferGeometry) {
  const lines = new EdgesGeometry(geometry, 25)
  const position = lines.getAttribute('position')
  const segments: [Vector3, Vector3, number][] = []
  let length = 0
  for (let i = 0; i < position.count; i += 2) {
    const a = new Vector3().fromBufferAttribute(position, i)
    const b = new Vector3().fromBufferAttribute(position, i + 1)
    const l = a.distanceTo(b)
    segments.push([a, b, l])
    length += l
  }
  lines.dispose()
  return { segments, length }
}

/**
 * Moves a point on a wall to the middle of its window: the grid runs along the wall and up it,
 * from the corner of the piece's bounds, so a window's points all land on one spot. A point on a
 * roof or a floor is left where it is.
 */
function toWindow(point: Vector3, normal: Vector3, bounds: Box3) {
  if (Math.abs(normal.y) > 0.5) return
  const snap = (value: number, from: number, to: number, cell: number) => {
    const cells = Math.max(1, Math.round((to - from) / cell))
    const size = (to - from) / cells
    return from + (Math.min(cells - 1, Math.floor((value - from) / size)) + 0.5) * size
  }
  const { min, max } = bounds
  point.y = snap(point.y, min.y, max.y, WINDOW.up)
  // Along the wall: x on a wall facing ±z, z on a wall facing ±x.
  if (Math.abs(normal.z) > Math.abs(normal.x)) point.x = snap(point.x, min.x, max.x, WINDOW.across)
  else point.z = snap(point.z, min.z, max.z, WINDOW.across)
}

/**
 * Points over drawn pieces (the landmarks, the Science Centre, the viaduct): over the surface, the
 * thin pieces favoured so the Flyer's spokes and the durian's spikes are not lost, and along the
 * sharp edges for the look's `outline` share. `windowed` is the share of the surface's points
 * moved onto windows.
 */
function pieces(
  out: Writer,
  parts: BufferGeometry[],
  count: number,
  group: Group,
  rise: number,
  look: CityLook,
  random: () => number,
  windowed = 0,
) {
  const flat = parts.map((part) => (part.index ? part.toNonIndexed() : part))
  // A piece may ask for fewer or more points than its size gives it, as `userData.share`.
  const measured = flat.map((geometry, k) => {
    const area = surfaceArea(geometry)
    const asked = (parts[k]!.userData.share as number | undefined) ?? 1
    return { geometry, area, share: area * girth(geometry, area) ** -look.thin * asked }
  })
  const [surface, outline] = quotas(count, [1 - look.outline, look.outline])
  const point = new Vector3()
  const normal = new Vector3()
  const bounds = new Box3()

  quotas(
    surface!,
    measured.map((m) => m.share),
  ).forEach((quota, k) => {
    if (quota <= 0 || measured[k]!.area <= 0) return
    const sampler = new MeshSurfaceSampler(new Mesh(measured[k]!.geometry))
    // The library has setRandomGenerator(), but its types do not declare it yet.
    ;(sampler as unknown as { randomFunction: () => number }).randomFunction = random
    sampler.build()
    if (windowed > 0)
      bounds.setFromBufferAttribute(
        measured[k]!.geometry.getAttribute('position') as BufferAttribute,
      )
    for (let i = 0; i < quota; i++) {
      sampler.sample(point, normal)
      const window = random() < windowed
      if (window) toWindow(point, normal, bounds)
      out.put(point.x, point.y, point.z, group, window ? KIND.window : 1, rise)
    }
  })

  const edges = measured.map((m) => edgesOf(m.geometry))
  quotas(
    outline!,
    edges.map((e, k) => e.length * girth(measured[k]!.geometry, measured[k]!.area) ** -look.thin),
  ).forEach((quota, k) => {
    const { segments, length } = edges[k]!
    for (let i = 0; i < quota; i++) {
      let along = random() * length
      let s = 0
      while (s < segments.length - 1 && along > segments[s]![2]) along -= segments[s++]![2]
      const [a, b, l] = segments[s]!
      point.lerpVectors(a, b, l > 0 ? along / l : 0)
      out.put(point.x, point.y, point.z, group, 1, rise)
    }
  })
  for (const geometry of new Set([...parts, ...flat])) geometry.dispose()
}

/** Scatters `count` points over the city, the look deciding where. */
export function sampleCity(
  layout: Layout,
  values: CityValues,
  look: CityLook,
  count: number,
): BufferGeometry {
  const random = rng(3)
  const plan = planCity(layout, values)
  const out = new Writer(count, random)
  const size = values.landmarks.size!
  const [blocks, landmarks, roads, water, mrt] = quotas(count, [
    look.blocks,
    look.landmarks,
    look.roads,
    look.water,
    look.mrt,
  ])

  // Ordinary buildings, each by its surface. The Lens's tower is drawn a little fuller.
  const buildings: Building[] = [
    ...plan.cbd.map((b) => ({ ...b, group: 'cbd' as Group })),
    { ...plan.lens, group: 'lens' as Group },
    ...plan.heartland.map((b) => ({ ...b, group: 'heartland' as Group })),
    { ...plan.rings, group: 'rings' as Group },
  ].map((b, index) => ({ ...b, index }))
  const surface = (b: Block) => 2 * (b.w + b.d) * b.h + b.w * b.d
  quotas(
    blocks!,
    buildings.map((b) => surface(b) * (b.group === 'lens' ? 2 : 1)),
  ).forEach((quota, k) => building(out, buildings[k]!, quota, look, random))

  // The landmarks, each by its surface, and the Science Centre a little fuller: it is a subject.
  const ids = [...AROUND_THE_BAY, 'science' as const]
  const placed = ids.map((id) => placeLandmark(layout, id, size))
  const areas = placed.map(
    (parts, k) =>
      parts.reduce((sum, part) => {
        const flat = part.index ? part.toNonIndexed() : part
        const area = surfaceArea(flat)
        if (flat !== part) flat.dispose()
        return sum + area
      }, 0) * (ids[k] === 'science' ? 1.5 : 1),
  )
  // Shares by the square root of area, so small landmarks like the Merlion are not lost.
  quotas(landmarks!, areas.map(Math.sqrt)).forEach((quota, k) => {
    const id = ids[k]!
    const group = id === 'science' ? 'science' : 'landmarks'
    const windowed = WINDOWED.includes(id) ? look.windows / (look.windows + look.walls || 1) : 0
    pieces(out, placed[k]!, quota, group, RISE[id], look, random, windowed)
  })

  // The viaduct, and on it the train.
  const train = Math.min(TRAIN.points, Math.round(mrt! * 0.6))
  pieces(out, viaductPieces(layout.mrt), mrt! - train, 'mrt', VIADUCT_RISE, look, random)

  // The traffic: cars along every road, both ways, each a headlight and a fading trail.
  const lengths = layout.roads.map((road) =>
    road.slice(1).reduce((sum, [x, z], i) => sum + Math.hypot(x - road[i]![0], z - road[i]![1]), 0),
  )
  quotas(Math.floor(roads! / CAR.points), lengths).forEach((cars, k) => {
    const road = layout.roads[k]!
    const [dx, dz] = direction(road)
    for (let car = 0; car < cars; car++) {
      // The left lane runs one way and the right the other, as in Singapore.
      const way = random() < 0.5 ? 1 : -1
      const lane = way * (0.014 + random() * 0.008)
      const start: Vec2 = [road[0]![0] - dz * lane, road[0]![1] + dx * lane]
      const from = random() * lengths[k]!
      const speed = way * (0.6 + random() * 0.8)
      for (let p = 0; p < CAR.points; p++) {
        // Behind the headlight, against the way it drives.
        const back = from - way * p * CAR.gap
        out.put(start[0] + dx * back, 0.006, start[1] + dz * back, 'roads', CAR.trail ** p, 0)
        out.moves({ kind: 'car', from: back, loop: lengths[k]!, speed, start, heading: [dx, dz] })
      }
    }
  })

  // The river: requests as packets of light, flowing downstream in streams and out into the bay.
  // Each packet is a short run of points, brightest at its head, and every stream has its pace.
  const river = values.water.river!
  const riverLength = lineLength(layout.river)
  const [inRiver, inBay] = quotas(water!, [0.3, 0.7])
  const paces = Array.from({ length: PACKET.streams }, () => 0.8 + random() * 0.5)
  for (let packet = 0; packet < Math.floor(inRiver! / PACKET.points); packet++) {
    const stream = Math.floor(random() * PACKET.streams)
    const aside = ((stream + 0.5) / PACKET.streams - 0.5) * river * 0.8
    const head = random() * riverLength
    for (let p = 0; p < PACKET.points; p++) {
      const from = head - p * PACKET.gap
      const [x, z] = alongLine(layout.river, Math.max(0, from))
      out.put(x, 0.002, z, 'river', PACKET.trail ** p, 0)
      out.moves({
        kind: 'river',
        from,
        loop: riverLength,
        speed: paces[stream]!,
        aside,
        length: riverLength,
      })
    }
  }

  // The train: three lit cars on the viaduct, which run its length, then wait out of sight.
  const track = lineLength(layout.mrt)
  for (let i = 0; i < train; i++) {
    const car = Math.floor(random() * 3)
    const from = car * (TRAIN.car + TRAIN.gap) + random() * TRAIN.car
    const aside = (random() < 0.5 ? -1 : 1) * 0.012
    const y = VIADUCT + 0.03 + (random() < 0.5 ? 0 : 0.016)
    const [x, z] = alongLine(layout.mrt, from)
    out.put(x, y, z, 'train', 1, VIADUCT_RISE)
    out.moves({ kind: 'train', from, loop: track * TRAIN.wait, speed: 1, aside, length: track })
  }

  const [cx, cz, radius] = circleOf(layout.bay)
  for (let i = 0; i < inBay!; i++) {
    const angle = random() * Math.PI * 2
    const r = radius * Math.sqrt(random())
    out.put(cx + Math.cos(angle) * r, 0, cz + Math.sin(angle) * r, 'bay', 1, 0)
  }

  // Its own stream of numbers, so changing the opening moves nothing in the city.
  out.rain(layout, rng(5))
  return out.geometry()
}

/**
 * The grains of the opening line: copies of points whose place in the haze is below the line,
 * so every grain falls, picked evenly and given a place on a letter (see ../ink.ts). `ink` holds
 * three numbers a grain: how far across and down the line it stands, in CSS pixels, and when it
 * leaves, from 0 to 1. Nothing is added to the city for them.
 */
export function sampleCityGrains(cloud: BufferGeometry, ink: Ink): BufferGeometry {
  const dust = cloud.getAttribute('aDust')
  const below: number[] = []
  for (let i = 0; i < dust.count; i++) {
    const across = (dust.getX(i) - HAZE.x) / HAZE.across
    if (dust.getY(i) < HAZE.y - 0.1 && Math.abs(across) < 0.7) below.push(i)
  }
  const count = Math.min(ink.grains.length / 3, below.length)
  const grains = new BufferGeometry()
  for (const [name, attribute] of Object.entries(cloud.attributes)) {
    const size = attribute.itemSize
    const copy = new Float32Array(count * size)
    for (let i = 0; i < count; i++) {
      const from = below[Math.floor((i * below.length) / count)]! * size
      for (let j = 0; j < size; j++) copy[i * size + j] = attribute.array[from + j]!
    }
    grains.setAttribute(name, new BufferAttribute(copy, size))
  }
  grains.setAttribute('aWord', new BufferAttribute(ink.grains.slice(0, count * 3), 3))
  return grains
}

/** The nearest point to `point` on a line of segments. */
function nearestOn(line: Vec2[], [x, z]: Vec2): Vec2 {
  let best: Vec2 = line[0]!
  let nearest = Infinity
  for (let i = 1; i < line.length; i++) {
    const [ax, az] = line[i - 1]!
    const [bx, bz] = line[i]!
    const dx = bx - ax
    const dz = bz - az
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)))
    const at: Vec2 = [ax + dx * t, az + dz * t]
    const d = Math.hypot(x - at[0], z - at[1])
    if (d < nearest) [nearest, best] = [d, at]
  }
  return best
}

export const lineLength = (line: Vec2[]) =>
  line.slice(1).reduce((sum, [x, z], i) => sum + Math.hypot(x - line[i]![0], z - line[i]![1]), 0)

const mix = (a: Vec2, b: Vec2, t: number): Vec2 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
]

function alongLine(line: Vec2[], distance: number): Vec2 {
  let left = distance
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1]!
    const b = line[i]!
    const l = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (left <= l || i === line.length - 1) return mix(a, b, l > 0 ? Math.min(1, left / l) : 0)
    left -= l
  }
  return line[0]!
}

function direction(line: Vec2[]): Vec2 {
  const [ax, az] = line[0]!
  const [bx, bz] = line[line.length - 1]!
  const l = Math.hypot(bx - ax, bz - az) || 1
  return [(bx - ax) / l, (bz - az) / l]
}

/** The middle and radius of a round outline, such as the bay's. */
function circleOf(outline: Vec2[]): [x: number, z: number, radius: number] {
  const x = outline.reduce((sum, p) => sum + p[0], 0) / outline.length
  const z = outline.reduce((sum, p) => sum + p[1], 0) / outline.length
  const radius =
    outline.reduce((sum, p) => sum + Math.hypot(p[0] - x, p[1] - z), 0) / outline.length
  return [x, z, radius]
}

/**
 * The city's points, added on top of each other so dense places glow without a bloom pass.
 *
 * `uSize` is a point's width in the city's units and `uHeight` the drawing buffer's height in
 * pixels, as for the Machine. `uFocus` is how far the camera is from what it looks at: points
 * nearer than that are a little brighter and points beyond it fade, as the sketch drew them, so
 * the far side of the city does not flatten the near side.
 *
 * The story (./story.ts): `uRise` raises every building out of its footprint in its turn,
 * `uLand` fades the city in as the map lands, `uLit` and `uGain` light and dim each group, and
 * `uWindows` is the share of the heartland's windows lit.
 */
export function cityPointsMaterial(layout: Layout, grains = false) {
  const lines = [...layout.river, ...layout.mrt].map(([x, z]) => new Vector2(x, z))
  return new ShaderMaterial({
    defines: {
      RIVER: layout.river.length,
      TRACK: layout.mrt.length,
      LINES: lines.length,
      ...(grains && { GRAINS: '' }),
    },
    uniforms: {
      // The opening (D44): how far the haze has rained down, how bright the haze is against the
      // city, and how much brighter a point flashes as it hits the water.
      uPour: { value: 1 },
      uDustGain: { value: 0.45 },
      // The share of points that hang in the haze and fall as rain. The rest are not drawn until
      // they are spreading over the land, so the haze is faint and the rain is light.
      uHazeShare: { value: 0.33 },
      uSplash: { value: 2 },
      uRain: { value: 2.5 },
      // The pointer torch (D36): where it is in the window, from -1 to 1 each way, and how lit;
      // the window's width over its height; how far it reaches and how much it brightens.
      uTorch: { value: new Vector3() },
      uAspect: { value: 1 },
      uTorchReach: { value: new Vector2(0.42, 2.5) },
      // The grains of the opening line (see sampleCityGrains): how far it has crumbled, where its
      // corner is and how big a CSS pixel is, a grain's width in pixels, brightness and growth.
      uCrumble: { value: 0 },
      uLine: { value: new Vector4() },
      uGrain: { value: new Vector3(1.5, 1, 1.6) },
      // The river's centre line, then the viaduct's, for the points that follow them.
      uLines: { value: lines },
      // How far a point moving at a speed of 1 has travelled: a car, the river, the train.
      uFlow: { value: new Vector3() },
      uSize: { value: 0.0075 },
      uBrightness: { value: 0.75 },
      uHeight: { value: 1 },
      // The widest a point is drawn, in pixels of the drawing buffer, so a near point is not a blob.
      uMaxSize: { value: 6 },
      uFocus: { value: 4 },
      uRise: { value: 1 },
      uLand: { value: 1 },
      uLit: { value: GROUPS.map(() => 0) },
      uGain: { value: GROUPS.map(() => 1) },
      uWindows: { value: 0 },
      // How much brighter a lit window is than an unlit one.
      uWindowGain: { value: 2.4 },
      uColour: { value: new Color('#e8e5df') },
      uAccent: { value: new Color('#ffa726') },
      // The Scanner sweep (./scan.ts): the Science Centre's points give way to the surface rebuilt
      // from them, and flash as the beam crosses them. The page shares these with the scan.
      ...scanUniforms(),
      // The easter eggs (./eggs.ts): how much further the train has gone than the flow says, and
      // how bright it is; how far up BLK 2024 its band of light is, how bright, and its height.
      uTrain: { value: new Vector2(0, 1) },
      uBlk: { value: new Vector3(0, 0, 1) },
      // The Supertrees' light show: how strongly it plays and its clock in seconds, and each tree
      // as where it stands and how tall it is.
      uShow: { value: new Vector2() },
      uTrees: { value: Array.from({ length: SUPERTREES.length }, () => new Vector3(0, 0, 1)) },
    },
    vertexShader: /* glsl */ `
      uniform float uSize;
      uniform float uBrightness;
      uniform float uHeight;
      uniform float uMaxSize;
      uniform float uFocus;
      uniform float uRise;
      uniform float uLand;
      uniform float uLit[${GROUPS.length}];
      uniform float uGain[${GROUPS.length}];
      uniform float uWindows;
      uniform float uWindowGain;
      uniform vec2 uTrain;
      uniform vec3 uBlk;
      uniform vec2 uShow;
      uniform vec3 uTrees[${SUPERTREES.length}];
      attribute float aGroup;
      attribute float aBright;
      attribute float aRise;
      attribute float aWindow;
      attribute float aJitter;
      attribute vec4 aMove;
      attribute vec4 aPath;
      uniform vec2 uLines[LINES];
      uniform vec3 uFlow;
      uniform float uPour;
      uniform float uDustGain;
      uniform float uHazeShare;
      uniform float uSplash;
      uniform float uRain;
      uniform vec3 uTorch;
      uniform float uAspect;
      uniform vec2 uTorchReach;
      attribute vec3 aDust;
      attribute vec2 aWater;
      attribute float aLate;
      #ifdef GRAINS
        uniform float uCrumble;
        uniform vec4 uLine;
        uniform vec3 uGrain;
        attribute vec3 aWord;
      #endif
      varying float vBrightness;
      varying float vWarm;
      ${SCAN_GLSL}

      // The point s along the line of count points from first in uLines, and its heading there.
      vec2 along(int first, int count, float s, out vec2 heading) {
        for (int i = 0; i < LINES - 1; i++) {
          if (i >= count - 1) break;
          vec2 a = uLines[first + i];
          vec2 b = uLines[first + i + 1];
          float l = length(b - a);
          heading = (b - a) / l;
          if (s <= l || i == count - 2) return a + heading * min(s, l);
          s -= l;
        }
        heading = vec2(1.0, 0.0);
        return uLines[first];
      }

      void main() {
        int group = int(aGroup + 0.5);
        vec3 at = position;

        // Traffic, the river and the train: moved here, so the CPU only sets how far they have gone.
        int kind = int(aMove.x + 0.5);
        float shown = 1.0;
        if (kind > 0) {
          float travelled = kind == 1 ? uFlow.x : kind == 2 ? uFlow.y : uFlow.z + uTrain.x;
          float s = mod(aMove.y + aMove.w * travelled, aMove.z);
          float line = kind == 1 ? aMove.z : aPath.y;
          float t = s / line;
          // Fading in and out at the ends of the line, and hidden past its end.
          shown = smoothstep(0.0, 0.05, t) * smoothstep(1.0, kind == 2 ? 0.8 : 0.95, t);
          if (kind == 1) {
            at.xz = aPath.xy + aPath.zw * s;
          } else {
            vec2 heading;
            vec2 on = kind == 2 ? along(0, RIVER, s, heading) : along(RIVER, TRACK, s, heading);
            at.xz = on + vec2(-heading.y, heading.x) * aPath.x;
          }
        }
        float start = aRise * ${(1 - RISE_SPAN).toFixed(3)};
        at.y *= smoothstep(start, start + ${RISE_SPAN.toFixed(3)}, uRise);

        // The opening: the point hangs in the haze, falls as rain onto the water, faster and
        // faster, and spreads from there to its place on the map.
        float poured = clamp((uPour - aLate * ${(1 - POUR_SPAN).toFixed(3)}) / ${POUR_SPAN.toFixed(3)}, 0.0, 1.0);
        float away = 1.0 - poured;
        if (poured < 1.0) {
          float fall = clamp(poured / ${FALL.toFixed(3)}, 0.0, 1.0);
          float spread = smoothstep(${FALL.toFixed(3)}, 1.0, poured);
          vec2 over = mix(mix(aDust.xz, aWater, smoothstep(0.0, 1.0, fall)), at.xz, spread);
          at = vec3(over.x, aDust.y * (1.0 - fall * fall), over.y);
        }
        // Brighter while it falls, so the rain can be followed down, and a flash as it hits the water.
        float raining = poured > 0.0 && poured < ${FALL.toFixed(3)} ? sin(3.14159 * poured / ${FALL.toFixed(3)}) : 0.0;
        float splash = 1.0 - smoothstep(0.0, 0.1, abs(poured - ${FALL.toFixed(3)}));
        // Only some points are haze and rain; the others come in as they spread.
        float haze = step(fract(aJitter * 13.37), uHazeShare);
        shown *= max(haze, smoothstep(${FALL.toFixed(3)}, ${(FALL + 0.2).toFixed(3)}, poured));

        vec4 viewPosition = modelViewMatrix * vec4(at, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        float pixelsPerUnit = 0.5 * uHeight * projectionMatrix[1][1] / -viewPosition.z;
        float size = uSize * (0.7 + 0.6 * aJitter) * pixelsPerUnit;

        float lit = uLit[group];
        float window = aWindow > 0.0 ? step(aWindow, uWindows) : 0.0;
        vWarm = max(lit, window) * poured;

        // Nothing is drawn narrower than a pixel: a point that should be is dimmer by the area
        // it gained. One drawn wider than the cap is dimmed a little, as the sketch did.
        float brightness = uBrightness * aBright * uGain[group] * uLand * shown;
        brightness *= min(1.0, size * size) * (size > uMaxSize ? 0.6 : 1.0);
        brightness *= mix(1.0, uWindowGain, window);
        brightness *= clamp(1.25 - (-viewPosition.z - uFocus) * 0.2, 0.3, 1.3);
        brightness *= mix(1.0, uDustGain, away) * (1.0 + uSplash * splash + uRain * raining);
        // The torch lights the haze near the pointer, and fades as the haze comes down.
        vec2 fromTorch = (gl_Position.xy / gl_Position.w - uTorch.xy) * vec2(uAspect, 1.0);
        float torch = uTorch.z * away * smoothstep(uTorchReach.x, 0.0, length(fromTorch));
        brightness *= 1.0 + uTorchReach.y * torch;
        gl_PointSize = clamp(size, 1.0, uMaxSize);
        if (group == ${GROUPS.indexOf('science')}) {
          brightness *= mix(1.0, 0.3, scanned(at.x)) * (1.0 + 3.0 * underBeam(at.x, 0.02));
        }
        if (group == ${GROUPS.indexOf('train')}) brightness *= uTrain.y;
        // The Supertrees' light show: waves of light run up the trunks and ring out round the
        // canopies, each tree a beat behind the last, the rest dark between them.
        if (group == ${GROUPS.indexOf('landmarks')} && uShow.x > 0.0) {
          float nearest = 1.0;
          int tree = -1;
          for (int k = 0; k < ${SUPERTREES.length}; k++) {
            float r = length(position.xz - uTrees[k].xy);
            if (r < nearest) {
              nearest = r;
              tree = k;
            }
          }
          if (nearest < 0.22) {
            float up = position.y / uTrees[tree].z;
            float k = float(tree);
            float wave = up > 0.86
              ? 0.5 + 0.5 * sin(uShow.y * 6.0 - nearest * 40.0 + k * 1.3)
              : 0.5 + 0.5 * sin(uShow.y * 5.0 - up * 10.0 - k * 0.9);
            brightness *= mix(1.0, 0.05 + 4.5 * wave * wave * wave * wave, uShow.x);
          }
        }
        // BLK 2024's band of light: its lit windows are already as bright as they go, so where the
        // band passes they turn white and swell.
        if (group == ${GROUPS.indexOf('rings')} && uBlk.y > 0.0) {
          float band = (position.y / uBlk.z - uBlk.x) / 0.09;
          float on = uBlk.y * exp(-band * band);
          brightness *= 1.0 + on;
          vWarm *= 1.0 - min(1.0, 0.45 * on);
          gl_PointSize = clamp(gl_PointSize * (1.0 + 0.35 * on), 1.0, uMaxSize * 1.5);
        }

        #ifdef GRAINS
          // A grain stands on its letter until the line crumbles as far as it, then falls into
          // its place in the haze, in the window and not in the city: the line is on the page.
          // Across at an even pace and down faster and faster, as rain falls.
          float held = 1.0 - smoothstep(0.0, 1.0,
            (uCrumble - aWord.z * ${(1 - CRUMBLE.span).toFixed(3)}) / ${CRUMBLE.span.toFixed(3)});
          float flown = smoothstep(1.0, 0.25, held);
          vec2 from = uLine.xy + aWord.xy * uLine.zw;
          vec2 to = gl_Position.xy / gl_Position.w;
          gl_Position = vec4(mix(from.x, to.x, flown), mix(from.y, to.y, flown * flown), 0.0, 1.0);
          // Brighter than the haze on its way, so the eye can follow it; landed, it cools into
          // the haze and is gone, since the point it is a copy of is already there.
          brightness = uGrain.y * (0.7 + 0.3 * aJitter) * (1.0 + uGrain.z * flown);
          brightness *= 1.0 - smoothstep(0.75, 1.0, flown);
          gl_PointSize = uGrain.x * (1.0 + uGrain.z * flown);
          vWarm = 0.0;
        #endif
        vBrightness = brightness;
        if (brightness <= 0.001) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColour;
      uniform vec3 uAccent;
      varying float vBrightness;
      varying float vWarm;

      void main() {
        // A firm disc with a soft rim: a window is a light, not a haze.
        float falloff = smoothstep(0.5, 0.3, length(gl_PointCoord - 0.5));
        gl_FragColor = vec4(mix(uColour, uAccent, vWarm) * vBrightness * falloff, 1.0);
      }
    `,
    blending: AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true,
  })
}
