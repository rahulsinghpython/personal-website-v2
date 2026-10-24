// The city's plan: the flat map it is built from (docs/DECISIONS.md, D39). A point on the ground
// is [x, z]. The visitor looks along -z, so -z is across the bay and +x is to their right.

export type Vec2 = [x: number, z: number]

/** A repeatable stream of numbers from 0 to 1, so the same layout gives the same city every build. */
export function rng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function inside([x, z]: Vec2, polygon: Vec2[]): boolean {
  let within = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, zi] = polygon[i]!
    const [xj, zj] = polygon[j]!
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) within = !within
  }
  return within
}

function toSegment([x, z]: Vec2, [ax, az]: Vec2, [bx, bz]: Vec2): number {
  const dx = bx - ax
  const dz = bz - az
  const along = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)))
  return Math.hypot(x - ax - dx * along, z - az - dz * along)
}

/** How far a point is from a line of segments; `closed` joins the last point to the first. */
export function distance(point: Vec2, line: Vec2[], closed = false): number {
  let nearest = Infinity
  const count = closed ? line.length : line.length - 1
  for (let i = 0; i < count; i++)
    nearest = Math.min(nearest, toSegment(point, line[i]!, line[(i + 1) % line.length]!))
  return nearest
}

/** A line moved sideways by `by`, for the two banks of the river. */
export function offset(line: Vec2[], by: number): Vec2[] {
  return line.map(([x, z], i) => {
    const [ax, az] = line[Math.max(0, i - 1)]!
    const [bx, bz] = line[Math.min(line.length - 1, i + 1)]!
    const length = Math.hypot(bx - ax, bz - az) || 1
    return [x - ((bz - az) / length) * by, z + ((bx - ax) / length) * by]
  })
}

export function circle([x, z]: Vec2, radius: number, segments = 64): Vec2[] {
  return Array.from({ length: segments }, (_, i) => {
    const angle = (i / segments) * Math.PI * 2
    return [x + Math.cos(angle) * radius, z + Math.sin(angle) * radius]
  })
}

export function rect(x0: number, z0: number, x1: number, z1: number): Vec2[] {
  return [
    [x0, z0],
    [x1, z0],
    [x1, z1],
    [x0, z1],
  ]
}

/** Points along a line, about `step` apart, ends included. */
export function along(line: Vec2[], step: number): Vec2[] {
  const points: Vec2[] = [line[0]!]
  for (let i = 1; i < line.length; i++) {
    const [ax, az] = line[i - 1]!
    const [bx, bz] = line[i]!
    const count = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / step))
    for (let k = 1; k <= count; k++)
      points.push([ax + ((bx - ax) * k) / count, az + ((bz - az) * k) / count])
  }
  return points
}
