import {
  AdditiveBlending,
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LineSegments,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
  Vector4,
  type Ray,
  type Raycaster,
} from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import { placeLandmark } from './city'
import { sciencePanels } from './landmarks'
import type { CityValues, Layout } from './layouts'

// The Scanner sweep (docs/EXPERIENCE.md, "Interactions"): at the Scanner beat the visitor sweeps a
// beam across the Science Centre, and where it has passed, the raw points close into surface and
// the roofs get their solar panels. Rahul's Etavolt work, done in front of the visitor.
//
// The surface is drawn as Rahul picked it from five (docs/DECISIONS.md, D51): each point of the
// scan grows into a small tile of the wall, and the mesh rebuilt from them is drawn over the tiles
// as lines, its triangles coming in one by one.
//
// What has been swept is held as bins across the building, from its west end to its east, each
// from 0 (raw points) to 1 (rebuilt). The surface, the panels and the city's own points all read
// them, so one sweep moves all three.

/** How many slices the building is swept in. */
export const SCAN_BINS = 32

/** Seconds for a slice to close from points into surface once the beam has passed it. */
const CLOSE = 0.8
/** Half the beam's width, in city units: what it rebuilds as it passes. */
const BEAM = 0.025
/** Seconds for the beam to come up or go out, and for it to catch up with the pointer. */
const BEAM_LIGHT = 0.15
const BEAM_CHASE = 0.04
/** How bright the beam stands, unheld, at the building: enough to be seen and taken up. */
const PARK = 0.3
/** The teaser: seconds the visitor rests at the beat before it plays, for the beam to come up,
 * to slide in and to slide back; how far across the building it goes, and how far the strip it
 * passes closes (short of the roof's panels, which come in at 0.86). */
const TEASE_WAIT = 1.2
const TEASE_LIGHT = 0.3
const TEASE_GO = 1.6
const TEASE_BACK = 1.1
const TEASE_REACH = 0.4
const TEASE_PEAK = 0.45
/** The teaser plays once per visit, however often the beat is reached. */
let teasedThisVisit = false
const ease = (t: number) => t * t * (3 - 2 * t)
/** Where the light on the rebuilt surface comes from, so its form can be read. */
const LIGHT = new Vector3(0.45, 0.8, 0.55).normalize()

/**
 * Shared by every material that reads the sweep. `uScanBox` is the building's west and east
 * edges, the beam's place and how lit it is; `uScanShown` is how near the story is to the Scanner
 * beat, so the sweep is only drawn there.
 */
export type ScanUniforms = {
  uScan: { value: Float32Array }
  uScanBox: { value: Vector4 }
  uScanShown: { value: number }
}

export const scanUniforms = (): ScanUniforms => ({
  uScan: { value: new Float32Array(SCAN_BINS) },
  uScanBox: { value: new Vector4(0, 1, 0, 0) },
  uScanShown: { value: 0 },
})

/** GLSL for reading the sweep: how rebuilt the building is at `x`, and how near the beam is. */
export const SCAN_GLSL = /* glsl */ `
  uniform float uScan[${SCAN_BINS}];
  uniform vec4 uScanBox;
  uniform float uScanShown;
  float scanned(float x) {
    float t = clamp((x - uScanBox.x) / (uScanBox.y - uScanBox.x), 0.0, 1.0) * ${(SCAN_BINS - 1).toFixed(1)};
    int i = int(floor(t));
    int j = min(i + 1, ${SCAN_BINS - 1});
    return mix(uScan[i], uScan[j], fract(t)) * uScanShown;
  }
  float underBeam(float x, float width) {
    return uScanBox.w * uScanShown * (1.0 - smoothstep(0.0, width, abs(x - uScanBox.z)));
  }
`

/** How near the story is to the Scanner beat, from 0 to 1: the sweep is only drawn there. */
export function scanShown(beat: number) {
  const t = Math.min(1, Math.max(0, (Math.abs(beat - 3) - 0.3) / 0.3))
  return 1 - t * t * (3 - 2 * t)
}

/** A number from 0 to 1 for a whole number, the same every time. */
function hash(n: number) {
  let t = Math.imul(n ^ (n >>> 16), 0x45d9f3b)
  t = Math.imul(t ^ (t >>> 16), 0x45d9f3b)
  return ((t ^ (t >>> 16)) >>> 0) / 4294967296
}

