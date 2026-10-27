import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  type Camera,
} from 'three'
import { planCity, VIADUCT, type Block } from './city'
import { JET, SUPERTREES } from './landmarks'
import type { CityValues, Layout } from './layouts'
import type { Vec2 } from './plan'
import { PLANE_HEADING, planeAt, planeShown } from './plane'
import { lineLength, TRAIN } from './points'
import { CITY_POSES } from './story'

// The easter eggs (docs/EXPERIENCE.md, "Easter eggs"): small things a visitor finds by pointing at
// the city. Each is found, never forced, and none moves the story on. The three from the sketch
// (docs/DECISIONS.md, D53): the Merlion spouting, the train on its viaduct, and the block numbered
// BLK 2024, the year Rahul joined Uniad. Then the four Rahul picked after (D54): otters in the
// river, a cat on the void deck, the Supertrees' light show, and the plane leaving Changi, which
// is no egg but the Core beat's last pin, and is drawn here with them.
//
// Each waits until the mouse comes onto it (on touch, a tap), plays for a few seconds, and stops,
// so frames are asked for only while one plays.

export type EggId = 'merlion' | 'cat' | 'blk' | 'supertrees' | 'train' | 'otters'

/** What the pointer is on: an egg, and for the train and the otters, how far along their line. */
export type Hit = { id: EggId; along: number }

/** How close the pointer must come to a thing, in CSS pixels, to be on it. */
const NEAR = 24

/** The spout: droplets on the arc, points in the rings where it lands, and its timing in seconds. */
const SPOUT = { droplets: 260, splash: 150, rise: 0.25, hold: 3.2, fall: 1.3 }

/**
 * The train called in: how far before the place pointed at it appears, and how quickly it closes
 * that distance, slowing as it arrives. The blink is the doors closing, when it is already here.
 */
const ARRIVE = { from: 0.9, ease: 0.6, appear: 0.35, glow: 1.6 }
const BLINK = { pulse: 0.45, pulses: 2, glow: 2.2 }

/** The band of light that runs up BLK 2024, and how long it takes. */
const BAND = { seconds: 1.5, glow: 2.6 }

/** The number painted at the top of BLK 2024's end wall, as HDB blocks carry theirs. */
const NUMBER = { lines: ['BLK', '2024'], across: 0.85, below: 0.025, step: 2 }

/**
 * The cat, sitting on the void deck at the foot of BLK 2024, under its number: how tall it sits,
 * where along the wall and how far out from it, and how long it looks up once the pointer passes.
 */
const CAT = { height: 0.12, along: 0.04, out: 0.07, look: 2.4, ease: 0.25 }

/**
 * The otters: a family of five, two grown and three young, surfacing where the river is pointed
 * at and swimming downstream in a line. How long a grown one is, how far apart and how fast, and
 * for how long in seconds. Far bigger than otters are, so they can be seen from the story's camera.
 */
const OTTERS = {
  family: 5,
  points: 40,
  wake: 40,
  length: 0.05,
  apart: 0.085,
  speed: 0.12,
  up: 0.5,
  swim: 4,
  down: 0.7,
}

/** The light show, in seconds: coming up, playing, and going out. */
const SHOW = { rise: 0.4, play: 5, fall: 0.8 }

/** The plane: points in its body and its contrail, and how much bigger than drawn below it is. */
const PLANE = { body: 110, trail: 120, scale: 1.35 }

/** The train's length: three cars and the two gaps between them. */
const TRAIN_LENGTH = 3 * TRAIN.car + 2 * TRAIN.gap

const KIND = {
  number: 0,
  droplet: 1,
  splash: 2,
  cat: 3,
  otter: 4,
  wake: 5,
  plane: 6,
  trail: 7,
  light: 8,
} as const

/** A part of the cat, which says how it moves when it looks up. */
const CAT_PART = { body: 0, head: 1, eye: 2 } as const

const wrap = (x: number, loop: number) => ((x % loop) + loop) % loop

/**
 * The wall of `block` the Rings beat's camera faces most squarely: its middle on the ground, the
 * way along it, left to right as the camera sees it, the way out of it, and how wide it is.
 */
function facingWall(block: Block) {
  const azimuth = (CITY_POSES.rings.azimuth * Math.PI) / 180
  const view: Vec2 = [Math.sin(azimuth), Math.cos(azimuth)]
  const walls = [
    { normal: [0, 1], width: block.w },
    { normal: [0, -1], width: block.w },
    { normal: [1, 0], width: block.d },
    { normal: [-1, 0], width: block.d },
  ] as const
  const wall = walls.reduce((a, b) =>
    b.normal[0] * view[0] + b.normal[1] * view[1] > a.normal[0] * view[0] + a.normal[1] * view[1]
      ? b
      : a,
  )
  const [nx, nz] = wall.normal
  return {
    middle: [block.x + (nx * block.w) / 2, block.z + (nz * block.d) / 2] as Vec2,
    along: [nz, -nx] as Vec2,
    out: [nx, nz] as Vec2,
    width: wall.width,
  }
}

