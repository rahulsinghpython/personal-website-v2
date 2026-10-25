import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  ExtrudeGeometry,
  Shape,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from 'three'
import { box, drum, lathe, ring, rod, type Point } from '../shapes'

// The eight buildings drawn with care (docs/EXPERIENCE.md, "The layout"), as massing that reads at
// the size the story's camera sees it: each one's outline, plus the one feature that says which
// building it is (the ship on Marina Bay Sands, the durian's spikes, the Merlion's water). Each is
// built at the origin with its front facing +z, towards the visitor, and is turned and moved into
// place by the layout.

export type LandmarkId =
  'mbs' | 'artscience' | 'supertrees' | 'flyer' | 'esplanade' | 'merlion' | 'pinnacle' | 'science'

/** How far round each landmark the ordinary blocks keep clear, before it is scaled. */
export const CLEAR: Record<LandmarkId, number> = {
  mbs: 0.75,
  artscience: 0.35,
  supertrees: 0.7,
  flyer: 0.5,
  esplanade: 0.45,
  merlion: 0.15,
  pinnacle: 0.6,
  science: 0.6,
}

/** A side profile, drawn as [across, up] points, pushed `depth` along x. */
function profile(points: [number, number][], depth: number): BufferGeometry {
  const shape = new Shape(points.map(([across, up]) => new Vector2(across, up)))
  return new ExtrudeGeometry(shape, { depth, bevelEnabled: false })
    .rotateY(Math.PI / 2)
    .translate(-depth / 2, 0, 0)
}

/** An outline on the ground, drawn as [x, z] points, pushed `thickness` up. */
function slab(outline: [number, number][], thickness: number): BufferGeometry {
  // A shape is drawn in x and y; turned flat, its y becomes -z and its depth becomes height.
  const shape = new Shape(outline.map(([x, z]) => new Vector2(x, -z)))
  return new ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false }).rotateX(-Math.PI / 2)
}

/** A thin plate narrowing from `base` wide to `tip` wide over `length`, standing up from the origin. */
function fin(base: number, tip: number, length: number, thickness: number): BufferGeometry {
  const shape = new Shape([
    new Vector2(-base / 2, 0),
    new Vector2(base / 2, 0),
    new Vector2(tip / 2, length),
    new Vector2(-tip / 2, length),
  ])
  return new ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false }).translate(
    0,
    0,
    -thickness / 2,
  )
}