/** The same number for the same point in space, to the tenth of a millimetre of the city. */
const spot = (x: number, y: number, z: number, salt: number) =>
  hash(
    (Math.round(x * 1e4) * 73856093) ^
      (Math.round(y * 1e4) * 19349663) ^
      (Math.round(z * 1e4) * 83492791) ^
      salt,
  )

/** The Science Centre as one geometry of loose triangles, where the layout puts it. */
function building(layout: Layout, values: CityValues): BufferGeometry {
  const pieces = placeLandmark(layout, 'science', values.landmarks.size!).map((piece) => {
    const flat = piece.index ? piece.toNonIndexed() : piece
    for (const name of Object.keys(flat.attributes))
      if (name !== 'position') flat.deleteAttribute(name)
    return flat
  })
  const merged = mergeGeometries(pieces)!
  for (const piece of pieces) piece.dispose()
  merged.computeVertexNormals()
  return merged
}

/**
 * Splits every triangle until no side is longer than `edge`, each side at a point of its own (so
 * the two triangles that share it split it the same way), then nudges every corner by a little
 * noise of its own: the uneven mesh a reconstruction from a scan makes, with no cracks in it.
 */
function remesh(source: BufferGeometry, edge: number, noise: number): BufferGeometry {
  const position = source.getAttribute('position')
  const out: number[] = []
  const split = (a: Vector3, b: Vector3) => {
    const lo = a.x + a.y + a.z < b.x + b.y + b.z ? a : b
    const hi = lo === a ? b : a
    const t = 0.35 + 0.3 * spot(lo.x + hi.x, lo.y + hi.y, lo.z + hi.z, 11)
    return lo.clone().lerp(hi, t)
  }
  const divide = (a: Vector3, b: Vector3, c: Vector3, depth: number) => {
    const ab = a.distanceTo(b)
    const bc = b.distanceTo(c)
    const ca = c.distanceTo(a)
    const longest = Math.max(ab, bc, ca)
    if (longest <= edge || depth > 14) {
      for (const p of [a, b, c]) out.push(p.x, p.y, p.z)
      return
    }
    if (longest === ab) {
      const m = split(a, b)
      divide(a, m, c, depth + 1)
      divide(m, b, c, depth + 1)
    } else if (longest === bc) {
      const m = split(b, c)
      divide(a, b, m, depth + 1)
      divide(a, m, c, depth + 1)
    } else {
      const m = split(c, a)
      divide(a, b, m, depth + 1)
      divide(m, b, c, depth + 1)
    }
  }
  const [a, b, c] = [new Vector3(), new Vector3(), new Vector3()]
  for (let i = 0; i < position.count; i += 3) {
    a.fromBufferAttribute(position, i)
    b.fromBufferAttribute(position, i + 1)
    c.fromBufferAttribute(position, i + 2)
    // A triangle with no area (the caps of a drum meet in one point) has nothing to rebuild.
    if (b.clone().sub(a).cross(c.clone().sub(a)).lengthSq() < 1e-12) continue
    divide(a.clone(), b.clone(), c.clone(), 0)
  }
  for (let i = 0; i < out.length; i += 3) {
    const [x, y, z] = [out[i]!, out[i + 1]!, out[i + 2]!]
    out[i] = x + (spot(x, y, z, 1) - 0.5) * noise
    out[i + 1] = y + (spot(x, y, z, 2) - 0.5) * noise
    out[i + 2] = z + (spot(x, y, z, 3) - 0.5) * noise
  }
  const mesh = new BufferGeometry()
  mesh.setAttribute('position', new BufferAttribute(new Float32Array(out), 3))
  mesh.computeVertexNormals()
  return mesh
}

/**
 * Gives each triangle its middle and a number of its own, the same on its three corners, so it
 * comes in whole when the sweep reaches it. `per` is how many vertices a piece has: 3 for a
 * triangle, 2 for a line.
 */
