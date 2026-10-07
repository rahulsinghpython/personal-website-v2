export type Tier = 'high' | 'mid' | 'low'

/**
 * Mirrors the Tiers table in docs/PERFORMANCE.md. The high count was raised on one tablet's
 * evidence (docs/DECISIONS.md, D33); mid and low are still starting guesses.
 */
export const TIERS: Record<Tier, { points: number; pixelRatioCap: number }> = {
  high: { points: 600_000, pixelRatioCap: 2 },
  mid: { points: 60_000, pixelRatioCap: 1.5 },
  low: { points: 20_000, pixelRatioCap: 1 },
}

/** A touch screen at least this many CSS pixels across its shorter side is a tablet. */
const TABLET = 600

/**
 * A stand-in until tier detection is built in Phase 5: a phone is taken to be mid, and anything
 * else high, tablets included. A tablet was mid until Rahul tried high on his and it did not
 * lag (docs/DECISIONS.md, D31). Nothing is ever guessed to be low. `?tier=low` in the address
 * sets it by hand, which is how each tier is tested.
 */
export function guessTier(): Tier {
  const asked = new URLSearchParams(location.search).get('tier')
  if (asked === 'high' || asked === 'mid' || asked === 'low') return asked
  const phone =
    matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < TABLET
  return phone ? 'mid' : 'high'
}

/**
 * A tier's numbers, unless the address says otherwise: `?points=400000` and `?dpr=3` override
 * them. For finding out what a device can take before the tiers are set in Phase 5.
 */
export function tierBudget(tier: Tier): { points: number; pixelRatioCap: number } {
  const query = new URLSearchParams(location.search)
  const asked = (key: string, min: number, max: number) => {
    const value = Number(query.get(key))
    return query.has(key) && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : null
  }
  return {
    points: asked('points', 1_000, 3_000_000) ?? TIERS[tier].points,
    pixelRatioCap: asked('dpr', 0.5, 4) ?? TIERS[tier].pixelRatioCap,
  }
}
