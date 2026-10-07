import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  LatheGeometry,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three'

// The few operations the Machine is made from (see "How shapes are made in code" in
// docs/DESIGN-PROCESS.md). Everything is built around the Y axis and then turned or moved into
// place with the geometry's own rotate and translate methods.

export type Point = [x: number, y: number, z: number]

const UP = new Vector3(0, 1, 0)
const TAU = Math.PI * 2

/**
 * How a shape is drawn as lines once its part is awake (see ./lines.ts): a rod by its centre
 * line, a ring by the middle of its tube, a drum by its two rims, a band by the rims of its top
 * face. A shape without one is drawn as points only.
 */
export type Outline = 'rod' | 'ring' | 'drum' | 'band'

function outlined(geometry: BufferGeometry, outline: Outline): BufferGeometry {
  geometry.userData.outline = outline
  return geometry
}

export const outlineOf = (geometry: BufferGeometry): Outline | undefined =>
  geometry.userData.outline

/** A 2D profile spun around the Y axis. Each point is [radius, height]. */
export function lathe(profile: [radius: number, height: number][], segments = 64): BufferGeometry {
  return new LatheGeometry(
    profile.map(([radius, height]) => new Vector2(radius, height)),
    segments,
  )
}

/** A round-section ring around the Y axis. */
export function ring(radius: number, tube: number, segments = 128): BufferGeometry {
  return outlined(new TorusGeometry(radius, tube, 10, segments).rotateX(Math.PI / 2), 'ring')
}

/** A machined ring around the Y axis: flat faces, square section. `depth` is along the axis. */
export function band(inner: number, outer: number, depth: number, segments = 96): BufferGeometry {
  const half = depth / 2
  return outlined(
    lathe(
      [
        [inner, -half],
        [outer, -half],
        [outer, half],
        [inner, half],
        [inner, -half],
      ],
      segments,
    ),
    'band',
  )
}

/** A solid cylinder around the Y axis, centred on the origin. */
export function drum(radius: number, height: number, segments = 48): BufferGeometry {
  return outlined(new CylinderGeometry(radius, radius, height, segments), 'drum')
}

export function ball(radius: number): BufferGeometry {
  return new SphereGeometry(radius, 24, 16)
}

/** A straight round bar from one point to another. */
export function rod(from: Point, to: Point, radius: number): BufferGeometry {
  const a = new Vector3(...from)
  const b = new Vector3(...to)
  const direction = b.clone().sub(a)
  const length = direction.length()
  return outlined(
    new CylinderGeometry(radius, radius, length, 12)
      .applyQuaternion(new Quaternion().setFromUnitVectors(UP, direction.normalize()))
      .translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2),
    'rod',
  )
}

/** The same shape `count` times around the Y axis. `make` builds the one at angle 0. */
export function around(count: number, make: (index: number) => BufferGeometry): BufferGeometry[] {
  return Array.from({ length: count }, (_, i) => make(i).rotateY((i / count) * TAU))
}

export function box(width: number, height: number, depth: number): BufferGeometry {
  return new BoxGeometry(width, height, depth)
}

/** A repeatable number from 0 to 1 for a grid cell, so "random" detail is the same every build. */
export function noise(x: number, y: number): number {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return value - Math.floor(value)
}

export const rad = (degrees: number) => (degrees * Math.PI) / 180
