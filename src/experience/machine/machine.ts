import type { BufferGeometry } from 'three'
import { cubeCity, cubeFrame } from './cube'
import {
  defineMachine,
  param,
  spinning,
  weighted,
  type MachineDef,
  type MachineValues,
} from './part'
import { around, ball, box, band, drum, lathe, rad, ring, rod } from './shapes'

// The Machine, in the shape Rahul picked on 2026-10-07 (docs/DECISIONS.md, D32): a tiered rig
// that hangs, with every part on its axis and drawn in its vocabulary of plates, posts, lines
// and cans.
//
// Each part stands for a kind of work (D24), and is one connected piece of the shape:
//   core     data pipelines   the tiers and the lines running down through them
//   scanner  3D scanning      a scanning puck on the mount, over solar panels on the top plate
//   rings    scheduling       a beaded ring round each of the lowest plates
//   lens     AI               the cube of cubes on a stage under the last plate
//
// The shape it replaced (D23, D25) and a slimmer one passed over with it are in git history, at
// 31d5e96.

/** Height of the top plate. */
const TOP = 1.1
/** The top face of the mount, where the puck stands. */
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
    size: param(0.2, 0.1, 0.35),
    panels: param(4, 3, 10, 1),
    length: param(0.56, 0.2, 0.7),
    tilt: param(16, 0, 60, 1),
    beams: param(5, 0, 9, 1),
  },
  rings: {
    count: param(3, 1, 4, 1),
    radius: param(1.12, 0.8, 2),
    grow: param(0.2, 0, 0.6),
    phase: param(0, 0, 360, 1),
  },
  lens: {
    scale: param(0.5, 0.3, 0.8),
    drop: param(0.34, 0.1, 0.8),
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
// open in the middle and the lines drop straight through them as one bundle, on into the Lens.

function core({ core }: Values): BufferGeometry[] {
  const each = Array.from({ length: tierCount(core) }, (_, tier) => tier)
  const last = lastTier(core)

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
  return [...mount, ...posts, ...plates, ...bundle]
}

// ---------------------------------------------------------------------------------------------
// Scanner: 3D scanning, which was for solar (docs/CONTENT.md): roofs rebuilt in 3D and panels
// placed on them. The top plate is the roof. Panels stand on it in a ring, tilted outward, and a
// scanning puck on the mount sweeps a fan of beams down one of them.

/** How far from the axis the panels' raised edge is. It clears the mount. */
const PANEL_INNER = 0.46
/** How far the low edge of a panel is off the roof. */
const PANEL_LIFT = 0.03

function scanner({ scanner }: Values): BufferGeometry[] {
  const s = scanner.size
  const tall = s * 1.3
  const eye = MOUNT_TOP + 0.06 + tall / 2
  const puck = [
    drum(0.07, 0.06).translate(0, MOUNT_TOP + 0.03, 0),
    drum(s, tall).translate(0, eye, 0),
    // The window the beams leave through, and the rims that make the puck a can and not a blur.
    ...[-0.5, 0, 0.5].map((at) => ring(s + 0.004, 0.011).translate(0, eye + at * tall, 0)),
    drum(s * 0.55, 0.03).translate(0, eye + tall / 2 + 0.015, 0),
  ]

  const count = Math.round(scanner.panels)
  const tilt = rad(scanner.tilt)
  const length = scanner.length
  const width = Math.min(0.9, 2 * PANEL_INNER * Math.tan(Math.PI / count) * 0.86)
  const roof = TOP + 0.025
  const high = roof + PANEL_LIFT + Math.sin(tilt) * length
  /** A point on the panel at angle 0: `along` from its raised edge, `across` from its middle. */
  const on = (along: number, across: number): [number, number, number] => [
    PANEL_INNER + Math.cos(tilt) * along,
    high - Math.sin(tilt) * along,
    across,
  ]
  const rows = 3
  const columns = Math.max(2, Math.round(width / 0.18))
  const beams = Math.round(scanner.beams)

  const panels = Array.from({ length: count }, (_, panel) =>
    [
      box(length, 0.012, width)
        .rotateZ(-tilt)
        .translate(...on(length / 2, 0)),
      // The cells, drawn as their borders so the grid survives as points.
      ...Array.from({ length: rows + 1 }, (_, row) => {
        const along = (row / rows) * length
        return rod(on(along, -width / 2), on(along, width / 2), 0.007)
      }),
      ...Array.from({ length: columns + 1 }, (_, column) => {
        const across = (column / columns - 0.5) * width
        return rod(on(0, across), on(length, across), 0.007)
      }),
      ...[-1, 1].map((side) =>
        rod([PANEL_INNER, roof, side * width * 0.38], on(0, side * width * 0.38), 0.012),
      ),
    ].map((piece) => piece.rotateY((panel / count) * Math.PI * 2)),
  ).flat()

  // One fan, on one panel: the scan caught part-way round.
  const fan = Array.from({ length: beams }, (_, beam) =>
    rod([s, eye, 0], on(((beam + 0.5) / beams) * length, 0), 0.006),
  )

  return [...puck, ...panels, ...fan]
}

// ---------------------------------------------------------------------------------------------
// Rings: scheduling. Many moving things kept in order. Each ring sits on three spokes and carries
// a row of beads, more of them the wider the ring. The beads are the things being scheduled. The
// rings widen as the plates narrow, so the outline is a diamond, and the spokes line up into
// three ribs.

/** How fast the beads of the innermost ring drift once the Rings are awake, in radians a second. */
const BEAD_DRIFT = 0.06
/** The spokes hold the rings up; the beads and the rings are the part. */
const SPOKE_SHARE = 0.3

function rings({ core, rings }: Values): BufferGeometry[] {
  const count = Math.min(Math.round(rings.count), tierCount(core))
  return Array.from({ length: count }, (_, orbit) => {
    const tier = tierCount(core) - count + orbit
    const y = tierY(core, tier)
    const plate = tierRadius(core, tier)
    const radius = rings.radius + orbit * rings.grow
    const turn = rad(rings.phase) * orbit
    // Neighbouring rings turn opposite ways as they lock, and their beads then drift opposite
    // ways (D26), slower the wider the ring.
    const way = orbit % 2 === 0 ? 1 : -1
    const drift = (way * BEAD_DRIFT) / (1 + orbit * 0.4)
    return [
      spinning(ring(radius, 0.018).translate(0, y, 0), way),
      ...around(3, () =>
        weighted(spinning(rod([plate, y, 0], [radius, y, 0], 0.014), way), SPOKE_SHARE),
      ),
      ...around(4 + orbit * 2, () => spinning(ball(0.055).translate(radius, y, 0), way, drift)),
    ].map((piece) => piece.rotateY(turn))
  }).flat()
}

// ---------------------------------------------------------------------------------------------
// Lens: AI. The cube of cubes on a stage hung under the last plate, where the chip sits in a real
// rig. Every line of the bundle runs into its roof and one tip leaves below: data in, an answer
// out.

/** The cube's faces are drawn faintly, so its edges carry it. */
const FACE_SHARE = 0.35

function lens({ core, lens }: Values): BufferGeometry[] {
  const last = lastTier(core)
  const top = tierY(core, last)
  const size = 1.05 * lens.scale
  const roofline = top - lens.drop
  const floor = roofline - size
  const stage = Math.max(tierRadius(core, last) * 0.85, size * 0.62)

  const cube = [
    ...cubeCity(1.05, 0.09, lens.skyline).map((piece) => weighted(piece, FACE_SHARE)),
    ...cubeFrame(1.05, 0.09, 0.012),
  ].map((piece) =>
    piece.scale(lens.scale, lens.scale, lens.scale).translate(0, roofline - size / 2, 0),
  )
  const feed = around(Math.round(core.lines) * 2, () =>
    rod([tierRadius(core, last) * 0.3, top, 0], [size * 0.36, roofline, 0], 0.012),
  )
  // Three thin posts, clear of the cube's corners, so the stage hangs without caging the cube.
  const cage = around(3, () =>
    weighted(rod([stage * 0.94, top, 0], [stage * 0.94, floor, 0], 0.012), 0.5),
  )
  const tip = lathe([
    [stage * 0.4, floor - 0.04],
    [0.04, floor - 0.42],
    [0, floor - 0.42],
  ])
  return [...feed, ...cube, ...cage, drum(stage, 0.04).translate(0, floor - 0.02, 0), tip]
}

export const machine: MachineDef = defineMachine({
  id: 'A',
  label: 'The Machine',
  params: schema,
  build: { core, scanner, rings, lens },
})
