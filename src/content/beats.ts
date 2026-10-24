// The copy for each beat. Mirrors the copy table in docs/CONTENT.md. Change the doc first.
// Written in sentence case; the capitals are styling.

import type { PartId } from './eras'
import { site } from './site'

export type BeatId = 'found' | 'signal' | PartId | 'whole' | 'contact'

/** The beats in story order. */
export const beats: readonly BeatId[] = [
  'found',
  'signal',
  'core',
  'scanner',
  'rings',
  'lens',
  'whole',
  'contact',
]

/** One line per beat, in story order. A job's line is its headline, and leads with the work. */
export const statements: Record<BeatId, string> = {
  found: `You've found ${site.firstName}.`,
  signal: 'Something was built here.',
  core: 'APIs that hold 10,000 requests a second.',
  scanner: "Software that turns laser scans into 3D models. You've been looking at one.",
  rings: 'One platform. 10,000+ users across Asia.',
  lens: "Language models for Singapore's government. Data in, decisions out.",
  whole: 'Four jobs. Five years. One city.',
  contact: 'You found me. Say something.',
}
