import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  ShaderMaterial,
  Vector3,
  Vector4,
} from 'three'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import { shareOf, spinOf, type MachineDef, type MachineValues, type PartId } from './part'

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
   * How much bigger and brighter each point gets as the count drops, so a low tier still reads,
   * and how much finer as it rises. 0 is no change; at 0.5 a quarter of the points are each
   * twice as big and twice as bright.
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

/**
 * The count the look was chosen at. A point's size and brightness in `POINT_LOOK` are right for
 * this many points; more are each drawn finer and fewer each bolder, so the whole stays as bright.
 */
const CHOSEN_AT = 150_000

/** What `boost` multiplies a point's size and brightness by when `count` points are drawn. */
export const lift = (count: number, boost: number) => (CHOSEN_AT / Math.max(1, count)) ** boost

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

/** How far the dust reaches from the middle of the Machine, in the Machine's units. */
const DUST_RADIUS = 9
/** The middle of the dust, about halfway up the Machine. */
const DUST_HEIGHT = 0.4

/**
 * Scatters `count` points over the Machine. A piece's share is its surface area times its part's
 * weight, and its own if it was given one. By area alone the plates would take nearly every point and the thin pieces, the lines
 * and the beams, would vanish, so `thin` packs points more closely the thinner a piece is: at 0
 * every surface is equally dense, at 1 a rod of half the radius is twice as dense.
 *
 * Each point also gets what the story needs: where it is while it is dust, how late in its part
 * it wakes (top first), and how its piece turns about the Machine's axis.
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
      const share = area * girth(geometry, area) ** -thin * weights[part.id] * shareOf(piece)
      return { index, geometry, share, spin: spinOf(piece) }
    }),
  )
  const whole = pieces.reduce((sum, piece) => sum + piece.share, 0) || 1

  const positions = new Float32Array(count * 3)
  const partIndex = new Float32Array(count)
  const jitter = new Float32Array(count)
  const dust = new Float32Array(count * 3)
  const order = new Float32Array(count)
  const spin = new Float32Array(count * 2)
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
        spin.set(piece.spin, written * 2)
      }
    }
    piece.geometry.dispose()
  }

  // Dust: evenly through a ball around the Machine. It has its own run of random numbers, so
  // changing the dust leaves every point where it was on the Machine.
  const scatter = seeded(2)
  for (let i = 0; i < count; i++) {
    const height = scatter() * 2 - 1
    const angle = scatter() * Math.PI * 2
    const radius = DUST_RADIUS * Math.cbrt(scatter())
    const flat = Math.sqrt(1 - height * height) * radius
    dust[i * 3] = Math.cos(angle) * flat
    dust[i * 3 + 1] = height * radius + DUST_HEIGHT
    dust[i * 3 + 2] = Math.sin(angle) * flat
  }

  // Waking runs down each part: 0 at its highest point, 1 at its lowest.
  const top = machine.parts.map(() => -Infinity)
  const bottom = machine.parts.map(() => Infinity)
  for (let i = 0; i < count; i++) {
    const part = partIndex[i]!
    const y = positions[i * 3 + 1]!
    top[part] = Math.max(top[part]!, y)
    bottom[part] = Math.min(bottom[part]!, y)
  }
  for (let i = 0; i < count; i++) {
    const part = partIndex[i]!
    order[i] = (top[part]! - positions[i * 3 + 1]!) / Math.max(top[part]! - bottom[part]!, 1e-6)
  }

  const cloud = new BufferGeometry()
  cloud.setAttribute('position', new BufferAttribute(positions, 3))
  cloud.setAttribute('aPart', new BufferAttribute(partIndex, 1))
  cloud.setAttribute('aJitter', new BufferAttribute(jitter, 1))
  cloud.setAttribute('aDust', new BufferAttribute(dust, 3))
  cloud.setAttribute('aOrder', new BufferAttribute(order, 1))
  cloud.setAttribute('aSpin', new BufferAttribute(spin, 2))
  return cloud
}

/**
 * Depth, for both materials: a point or a line is dimmer the farther behind the Machine's middle
 * it is, and a little brighter in front of it. Everything is added on top of everything else, so
 * without this the far side is as bright as the near side and the Machine reads as flat.
 * `uDepth` is how much is taken off at the back; 0 turns it off.
 */
export const DEPTH_GLSL = /* glsl */ `
  uniform float uDepth;

  float depthFade(vec4 viewPosition) {
    // The Machine's middle is a little below the origin, and it reaches about 2.2 either way.
    float middle = (modelViewMatrix * vec4(0.0, -0.3, 0.0, 1.0)).z;
    float behind = clamp((middle - viewPosition.z) / 2.2, -1.0, 1.0);
    return mix(1.0 + 0.4 * uDepth, 1.0 - uDepth, behind * 0.5 + 0.5);
  }
`

