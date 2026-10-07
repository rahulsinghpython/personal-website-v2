import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
  Vector3,
  Vector4,
} from 'three'
import { shareOf, spinOf, type MachineDef, type MachineValues } from './part'
import { DEPTH_GLSL } from './points'
import { outlineOf } from './shapes'

// The Machine's drawing: the centre line of every rod and ring and the rim of every plate and
// can, as true one-pixel lines. An awake part has "lines drawn" (docs/EXPERIENCE.md): the points
// are the scan, soft at any count, and these are what the scan resolves into. One geometry, one
// draw call, a few thousand segments.

type Path = { points: Vector3[]; closed: boolean }

/** The lines a piece is drawn with, read back from its vertices so they follow every move. */
function paths(piece: BufferGeometry): Path[] {
  const position = piece.getAttribute('position')
  const parameters = (piece as unknown as { parameters: Record<string, unknown> }).parameters
  const count = (key: string) => parameters[key] as number
  const vertex = (index: number) => new Vector3().fromBufferAttribute(position, index)
  /** The middle of `size` vertices, `step` apart. */
  const middle = (first: number, size: number, step = 1) => {
    const sum = new Vector3()
    for (let i = 0; i < size; i++) sum.add(vertex(first + i * step))
    return sum.divideScalar(size)
  }
  const loop = (size: number, at: (i: number) => Vector3): Path => ({
    points: Array.from({ length: size }, (_, i) => at(i)),
    closed: true,
  })

  switch (outlineOf(piece)) {
    // A cylinder's side is two rows of vertices, the top row first, each closing on itself.
    case 'rod': {
      const around = count('radialSegments')
      return [{ points: [middle(0, around), middle(around + 1, around)], closed: false }]
    }
    case 'drum': {
      const around = count('radialSegments')
      return [0, around + 1].map((row) => loop(around, (i) => vertex(row + i)))
    }
    // A torus is rows round the tube, each running the whole way round the ring.
    case 'ring': {
      const tube = count('radialSegments')
      const row = count('tubularSegments') + 1
      return [loop(row - 1, (i) => middle(i, tube, row))]
    }
    // A lathe is its profile repeated round the axis. The band's top face is points 2 and 3.
    case 'band': {
      const profile = (parameters.points as unknown[]).length
      return [2, 3].map((corner) => loop(count('segments'), (i) => vertex(i * profile + corner)))
    }
    default:
      return []
  }
}

/** The same "random" number for the same line every time. */
const scatter = (index: number) => {
  const value = Math.sin(index * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

/** Every line of the Machine as segments, each vertex carrying what the story needs. */
export function sampleLines(machine: MachineDef, values: MachineValues): BufferGeometry {
  const positions: number[] = []
  const parts: number[] = []
  const spins: number[] = []
  const alongs: number[] = []
  const seeds: number[] = []
  const gains: number[] = []
  let line = 0

  machine.parts.forEach((part, index) => {
    for (const piece of part.build(values)) {
      const spin = spinOf(piece)
      // A piece that was given fewer points is drawn fainter as a line too.
      const gain = Math.min(1, shareOf(piece))
      for (const { points, closed } of paths(piece)) {
        const seed = scatter(line++)
        const steps = closed ? points.length : points.length - 1
        for (let i = 0; i < steps; i++) {
          for (const end of [i, i + 1]) {
            positions.push(...points[end % points.length]!.toArray())
            parts.push(index)
            spins.push(...spin)
            alongs.push(end / steps)
            seeds.push(seed)
            gains.push(gain)
          }
        }
      }
      piece.dispose()
    }
  })

  const lines = new BufferGeometry()
  const set = (name: string, values: number[], size: number) =>
    lines.setAttribute(name, new BufferAttribute(new Float32Array(values), size))
  set('position', positions, 3)
  set('aPart', parts, 1)
  set('aSpin', spins, 2)
  set('aAlong', alongs, 1)
  set('aSeed', seeds, 1)
  set('aGain', gains, 1)
  return lines
}

/**
 * Draws the lines of a part once it is awake. Each line is drawn in from one end, late in the
 * part's waking and in its own time, so the drawing arrives after the scan has closed up. It
 * takes the same story uniforms as the points material (see ../timeline.ts) and turns with the
 * Rings the same way.
 */
export function linesMaterial() {
  return new ShaderMaterial({
    uniforms: {
      // Unused here, but the story sets all of them on every material it is given.
      uGather: { value: new Vector4(1, 1, 1, 1) },
      uLock: { value: new Vector4(1, 1, 1, 1) },
      uWake: { value: new Vector4(0, 0, 0, 0) },
      uTurn: { value: 0 },
      uDrift: { value: 0 },
      uDepth: { value: 0.6 },
      uLine: { value: 0.55 },
      uAccent: { value: new Color('#ffa726') },
    },
    vertexShader: /* glsl */ `
      uniform vec4 uWake;
      uniform float uTurn;
      uniform float uDrift;
      uniform float uLine;
      attribute float aPart;
      attribute vec2 aSpin;
      attribute float aAlong;
      attribute float aSeed;
      attribute float aGain;
      varying float vAlong;
      varying float vDrawn;
      varying float vBrightness;
      ${DEPTH_GLSL}

      void main() {
        int part = int(aPart + 0.5);
        float angle = uTurn * aSpin.x + uDrift * aSpin.y;
        float c = cos(angle);
        float s = sin(angle);
        vec3 home = vec3(position.x * c + position.z * s, position.y, position.z * c - position.x * s);
        vec4 viewPosition = modelViewMatrix * vec4(home, 1.0);
        gl_Position = projectionMatrix * viewPosition;

        // The last third of waking draws the lines, each starting at its own moment.
        float drawing = smoothstep(0.65, 1.0, uWake[part]);
        vDrawn = clamp(drawing * 1.6 - aSeed * 0.6, 0.0, 1.0);
        vAlong = aAlong;
        vBrightness = uLine * aGain * depthFade(viewPosition);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uAccent;
      varying float vAlong;
      varying float vDrawn;
      varying float vBrightness;

      void main() {
        if (vAlong > vDrawn) discard;
        gl_FragColor = vec4(uAccent * vBrightness, 1.0);
      }
    `,
    blending: AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true,
  })
}