/**
 * Draws on a small canvas and reads back where the ink is, one place every `step` pixels, as
 * [x, y] in pixels from the top left, with the colour of the ink there, red, green or blue.
 */
function ink(
  width: number,
  height: number,
  step: number,
  draw: (pen: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const pen = canvas.getContext('2d')
  if (!pen) return []
  draw(pen)
  const { data } = pen.getImageData(0, 0, width, height)
  const found: [x: number, y: number, colour: 'r' | 'g' | 'b'][] = []
  for (let y = 0; y < height; y += step)
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4
      if (data[i + 3]! < 128) continue
      const [r, g, b] = [data[i]!, data[i + 1]!, data[i + 2]!]
      found.push([x, y, r >= g && r >= b ? 'r' : g >= b ? 'g' : 'b'])
    }
  return found
}

/**
 * The points of the painted number, on the end wall of `block` that the Rings beat's camera
 * faces, just under the roof. The letters are drawn on a canvas and read back.
 */
function numberPoints(block: Block): number[] {
  const wall = facingWall(block)
  const [width, height] = [160, 112]
  const letters = ink(width, height, NUMBER.step, (pen) => {
    pen.fillStyle = '#f00'
    pen.textAlign = 'center'
    pen.textBaseline = 'top'
    pen.font = 'bold 40px Arial, sans-serif'
    pen.fillText(NUMBER.lines[0]!, 80, 2)
    pen.font = 'bold 62px Arial, sans-serif'
    pen.fillText(NUMBER.lines[1]!, 80, 46)
  })
  const unit = (wall.width * NUMBER.across) / width
  const top = block.h - NUMBER.below
  const [x0, z0] = [wall.middle[0] + wall.out[0] * 0.004, wall.middle[1] + wall.out[1] * 0.004]
  return letters.flatMap(([x, y]) => {
    const across = (x - width / 2) * unit
    return [x0 + wall.along[0] * across, top - y * unit, z0 + wall.along[1] * across]
  })
}

/**
 * The cat, as seen from in front, sitting: its body, its head with the ears up, its tail round its
 * feet, and two eyes. Drawn on a canvas in three colours, one a part, and read back as [across, up,
 * part] in the city's units, from the middle of where it sits.
 */
function catPoints(): number[] {
  const [width, height] = [48, 60]
  const drawn = ink(width, height, 3, (pen) => {
    // The body, narrow at the shoulders and wide where it sits, and the tail curled up beside it.
    pen.fillStyle = '#f00'
    pen.beginPath()
    pen.moveTo(18, 24)
    pen.bezierCurveTo(10, 36, 5, 50, 9, 59)
    pen.lineTo(39, 59)
    pen.bezierCurveTo(43, 50, 38, 36, 30, 24)
    pen.closePath()
    pen.fill()
    pen.strokeStyle = '#f00'
    pen.lineWidth = 3.5
    pen.beginPath()
    pen.moveTo(38, 57)
    pen.bezierCurveTo(47, 56, 48, 46, 44, 38)
    pen.stroke()
    // The head and its ears.
    pen.fillStyle = '#0f0'
    pen.beginPath()
    pen.ellipse(24, 19, 11, 9.5, 0, 0, Math.PI * 2)
    pen.fill()
    pen.beginPath()
    pen.moveTo(13, 16)
    pen.lineTo(14, 1)
    pen.lineTo(22, 11)
    pen.moveTo(35, 16)
    pen.lineTo(34, 1)
    pen.lineTo(26, 11)
    pen.fill()
    // Gaps where the eyes are, so they show on their own when they catch the light.
    pen.globalCompositeOperation = 'destination-out'
    for (const x of [19, 29]) {
      pen.beginPath()
      pen.arc(x, 19, 3, 0, Math.PI * 2)
      pen.fill()
    }
  })
  const unit = CAT.height / height
  const points = drawn.flatMap(([x, y, colour]) => [
    (x - width / 2) * unit,
    (height - y) * unit,
    colour === 'r' ? CAT_PART.body : CAT_PART.head,
  ])
  // The eyes: a point each, which catch the light when it looks up.
  for (const x of [19, 29]) points.push((x - width / 2) * unit, (height - 19) * unit, CAT_PART.eye)
  return points
}

/**
 * The plane, nose forward: [forward, across, up] in the city's units. A body, swept wings and a
 * tailplane with its fin.
 */