/** Two points joined by a bar of square section, for decks and bridges. */
function beam(from: Point, to: Point, width: number, height: number): BufferGeometry {
  const [ax, ay, az] = from
  const [bx, by, bz] = to
  const length = Math.hypot(bx - ax, bz - az)
  return box(length, height, width)
    .rotateY(-Math.atan2(bz - az, bx - ax))
    .translate((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2)
}

/**
 * Three broad towers in a row, each two legs leaning together, and the ship across their tops,
 * its pointed bow overhanging the north tower, which is the left one seen from the bay.
 */
function mbs(): BufferGeometry[] {
  const height = 1.05
  const spacing = 0.42
  const towers = [-1, 0, 1].map((k) =>
    profile(
      [
        [-0.2, 0],
        [0.2, 0],
        [0.07, height],
        [-0.07, height],
      ],
      0.2,
    ).translate(k * spacing, 0, 0),
  )
  const end = spacing + 0.16
  const ship = slab(
    [
      [-spacing - 0.44, 0],
      [-spacing - 0.16, -0.07],
      [end, -0.07],
      [end, 0.07],
      [-spacing - 0.16, 0.07],
    ],
    0.04,
  ).translate(0, height, 0)
  const podium = box(2 * spacing + 0.45, 0.07, 0.3).translate(0, 0.035, 0.27)
  return [...towers, ship, podium]
}

/**
 * The open hand: ten broad fingers rising from a round base and leaning out, the longest towards
 * the water, which is in front.
 */
function artscience(): BufferGeometry[] {
  const base = lathe([
    [0, 0],
    [0.11, 0],
    [0.12, 0.04],
    [0, 0.06],
  ])
  const fingers = Array.from({ length: 10 }, (_, k) => {
    const angle = (k / 10) * Math.PI * 2
    const front = (Math.cos(angle) + 1) / 2
    return fin(0.09, 0.025, 0.2 + 0.14 * front, 0.014)
      .rotateX(0.45 + 0.3 * front)
      .translate(0, 0.03, 0.06)
      .rotateY(angle)
  })
  return [base, ...fingers]
}

/**
 * A grove of six: tall trunks opening, near the top, into wide shallow canopies. The skyway runs
 * between the two tallest.
 */
function supertrees(): BufferGeometry[] {
  const trees: [x: number, z: number, height: number][] = [
    [-0.24, 0.11, 0.62],
    [0.03, 0.31, 0.78],
    [-0.39, -0.19, 0.5],
    [0.23, -0.09, 0.7],
    [-0.07, -0.39, 0.66],
    [0.46, 0.21, 0.48],
  ]
  const pieces = trees.map(([x, z, height]) =>
    lathe(
      [
        [0.045, 0],
        [0.024, height * 0.8],
        [0.07, height * 0.92],
        [0.2, height],
        [0.19, height + 0.012],
        [0.05, height * 0.94],
      ],
      24,
    ).translate(x, 0, z),
  )
  const skyway = beam([0.03, 0.42, 0.31], [0.23, 0.42, -0.09], 0.025, 0.012)
  return [...pieces, skyway]
}

/** One wheel on a pair of legs, capsules round its rim, a terminal under it. */
function flyer(): BufferGeometry[] {
  const radius = 0.44
  const hub = radius + 0.09
  const wheel = [ring(radius, 0.012), ring(radius * 0.96, 0.006)].map((piece) =>
    piece.rotateX(Math.PI / 2).translate(0, hub, 0),
  )
  const spokes = Array.from({ length: 16 }, (_, k) => {
    const angle = (k / 16) * Math.PI * 2
    return rod([0, hub, 0], [Math.cos(angle) * radius, hub + Math.sin(angle) * radius, 0], 0.003)
  })
  const capsules = Array.from({ length: 28 }, (_, k) => {
    const angle = (k / 28) * Math.PI * 2
    return box(0.035, 0.028, 0.035).translate(
      Math.cos(angle) * (radius + 0.02),
      hub + Math.sin(angle) * (radius + 0.02),
      0,
    )
  })
  const legs = [-1, 1].map((side) => rod([0, 0, side * 0.2], [0, hub, 0], 0.014))
  const terminal = box(0.6, 0.08, 0.2).translate(0, 0.04, 0)
  return [...wheel, ...spokes, ...capsules, ...legs, terminal]
}

/**
 * The two domes on the waterfront, side by side, each criss-crossed by a lattice of ribs, the
 * sunshades that make them durians. Drawn as ribs and not as spikes: as points, spikes are fur,
 * and the domes read as something under a microscope.
 */
function esplanade(): BufferGeometry[] {
  const stretch = new Vector3(1.2, 0.8, 1)
  const dome = (radius: number, x: number, z: number) => {
    const at = (up: number, around: number) =>
      new Vector3(
        Math.cos(up) * Math.cos(around) * radius * stretch.x + x,
        Math.sin(up) * radius * stretch.y,
        Math.cos(up) * Math.sin(around) * radius * stretch.z + z,
      )
    const shell = new SphereGeometry(radius, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2)
      .scale(stretch.x, stretch.y, stretch.z)
      .translate(x, 0, z)
    // As points, the ribs are what say durian; the shell under them is only a faint dome.
    shell.userData.share = 0.3
    // Two families of ribs spiralling up from the base, one each way, crossing into diamonds.
    const ribs = [-1, 1].flatMap((turn) =>
      Array.from({ length: 12 }, (_, k) => {
        const curve = new CatmullRomCurve3(
          Array.from({ length: 9 }, (_, j) => {
            const t = j / 8
            return at(t * 1.45, (k / 12) * Math.PI * 2 + turn * t * 1.3)
          }),
        )
        return new TubeGeometry(curve, 24, radius * 0.022, 4)
      }),
    )
    return [shell, ...ribs]
  }
  const podium = box(0.62, 0.05, 0.22).translate(0, 0.025, 0)
  return [...dome(0.22, -0.24, 0), ...dome(0.17, 0.24, 0.03), podium]
}

/**
 * Small against the skyline, so drawn larger than life. The visitor only ever sees it side on,
 * its water crossing the frame, so it is drawn as its side: a silhouette like a chess knight's,
 * pushed into depth with rounded edges. The wave it sits on, its chest, the open mouth under the
 * snout, the mane in locks down the back, and the fish's tail curling up behind into a fork. Then
 * the arc of water from the mouth into the bay, which is what reads from afar. An upright column
 * with a round head read as phallic, twice (docs/DECISIONS.md, D41); this outline has neither.
 */
function merlion(): BufferGeometry[] {
  // [forward, up], drawn round from the back of the base.
  const side: [number, number][] = [
    [-0.1, 0],
    [0.09, 0],
    [0.09, 0.035],
    [0.06, 0.05],
    [0.045, 0.07],
    [0.05, 0.12],
    [0.055, 0.15],
    [0.045, 0.175],
    // The lower jaw, the open mouth, the snout.
    [0.085, 0.18],
    [0.11, 0.19],
    [0.115, 0.205],
    [0.1, 0.225],
    [0.075, 0.235],
    [0.06, 0.255],
    [0.035, 0.275],
    [0, 0.27],
    // The mane, in locks down the back.
    [-0.03, 0.255],
    [-0.02, 0.24],
    [-0.05, 0.23],
    [-0.035, 0.215],
    [-0.06, 0.2],
    [-0.04, 0.19],
    [-0.055, 0.17],
    // The fish: its back, then the tail curling up behind into a fork and down again.
    [-0.035, 0.14],
    [-0.03, 0.11],
    [-0.045, 0.085],
    [-0.07, 0.095],
    [-0.09, 0.12],
    [-0.085, 0.165],
    [-0.105, 0.145],
    [-0.135, 0.16],
    [-0.125, 0.12],
    [-0.11, 0.085],
    [-0.095, 0.06],
    [-0.1, 0.045],
  ]
  const depth = 0.05
  const shape = new Shape(side.map(([forward, up]) => new Vector2(-forward, up)))
  const figure = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.006,
    bevelSegments: 2,
  })
    .rotateY(Math.PI / 2)
    .translate(-depth / 2, 0, 0)
  const jet = new CatmullRomCurve3(
    Array.from({ length: 9 }, (_, k) => {
      const t = k / 8
      return new Vector3(0, 0.195 + 0.05 * t - 0.24 * t * t, 0.115 + 0.42 * t)
    }),
  )
  const water = new TubeGeometry(jet, 32, 0.006, 6)
  return [figure, water]
}

