import { defineMachine, param } from '../part'
import { apertureStack, box, drum, gimbal, noise, pipe, rad } from '../shapes'

// Silhouette A: round and ringed. A cube of cubes with a skyline on its roof, hung inside three
// nested gimbal rings. From the references: the Connection Machine, the chip die as a "machine
// city", and the gimbal's rings inside rings.

const SIDES = [-1, 1]
const LOTS = 3

export const caged = defineMachine({
  id: 'A',
  label: 'Cube in gimbals',
  params: {
    core: {
      size: param(1.3, 0.8, 1.6),
      gap: param(0.12, 0.02, 0.3),
      skyline: param(0.2, 0, 0.4),
      fibre: param(0.04, 0.01, 0.08, 0.005),
    },
    scanner: {
      size: param(1.6, 0.5, 2.5),
      angle: param(38, -180, 180, 1),
    },
    rings: {
      radius: param(1.95, 1.5, 2.4),
      step: param(0.27, 0.15, 0.5),
      tiltA: param(52, 0, 90, 1),
      tiltB: param(38, 0, 90, 1),
      depth: param(0.16, 0.04, 0.4),
    },
    lens: {
      radius: param(0.42, 0.2, 0.8),
      count: param(4, 1, 8, 1),
      gap: param(0.2, 0.08, 0.4),
      taper: param(0.17, 0, 0.3),
    },
  },
  build: {
    core: ({ core }) => {
      const cell = (core.size - core.gap) / 2
      const offset = (cell + core.gap) / 2
      const half = core.size / 2

      const cubes = SIDES.flatMap((x) =>
        SIDES.flatMap((y) =>
          SIDES.map((z) => box(cell, cell, cell).translate(x * offset, y * offset, z * offset)),
        ),
      )

      // The roof is a small city: a grid of blocks of different heights on each of the top cubes.
      const lot = cell / LOTS
      const skyline = SIDES.flatMap((x) =>
        SIDES.flatMap((z) =>
          Array.from({ length: LOTS * LOTS }, (_, i) => {
            const column = i % LOTS
            const row = Math.floor(i / LOTS)
            const height = Math.max(
              0.01,
              core.skyline * (0.15 + 0.85 * noise(column + 5 * x, row + 9 * z)),
            )
            return box(lot * 0.72, height, lot * 0.72).translate(
              x * offset + (column - 1) * lot,
              half + height / 2,
              z * offset + (row - 1) * lot,
            )
          }),
        ),
      )

      // Fibres leave through the gaps between the cubes and gather into one trunk underneath.
      const fibres = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].map(([x = 0, z = 0]) =>
        pipe(
          [
            [0, 0, 0],
            [x * (half + 0.16), 0, z * (half + 0.16)],
            [x * (half + 0.2), -half * 0.7, z * (half + 0.2)],
            [x * 0.2, -half - 0.28, z * 0.2],
            [x * 0.07, -half - 0.5, z * 0.07],
          ],
          core.fibre,
        ),
      )

      return [...cubes, ...skyline, ...fibres]
    },

    // A head that rides the outer ring, like the gantry of a scanner.
    scanner: ({ scanner, rings }) => {
      const s = scanner.size
      const seat = rings.radius + 0.02
      return [
        box(0.36 * s, 0.14 * s, rings.depth + 0.12).translate(0, seat, 0),
        drum(0.15 * s, 0.24 * s).translate(0, seat + 0.19 * s, 0),
        drum(0.17 * s, 0.03 * s).translate(0, seat + 0.325 * s, 0),
      ].map((piece) => piece.rotateZ(rad(scanner.angle)))
    },

    rings: ({ rings }) =>
      gimbal(rings.radius, rings.step, rings.depth, rad(rings.tiltA), rad(rings.tiltB)),

    // Out along the axis the gimbals pivot on.
    lens: ({ lens, rings }) =>
      [
        drum(0.05, 0.12).translate(0, -0.05, 0),
        ...apertureStack(lens.radius, Math.round(lens.count), lens.gap, lens.taper),
      ].map((piece) => piece.rotateZ(-Math.PI / 2).translate(rings.radius + 0.1, 0, 0)),
  },
})
