import { gsap } from 'gsap/gsap-core'
import type { ShaderMaterial, Vector4 } from 'three'
import { beats, type BeatId } from '../content/beats'
import { POSES } from './camera/camera'
import { PART_ORDER, type PartId } from './machine/part'

// The master timeline: the whole story as one paused GSAP timeline, one unit of time per beat.
// Nothing plays it. Its position is set from progress, so the scene is a function of progress
// and scrolling back undoes it exactly.
//
// Only gsap's core is imported, not 'gsap' itself, which would also bring its plugin for
// animating CSS. Everything animated here is a number on a plain object.

const each = (value: number): Record<PartId, number> => ({
  core: value,
  scanner: value,
  rings: value,
  lens: value,
})

/** How far the Rings turn as they lock, in radians. */
const RING_TURN = 1.4

/**
 * Everything in the scene that the story sets. The timeline writes it and the frame loop reads
 * it. `gather`, `lock` and `wake` run from 0 to 1 for each part: dust pulled in to a loose
 * silhouette, the silhouette closed up, and the part powered on.
 */
export const story = {
  gather: each(0),
  lock: each(0),
  wake: each(0),
  /** How far the Rings still have to turn before they lock, in radians. */
  turn: RING_TURN,
  /**
   * How far the beads have drifted, in radians at a speed of 1. The one thing here the timeline
   * does not set: it is ambient motion (D26), added to by the frame loop.
   */
  drift: 0,
  camera: { ...POSES.found },
}

const LAST = beats.length - 1
const at = (beat: BeatId) => beats.indexOf(beat)

/**
 * Settled in round 6 of docs/DESIGN-PROCESS.md: Rahul scrolled these on his tablet and asked for
 * no change (docs/DECISIONS.md, D35).
 * A beat's picture is finished a little before its text has fully arrived and holds a little
 * after, so the visitor reads beside something that is standing still.
 */
function build() {
  const timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } })
  /** Moves one number of `target` from `from` to `to` between two moments, in beats. */
  const span = <T extends object>(
    target: T,
    key: keyof T & string,
    from: number,
    to: number,
    start: number,
    end: number,
  ) =>
    timeline.fromTo(
      target,
      { [key]: from },
      { [key]: to, duration: end - start, immediateRender: false },
      start,
    )

  // Signal: the dust was an object all along. Every part gathers, the oldest work a little first.
  PART_ORDER.forEach((part, index) => {
    const start = at('found') + 0.08 + index * 0.05
    span(story.gather, part, 0, 1, start, start + 0.7)
  })

  // Then one part a beat, in the order Rahul came to the work. It wakes as it locks, a moment
  // behind, so the haze closes up into lit lines instead of closing up and then changing colour.
  for (const part of PART_ORDER) {
    const beat = at(part)
    span(story.lock, part, 0, 1, beat - 0.85, beat - 0.3)
    span(story.wake, part, 0, 1, beat - 0.8, beat - 0.25)
  }
  span(story, 'turn', RING_TURN, 0, at('rings') - 0.85, at('rings') - 0.3)

  // The camera travels from each beat's pose to the next.
  for (let beat = 1; beat <= LAST; beat++) {
    timeline.fromTo(
      story.camera,
      { ...POSES[beats[beat - 1]!] },
      { ...POSES[beats[beat]!], duration: 0.8, immediateRender: false },
      beat - 0.9,
    )
  }
  return timeline
}

const timeline = build()
let sought = -1

/** Puts the scene where the story is at `progress`, from 0 (Found) to 1 (Contact). */
export function seek(progress: number) {
  // Moving the timeline wakes gsap's own ticker for a couple of seconds, so it is left alone on
  // a frame where only the beads have moved.
  if (progress === sought) return
  sought = progress
  timeline.time(progress * LAST)
}

/**
 * The story for a visitor who asked for reduced motion: nothing assembles. The Machine is whole
 * and awake from the start, and the camera cuts from one beat's pose to the next.
 */
export function seekStill(progress: number) {
  seek(Math.round(progress * LAST) / LAST)
  for (const part of PART_ORDER) story.gather[part] = story.lock[part] = story.wake[part] = 1
  story.turn = 0
}

/** Copies the story into the points material. Called every frame, so it makes nothing new. */
export function applyStory(material: ShaderMaterial) {
  const { gather, lock, wake } = story
  const uniforms = material.uniforms
  ;(uniforms.uGather!.value as Vector4).set(gather.core, gather.scanner, gather.rings, gather.lens)
  ;(uniforms.uLock!.value as Vector4).set(lock.core, lock.scanner, lock.rings, lock.lens)
  ;(uniforms.uWake!.value as Vector4).set(wake.core, wake.scanner, wake.rings, wake.lens)
  uniforms.uTurn!.value = story.turn
  uniforms.uDrift!.value = story.drift
}
