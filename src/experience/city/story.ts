import { beats, type BeatId } from '../../content/beats'
import type { Lens, Pose } from '../camera/camera'
import { GROUPS, type Group } from './city'

// The city's story, as a pure function of where the visitor is: the same beat always gives the
// same picture, so scrolling back undoes it. The home page and the workbench both tell it.

/**
 * The camera at each beat: the poses of the "From the map" sketch Rahul picked (D38 to D40). It
 * always faces the same way, within about 15 degrees, and glides from subject to subject like a
 * slow drone (EXPERIENCE, "The camera is calm"). The sketch had seven stages; Whole is new, the
 * camera rising over the bay before it comes down for the view across it to Marina Bay Sands.
 */
export const CITY_POSES: Record<BeatId, Pose> = {
  // Up where the opening line and the dust are.
  found: { x: 0, y: 4.4, z: 0.6, azimuth: -12, elevation: 0, distance: 3.7 },
  // Looking down on the map as the dust lands on it.
  signal: { x: -0.4, y: 0.7, z: 0.3, azimuth: -14, elevation: 66, distance: 6.2 },
  // The CBD and the river, where the requests run.
  core: { x: -1.6, y: 0.4, z: -0.5, azimuth: -18, elevation: 22, distance: 3.8 },
  // The Science Centre's roof.
  scanner: { x: 0.05, y: 0.15, z: 2.35, azimuth: -15, elevation: 30, distance: 2.6 },
  // The heartland, and BLK 2024.
  rings: { x: 0.9, y: 0.3, z: 1.9, azimuth: -15, elevation: 22, distance: 3.4 },
  // The Lens's tower, from below its top.
  lens: { x: -1.55, y: 1.2, z: -0.8, azimuth: -20, elevation: 10, distance: 3 },
  whole: { x: 0, y: 0.3, z: -0.3, azimuth: -16, elevation: 34, distance: 6.4 },
  contact: { x: 0.45, y: 0.5, z: -1.6, azimuth: -25, elevation: 7, distance: 3.3 },
}

/**
 * The sketch's lens: a wider view than the Machine's, and the city slid right (or up, on a tall
 * window) as the text band arrives at Signal, so the words never sit on the subject.
 */
const FOV = 40
const RIGHT = 0.1
const UP = 0.15

/**
 * The opening (docs/DECISIONS.md, D44). The first scroll crumbles the name into grains that fall
 * into the haze, evenly with the scroll, as the Machine's did (D37). Then the haze comes down as
 * rain onto the river and the bay, and spreads from the water across the land as the map: in
 * beats, from Found to just before Signal, each point taking `POUR_SPAN` of the way.
 */
const CRUMBLED = 0.6
const POUR_FROM = 0.3
const POUR_TO = 1.45
export const POUR_SPAN = 0.45

/** When the buildings rise, in beats: on the way from Signal to Core, as in the sketch. */
const RISE_FROM = 1.58
const RISE_TO = 2

/** How much of the rise each building takes; the rest of it is how far apart they start. */
export const RISE_SPAN = 0.36

/**
 * What is lit at a beat, as the sketch lit it. `lit` turns a group from cold to the accent; what
 * Rahul's work touches stays lit for the rest of the story (EXPERIENCE, "Cold and lit"). `gain` is
 * how bright a group is against its rest, and `rest` is the gain of every group not named: during
 * a job's beat the city dims except its subject. `windows` is the share of the heartland's windows
 * lit, block by block.
 */
type Light = {
  lit: Partial<Record<Group, number>>
  gain: Partial<Record<Group, number>>
  rest: number
  windows: number
}

/** The spotlight: how bright the city is during a job's beat, outside its subject. */
const DIM = 0.55
/** How lit an earlier job's subject stays while a later one has the beat. Fully lit again at Whole. */
const STILL = 0.5
const S2T = { roads: 1, river: 1 }
const ETAVOLT = { science: 1 }
// Scheduling, so the train runs lit from Uniad's beat on.
const UNIAD = { rings: 1, train: 1 }
const COGNIZANT = { lens: 1 }
const still = (...subjects: Partial<Record<Group, number>>[]) =>
  Object.fromEntries(subjects.flatMap((s) => Object.keys(s)).map((group) => [group, STILL]))
// The landmarks are brighter at the end but stay cold: the accent is only for Rahul's work.
const WHOLE = {
  lit: { ...S2T, ...ETAVOLT, ...UNIAD, ...COGNIZANT },
  gain: { landmarks: 1.45 },
  rest: 1,
  windows: 0.55,
}

export const CITY_LIGHTS: Record<BeatId, Light> = {
  found: { lit: {}, gain: {}, rest: 1, windows: 0 },
  signal: { lit: {}, gain: {}, rest: 1, windows: 0 },
  core: { lit: S2T, gain: { roads: 1.9, river: 1.2, cbd: 0.9 }, rest: DIM, windows: 0 },
  scanner: { lit: { ...still(S2T), ...ETAVOLT }, gain: { science: 1.6 }, rest: DIM, windows: 0 },
  rings: {
    lit: { ...still(S2T, ETAVOLT), ...UNIAD },
    gain: { heartland: 0.82, rings: 1.8 },
    rest: DIM,
    windows: 0.55,
  },
  lens: {
    lit: { ...still(S2T, ETAVOLT, UNIAD), ...COGNIZANT },
    gain: { lens: 2.8, cbd: 0.65 },
    rest: DIM,
    windows: 0.55,
  },
  whole: WHOLE,
  contact: WHOLE,
}

