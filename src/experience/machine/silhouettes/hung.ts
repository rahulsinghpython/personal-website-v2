import { defineMachine, param, type ParamValues } from '../part'
import {
  around,
  ball,
  band,
  drum,
  gimbal,
  GIMBAL_THICK,
  pipe,
  rad,
  rod,
  type Point,
} from '../shapes'
import { cubeCity } from './cube'

// The mix Rahul asked for in round 2: A's cube in gimbals, hung from B's tiers.
//
// Rahul's note on A: the gimbal rings are good, but things were bolted onto them, which a ring
// that turns freely cannot carry. So here the gimbal is built the way a real one is. The outer
// ring hangs from one swivel and can turn on it. Each ring pivots inside the next on a pair of
// pins. The cube sits on an axle through the innermost ring. Nothing else touches the rings.
//
// The tiers above are the fixed part: they hang from the mount, carry the swivel, and carry the
// Scanner. Their plates are open in the middle and narrow towards the cube, which makes them
// the Lens: a stack of apertures.

/** Height of the centre of the gimbals, which is the centre of the cube. */
const CENTRE = -1.05

const rings = {
  radius: param(1.32, 1.1, 1.9),
  step: param(0.18, 0.12, 0.4),
  tiltA: param(62, 0, 90, 1),
  tiltB: param(48, 0, 90, 1),
  yaw: param(25, -90, 90, 1),
  depth: param(0.14, 0.04, 0.3),
}
const lens = {
  radius: param(0.95, 0.5, 1.4),
  tiers: param(4, 2, 6, 1),
  drop: param(0.4, 0.25, 0.7),
  taper: param(0.21, 0.05, 0.3),
  lines: param(6, 0, 12, 1),
}
type Rings = ParamValues<typeof rings>
type Lens = ParamValues<typeof lens>

/** Where the outer ring hangs from: just above its highest point. */
const swivel = (r: Rings) => CENTRE + r.radius + 0.1
/** Tier 0 is the lowest and smallest, just above the swivel. */
const tierY = (r: Rings, l: Lens, tier: number) => swivel(r) + 0.15 + tier * l.drop
const tierRadius = (l: Lens, tier: number) =>
  Math.max(0.2, l.radius * (1 - l.taper * (Math.round(l.tiers) - 1 - tier)))
const top = (r: Rings, l: Lens) => tierY(r, l, Math.round(l.tiers) - 1)

export const hung = defineMachine({
  id: 'C',
  label: 'A + B: cube in gimbals, hung from tiers',
  params: {
    core: {
      size: param(0.9, 0.5, 1.3),
      gap: param(0.08, 0.02, 0.25),
      skyline: param(0.16, 0, 0.3),
      spin: param(20, -90, 90, 1),
      fibre: param(0.025, 0.01, 0.05, 0.002),
    },
    scanner: {
      reach: param(0.5, 0.2, 1.2),
      drop: param(0.75, 0.1, 1.4),
      size: param(0.2, 0.1, 0.4),
    },
    rings,
    lens,
  },
  build: {
    // The cube on its axle. It is built in the innermost ring's own frame, then turned through
    // the same pivots as that ring, so it always sits true inside it.
    core: ({ core, rings }) => {
      const half = core.size / 2
      const reach = rings.radius - 2 * rings.step - GIMBAL_THICK
      const fibres = [-1, 1].map((z) =>
        pipe(
          [
            [0, 0, 0],
            [0, 0, z * (half + 0.06)],
            [0, -half * 0.7, z * (half + 0.08)],
            [0, -half - 0.2, z * 0.16],
            [0, -half - 0.34, z * 0.05],
          ],
          core.fibre,
        ),
      )
      return [
        rod([-reach, 0, 0], [reach, 0, 0], 0.035),
        ...[...cubeCity(core.size, core.gap, core.skyline), ...fibres].map((piece) =>
          piece.rotateX(rad(core.spin)),
        ),
      ].map((piece) =>
        piece
          .rotateY(rad(rings.tiltB))
          .rotateX(rad(rings.tiltA))
          .rotateY(rad(rings.yaw))
          .translate(0, CENTRE, 0),
      )
    },

    // A straight arm off the top plate, with a drum-shaped head hanging from its end.
    scanner: ({ rings, lens, scanner }) => {
      const out = -lens.radius - scanner.reach
      const arm = top(rings, lens) + 0.05
      const head = top(rings, lens) - scanner.drop
      const s = scanner.size
      return [
        rod([-lens.radius + 0.15, arm, 0], [out, arm, 0], 0.03),
        ball(0.05).translate(out, arm, 0),
        rod([out, arm, 0], [out, head + s * 0.6, 0], 0.03),
        drum(s, s * 1.1).translate(out, head, 0),
        drum(s * 1.12, s * 0.12).translate(out, head + s * 0.62, 0),
        drum(s * 1.12, s * 0.12).translate(out, head - s * 0.62, 0),
      ]
    },

    // The gimbals and the pin they hang from. Nothing else.
    rings: ({ rings }) => [
      ...gimbal(rings.radius, rings.step, rings.depth, rad(rings.tiltA), rad(rings.tiltB)).map(
        (piece) => piece.rotateY(rad(rings.yaw)).translate(0, CENTRE, 0),
      ),
      rod([0, CENTRE + rings.radius - 0.03, 0], [0, swivel(rings) + 0.05, 0], 0.035),
      drum(0.07, 0.06).translate(0, swivel(rings), 0),
    ],

    // The tiers: plates open in the middle, narrowing towards the cube, hung from the mount.
    lens: ({ rings, lens }) => {
      const tiers = Array.from({ length: Math.round(lens.tiers) }, (_, tier) => tier)
      const y = (tier: number) => tierY(rings, lens, tier)
      const peak = top(rings, lens)

      const plates = tiers.map((tier) => {
        const radius = tierRadius(lens, tier)
        // The lowest plate is solid: it is what the swivel hangs from.
        const plate = tier === 0 ? drum(radius, 0.05) : band(radius * 0.45, radius, 0.05)
        return plate.translate(0, y(tier), 0)
      })
      const hanger = rod([0, swivel(rings), 0], [0, y(0), 0], 0.05)
      const mount = [
        drum(lens.radius * 0.5, 0.05).translate(0, peak + 0.2, 0),
        drum(0.16, 0.3).translate(0, peak + 0.37, 0),
        ...around(3, () =>
          rod([lens.radius * 0.42, peak, 0], [lens.radius * 0.42, peak + 0.2, 0], 0.025),
        ),
      ]
      const posts = tiers.slice(1).flatMap((tier) => {
        const radius = tierRadius(lens, tier - 1) * 0.8
        return around(3, () => rod([radius, y(tier - 1), 0], [radius, y(tier), 0], 0.025)).map(
          (post) => post.rotateY(tier * 0.6),
        )
      })

      // Signal lines run down through every plate, bowing out between one plate and the next.
      const lines = around(Math.round(lens.lines), (line) => {
        const sway = line % 2 === 0 ? 0.06 : -0.06
        const points = tiers.flatMap((tier): Point[] => {
          const at: Point = [tierRadius(lens, tier) * 0.62, y(tier), 0]
          if (tier === tiers.length - 1) return [at]
          const between = (tierRadius(lens, tier) + tierRadius(lens, tier + 1)) / 2
          return [at, [between * 0.62 + 0.07, y(tier) + lens.drop / 2, sway]]
        })
        return pipe(points, 0.016, 64)
      })

      return [...plates, hanger, ...mount, ...posts, ...lines]
    },
  },
})
