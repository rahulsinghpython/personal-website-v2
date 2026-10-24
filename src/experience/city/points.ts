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
import type { LandmarkId } from './landmarks'
import type { CityValues, Layout } from './layouts'
import { rng, type Vec2 } from './plan'
import { RISE_SPAN } from './story'

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
const TRAIN = { points: 900, car: 0.13, gap: 0.015, wait: 1.6 }

/** The river's packets: how many streams across it, points to a packet, their spacing and fade. */
const PACKET = { streams: 5, points: 5, gap: 0.009, trail: 0.7 }

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

  return out.geometry()
}

const lineLength = (line: Vec2[]) =>
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
export function cityPointsMaterial(layout: Layout) {
  const lines = [...layout.river, ...layout.mrt].map(([x, z]) => new Vector2(x, z))
  return new ShaderMaterial({
    defines: { RIVER: layout.river.length, TRACK: layout.mrt.length, LINES: lines.length },
    uniforms: {
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
      attribute float aGroup;
      attribute float aBright;
      attribute float aRise;
      attribute float aWindow;
      attribute float aJitter;
      attribute vec4 aMove;
      attribute vec4 aPath;
      uniform vec2 uLines[LINES];
      uniform vec3 uFlow;
      varying float vBrightness;
      varying float vWarm;

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
          float travelled = kind == 1 ? uFlow.x : kind == 2 ? uFlow.y : uFlow.z;
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

        vec4 viewPosition = modelViewMatrix * vec4(at, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        float pixelsPerUnit = 0.5 * uHeight * projectionMatrix[1][1] / -viewPosition.z;
        float size = uSize * (0.7 + 0.6 * aJitter) * pixelsPerUnit;

        float lit = uLit[group];
        float window = aWindow > 0.0 ? step(aWindow, uWindows) : 0.0;
        vWarm = max(lit, window);

        // Nothing is drawn narrower than a pixel: a point that should be is dimmer by the area
        // it gained. One drawn wider than the cap is dimmed a little, as the sketch did.
        float brightness = uBrightness * aBright * uGain[group] * uLand * shown;
        brightness *= min(1.0, size * size) * (size > uMaxSize ? 0.6 : 1.0);
        brightness *= mix(1.0, uWindowGain, window);
        brightness *= clamp(1.25 - (-viewPosition.z - uFocus) * 0.2, 0.3, 1.3);
        gl_PointSize = clamp(size, 1.0, uMaxSize);
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