/**
 * How the traffic, the river and the train move (docs/DECISIONS.md, D43), in the order car,
 * river, train. Mostly with the scroll, so the visitor drives the city, and a little on their own
 * clock, the ambient motion D26 allows: in city units per beat scrolled, and per second.
 */
export const FLOW = {
  scroll: [0.5, 0.35, 0.9],
  ambient: [0.12, 0.05, 0.25],
} as const

/** How far a point moving at a speed of 1 has gone, for the car, the river and the train. */
export function cityFlow(beat: number, seconds: number): [number, number, number] {
  return [0, 1, 2].map((k) => FLOW.scroll[k]! * beat + FLOW.ambient[k]! * seconds) as [
    number,
    number,
    number,
  ]
}

/** Where the city first moves on its own: once it has risen, on the way to Core (PERFORMANCE). */
export const MOVES_FROM = RISE_TO - 0.2

/** Everything the city's story sets. Written by `seekCity`, read by the frame loop. */
export const cityStory = {
  camera: { ...CITY_POSES.found },
  lens: { fov: FOV, right: 0, up: 0 } satisfies Lens,
  /** How far the dust has landed as a map, from 0 to 1. */
  land: 0,
  /** How far the opening line has crumbled into the haze, from 0 to 1 (see ../ink.ts). */
  crumble: 0,
  /** How far the haze has rained down and spread into the map, from 0 to 1. */
  pour: 0,
  /** How far the city has risen out of the map, from 0 (flat) to 1 (every building standing). */
  rise: 0,
  /** Per group, in the order of GROUPS: how far it is lit, from cold (0) to the accent (1). */
  lit: GROUPS.map(() => 0),
  /** Per group, in the order of GROUPS: how bright it is against its rest. */
  gain: GROUPS.map(() => 1),
  /** The share of the heartland's windows lit. */
  windows: 0,
}

const LAST = beats.length - 1
const clamp = (x: number) => Math.min(1, Math.max(0, x))
const smooth = (x: number) => {
  const t = clamp(x)
  return t * t * (3 - 2 * t)
}

/** Puts the city's story at `beat`, from 0 (Found) to the last beat (Contact). Makes nothing new. */
export function seekCity(beat: number) {
  const at = Math.min(LAST, Math.max(0, beat))
  const from = Math.min(LAST, Math.floor(at))
  const to = Math.min(LAST, from + 1)
  // As the sketch moved: eased over the whole of each beat.
  const k = smooth(at - from)
  const a = CITY_POSES[beats[from]!]
  const b = CITY_POSES[beats[to]!]
  const camera = cityStory.camera
  camera.x = a.x + (b.x - a.x) * k
  camera.y = a.y + (b.y - a.y) * k
  camera.z = a.z + (b.z - a.z) * k
  camera.azimuth = a.azimuth + (b.azimuth - a.azimuth) * k
  camera.elevation = a.elevation + (b.elevation - a.elevation) * k
  camera.distance = a.distance + (b.distance - a.distance) * k

  const shift = smooth(at - 1)
  cityStory.lens.right = RIGHT * shift
  cityStory.lens.up = UP * shift
  cityStory.land = smooth((at - 1) / 0.55)
  cityStory.rise = clamp((at - RISE_FROM) / (RISE_TO - RISE_FROM))
  cityStory.crumble = clamp(at / CRUMBLED)
  cityStory.pour = clamp((at - POUR_FROM) / (POUR_TO - POUR_FROM))

  // Lit as the camera moves: over the whole of the way from one beat to the next.
  const la = CITY_LIGHTS[beats[from]!]
  const lb = CITY_LIGHTS[beats[to]!]
  GROUPS.forEach((group, i) => {
    cityStory.lit[i] = (la.lit[group] ?? 0) + ((lb.lit[group] ?? 0) - (la.lit[group] ?? 0)) * k
    const ga = la.gain[group] ?? la.rest
    cityStory.gain[i] = ga + ((lb.gain[group] ?? lb.rest) - ga) * k
  })
  cityStory.windows = la.windows + (lb.windows - la.windows) * k
}

/**
 * How much of the map's lines show at `beat`: while the city lies flat at Signal, as the sketch
 * drew them, fading out on either side.
 */
export function mapShown(beat: number) {
  const t = Math.min(1, Math.abs(beat - 1.5) / 0.32)
  return 1 - t * t * (3 - 2 * t)
}

/**
 * The story for a visitor who asked for reduced motion (EXPERIENCE, "Reduced motion"): no
 * rain and no lighting up in sequence. The city is whole and lit from the start, and the camera
 * cuts from one beat's pose to the next.
 */
export function seekCityStill(beat: number) {
  seekCity(Math.round(Math.min(LAST, Math.max(0, beat))))
  const whole = CITY_LIGHTS.whole
  GROUPS.forEach((group, i) => {
    cityStory.lit[i] = whole.lit[group] ?? 0
    cityStory.gain[i] = whole.gain[group] ?? whole.rest
  })
  cityStory.windows = whole.windows
  cityStory.land = cityStory.rise = cityStory.pour = 1
  cityStory.crumble = 0
}