function planePoints(random: () => number): number[] {
  const points: number[] = []
  for (let k = 0; k < PLANE.body; k++) {
    const r = random()
    if (r < 0.4) points.push(-0.04 + random() * 0.085, 0, 0)
    else if (r < 0.8) {
      const across = (random() - 0.5) * 0.075
      points.push(0.004 - Math.abs(across) * 0.45, across, 0)
    } else if (r < 0.92) {
      const across = (random() - 0.5) * 0.026
      points.push(-0.036 - Math.abs(across) * 0.3, across, 0)
    } else points.push(-0.038 - random() * 0.004, 0, random() * 0.013)
  }
  return points
}

/** The material all of them are drawn with: one draw call. */
function eggMaterial(layout: Layout, size: number) {
  const { at, turn } = layout.landmarks.merlion
  const [u0, u1, u2] = JET.up
  const [f0, f1] = JET.forward
  return new ShaderMaterial({
    uniforms: {
      uHeight: { value: 1 },
      uSize: { value: 0.0075 },
      uMaxSize: { value: 6 },
      // Where the Merlion stands, and its forward direction at its size.
      uJet: { value: new Vector4(at[0], at[1], Math.sin(turn) * size, Math.cos(turn) * size) },
      uScale: { value: size },
      // How strongly it spouts, from 0 to 1, and the spout's own clock in seconds.
      uSpout: { value: new Vector2() },
      // The number and the cat: how far they are shown, and the number's flash when found.
      uNumber: { value: new Vector3() },
      // The cat: where it sits and how far it is looking up; the way along its wall, and out.
      uCat: { value: new Vector4() },
      uCatAxes: { value: new Vector4() },
      // The otters: where they surfaced, the way downstream, seconds since, and how far shown.
      uOtters: { value: new Vector4() },
      uOttersShown: { value: 0 },
      // The plane: where it is and how far shown, the way it flies, and a clock for its lights.
      uPlane: { value: new Vector4() },
      uPlaneHeading: { value: new Vector3(...PLANE_HEADING) },
      uClock: { value: 0 },
      uColour: { value: new Color('#e8e5df') },
      uAccent: { value: new Color('#ffa726') },
    },
    vertexShader: /* glsl */ `
      uniform float uHeight;
      uniform float uSize;
      uniform float uMaxSize;
      uniform vec4 uJet;
      uniform float uScale;
      uniform vec2 uSpout;
      uniform vec3 uNumber;
      uniform vec4 uCat;
      uniform vec4 uCatAxes;
      uniform vec4 uOtters;
      uniform float uOttersShown;
      uniform vec4 uPlane;
      uniform vec3 uPlaneHeading;
      uniform float uClock;
      attribute float aKind;
      attribute vec2 aSeed;
      varying float vBright;
      varying float vWarm;

      vec3 jet(float t) {
        float up = (${u0.toFixed(4)} + ${u1.toFixed(4)} * t + ${u2.toFixed(4)} * t * t) * uScale;
        float forward = ${f0.toFixed(4)} + ${f1.toFixed(4)} * t;
        return vec3(uJet.x + uJet.z * forward, up, uJet.y + uJet.w * forward);
      }

      // Where otter i of the family is, its head, as it swims downstream, weaving a little.
      vec3 otter(float i, out vec2 ahead, out vec2 side) {
        ahead = vec2(cos(uOtters.z), sin(uOtters.z));
        side = vec2(-ahead.y, ahead.x);
        float t = uOtters.w;
        vec2 at = uOtters.xy + ahead * (t * ${OTTERS.speed.toFixed(3)} - i * ${OTTERS.apart.toFixed(3)})
          + side * sin(t * 3.0 + i * 1.7) * ${(OTTERS.length * 0.35).toFixed(4)};
        return vec3(at.x, 0.004, at.y);
      }

      void main() {
        int kind = int(aKind + 0.5);
        vec3 at = position;
        float bright = 0.0;
        float size = 1.0;
        vWarm = 0.0;
        if (kind == ${KIND.number}) {
          // Painted on, so white on the lit block, and warm for a moment when it is found.
          bright = 0.6 * uNumber.x * (1.0 + 1.6 * uNumber.z);
          vWarm = uNumber.z;
          size = 0.8;
        } else if (kind == ${KIND.droplet}) {
          // A droplet, running from the mouth to the bay, spraying wider as it goes. The spout
          // dies away droplet by droplet.
          float t = fract(aSeed.x + uSpout.y * 0.75);
          at = jet(t) + position * t * uScale;
          at.y = max(at.y, 0.0);
          bright = 1.4 * step(aSeed.y, uSpout.x) * smoothstep(0.0, 0.06, t) * (1.0 - 0.35 * t);
        } else if (kind == ${KIND.splash}) {
          // Rings spreading on the bay where the water lands, three at a time.
          float r = fract(floor(aSeed.x * 3.0) / 3.0 + uSpout.y * 0.55);
          vec3 c = jet(1.0);
          float a = aSeed.y * 6.2832;
          at = vec3(c.x, 0.004, c.z) + vec3(cos(a), 0.0, sin(a)) * r * 0.1 * uScale;
          bright = step(fract(aSeed.y * 7.0), uSpout.x) * (1.0 - r) * smoothstep(0.0, 0.15, r);
        } else if (kind == ${KIND.cat}) {
          // The cat. Looking up, its head lifts a little and its eyes catch the light.
          int part = int(position.z + 0.5);
          vec2 p = position.xy;
          if (part != ${CAT_PART.body}) p.y += uCat.w * ${(CAT.height * 0.07).toFixed(4)};
          if (part == ${CAT_PART.eye}) p.y += uCat.w * ${(CAT.height * 0.04).toFixed(4)};
          at = uCat.xyz + vec3(uCatAxes.x * p.x, p.y, uCatAxes.y * p.x);
          bright = uNumber.x * (part == ${CAT_PART.eye} ? 0.4 + 2.6 * uCat.w : 0.6);
          vWarm = part == ${CAT_PART.eye} ? 1.0 : 0.0;
          size = part == ${CAT_PART.eye} ? 2.2 : 0.9;
        } else if (kind == ${KIND.otter}) {
          // An otter, low in the water, the young ones smaller.
          vec2 ahead;
          vec2 side;
          vec3 head = otter(aSeed.x, ahead, side);
          float grown = aSeed.x < 1.5 ? 1.0 : 0.7;
          at = head + vec3(ahead.x * position.x + side.x * position.y, position.z, ahead.y * position.x + side.y * position.y) * grown;
          bright = uOttersShown * (1.1 + 0.3 * sin(uOtters.w * 4.0 + aSeed.x * 2.1));
          size = 1.2;
        } else if (kind == ${KIND.wake}) {
          // Its wake, a V of ripples spreading behind it.
          vec2 ahead;
          vec2 side;
          vec3 head = otter(aSeed.x, ahead, side);
          float reach = ${(OTTERS.length * 3).toFixed(4)};
          float d = fract(aSeed.y * 7.0 + uOtters.w * 0.9) * reach;
          float arm = aSeed.y > 0.5 ? 1.0 : -1.0;
          vec2 on = head.xz - ahead * (${(OTTERS.length * 0.4).toFixed(4)} + d) + side * arm * d * 0.45;
          at = vec3(on.x, 0.003, on.y);
          bright = 0.6 * uOttersShown * (1.0 - d / reach);
          size = 1.0;
        } else {
          // The plane and its contrail, lit as the Core beat's subject, and its lights.
          vec3 ahead = uPlaneHeading;
          vec3 side = normalize(cross(ahead, vec3(0.0, 1.0, 0.0)));
          vec3 up = cross(side, ahead);
          if (kind == ${KIND.trail}) {
            float s = aSeed.x;
            at = uPlane.xyz - ahead * (0.05 + s * 0.6) + (side * (aSeed.y - 0.5) + up * 0.3) * 0.012 * s;
            bright = 0.3 * uPlane.w * (1.0 - s) * (1.0 - s);
          } else {
            at = uPlane.xyz + ahead * position.x + side * position.y + up * position.z;
            if (kind == ${KIND.plane}) {
              bright = 0.8 * uPlane.w;
              vWarm = 1.0;
              size = 0.7;
            } else {
              // A strobe on each wingtip and the tail, flashing in turn.
              float flash = step(0.88, fract(uClock * 0.9 + aSeed.x));
              bright = uPlane.w * (0.35 + 2.4 * flash);
              size = 1.2;
            }
          }
        }
        vec4 viewPosition = modelViewMatrix * vec4(at, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        float pixelsPerUnit = 0.5 * uHeight * projectionMatrix[1][1] / -viewPosition.z;
        float wide = uSize * size * pixelsPerUnit;
        gl_PointSize = clamp(wide, 1.0, uMaxSize);
        vBright = bright * min(1.0, wide * wide);
        if (vBright <= 0.001) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColour;
      uniform vec3 uAccent;
      varying float vBright;
      varying float vWarm;
      void main() {
        float falloff = smoothstep(0.5, 0.3, length(gl_PointCoord - 0.5));
        gl_FragColor = vec4(mix(uColour, uAccent, vWarm) * vBright * falloff, 1.0);
      }
    `,
    blending: AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true,
  })
}