function perPiece(geometry: BufferGeometry, per: number, salt: number) {
  const position = geometry.getAttribute('position')
  const middle = new Float32Array(position.count * 3)
  const seed = new Float32Array(position.count)
  for (let i = 0; i < position.count; i += per) {
    let [x, y, z] = [0, 0, 0]
    for (let k = 0; k < per; k++) {
      x += position.getX(i + k) / per
      y += position.getY(i + k) / per
      z += position.getZ(i + k) / per
    }
    const s = spot(x, y, z, salt)
    for (let k = 0; k < per; k++) {
      middle.set([x, y, z], (i + k) * 3)
      seed[i + k] = s
    }
  }
  geometry.setAttribute('aMiddle', new BufferAttribute(middle, 3))
  geometry.setAttribute('aSeed', new BufferAttribute(seed, 1))
}

/** Every side of every triangle as a line, each carrying its triangle's middle and number. */
function wire(mesh: BufferGeometry): BufferGeometry {
  const position = mesh.getAttribute('position')
  const middle = mesh.getAttribute('aMiddle')
  const seed = mesh.getAttribute('aSeed')
  const p: number[] = []
  const m: number[] = []
  const s: number[] = []
  for (let i = 0; i < position.count; i += 3)
    for (const [from, to] of [
      [0, 1],
      [1, 2],
      [2, 0],
    ] as const)
      for (const k of [i + from, i + to]) {
        p.push(position.getX(k), position.getY(k), position.getZ(k))
        m.push(middle.getX(k), middle.getY(k), middle.getZ(k))
        s.push(seed.getX(k))
      }
  const lines = new BufferGeometry()
  lines.setAttribute('position', new BufferAttribute(new Float32Array(p), 3))
  lines.setAttribute('aMiddle', new BufferAttribute(new Float32Array(m), 3))
  lines.setAttribute('aSeed', new BufferAttribute(new Float32Array(s), 1))
  return lines
}

const common = (uniforms: ScanUniforms) => ({
  ...uniforms,
  uAccent: { value: new Color('#ffa726') },
  uLight: { value: LIGHT },
})

/**
 * The mesh's lines, over the tiles. Each triangle's three sides come in together when the sweep
 * at its middle passes its own number, so the mesh closes in triangle by triangle, a little after
 * the tiles, bright as they arrive.
 */
function meshLines(mesh: BufferGeometry, uniforms: ScanUniforms) {
  const material = new ShaderMaterial({
    uniforms: { ...common(uniforms), uBright: { value: 0.28 } },
    vertexShader: /* glsl */ `
      ${SCAN_GLSL}
      attribute vec3 aMiddle;
      attribute float aSeed;
      varying float vLight;
      void main() {
        float r = scanned(aMiddle.x);
        float from = 0.2 + 0.6 * aSeed;
        float shown = smoothstep(from, from + 0.1, r);
        float fresh = shown * (1.0 - smoothstep(from + 0.1, from + 0.4, r));
        vLight = shown * (1.0 + 1.5 * fresh + 2.0 * underBeam(position.x, 0.015));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        if (vLight <= 0.001) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uAccent;
      uniform float uBright;
      varying float vLight;
      void main() {
        gl_FragColor = vec4(mix(uAccent, vec3(1.0, 0.9, 0.75), clamp(vLight - 1.0, 0.0, 1.0)) * uBright * vLight, 1.0);
      }
    `,
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
  })
  return new LineSegments(wire(mesh), material)
}

/**
 * The tiles: a facet of surface at each of `count` points over the building, square to it, growing
 * from a point into a tile that meets its neighbours as the sweep passes.
 */
