import type { BufferGeometry } from 'three'
import { box, noise, rod, type Point } from './shapes'

const SIDES = [-1, 1]
const LOTS = 3

/**
 * A cube made of eight smaller cubes with gaps between them, and a small city on its roof: a grid
 * of blocks of different heights on each of the four top cubes. Centred on `centre` in height.
 */
export function cubeCity(size: number, gap: number, skyline: number, centre = 0): BufferGeometry[] {
  const cell = (size - gap) / 2
  const offset = (cell + gap) / 2
  const roof = centre + size / 2

  const cubes = SIDES.flatMap((x) =>
    SIDES.flatMap((y) =>
      SIDES.map((z) =>
        box(cell, cell, cell).translate(x * offset, centre + y * offset, z * offset),
      ),
    ),
  )

  const lot = cell / LOTS
  const blocks = SIDES.flatMap((x) =>
    SIDES.flatMap((z) =>
      Array.from({ length: LOTS * LOTS }, (_, i) => {
        const column = i % LOTS
        const row = Math.floor(i / LOTS)
        const height = Math.max(0.01, skyline * (0.15 + 0.85 * noise(column + 5 * x, row + 9 * z)))
        return box(lot * 0.72, height, lot * 0.72).translate(
          x * offset + (column - 1) * lot,
          roof + height / 2,
          z * offset + (row - 1) * lot,
        )
      }),
    ),
  )

  return [...cubes, ...blocks]
}

/**
 * The twelve edges of each of the eight cubes of `cubeCity`, as thin bars. As points a cube's
 * faces are a haze; its edges are what make it a cube.
 */
export function cubeFrame(size: number, gap: number, radius: number, centre = 0): BufferGeometry[] {
  const cell = (size - gap) / 2
  const offset = (cell + gap) / 2
  const half = cell / 2
  return SIDES.flatMap((x) =>
    SIDES.flatMap((y) =>
      SIDES.flatMap((z) => {
        const middle: Point = [x * offset, centre + y * offset, z * offset]
        return [0, 1, 2].flatMap((axis) =>
          SIDES.flatMap((a) =>
            SIDES.map((b) => {
              /** A point on this edge, `along` from its middle. */
              const at = (along: number) =>
                middle.map(
                  (value, i) =>
                    value + (i === axis ? along : (i === (axis + 1) % 3 ? a : b) * half),
                ) as Point
              return rod(at(-half), at(half), radius)
            }),
          ),
        )
      }),
    ),
  )
}
