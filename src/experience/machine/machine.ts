import type { BufferGeometry } from 'three'
import { cubeCity } from './cube'
import { defineMachine, param, type MachineDef, type MachineValues } from './part'
import { around, ball, band, box, drum, GIMBAL_THICK, lathe, rad, ring, rod } from './shapes'

// The Machine, in the silhouette Rahul signed off in round 2 (docs/DECISIONS.md, D23): a tiered
// rig that hangs, with orbit rings, an arm, and a small cube in gimbals standing on top.
//
// Each part stands for a kind of work (D24), and is one connected piece of the shape:
//   core     data pipelines   the tiers, the lines running down through them, and the tip
//   scanner  3D scanning      the arm and its head
//   rings    scheduling       the orbit rings
//   lens     AI               the crown: the cube in gimbals
//
// The detail of each part is the version Rahul picked in round 3 (D25). The versions he passed
// over are in git history, at 4393c8e.

/** Height of the top plate. */
const TOP = 1.1
/** The top face of the mount, where the crown stands. */
const MOUNT_TOP = TOP + 0.405

const schema = {
  core: {
    radius: param(1.1, 0.6, 1.6),
    tiers: param(5, 3, 7, 1),
    drop: param(0.55, 0.25, 0.8),
    taper: param(0.15, 0.05, 0.25),
    lines: param(6, 0, 16, 1),
  },
  scanner: {
    reach: param(0.5, 0.2, 1.2),
    size: param(0.2, 0.1, 0.4),
  },
  rings: {
    count: param(3, 1, 4, 1),
    radius: param(1.25, 0.8, 2),
    grow: param(0.3, 0, 0.6),
    phase: param(130, 0, 360, 1),
  },
  lens: {
    scale: param(0.38, 0.2, 0.7),
    tilt: param(62, 0, 90, 1),
    yaw: param(25, -90, 90, 1),
    spin: param(20, -90, 90, 1),
    skyline: param(0.16, 0, 0.3),
  },
}
type Values = MachineValues<typeof schema>
type Core = Values['core']

const tierCount = (c: Core) => Math.round(c.tiers)
const tierY = (c: Core, tier: number) => TOP - tier * c.drop
const tierRadius = (c: Core, tier: number) => Math.max(0.12, c.radius * (1 - c.taper * tier))
const lastTier = (c: Core) => tierCount(c) - 1

// ---------------------------------------------------------------------------------------------
// Core: data pipelines. Stage after stage, with the lines that run through them. The plates are
// open in the middle and the lines drop straight through them as one bundle, gathering into a
// nozzle.

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

// ---------------------------------------------------------------------------------------------
// Scanner: 3D scanning. A drum held in a fork at the end of an arm, drawn with the fan of beams
// it sweeps.

function scanner({ core, scanner }: Values): BufferGeometry[] {
  const s = scanner.size
  const out = -core.radius - scanner.reach
  const arm = TOP + 0.05
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
    ...[-1, 1].map((side) => rod([out, arm, side * s * 1.25], [out, head, side * s * 1.25], 0.025)),
    drum(s, s * 2.2)
      .rotateX(Math.PI / 2)
      .translate(out, head, 0),
    ...fan,
  ]
}

// ---------------------------------------------------------------------------------------------
// Rings: scheduling. Many moving things kept in order. Each ring sits on three spokes and carries
// a row of beads, more of them the wider the ring. The beads are the things being scheduled.

function rings({ core, rings }: Values): BufferGeometry[] {
  const count = Math.min(Math.round(rings.count), tierCount(core))
  return Array.from({ length: count }, (_, orbit) => {
    const tier = tierCount(core) - count + orbit
    const y = tierY(core, tier)
    const plate = tierRadius(core, tier)
    const radius = rings.radius + orbit * rings.grow
    const turn = rad(rings.phase) * orbit
    return [
      ring(radius, 0.02).translate(0, y, 0),
      ...around(3, () => rod([plate, y, 0], [radius, y, 0], 0.018)),
      ...around(4 + orbit * 2, () => ball(0.065).translate(radius, y, 0)),
    ].map((piece) => piece.rotateY(turn))
  }).flat()
}

// ---------------------------------------------------------------------------------------------
// Lens: AI. The crown, standing on the mount: a cube of cubes in two gimbal rings.
//
// The gimbal is built the way a real one is (D23): the outer ring stands on one pin, the inner
// ring pivots inside it, and the cube sits on an axle through the inner ring. Nothing else
// touches the rings. It is built at full size and then shrunk as a whole.

const RADIUS = 1.32
const DEPTH = 0.14
/** How far the pin lifts the outer ring off the mount. */
const PIN = 0.1

function lens({ lens }: Values): BufferGeometry[] {
  const centre = MOUNT_TOP + PIN + RADIUS * lens.scale
  const tilt = rad(lens.tilt)
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
      ].map((piece) => piece.rotateX(tilt)),
    ]),
  ]
}

export const machine: MachineDef = defineMachine({
  id: 'A',
  label: 'The Machine',
  params: schema,
  build: { core, scanner, rings, lens },
})