/** How far a pointer may move between pressing and letting go for it to be a tap, not a drag. */
const TAP = 6

/** The eggs that keep playing while the pointer stays on them; the rest play once as it arrives. */
const HOLDS: readonly EggId[] = ['merlion', 'cat', 'supertrees']

/**
 * Finding an egg, on any page that draws the city: a mouse plays one as it comes onto it, and a
 * tap plays it on touch. Never on the page's own words, links or pins, never during a drag, and
 * only while `ready` says the city is there to find things in. The test reads the camera as the
 * last frame left it, so pointing draws nothing. Returns what stops listening.
 */
export function watchEggs(
  eggs: Eggs,
  view: () => { camera: Camera; size: { width: number; height: number } },
  ready: () => boolean,
  played: () => void,
) {
  // What the mouse is on now, so each plays as the mouse arrives on it, not on every move.
  let over: EggId | null = null
  // Where the last press began, and whether a button is held now: a drag plays nothing.
  let down: [number, number] = [NaN, NaN]
  let held = false
  const onPage = (target: EventTarget | null) =>
    target instanceof Element &&
    !!target.closest(
      'a, button, input, select, textarea, label, summary, p, li, h1, h2, h3, [data-claim]',
    )
  const find = (event: MouseEvent) => {
    if (!ready() || onPage(event.target)) return null
    const { camera, size } = view()
    return eggs.hit(event.clientX, event.clientY, camera, size.width, size.height)
  }
  const point = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || held) return
    const found = find(event)
    if (found && (found.id !== over || HOLDS.includes(found.id))) {
      eggs.play(found)
      played()
    }
    over = found?.id ?? null
  }
  const leave = () => (over = null)
  const press = (event: PointerEvent) => {
    down = [event.clientX, event.clientY]
    held = true
  }
  const release = () => (held = false)
  // On touch there is no hover, so a tap plays it. A mouse has played it already on arriving.
  const click = (event: MouseEvent) => {
    if ((event as PointerEvent).pointerType === 'mouse') return
    if (Math.hypot(event.clientX - down[0], event.clientY - down[1]) > TAP) return
    const found = find(event)
    if (!found) return
    eggs.play(found)
    played()
  }
  addEventListener('pointermove', point, { passive: true })
  document.documentElement.addEventListener('pointerleave', leave, { passive: true })
  addEventListener('pointerdown', press, { passive: true })
  addEventListener('pointerup', release, { passive: true })
  addEventListener('pointercancel', release, { passive: true })
  addEventListener('click', click)
  return () => {
    removeEventListener('pointermove', point)
    document.documentElement.removeEventListener('pointerleave', leave)
    removeEventListener('pointerdown', press)
    removeEventListener('pointerup', release)
    removeEventListener('pointercancel', release)
    removeEventListener('click', click)
  }
}

