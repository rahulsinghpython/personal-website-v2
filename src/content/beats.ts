// The copy for each beat. Mirrors the copy table in docs/CONTENT.md. Change the doc first.
// Written in sentence case; the capitals are styling.

import type { PartId } from './eras'
import { site } from './site'

export type BeatId = 'found' | 'signal' | PartId | 'whole' | 'contact'

/** One line per beat, in story order. */
export const statements: Record<BeatId, string> = {
  found: `You've found ${site.firstName}.`,
  signal: 'Something was built here.',
  core: 'It started with pipes. 10,000 requests a second.',
  scanner: 'I wrote software that turns laser scans into 3D models.',
  rings: '10,000 people. One schedule that holds.',
  lens: "Language models for Singapore's government. Data in, decisions out.",
  whole: 'Five years. One machine.',
  contact: 'You found me. Say something.',
}