function tiles(source: BufferGeometry, count: number, uniforms: ScanUniforms) {
  const sampler = new MeshSurfaceSampler(new Mesh(source)).build()
  const at = new Float32Array(count * 3)
  const normals = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const point = new Vector3()
  const normal = new Vector3()
  for (let i = 0; i < count; i++) {
    sampler.sample(point, normal)
    at.set([point.x, point.y, point.z], i * 3)
    normals.set([normal.x, normal.y, normal.z], i * 3)
    seeds[i] = spot(point.x, point.y, point.z, 7)
  }
  let area = 0
  const position = source.getAttribute('position')
  const [a, b, c] = [new Vector3(), new Vector3(), new Vector3()]
  for (let i = 0; i < position.count; i += 3) {
    a.fromBufferAttribute(position, i)
    b.fromBufferAttribute(position, i + 1).sub(a)
    c.fromBufferAttribute(position, i + 2).sub(a)
    area += b.cross(c).length() / 2
  }
  const geometry = new InstancedBufferGeometry()
  const quad = new PlaneGeometry(1, 1)
  geometry.index = quad.index
  geometry.setAttribute('position', quad.getAttribute('position'))
  geometry.setAttribute('aAt', new InstancedBufferAttribute(at, 3))
  geometry.setAttribute('aNormal', new InstancedBufferAttribute(normals, 3))
  geometry.setAttribute('aSeed', new InstancedBufferAttribute(seeds, 1))
  geometry.instanceCount = count
  const material = new ShaderMaterial({
    uniforms: { ...common(uniforms), uTile: { value: Math.sqrt(area / count) * 0.95 } },
    vertexShader: /* glsl */ `
      ${SCAN_GLSL}
      attribute vec3 aAt;
      attribute vec3 aNormal;
      attribute float aSeed;
      uniform float uTile;
      uniform vec3 uLight;
      varying float vShown;
      varying float vFresh;
      varying float vFacing;
      varying vec3 vAt;
      void main() {
        float r = scanned(aAt.x);
        float from = 0.05 + 0.5 * aSeed;
        float grown = smoothstep(from, from + 0.4, r);
        vShown = smoothstep(from, from + 0.05, r);
        vFresh = vShown * (1.0 - smoothstep(from + 0.2, from + 0.5, r));
        vFacing = max(dot(aNormal, uLight), 0.0);
        vAt = aAt;
        // Square to the surface, its rows level, so the tiles line up like a scanner's passes. A
        // hair off the wall, so they hide the mesh's lines in places and it reads as under them.
        vec3 across = abs(aNormal.y) > 0.9 ? vec3(1.0, 0.0, 0.0) : normalize(cross(vec3(0.0, 1.0, 0.0), aNormal));
        vec3 up = cross(aNormal, across);
        float size = uTile * mix(0.12, 1.0, grown);
        vec3 at = aAt + aNormal * 0.002 + (across * position.x + up * position.y) * size;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(at, 1.0);
        if (vShown <= 0.001) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      ${SCAN_GLSL}
      uniform vec3 uAccent;
      varying float vShown;
      varying float vFresh;
      varying float vFacing;
      varying vec3 vAt;
      void main() {
        float shade = 0.2 + 0.65 * vFacing;
        vec3 colour = uAccent * shade + vec3(1.0, 0.85, 0.6) * (0.6 * vFresh + 0.7 * underBeam(vAt.x, 0.012));
        gl_FragColor = vec4(colour, 0.9 * vShown);
      }
    `,
    transparent: true,
    depthWrite: true,
  })
  quad.dispose()
  return new Mesh(geometry, material)
}

/** The solar panels: each a dark cell in a bright frame, placed when its roof is rebuilt. */
function panels(layout: Layout, values: CityValues, uniforms: ScanUniforms) {
  const { at, turn } = layout.landmarks.science
  const size = values.landmarks.size!
  const geometry = sciencePanels().scale(size, size, size).rotateY(turn).translate(at[0], 0, at[1])
  perPiece(geometry, 6, 13)
  const material = new ShaderMaterial({
    uniforms: common(uniforms),
    vertexShader: /* glsl */ `
      ${SCAN_GLSL}
      attribute vec3 aMiddle;
      attribute float aSeed;
      varying float vShown;
      varying vec2 vUv;
      void main() {
        float r = scanned(aMiddle.x);
        float from = 0.86 + 0.1 * aSeed;
        vShown = smoothstep(from, from + 0.04, r);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        if (vShown <= 0.001) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uAccent;
      varying float vShown;
      varying vec2 vUv;
      void main() {
        vec2 edge = min(vUv, 1.0 - vUv);
        float frame = 1.0 - smoothstep(0.05, 0.09, min(edge.x, edge.y));
        // The cells of the panel, faint.
        vec2 cell = abs(fract(vUv * vec2(4.0, 6.0)) - 0.5);
        float lines = smoothstep(0.42, 0.48, max(cell.x, cell.y));
        vec3 colour = mix(vec3(0.03, 0.035, 0.06) + uAccent * 0.12 * lines, uAccent * 0.8, frame);
        gl_FragColor = vec4(colour, vShown);
      }
    `,
    transparent: true,
    depthWrite: true,
  })
  return new Mesh(geometry, material)
}

