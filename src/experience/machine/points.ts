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
import { buildPart, type MachineDef, type MachineValues, type PartId } from './part'

// The Machine as a point cloud: points scattered over the surface of each part, and the material
// that draws them. One geometry, one draw call, however many points there are.

/** How much of the point budget a part gets, relative to its surface area. */
export type PartWeights = Record<PartId, number>

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

/** Surface area of a geometry whose triangles are not indexed, as `buildPart` returns them. */
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
 * Scatters `count` points over the Machine. A part's share is its surface area times its
 * weight: by area alone the plates would take nearly every point and the thin parts, the rings
 * and the beams, would vanish.
 */
export function samplePoints(
  machine: MachineDef,
  values: MachineValues,
  count: number,
  weights: PartWeights,
): BufferGeometry {
  const parts = machine.parts.map((part) => ({ id: part.id, geometry: buildPart(part, values) }))
  const shares = parts.map((part) => surfaceArea(part.geometry) * weights[part.id])
  const whole = shares.reduce((sum, share) => sum + share, 0) || 1

  const positions = new Float32Array(count * 3)
  const partIndex = new Float32Array(count)
  const jitter = new Float32Array(count)
  const random = seeded(1)
  const point = new Vector3()

  let written = 0
  parts.forEach((part, index) => {
    const last = index === parts.length - 1
    const quota = last ? count - written : Math.round((count * shares[index]!) / whole)
    const sampler = new MeshSurfaceSampler(new Mesh(part.geometry))
    // The library has setRandomGenerator(), but its types do not declare it yet.
    ;(sampler as unknown as { randomFunction: () => number }).randomFunction = random
    sampler.build()
    for (let i = 0; i < quota && written < count; i++, written++) {
      sampler.sample(point)
      point.toArray(positions, written * 3)
      partIndex[written] = index
      jitter[written] = random()
    }
    part.geometry.dispose()
  })

  const cloud = new BufferGeometry()
  cloud.setAttribute('position', new BufferAttribute(positions, 3))
  cloud.setAttribute('aPart', new BufferAttribute(partIndex, 1))
  cloud.setAttribute('aJitter', new BufferAttribute(jitter, 1))
  return cloud
}

/**
 * Soft round points, added on top of each other so dense areas glow without a bloom pass.
 * `uSize` is a point's width in CSS pixels at ten units from the camera.
 */
export function pointsMaterial() {
  return new ShaderMaterial({
    uniforms: {
      uSize: { value: 2 },
      uBrightness: { value: 0.6 },
      uPixelRatio: { value: 1 },
      // Cold off-white: the dormant colour. The warm accent comes with round 5.
      uColour: { value: new Color('#e5e5e5') },
    },
    vertexShader: /* glsl */ `
      uniform float uSize;
      uniform float uBrightness;
      uniform float uPixelRatio;
      attribute float aJitter;
      varying float vBrightness;

      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        gl_PointSize = uSize * uPixelRatio * (0.6 + 0.8 * aJitter) * 10.0 / -viewPosition.z;
        vBrightness = uBrightness * (0.55 + 0.45 * aJitter);
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
