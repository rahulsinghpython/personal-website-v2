import type { BufferGeometry } from 'three'
import { defineMachine, param } from '../part'
import { drum, gimbal, GIMBAL_THICK, rad, rod } from '../shapes'
import { tiered } from './chandelier'
import { cubeCity } from './cube'

// The silhouette Rahul signed off in round 2 (docs/DECISIONS.md, D23). It came from two of the
// three first options: B, a tiered rig that hangs, with A, a cube in gimbals, as a much smaller
// piece on top.
//
// So this is B, hung a little lower, with a small cube in gimbals standing on its mount. The
// gimbal is built the way a real one is, after Rahul's note on A that things had been bolted
// onto rings that are meant to turn freely. The outer ring stands on one pin, like a toy
// gyroscope on its pedestal, and can turn on it. Each ring pivots inside the next on a pair of
// pins. The cube sits on an axle through the innermost ring. Nothing else touches the rings.

const rig = tiered(1.1)

// The crown is built at A's size and then shrunk as a whole, so its proportions stay A's.
const RADIUS = 1.32
const STEP = 0.18
const DEPTH = 0.14
const CUBE = 0.9
/** How far the pin lifts the outer ring off the mount. */
const PIN = 0.1

type Crown = { scale: number; tiltA: number; tiltB: number; yaw: number }

const crownCentre = (crown: Crown) => rig.mountTop + PIN + RADIUS * crown.scale

/** Shrinks pieces built around the origin at A's size and stands them on the mount. */
const place = (pieces: BufferGeometry[], crown: Crown) =>
  pieces.map((piece) =>
    piece
      .rotateY(rad(crown.yaw))
      .scale(crown.scale, crown.scale, crown.scale)
      .translate(0, crownCentre(crown), 0),
  )

export const crowned = defineMachine({
  id: 'A',
  label: 'The Machine, as signed off in round 2',
  params: {
    ...rig.params,
    core: {
      ...rig.params.core,
      skyline: param(0.16, 0, 0.3),
      spin: param(20, -90, 90, 1),
    },
    rings: {
      ...rig.params.rings,
      scale: param(0.38, 0.2, 0.7),
      tiltA: param(62, 0, 90, 1),
      tiltB: param(48, 0, 90, 1),
      yaw: param(25, -90, 90, 1),
    },
  },
  build: {
    ...rig.build,

    // B's tiers, and on top of them the cube on its axle. The cube is built in the innermost
    // ring's own frame, then turned through the same pivots as that ring, so it sits true in it.
    core: (values) => {
      const { core, rings } = values
      const reach = RADIUS - 2 * STEP - GIMBAL_THICK
      const cube = [
        rod([-reach, 0, 0], [reach, 0, 0], 0.035),
        ...cubeCity(CUBE, 0.08, core.skyline).map((piece) => piece.rotateX(rad(core.spin))),
      ].map((piece) => piece.rotateY(rad(rings.tiltB)).rotateX(rad(rings.tiltA)))
      return [...rig.build.core(values), ...place(cube, rings)]
    },

    // B's orbit rings, and the crown's gimbals with the pin they stand on.
    rings: (values) => {
      const { rings } = values
      const foot = crownCentre(rings) - RADIUS * rings.scale
      return [
        ...rig.build.rings(values),
        ...place(gimbal(RADIUS, STEP, DEPTH, rad(rings.tiltA), rad(rings.tiltB)), rings),
        rod([0, rig.mountTop, 0], [0, foot + 0.02, 0], 0.03),
        drum(0.06, 0.04).translate(0, rig.mountTop + 0.02, 0),
      ]
    },
  },
})