/** Seven slim towers in a shallow bow, each clear of the next, joined by sky bridges halfway up and on top. */
function pinnacle(): BufferGeometry[] {
  const height = 0.62
  // A gentle bow, so seen from the front it is a row of slabs, not a ring.
  const step = 0.14
  const radius = 1.3
  const spots: Point[] = Array.from({ length: 7 }, (_, k) => {
    const angle = (k - 3) * step
    return [Math.sin(angle) * radius, 0, (Math.cos(angle) - 1) * radius + 0.2]
  })
  const towers = spots.map(([x, , z], k) =>
    box(0.11, height, 0.09)
      .rotateY((k - 3) * step)
      .translate(x, height / 2, z),
  )
  const bridges = [0.52, 1].flatMap((level) =>
    spots
      .slice(1)
      .map((spot, k) =>
        beam(
          [spots[k]![0], height * level - 0.015, spots[k]![2]],
          [spot[0], height * level - 0.015, spot[2]],
          0.07,
          0.03,
        ),
      ),
  )
  return [...towers, ...bridges]
}

/**
 * The building the Scanner beat rebuilds, in the massing of the mesh Rahul made of it: a long hall
 * under a pitched roof, a tall drum with a collar, a block against the drum, a flat hall beside.
 */
function science(): BufferGeometry[] {
  const hall = profile(
    [
      [-0.2, 0],
      [0.2, 0],
      [0.2, 0.06],
      [0, 0.16],
      [-0.2, 0.06],
    ],
    0.5,
  )
  const drumTower = drum(0.09, 0.34).translate(0.17, 0.17, -0.2)
  const collar = drum(0.125, 0.03).translate(0.17, 0.09, -0.2)
  const block = box(0.13, 0.15, 0.22).rotateY(0.35).translate(0.02, 0.075, -0.22)
  const flat = box(0.3, 0.07, 0.36).translate(0.48, 0.035, 0)
  return [hall, drumTower, collar, block, flat]
}

