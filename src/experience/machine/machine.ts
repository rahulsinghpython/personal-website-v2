import type { BufferGeometry } from 'three'
import { defineMachine, param, type MachineDef, type MachineValues } from './part'
import {
  apertureStack,
  around,
  ball,
  band,
  box,
  drum,
  gimbal,
  GIMBAL_THICK,
  lathe,
  pipe,
  rad,
  ring,
  rod,
  TAU,
  type Point,
} from './shapes'
import { cubeCity } from './silhouettes/cube'

// The Machine, in the silhouette Rahul signed off in round 2 (docs/DECISIONS.md, D23): a tiered
// rig that hangs, with orbit rings, an arm, and a small cube in gimbals standing on top.
//
// Each part stands for a kind of work (D24), and is one connected piece of the shape:
//   core     data pipelines   the tiers, the lines running down through them, and the tip
//   scanner  3D scanning      the arm and its head
//   rings    scheduling       the orbit rings
//   lens     AI               the crown: the cube in gimbals
//
// Round 3 of docs/DESIGN-PROCESS.md: every part has three versions, picked by its `version`
// parameter, so any version of one part can be seen with any version of the others.

/** Height of the top plate. */
const TOP = 1.1
/** The top face of the mount, where the crown stands. */
const MOUNT_TOP = TOP + 0.405

const versions = (version: number) => param(version, 1, 3, 1)

const schema = (version: number) => ({
  core: {
    version: versions(version),
    radius: param(1.1, 0.6, 1.6),
    tiers: param(5, 3, 7, 1),
    drop: param(0.55, 0.25, 0.8),
    taper: param(0.15, 0.05, 0.25),
    lines: param(6, 0, 16, 1),
  },
  scanner: {
    version: versions(version),
    reach: param(0.5, 0.2, 1.2),
    drop: param(0.75, 0.1, 1.4),
    size: param(0.2, 0.1, 0.4),
  },
  rings: {
    version: versions(version),
    count: param(3, 1, 4, 1),
    radius: param(1.25, 0.8, 2),
    grow: param(0.3, 0, 0.6),
    phase: param(130, 0, 360, 1),
  },
  lens: {
    version: versions(version),
    scale: param(0.38, 0.2, 0.7),
    tiltA: param(62, 0, 90, 1),
    tiltB: param(48, 0, 90, 1),
    yaw: param(25, -90, 90, 1),
    spin: param(20, -90, 90, 1),
    skyline: param(0.16, 0, 0.3),
  },
})
type Values = MachineValues<ReturnType<typeof schema>>
type Core = Values['core']

const tierCount = (c: Core) => Math.round(c.tiers)
const tierY = (c: Core, tier: number) => TOP - tier * c.drop
const tierRadius = (c: Core, tier: number) => Math.max(0.12, c.radius * (1 - c.taper * tier))
const lastTier = (c: Core) => tierCount(c) - 1

// ---------------------------------------------------------------------------------------------
// Core: data pipelines. Stage after stage, with the lines that run through them.

