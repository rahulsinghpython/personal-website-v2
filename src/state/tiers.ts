export type Tier = 'high' | 'mid' | 'low'

/** Mirrors the Tiers table in docs/PERFORMANCE.md. The point counts are tuned in the greybox phase. */
export const TIERS: Record<Tier, { points: number; pixelRatioCap: number }> = {
  high: { points: 150_000, pixelRatioCap: 2 },
  mid: { points: 60_000, pixelRatioCap: 1.5 },
  low: { points: 20_000, pixelRatioCap: 1 },
}

/**
 * A stand-in until tier detection is built in Phase 5: a touch device is taken to be mid, and
 * anything else high. Nothing is ever guessed to be low. `?tier=low` in the address sets it by
 * hand, which is how each tier is tested.
 */
export function guessTier(): Tier {
  const asked = new URLSearchParams(location.search).get('tier')
  if (asked === 'high' || asked === 'mid' || asked === 'low') return asked
  return matchMedia('(pointer: coarse)').matches ? 'mid' : 'high'
}