/**
 * The solar panels the Scanner places once the Science Centre's roofs are rebuilt: rows up the
 * front slope of the hall's pitched roof, and a grid over the flat hall. Each panel is a quad, a
 * little off its roof, with a `uv` from corner to corner so its frame can be drawn. In the same
 * place and units as `science()`.
 */
export function sciencePanels(): BufferGeometry {
  const positions: number[] = []
  const uvs: number[] = []
  const lift = 0.004
  const quad = (corner: Vector3, u: Vector3, v: Vector3, normal: Vector3) => {
    const a = corner.clone().addScaledVector(normal, lift)
    const b = a.clone().add(u)
    const c = a.clone().add(u).add(v)
    const d = a.clone().add(v)
    for (const [p, uv] of [
      [a, [0, 0]],
      [b, [1, 0]],
      [c, [1, 1]],
      [a, [0, 0]],
      [c, [1, 1]],
      [d, [0, 1]],
    ] as const) {
      positions.push(p.x, p.y, p.z)
      uvs.push(...uv)
    }
  }
  // The hall's front slope runs from its eave (z 0.2, height 0.06) up to the ridge (z 0, 0.16).
  const eave = new Vector3(0, 0.06, 0.2)
  const upSlope = new Vector3(0, 0.1, -0.2).normalize()
  const slopeNormal = new Vector3(0, 0.2, 0.1).normalize()
  const across = new Vector3(1, 0, 0)
  for (let row = 0; row < 4; row++)
    for (let column = 0; column < 12; column++) {
      const corner = eave
        .clone()
        .addScaledVector(upSlope, 0.02 + row * 0.048)
        .add(new Vector3(-0.218 + column * 0.0366, 0, 0))
      quad(
        corner,
        across.clone().multiplyScalar(0.033),
        upSlope.clone().multiplyScalar(0.044),
        slopeNormal,
      )
    }
  // The flat hall's roof: x 0.33 to 0.63, z -0.18 to 0.18, at 0.07.
  const up = new Vector3(0, 1, 0)
  for (let row = 0; row < 8; row++)
    for (let column = 0; column < 7; column++)
      quad(
        new Vector3(0.35 + column * 0.0376, 0.07, 0.16 - row * 0.0405),
        new Vector3(0.034, 0, 0),
        new Vector3(0, 0, -0.036),
        up,
      )
  const panels = new BufferGeometry()
  panels.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  panels.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
  return panels
}

export const LANDMARKS: Record<LandmarkId, () => BufferGeometry[]> = {
  mbs,
  artscience,
  supertrees,
  flyer,
  esplanade,
  merlion,
  pinnacle,
  science,
}