function core({ core }: Values): BufferGeometry[] {
  const each = Array.from({ length: tierCount(core) }, (_, tier) => tier)
  const last = lastTier(core)
  const tipTop = tierY(core, last) - 0.14

  const mount = [
    drum(0.16, 0.35).translate(0, TOP + 0.2, 0),
    drum(0.3, 0.05).translate(0, TOP + 0.38, 0),
  ]
  const posts = each.slice(0, -1).flatMap((tier) => {
    const radius = tierRadius(core, tier + 1) * 0.8
    return around(3, () =>
      rod([radius, tierY(core, tier), 0], [radius, tierY(core, tier + 1), 0], 0.025),
    ).map((post) => post.rotateY(tier * 0.6))
  })
  const solidPlates = () =>
    each.map((tier) => drum(tierRadius(core, tier), 0.05).translate(0, tierY(core, tier), 0))
  const stackTip = () =>
    apertureStack(0.34, 4, 0.2, 0.2).map((piece) => piece.rotateX(Math.PI).translate(0, tipTop, 0))

  // 2: the plates are open in the middle and the lines drop straight through them as one bundle,
  // gathering into a nozzle.
  if (core.version === 2) {
    const plates = each.map((tier) => {
      const radius = tierRadius(core, tier)
      const plate = tier === 0 ? drum(radius, 0.05) : band(radius * 0.5, radius, 0.05)
      return plate.translate(0, tierY(core, tier), 0)
    })
    const bundle = around(Math.round(core.lines) * 2, () =>
      rod([core.radius * 0.3, TOP, 0], [tierRadius(core, last) * 0.3, tierY(core, last), 0], 0.014),
    )
    const nozzle = lathe([
      [tierRadius(core, last) * 0.3 + 0.04, tierY(core, last)],
      [0.05, tipTop - 0.5],
      [0, tipTop - 0.5],
    ])
    return [...mount, ...posts, ...plates, ...bundle, nozzle]
  }

  // 3: solid plates, wrapped on the outside by conduits that wind down to the tip.
  if (core.version === 3) {
    const conduits = around(3, () =>
      pipe(
        Array.from({ length: 25 }, (_, i): Point => {
          const t = i / 24
          const radius = core.radius + (tierRadius(core, last) - core.radius) * t + 0.07
          const angle = t * TAU * 1.25
          const y = TOP + (tierY(core, last) - 0.3 - TOP) * t
          return [Math.cos(angle) * radius, y, Math.sin(angle) * radius]
        }),
        0.035,
        96,
      ),
    )
    return [...mount, ...posts, ...solidPlates(), ...conduits, ...stackTip()]
  }

  // 1, as signed off: solid plates, and lines that bow out between one plate and the next.
  const lines = around(Math.round(core.lines), (line) => {
    const sway = line % 2 === 0 ? 0.07 : -0.07
    const points = each.flatMap((tier): Point[] => {
      const at: Point = [tierRadius(core, tier) * 0.55, tierY(core, tier), 0]
      if (tier === last) return [at]
      const between = (tierRadius(core, tier) + tierRadius(core, tier + 1)) / 2
      return [at, [between * 0.55 + 0.09, tierY(core, tier) - core.drop / 2, sway]]
    })
    return pipe(points, 0.016, 64)
  })
  return [...mount, ...posts, ...solidPlates(), ...lines, ...stackTip()]
}

// ---------------------------------------------------------------------------------------------
// Scanner: 3D scanning. A head that sweeps.

function scanner({ core, scanner }: Values): BufferGeometry[] {
  const s = scanner.size
  const out = -core.radius - scanner.reach
  const arm = TOP + 0.05

  // 2: a drum held in a fork, drawn with the fan of beams it sweeps.
  if (scanner.version === 2) {
    const head = TOP - 0.3
    const fan = Array.from({ length: 7 }, (_, i) => {
      const angle = rad(-36 + i * 12)
      return rod(
        [out, head, 0],
        [out + Math.sin(angle) * 1.1, head - Math.cos(angle) * 1.1, 0],
        0.008,
      )
    })
    return [
      rod([-core.radius + 0.15, arm, 0], [out, arm, 0], 0.03),
      box(0.06, 0.06, s * 2.6).translate(out, arm, 0),
      ...[-1, 1].map((side) =>
        rod([out, arm, side * s * 1.25], [out, head, side * s * 1.25], 0.025),
      ),
      drum(s, s * 2.2)
        .rotateX(Math.PI / 2)
        .translate(out, head, 0),
      ...fan,
    ]
  }

  // 3: no arm. The head rides a fixed rail around the top plate, so it can go all the way round.
  if (scanner.version === 3) {
    const rail = core.radius + scanner.reach * 0.6
    return [
      ring(rail, 0.03).translate(0, TOP, 0),
      ...around(4, () => rod([core.radius - 0.05, TOP, 0], [rail, TOP, 0], 0.022)).map((spoke) =>
        spoke.rotateY(0.6),
      ),
      ...[
        box(0.2, 0.14, 0.22).translate(rail, TOP, 0),
        drum(s * 0.75, s * 1.1).translate(rail, TOP - 0.07 - s * 0.55, 0),
        drum(s * 0.85, s * 0.12).translate(rail, TOP - 0.07 - s * 1.15, 0),
      ].map((piece) => piece.rotateY(rad(200))),
    ]
  }

  // 1, as signed off: a straight arm with a drum-shaped head hanging from its end.
  const head = TOP - scanner.drop
  return [
    rod([-core.radius + 0.15, arm, 0], [out, arm, 0], 0.03),
    ball(0.05).translate(out, arm, 0),
    rod([out, arm, 0], [out, head + s * 0.6, 0], 0.03),
    drum(s, s * 1.1).translate(out, head, 0),
    drum(s * 1.12, s * 0.12).translate(out, head + s * 0.62, 0),
    drum(s * 1.12, s * 0.12).translate(out, head - s * 0.62, 0),
  ]
}

// ---------------------------------------------------------------------------------------------
// Rings: scheduling. Many moving things kept in order.