export type Eggs = {
  /**
   * The spout, the number, the cat, the otters and the plane. The train, the band on BLK 2024 and
   * the Supertrees are the city's points.
   */
  object: Points
  /** What the pointer at `x`, `y` in CSS pixels is on, if anything. */
  hit: (x: number, y: number, camera: Camera, width: number, height: number) => Hit | null
  /** Plays what was found. */
  play: (hit: Hit) => void
  /**
   * Moves the eggs on by `dt` seconds. `beat` is where the story is, `rise` how far the city has
   * risen, `train` how far the city's flow has taken the train, `clock` the city's own clock in
   * seconds, and `still` that the visitor asked for reduced motion, which plays each one without
   * its motion. Says whether one is still playing.
   */
  step: (
    dt: number,
    state: {
      height: number
      beat: number
      rise: number
      train: number
      clock: number
      still: boolean
    },
  ) => boolean
  dispose: () => void
}

/**
 * Builds the eggs. `city` is the city's points material, whose `uTrain`, `uBlk`, `uShow` and
 * `uTrees` they set: the train, BLK 2024 and the Supertrees are drawn with the city.
 */
export function buildEggs(layout: Layout, values: CityValues, city: ShaderMaterial): Eggs {
  const size = values.landmarks.size!
  const block = planCity(layout, values).rings
  // Its own stream of numbers, the same on every visit.
  let state = 7
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }

  const position: number[] = []
  const kind: number[] = []
  const seed: number[] = []
  const add = (k: number, x: number, y: number, z: number, s0 = 0, s1 = 0) => {
    position.push(x, y, z)
    kind.push(k)
    seed.push(s0, s1)
  }
  const number = numberPoints(block)
  for (let i = 0; i < number.length; i += 3)
    add(KIND.number, number[i]!, number[i + 1]!, number[i + 2]!)
  for (let k = 0; k < SPOUT.droplets; k++)
    add(
      KIND.droplet,
      (random() - 0.5) * 0.03,
      (random() - 0.5) * 0.02,
      (random() - 0.5) * 0.02,
      random(),
      random() * 0.98,
    )
  for (let k = 0; k < SPOUT.splash; k++) add(KIND.splash, 0, 0, 0, random(), random())
  const cat = catPoints()
  for (let i = 0; i < cat.length; i += 3) add(KIND.cat, cat[i]!, cat[i + 1]!, cat[i + 2]!)
  for (let i = 0; i < OTTERS.family; i++) {
    for (let k = 0; k < OTTERS.points; k++)
      add(
        KIND.otter,
        (random() - 0.6) * OTTERS.length,
        (random() - 0.5) * OTTERS.length * 0.36,
        random() * OTTERS.length * 0.12,
        i,
      )
    for (let k = 0; k < OTTERS.wake; k++) add(KIND.wake, 0, 0, 0, i, random())
  }
  const plane = planePoints(random).map((v) => v * PLANE.scale)
  for (let i = 0; i < plane.length; i += 3) add(KIND.plane, plane[i]!, plane[i + 1]!, plane[i + 2]!)
  for (let k = 0; k < PLANE.trail; k++) add(KIND.trail, 0, 0, 0, random(), random())
  for (const [x, y, phase] of [
    [0.002, 0.038, 0],
    [0.002, -0.038, 0.33],
    [-0.042, 0, 0.66],
  ] as const)
    add(KIND.light, x * PLANE.scale, y * PLANE.scale, 0, phase)

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(position), 3))
  geometry.setAttribute('aKind', new BufferAttribute(new Float32Array(kind), 1))
  geometry.setAttribute('aSeed', new BufferAttribute(new Float32Array(seed), 2))
  const material = eggMaterial(layout, size)
  const object = new Points(geometry, material)
  object.frustumCulled = false
  // Over the city's points, as the scan's surface is.
  object.renderOrder = 2

  const u = material.uniforms as {
    uHeight: { value: number }
    uSpout: { value: Vector2 }
    uNumber: { value: Vector3 }
    uCat: { value: Vector4 }
    uCatAxes: { value: Vector4 }
    uOtters: { value: Vector4 }
    uOttersShown: { value: number }
    uPlane: { value: Vector4 }
    uClock: { value: number }
  }
  const train = city.uniforms.uTrain!.value as Vector2
  const band = city.uniforms.uBlk!.value as Vector3
  band.z = block.h
  const show = city.uniforms.uShow!.value as Vector2
  const grove = layout.landmarks.supertrees
  ;(city.uniforms.uTrees!.value as Vector3[]).forEach((tree, k) => {
    const [x, z, height] = SUPERTREES[k]!
    tree.set(grove.at[0] + x * size, grove.at[1] + z * size, height * size)
  })

  // The cat sits on the ground in front of the wall with the number, a little to one side.
  const wall = facingWall(block)
  const catAt = new Vector3(
    wall.middle[0] + wall.out[0] * CAT.out + wall.along[0] * CAT.along,
    0,
    wall.middle[1] + wall.out[1] * CAT.out + wall.along[1] * CAT.along,
  )
  u.uCat.value.set(catAt.x, 0, catAt.z, 0)
  u.uCatAxes.value.set(wall.along[0], wall.along[1], wall.out[0], wall.out[1])

  // Where each can be pointed at.
  const { at, turn } = layout.landmarks.merlion
  const merlionAt = [0, 0.3, 0.6, 0.95].map((t) => {
    const forward = t === 0 ? 0 : JET.forward[0] + JET.forward[1] * t
    const up = t === 0 ? 0.14 : JET.up[0] + JET.up[1] * t + JET.up[2] * t * t
    return new Vector3(
      at[0] + Math.sin(turn) * forward * size,
      up * size,
      at[1] + Math.cos(turn) * forward * size,
    )
  })
  /** The eight corners of a box standing on the ground. */
  const corners = (x: number, z: number, w: number, d: number, h: number) =>
    [-1, 1].flatMap((sx) =>
      [0, 1].flatMap((sy) =>
        [-1, 1].map((sz) => new Vector3(x + (sx * w) / 2, sy * h, z + (sz * d) / 2)),
      ),
    )
  const blkBox = corners(block.x, block.z, block.w, block.d, block.h)
  const catBox = corners(catAt.x, catAt.z, CAT.height * 0.8, CAT.height * 0.8, CAT.height)
  const tallest = Math.max(...SUPERTREES.map(([, , h]) => h))
  const groveBox = corners(grove.at[0], grove.at[1], 1.2 * size, 1.2 * size, tallest * size)
  const track = layout.mrt.map(([x, z]) => new Vector3(x, VIADUCT + 0.03, z))
  const trackLength = lineLength(layout.mrt)
  const loop = trackLength * TRAIN.wait
  const river = layout.river.map(([x, z]) => new Vector3(x, 0.002, z))
  const riverWidth = values.water.river!

  const projected = new Vector3()
  /** Where a point in the city is in the window, in CSS pixels, or null if behind the camera. */
  const toWindow = (point: Vector3, camera: Camera, width: number, height: number) => {
    projected.copy(point).project(camera)
    if (projected.z < -1 || projected.z > 1) return null
    return [((projected.x + 1) / 2) * width, ((1 - projected.y) / 2) * height] as const
  }
  /** Whether the window point is in the box, as the window sees it, give or take `margin`. */
  const inBox = (
    box: Vector3[],
    x: number,
    y: number,
    margin: number,
    camera: Camera,
    width: number,
    height: number,
  ) => {
    let [left, top, right, bottom] = [Infinity, Infinity, -Infinity, -Infinity]
    for (const corner of box) {
      const on = toWindow(corner, camera, width, height)
      if (!on) return false
      left = Math.min(left, on[0])
      right = Math.max(right, on[0])
      top = Math.min(top, on[1])
      bottom = Math.max(bottom, on[1])
    }
    return x > left - margin && x < right + margin && y > top - margin && y < bottom + margin
  }
  /**
   * How far along `line` the window point is, if it is within `reach` pixels of it (or of the
   * width `wide` across it in the city, whichever is more), or -1.
   */
  const onLine = (
    line: Vector3[],
    wide: number,
    x: number,
    y: number,
    camera: Camera,
    width: number,
    height: number,
  ) => {
    let best = Infinity
    let along = -1
    let travelled = 0
    for (let k = 1; k < line.length; k++) {
      const length = line[k]!.distanceTo(line[k - 1]!)
      const a = toWindow(line[k - 1]!, camera, width, height)
      const b = a && toWindow(line[k]!, camera, width, height)
      if (a && b) {
        const [dx, dy] = [b[0] - a[0], b[1] - a[1]]
        const t = Math.max(
          0,
          Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1)),
        )
        const off = Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t)
        // How many pixels the line's own width is here.
        const across = (wide / 2) * (Math.hypot(dx, dy) / Math.max(length, 1e-6))
        if (off < Math.max(NEAR, across) && off < best) {
          best = off
          along = travelled + t * length
        }
      }
      travelled += length
    }
    return x >= 0 && x <= width && y >= 0 && y <= height ? along : -1
  }

  const hit: Eggs['hit'] = (x, y, camera, width, height) => {
    // The Merlion: its body or its water. Its reach grows as the camera comes closer.
    const body = toWindow(merlionAt[0]!, camera, width, height)
    const water = toWindow(merlionAt[3]!, camera, width, height)
    if (body && water) {
      const reach = Math.max(NEAR, 0.35 * Math.hypot(water[0] - body[0], water[1] - body[1]))
      for (const point of merlionAt) {
        const on = toWindow(point, camera, width, height)
        if (on && Math.hypot(x - on[0], y - on[1]) < reach) return { id: 'merlion', along: 0 }
      }
    }
    if (inBox(catBox, x, y, 10, camera, width, height)) return { id: 'cat', along: 0 }
    if (inBox(blkBox, x, y, 6, camera, width, height)) return { id: 'blk', along: 0 }
    if (inBox(groveBox, x, y, 0, camera, width, height)) return { id: 'supertrees', along: 0 }
    const on = onLine(track, 0, x, y, camera, width, height)
    if (on >= 0) return { id: 'train', along: on }
    const swim = onLine(river, riverWidth, x, y, camera, width, height)
    return swim >= 0 ? { id: 'otters', along: swim } : null
  }

  // What is playing: each one's seconds since it was found, or null.
  let spout: number | null = null
  let blk: number | null = null
  let looking: number | null = null
  let otters: number | null = null
  let playing: number | null = null
  let calling: { t: number; left: number } | null = null
  let blinking: number | null = null
  let flow = 0
  let still = false
  const where = new Vector3()

  /** The point `along` the river from its source, and the way downstream there, as an angle. */
  const downstream = (along: number) => {
    let left = along
    for (let k = 1; k < layout.river.length; k++) {
      const [ax, az] = layout.river[k - 1]!
      const [bx, bz] = layout.river[k]!
      const length = Math.hypot(bx - ax, bz - az)
      if (left <= length || k === layout.river.length - 1) {
        const t = Math.min(1, left / length)
        return [ax + (bx - ax) * t, az + (bz - az) * t, Math.atan2(bz - az, bx - ax)] as const
      }
      left -= length
    }
    return [layout.river[0]![0], layout.river[0]![1], 0] as const
  }

  const play: Eggs['play'] = (found) => {
    // Found again while it runs, it runs on from full, without coming up again.
    if (found.id === 'merlion') spout = spout === null ? 0 : Math.min(spout, SPOUT.rise)
    else if (found.id === 'blk') blk = 0
    else if (found.id === 'cat') looking = looking === null ? 0 : Math.min(looking, CAT.ease)
    else if (found.id === 'supertrees')
      playing = playing === null ? 0 : Math.min(playing, SHOW.rise)
    else if (found.id === 'otters') {
      if (otters !== null) return
      const [x, z, heading] = downstream(found.along)
      u.uOtters.value.set(x, z, heading, 0)
      otters = 0
    } else {
      // Here already, the train blinks as its doors close. Out of sight, it is called to where
      // the visitor pointed, and arrives from a little before it, slowing.
      const travelled = flow + train.x
      const tail = wrap(travelled, loop)
      const head = wrap(travelled + TRAIN_LENGTH, loop)
      if (calling || tail < trackLength || head < trackLength) {
        if (!calling) blinking = 0
        return
      }
      const stop = Math.max(0, found.along - TRAIN_LENGTH / 2)
      const from = still ? stop : Math.max(0, stop - ARRIVE.from)
      train.x += wrap(from - travelled, loop)
      calling = { t: 0, left: stop - from }
      blinking = null
    }
  }

  /** A share from 0 to 1 that comes up over `rise` seconds, holds, and goes out over `fall`. */
  const envelope = (t: number, rise: number, hold: number, fall: number) =>
    Math.min(1, t / rise) * (1 - Math.min(1, Math.max(0, (t - hold) / fall)))

  const step: Eggs['step'] = (dt, now) => {
    u.uHeight.value = now.height
    flow = now.train
    still = now.still
    let busy = false

    if (spout !== null) {
      spout += dt
      if (!still) u.uSpout.value.y += dt
      u.uSpout.value.x = envelope(spout, SPOUT.rise, SPOUT.hold, SPOUT.fall)
      if (spout >= SPOUT.hold + SPOUT.fall) spout = null
      busy = true
    } else u.uSpout.value.x = 0

    let flash = 0
    if (blk !== null) {
      blk += dt
      const t = blk / BAND.seconds
      band.x = still ? 0.5 : -0.15 + 1.3 * t
      band.y =
        BAND.glow * (still ? Math.sin(Math.PI * Math.min(1, t)) : 1 - Math.max(0, t - 0.85) / 0.15)
      flash = Math.max(0, 1 - t) ** 2
      if (t >= 1) {
        blk = null
        band.y = 0
      }
      busy = true
    }
    const shown = Math.min(1, Math.max(0, (now.rise - 0.85) / 0.15))
    u.uNumber.value.set(shown, 0, flash)

    if (looking !== null) {
      looking += dt
      // Up quickly, held while the pointer stays near, and down slowly.
      u.uCat.value.w = still
        ? looking < CAT.look
          ? 1
          : 0
        : envelope(looking, CAT.ease, CAT.look, CAT.ease * 3)
      if (looking >= CAT.look + CAT.ease * 3) {
        looking = null
        u.uCat.value.w = 0
      }
      busy = true
    }

    if (playing !== null) {
      playing += dt
      if (!still) show.y += dt
      show.x = envelope(playing, SHOW.rise, SHOW.rise + SHOW.play, SHOW.fall)
      if (playing >= SHOW.rise + SHOW.play + SHOW.fall) {
        playing = null
        show.x = 0
      }
      busy = true
    }

    if (otters !== null) {
      otters += dt
      if (!still) u.uOtters.value.w = otters
      u.uOttersShown.value = envelope(otters, OTTERS.up, OTTERS.up + OTTERS.swim, OTTERS.down)
      if (otters >= OTTERS.up + OTTERS.swim + OTTERS.down) {
        otters = null
        u.uOttersShown.value = 0
      }
      busy = true
    }

    // The plane flies with the scroll; only its lights keep the city's own time.
    planeAt(now.beat, where)
    u.uPlane.value.set(where.x, where.y, where.z, planeShown(now.beat))
    u.uClock.value = now.clock

    let glow = 1
    if (calling) {
      const before = calling.t
      calling.t += dt
      // The distance left closes as e^(-t / ease): fast at first, slowing as it arrives.
      const gone = (t: number) => calling!.left * (1 - Math.exp(-t / ARRIVE.ease))
      train.x += gone(calling.t) - gone(before)
      const appear = Math.min(1, calling.t / ARRIVE.appear)
      glow = appear * (1 + (ARRIVE.glow - 1) * Math.exp(-calling.t / (ARRIVE.ease * 2)))
      if (calling.t > ARRIVE.ease * 6) {
        train.x += calling.left - gone(calling.t)
        calling = null
      }
      busy = true
    } else if (blinking !== null) {
      blinking += dt
      const pulse = Math.sin((Math.PI * blinking) / BLINK.pulse)
      glow = 1 + (BLINK.glow - 1) * Math.max(0, pulse)
      if (blinking >= BLINK.pulse * BLINK.pulses * 2) blinking = null
      busy = true
    }
    train.y = glow
    return busy
  }

  const dispose = () => {
    geometry.dispose()
    material.dispose()
  }
  return { object, hit, play, step, dispose }
}