/** The beam: a blade of light standing over the building where it sweeps. */
function beam(box: Box3, uniforms: ScanUniforms) {
  const top = box.max.y + 0.12
  const geometry = new PlaneGeometry(0.16, top).translate(0, top / 2, box.max.z + 0.02)
  const material = new ShaderMaterial({
    uniforms: common(uniforms),
    vertexShader: /* glsl */ `
      uniform vec4 uScanBox;
      varying vec2 vAt;
      void main() {
        vAt = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position + vec3(uScanBox.z, 0.0, 0.0), 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec4 uScanBox;
      uniform float uScanShown;
      uniform vec3 uAccent;
      varying vec2 vAt;
      void main() {
        float x = abs(vAt.x);
        float core = exp(-pow(x / 0.0035, 2.0));
        float glow = exp(-pow(x / 0.03, 2.0));
        float height = ${top.toFixed(3)};
        // Brightest at the building, fading out above it.
        float fade = 1.0 - smoothstep(height * 0.55, height, vAt.y);
        vec3 colour = vec3(1.0, 0.92, 0.8) * core + uAccent * 0.35 * glow;
        gl_FragColor = vec4(colour * fade * uScanBox.w * uScanShown, 1.0);
      }
    `,
    blending: AdditiveBlending,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })
  return new Mesh(geometry, material)
}

export type Scan = {
  /** What is drawn: the rebuilt surface, its panels and the beam. */
  object: Group
  uniforms: ScanUniforms
  /** Where the pointer's ray points the beam, or null when it is not over the building. */
  aim: (raycaster: Raycaster) => number | null
  /**
   * Moves the sweep on by `dt` seconds, with the beam at `x` or out (null), at `shown` of the
   * way to the Scanner beat. `rest.settled` says the camera has come to rest; `rest.motion`
   * says the device and the visitor allow motion of its own, without which there is no teaser.
   * Says whether anything is still changing, so frames are asked for only then. Away from the
   * beat the building goes back to points, ready to be swept again.
   */
  step: (
    dt: number,
    x: number | null,
    shown: number,
    rest: { settled: boolean; motion: boolean },
  ) => boolean
  dispose: () => void
}