function rings({ core, rings }: Values): BufferGeometry[] {
  const count = Math.min(Math.round(rings.count), tierCount(core))
  return Array.from({ length: count }, (_, orbit) => {
    const tier = tierCount(core) - count + orbit
    const y = tierY(core, tier)
    const plate = tierRadius(core, tier)
    const radius = rings.radius + orbit * rings.grow
    const turn = rad(rings.phase) * orbit

    // 2: each ring carries a row of beads, more of them the wider the ring, on three spokes.
    if (rings.version === 2) {
      return [
        ring(radius, 0.02).translate(0, y, 0),
        ...around(3, () => rod([plate, y, 0], [radius, y, 0], 0.018)),
        ...around(4 + orbit * 2, () => ball(0.065).translate(radius, y, 0)),
      ].map((piece) => piece.rotateY(turn))
    }

    // 3: each ring is tipped about its own arm, a different way from the one above.
    if (rings.version === 3) {
      const tip = rad(orbit % 2 === 0 ? 10 : -10)
      return [
        ring(radius, 0.02).rotateX(tip).translate(0, y, 0),
        rod([plate, y, 0], [radius, y, 0], 0.022),
        ball(0.09).translate(radius, y, 0),
      ].map((piece) => piece.rotateY(turn))
    }

    // 1, as signed off: a flat ring on one arm, with a weight where they meet.
    return [
      ring(radius, 0.02).translate(0, y, 0),
      rod([plate, y, 0], [radius, y, 0], 0.022).rotateY(turn),
      ball(0.09).translate(radius, y, 0).rotateY(turn),
    ]
  }).flat()
}

// ---------------------------------------------------------------------------------------------
// Lens: AI. The crown, standing on the mount.
//
// The gimbal is built the way a real one is (D23): the outer ring stands on one pin, each ring
// pivots inside the next, and what it carries sits on an axle through the innermost ring.
// Nothing else touches the rings. It is built at full size and then shrunk as a whole.

const RADIUS = 1.32
const STEP = 0.18
const DEPTH = 0.14
/** How far the pin lifts the outer ring off the mount. */
const PIN = 0.1

function lens({ lens }: Values): BufferGeometry[] {
  const centre = MOUNT_TOP + PIN + RADIUS * lens.scale
  const tiltA = rad(lens.tiltA)
  const tiltB = rad(lens.tiltB)
  const place = (pieces: BufferGeometry[]) =>
    pieces.map((piece) =>
      piece
        .rotateY(rad(lens.yaw))
        .scale(lens.scale, lens.scale, lens.scale)
        .translate(0, centre, 0),
    )
  const stand = [
    rod([0, MOUNT_TOP, 0], [0, centre - RADIUS * lens.scale + 0.02, 0], 0.03),
    drum(0.06, 0.04).translate(0, MOUNT_TOP + 0.02, 0),
  ]

  // 2: two rings instead of three, and a bigger cube, so it still reads when it is this small.
  if (lens.version === 2) {
    const inner = RADIUS - 0.2
    const faceOn = (outer: number) => band(outer - GIMBAL_THICK, outer, DEPTH).rotateX(Math.PI / 2)
    const reach = inner - GIMBAL_THICK
    return [
      ...stand,
      ...place([
        faceOn(RADIUS),
        ...[-1, 1].map((side) => rod([side * reach, 0, 0], [side * (RADIUS - 0.03), 0, 0], 0.03)),
        ...[
          faceOn(inner),
          rod([0, -reach, 0], [0, reach, 0], 0.035),
          ...cubeCity(1.05, 0.09, lens.skyline).map((piece) => piece.rotateY(rad(lens.spin))),
        ].map((piece) => piece.rotateX(tiltA)),
      ]),
    ]
  }

  const reach = RADIUS - 2 * STEP - GIMBAL_THICK
  const axle = rod([-reach, 0, 0], [reach, 0, 0], 0.035)
  // 3: the gimbals carry a short stack of open plates threaded on the axle, not a cube.
  const carried =
    lens.version === 3
      ? apertureStack(0.62, 4, 0.24, 0.14).map((piece) =>
          piece.translate(0, -0.36, 0).rotateZ(Math.PI / 2),
        )
      : // 1, as signed off: the cube with the city on its roof.
        cubeCity(0.9, 0.08, lens.skyline)

  return [
    ...stand,
    ...place([
      ...gimbal(RADIUS, STEP, DEPTH, tiltA, tiltB),
      ...[axle, ...carried.map((piece) => piece.rotateX(rad(lens.spin)))].map((piece) =>
        piece.rotateY(tiltB).rotateX(tiltA),
      ),
    ]),
  ]
}

/** The Machine with every part at the given version. */
export function machine(version: number, id: string, label: string): MachineDef {
  return defineMachine({
    id,
    label,
    params: schema(version),
    build: { core, scanner, rings, lens },
  })
}
