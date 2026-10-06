import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  ShaderMaterial,
  Vector3,
} from 'three'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import { TIERS } from '../../state/tiers'
import type { MachineDef, MachineValues, PartId } from './part'

// The Machine as a point cloud: points scattered over the surface of each part, and the material
// that draws them. One geometry, one draw call, however many points there are.

/** How much of the point budget a part gets, relative to its surface area. */
export type PartWeights = Record<PartId, number>

/** How the cloud is drawn: the numbers round 4 of docs/DESIGN-PROCESS.md settles. */
export type PointLook = {
  /** Share of the tier's point budget in use, from 0 to 1. */
  density: number
  /** A point's width in the Machine's own units. For scale, the thinnest rod is 0.016 across. */
  size: number
  brightness: number
  /**
   * How much bigger and brighter each point gets as the count drops, so a low tier still reads.
   * 0 is no help; at 0.5 a quarter of the points are each twice as big and twice as bright.
   */
  boost: number
  /**
   * How much more closely points are packed on thin pieces than on broad ones. 0 is the same
   * everywhere; at 1 a rod of half the radius is twice as dense.
   */
  thin: number
  weights: PartWeights
}

/**
 * The look Rahul chose in round 4 (docs/DECISIONS.md, D28): between an even scan and a drawing
 * led by its lines. Three quarters of each tier's points, with the thin pieces favoured.
 */
export const POINT_LOOK: PointLook = {
  density: 0.75,
  size: 0.013,
  brightness: 0.42,
  boost: 0.35,
  thin: 0.6,
  weights: { core: 1, scanner: 1, rings: 2, lens: 0.75 },
}

/** What `boost` multiplies a point's size and brightness by when `count` points are drawn. */
export const lift = (count: number, boost: number) =>
  (TIERS.high.points / Math.max(1, count)) ** boost

/** The same "random" numbers every time, so the same Machine always gives the same cloud. */
function seeded(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Surface area of a geometry whose triangles are not indexed. */
function surfaceArea(geometry: BufferGeometry) {
  const position = geometry.getAttribute('position')
  const a = new Vector3()
  const b = new Vector3()
  const c = new Vector3()
  let total = 0
  for (let i = 0; i < position.count; i += 3) {
    a.fromBufferAttribute(position, i)
    b.fromBufferAttribute(position, i + 1).sub(a)
    c.fromBufferAttribute(position, i + 2).sub(a)
    total += b.cross(c).length() / 2
  }
  return total
}

/**
 * How thick a piece is: its surface area over its longest side. For a rod or a ring that comes
 * out in proportion to its radius whatever its length, so two rods of one radius count as equally
 * thin; for a plate it is about the plate's width.
 */
function girth(geometry: BufferGeometry, area: number) {
  geometry.computeBoundingBox()
  const size = geometry.boundingBox!.getSize(new Vector3())
  return area / Math.max(size.x, size.y, size.z, 1e-6)
}

/**
 * Scatters `count` points over the Machine. A piece's share is its surface area times its part's
 * weight. By area alone the plates would take nearly every point and the thin pieces, the lines
 * and the beams, would vanish, so `thin` packs points more closely the thinner a piece is: at 0
 * every surface is equally dense, at 1 a rod of half the radius is twice as dense.
 */
export function samplePoints(
  machine: MachineDef,
  values: MachineValues,
  count: number,
  weights: PartWeights,
  thin: number,
): BufferGeometry {
  const pieces = machine.parts.flatMap((part, index) =>
    part.build(values).map((piece) => {
      const geometry = piece.index ? piece.toNonIndexed() : piece
      if (geometry !== piece) piece.dispose()
      const area = surfaceArea(geometry)
      const share = area * girth(geometry, area) ** -thin * weights[part.id]
      return { index, geometry, share }
    }),
  )
  const whole = pieces.reduce((sum, piece) => sum + piece.share, 0) || 1

  const positions = new Float32Array(count * 3)
  const partIndex = new Float32Array(count)
  const jitter = new Float32Array(count)
  const random = seeded(1)
  const point = new Vector3()

  let written = 0
  let passed = 0
  for (const piece of pieces) {
    // Rounding the running total, not each share, so the quotas add up to exactly `count`.
    passed += piece.share
    const until = Math.round((count * passed) / whole)
    if (until > written) {
      const sampler = new MeshSurfaceSampler(new Mesh(piece.geometry))
      // The library has setRandomGenerator(), but its types do not declare it yet.
      ;(sampler as unknown as { randomFunction: () => number }).randomFunction = random
      sampler.build()
      for (; written < until; written++) {
        sampler.sample(point)
        point.toArray(positions, written * 3)
        partIndex[written] = piece.index
        jitter[written] = random()
      }
    }
    piece.geometry.dispose()
  }

  const cloud = new BufferGeometry()
  cloud.setAttribute('position', new BufferAttribute(positions, 3))
  cloud.setAttribute('aPart', new BufferAttribute(partIndex, 1))
  cloud.setAttribute('aJitter', new BufferAttribute(jitter, 1))
  return cloud
}

/**
 * Soft round points, added on top of each other so dense areas glow without a bloom pass.
 *
 * `uSize` is a point's width in the Machine's own units, the units its rods and rings are
 * measured in. A point is part of the object, so it is drawn smaller when the Machine is: the
 * picture on a phone is the picture on a monitor, scaled. `uHeight` is the height of the drawing
 * buffer in pixels, which is what turns units into pixels.
 */
export function pointsMaterial() {
  return new ShaderMaterial({
    uniforms: {
      uSize: { value: 0.012 },
      uBrightness: { value: 0.5 },
      uHeight: { value: 1 },
      // Cold off-white: the dormant colour. The warm accent comes with round 5.
      uColour: { value: new Color('#e5e5e5') },
    },
    vertexShader: /* glsl */ `
      uniform float uSize;
      uniform float uBrightness;
      uniform float uHeight;
      attribute float aJitter;
      varying float vBrightness;

      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        float pixelsPerUnit = 0.5 * uHeight * projectionMatrix[1][1] / -viewPosition.z;
        float size = uSize * (0.6 + 0.8 * aJitter) * pixelsPerUnit;
        // Nothing is drawn narrower than a pixel. A point that should be is drawn one pixel wide
        // and dimmer by the area it gained, so a small screen is not brighter than a large one.
        gl_PointSize = max(size, 1.0);
        vBrightness = uBrightness * (0.55 + 0.45 * aJitter) * min(1.0, size * size);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColour;
      varying float vBrightness;

      void main() {
        float falloff = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
        gl_FragColor = vec4(uColour * vBrightness * falloff, 1.0);
      }
    `,
    blending: AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true,
  })
}