export function buildScan(layout: Layout, values: CityValues): Scan {
  const uniforms = scanUniforms()
  const source = building(layout, values)
  source.computeBoundingBox()
  const box = source.boundingBox!.clone()
  const west = box.min.x - 0.01
  const east = box.max.x + 0.01
  uniforms.uScanBox.value.set(west, east, west, 0)

  const object = new Group()
  const mesh = remesh(source, 0.036, 0.003)
  perPiece(mesh, 3, 5)
  object.add(tiles(source, 3200, uniforms))
  object.add(meshLines(mesh, uniforms))
  mesh.dispose()
  object.add(panels(layout, values, uniforms))
  object.add(beam(box, uniforms))
  // After the city's points, which write no depth, so the surface covers the raw points it rebuilds.
  object.traverse((child) => {
    child.renderOrder = 1
    child.frustumCulled = false
  })

  // The beam is aimed where the pointer's ray crosses the building's front, and only when the
  // ray passes near the building at all.
  const reach = box.clone().expandByVector(new Vector3(0.12, 0.1, 0.12))
  reach.min.y = 0
  const hit = new Vector3()
  const plane = { normal: new Vector3(0, 0, 1), z: (box.min.z + box.max.z) / 2 }
  const aim = (raycaster: Raycaster) => {
    const ray: Ray = raycaster.ray
    if (!ray.intersectBox(reach, hit)) return null
    const t = (plane.z - ray.origin.z) / ray.direction.z
    const x = Number.isFinite(t) && t > 0 ? ray.origin.x + ray.direction.x * t : hit.x
    return Math.min(east, Math.max(west, x))
  }

  const bins = uniforms.uScan.value
  // What the visitor has swept, and what the teaser has lit for a moment. The shaders read the
  // greater of the two.
  const swept = new Float32Array(SCAN_BINS)
  const teased = new Float32Array(SCAN_BINS)
  const passed = new Uint8Array(SCAN_BINS)
  const span = east - west
  const binOf = (x: number) => ((x - west) / span) * (SCAN_BINS - 1)
  let last: number | null = null
  // Seconds into the teaser: below 0 while it waits for the visitor to settle, null when it is
  // not playing.
  let tease: number | null = null
  const step: Scan['step'] = (dt, x, shown, rest) => {
    const state = uniforms.uScanBox.value
    let changing = false
    uniforms.uScanShown.value = shown
    if (shown <= 0) {
      if (passed.some(Boolean) || bins.some((v) => v > 0) || state.w > 0) changing = true
      passed.fill(0)
      swept.fill(0)
      teased.fill(0)
      bins.fill(0)
      state.z = west
      state.w = 0
      last = null
      tease = null
      return changing
    }
    const aiming = x !== null && shown > 0.5
    if (aiming) {
      // Every slice between where the beam was and where it is now, so a fast sweep misses none.
      const from = last ?? x
      const lo = binOf(Math.min(from, x) - BEAM)
      const hi = binOf(Math.max(from, x) + BEAM)
      for (let i = Math.max(0, Math.ceil(lo)); i <= Math.min(SCAN_BINS - 1, Math.floor(hi)); i++)
        passed[i] = 1
      last = x
    } else last = null
    for (let i = 0; i < SCAN_BINS; i++) {
      const target = passed[i]!
      const value = swept[i]!
      if (value === target) continue
      swept[i] = target > value ? Math.min(target, value + dt / CLOSE) : target
      changing = true
    }

    // The teaser: once per visit, a moment after the visitor has come to rest at the beat, the
    // beam slides a little way in and back, and the strip it passed starts to close and falls
    // back to points. It shows there is a beam and what it does; the rebuilding is left to the
    // visitor. The visitor's own hand on the building ends it at once.
    if (aiming) {
      teasedThisVisit = true
      tease = null
    } else if (!teasedThisVisit && rest.motion && tease === null && rest.settled && shown >= 1)
      tease = -TEASE_WAIT
    let teaseAt: number | null = null
    let teaseLit = PARK
    if (tease !== null) {
      if (tease < 0 && !(rest.settled && shown >= 1)) tease = -TEASE_WAIT
      else tease += dt
      if (tease >= 0) teasedThisVisit = true
      const going = tease - TEASE_LIGHT
      const back = going - TEASE_GO
      if (tease < 0) teaseAt = null
      else if (back < 0) {
        teaseAt = west + TEASE_REACH * span * ease(Math.max(0, going) / TEASE_GO)
        teaseLit = 1
        const reached = binOf(teaseAt + BEAM)
        for (let i = 0; i < SCAN_BINS && i <= reached; i++)
          teased[i] = Math.min(TEASE_PEAK, teased[i]! + dt / CLOSE)
      } else if (back < TEASE_BACK) {
        teaseAt = west + TEASE_REACH * span * (1 - ease(back / TEASE_BACK))
        for (let i = 0; i < SCAN_BINS; i++)
          teased[i] = Math.max(0, teased[i]! - dt / (TEASE_BACK * 0.6))
      } else {
        teaseAt = west
        teased.fill(0)
        tease = null
      }
      changing = true
    } else if (teased.some((v) => v > 0)) {
      teased.fill(0)
      changing = true
    }
    for (let i = 0; i < SCAN_BINS; i++) bins[i] = Math.max(swept[i]!, teased[i]!)

    // Lit while the visitor or the teaser holds it, and otherwise left standing dim where it was
    // put down, so the visitor can see there is something there to take up.
    const lit = aiming ? 1 : teaseLit
    const light = 1 - Math.exp(-dt / BEAM_LIGHT)
    state.w += (lit - state.w) * light
    if (Math.abs(lit - state.w) < 0.005) state.w = lit
    else changing = true
    const to = aiming ? x : teaseAt
    if (to !== null) {
      const near = state.w < 0.01 || !aiming ? 1 : 1 - Math.exp(-dt / BEAM_CHASE)
      const before = state.z
      state.z += (to - state.z) * near
      if (Math.abs(to - state.z) < 0.0005) state.z = to
      if (state.z !== before) changing = true
    }
    return changing
  }

  const dispose = () => {
    source.dispose()
    object.traverse((child) => {
      if (child instanceof Mesh || child instanceof LineSegments) {
        child.geometry.dispose()
        ;(child.material as ShaderMaterial).dispose()
      }
    })
  }
  return { object, uniforms, aim, step, dispose }
}
