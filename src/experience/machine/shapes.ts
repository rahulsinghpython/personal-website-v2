import {
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  LatheGeometry,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from 'three'

// The few operations the Machine is made from (see "How shapes are made in code" in
// docs/DESIGN-PROCESS.md). Everything is built around the Y axis and then turned or moved into
// place with the geometry's own rotate and translate methods.

export type Point = [x: number, y: number, z: number]

const UP = new Vector3(0, 1, 0)
const TAU = Math.PI * 2

/** A 2D profile spun around the Y axis. Each point is [radius, height]. */
export function lathe(profile: [radius: number, height: number][], segments = 64): BufferGeometry {
  return new LatheGeometry(
    profile.map(([radius, height]) => new Vector2(radius, height)),
    segments,
  )
}

/** A round-section ring around the Y axis. */
export function ring(radius: number, tube: number, segments = 128): BufferGeometry {
  return new TorusGeometry(radius, tube, 10, segments).rotateX(Math.PI / 2)
}

/** A machined ring around the Y axis: flat faces, square section. `depth` is along the axis. */
export function band(inner: number, outer: number, depth: number, segments = 96): BufferGeometry {
  const half = depth / 2
  return lathe(
    [
      [inner, -half],
      [outer, -half],
      [outer, half],
      [inner, half],
      [inner, -half],
    ],
    segments,
  )
}

/** A solid cylinder around the Y axis, centred on the origin. */
export function drum(radius: number, height: number, segments = 48): BufferGeometry {
  return new CylinderGeometry(radius, radius, height, segments)
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
  return new CylinderGeometry(radius, radius, length, 12)
    .applyQuaternion(new Quaternion().setFromUnitVectors(UP, direction.normalize()))
    .translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2)
}

/** A pipe through a list of points, smoothed. */
export function pipe(points: Point[], radius: number, segments = 48): BufferGeometry {
  const curve = new CatmullRomCurve3(points.map((point) => new Vector3(...point)))
  return new TubeGeometry(curve, segments, radius, 8)
}

/** The same shape `count` times around the Y axis. `make` builds the one at angle 0. */
export function around(count: number, make: (index: number) => BufferGeometry): BufferGeometry[] {
  return Array.from({ length: count }, (_, i) => make(i).rotateY((i / count) * TAU))
}

/**
 * A stack of aperture plates along +Y, starting at the origin and narrowing as it goes, held
 * together by three rails. The Lens in every silhouette is one of these, pointed somewhere.
 */
export function apertureStack(
  radius: number,
  count: number,
  gap: number,
  taper: number,
): BufferGeometry[] {
  const outerAt = (i: number) => radius * (1 - taper * i)
  const plates = Array.from({ length: count }, (_, i) =>
    band(outerAt(i) * 0.5, outerAt(i), 0.05).translate(0, i * gap, 0),
  )
  const last = count - 1
  const rails = around(3, () =>
    rod([outerAt(0) * 0.88, 0, 0], [outerAt(last) * 0.88, last * gap, 0], 0.014),
  )
  return [...plates, ...rails]
}

export function box(width: number, height: number, depth: number): BufferGeometry {
  return new BoxGeometry(width, height, depth)
}

/** How thick a gimbal ring is, from its inner face to its outer face. */
export const GIMBAL_THICK = 0.06

/**
 * Three rings, each pivoted inside the next on an axis at right angles to the last, like a
 * gyroscope's gimbals. The outer ring faces +Z. The tilts are how far the middle and inner rings
 * have turned on their pivots.
 */
export function gimbal(
  radius: number,
  step: number,
  depth: number,
  tiltA: number,
  tiltB: number,
): BufferGeometry[] {
  const thick = GIMBAL_THICK
  const radii = [radius, radius - step, radius - 2 * step] as const
  const faceOn = (outer: number) => band(outer - thick, outer, depth).rotateX(Math.PI / 2)
  const pin = (from: number, to: number, axis: 'x' | 'y') =>
    [-1, 1].map((side) =>
      axis === 'x'
        ? rod([side * (from - thick), 0, 0], [side * (to - thick / 2), 0, 0], 0.03)
        : rod([0, side * (from - thick), 0], [0, side * (to - thick / 2), 0], 0.03),
    )
  return [
    faceOn(radii[0]),
    ...pin(radii[1], radii[0], 'x'),
    faceOn(radii[1]).rotateX(tiltA),
    ...pin(radii[2], radii[1], 'y').map((piece) => piece.rotateX(tiltA)),
    faceOn(radii[2]).rotateY(tiltB).rotateX(tiltA),
  ]
}

/** A dish opening towards +Y, with its feed held at the focus. */
export function dish(radius: number): BufferGeometry[] {
  const focus = radius * 0.55
  const steps = 12
  const bowl = lathe(
    Array.from({ length: steps + 1 }, (_, i) => {
      const r = (radius * i) / steps
      return [r, (r * r) / (4 * focus)] as [number, number]
    }),
  )
  const rim = (radius * radius) / (4 * focus)
  return [
    bowl,
    drum(radius * 0.1, radius * 0.12).translate(0, focus, 0),
    ...around(3, () => rod([radius * 0.95, rim, 0], [radius * 0.08, focus, 0], 0.012)),
  ]
}

/** A repeatable number from 0 to 1 for a grid cell, so "random" detail is the same every build. */
export function noise(x: number, y: number): number {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return value - Math.floor(value)
}

export const rad = (degrees: number) => (degrees * Math.PI) / 180

export { TAU }
