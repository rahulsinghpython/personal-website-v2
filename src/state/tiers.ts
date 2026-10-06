export type Tier = 'high' | 'mid' | 'low'

/** Mirrors the Tiers table in docs/PERFORMANCE.md. The point counts are tuned in the greybox phase. */
export const TIERS: Record<Tier, { points: number; pixelRatioCap: number }> = {
  high: { points: 150_000, pixelRatioCap: 2 },
  mid: { points: 60_000, pixelRatioCap: 1.5 },
  low: { points: 20_000, pixelRatioCap: 1 },
}