/**
 * Soft round points, added on top of each other so dense areas glow without a bloom pass.
 *
 * `uSize` is a point's width in the Machine's own units, the units its rods and rings are
 * measured in. A point is part of the object, so it is drawn smaller when the Machine is: the
 * picture on a phone is the picture on a monitor, scaled. `uHeight` is the height of the drawing
 * buffer in pixels, which is what turns units into pixels.
 *
 * The rest tell the story (see ../timeline.ts). Three of them hold one number per part, in the order
 * the parts assemble: `uGather` pulls a part's dust in to a loose silhouette, `uLock` closes what
 * is left, and `uWake` turns the part from cold to the accent. As made here the Machine is whole
 * and dormant, which is the look chosen in round 4.
 */
export function pointsMaterial() {
  return new ShaderMaterial({
    uniforms: {
      uSize: { value: 0.012 },
      uBrightness: { value: 0.5 },
      uHeight: { value: 1 },
      uGather: { value: new Vector4(1, 1, 1, 1) },
      uLock: { value: new Vector4(1, 1, 1, 1) },
      uWake: { value: new Vector4(0, 0, 0, 0) },
      // How much of the way back to dust a gathered point still is, until its part locks.
      uLoose: { value: 0.018 },
      // How far the Rings still have to turn before they lock, in radians.
      uTurn: { value: 0 },
      // How far a bead moving at a speed of 1 has drifted round its ring, in radians.
      uDrift: { value: 0 },
      uDepth: { value: 0.6 },
      // How bright dust is, and how bright an awake point is, against a dormant one.
      uDustGain: { value: 1 },
      uAwakeGain: { value: 1.25 },
      // Cold off-white is dormant. The accent is the working choice until round 5 settles it.
      uColour: { value: new Color('#e5e5e5') },
      uAccent: { value: new Color('#ffa726') },
    },
    vertexShader: /* glsl */ `
      uniform float uSize;
      uniform float uBrightness;
      uniform float uHeight;
      uniform vec4 uGather;
      uniform vec4 uLock;
      uniform vec4 uWake;
      uniform float uLoose;
      uniform float uTurn;
      uniform float uDrift;
      uniform float uDustGain;
      uniform float uAwakeGain;
      attribute float aPart;
      attribute float aJitter;
      attribute vec3 aDust;
      attribute float aOrder;
      attribute vec2 aSpin;
      varying float vBrightness;
      varying float vWake;
      ${DEPTH_GLSL}

      // Points do not move in step. Each takes "span" of the whole change, and starts earlier
      // or later in it by its own "offset".
      float staggered(float whole, float offset, float span) {
        return smoothstep(0.0, 1.0, (whole - offset * (1.0 - span)) / span);
      }

      void main() {
        int part = int(aPart + 0.5);
        // A second random number, so the big points are not also the late ones.
        float late = fract(aJitter * 7.13);
        float gather = staggered(uGather[part], late, 0.6);
        float lock = staggered(uLock[part], late, 0.6);
        float away = mix(1.0, uLoose, gather) * (1.0 - lock);
        // A point turns to the accent the way it arrived: in its own time, not in a sweep down
        // the part. With the timeline waking a part as it locks, each point lights as it lands.
        vWake = staggered(uWake[part], late, 0.6);

        float angle = uTurn * aSpin.x + uDrift * aSpin.y;
        float c = cos(angle);
        float s = sin(angle);
        vec3 home = vec3(position.x * c + position.z * s, position.y, position.z * c - position.x * s);

        vec4 viewPosition = modelViewMatrix * vec4(mix(home, aDust, away), 1.0);
        gl_Position = projectionMatrix * viewPosition;
        float pixelsPerUnit = 0.5 * uHeight * projectionMatrix[1][1] / -viewPosition.z;
        float size = uSize * (0.6 + 0.8 * aJitter) * pixelsPerUnit;
        // Nothing is drawn narrower than a pixel. A point that should be is drawn one pixel wide
        // and dimmer by the area it gained, so a small screen is not brighter than a large one.
        gl_PointSize = max(size, 1.0);
        vBrightness = uBrightness * (0.55 + 0.45 * aJitter) * min(1.0, size * size);
        vBrightness *= mix(1.0, uDustGain, away) * mix(1.0, uAwakeGain, vWake);
        vBrightness *= depthFade(viewPosition);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColour;
      uniform vec3 uAccent;
      varying float vBrightness;
      varying float vWake;

      void main() {
        float falloff = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
        gl_FragColor = vec4(mix(uColour, uAccent, vWake) * vBrightness * falloff, 1.0);
      }
    `,
    blending: AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true,
  })
}
