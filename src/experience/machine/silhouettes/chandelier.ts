import { defineMachine, param, type MachineValues } from '../part'
import { apertureStack, around, ball, drum, pipe, rad, ring, rod, type Point } from '../shapes'

// Silhouette B: tall, tiered and hanging. Plates that narrow as they descend, joined by posts and
// wavy lines, with arms carrying orbit rings below and the Lens as the tip. From the references:
// the inside of a quantum computer and the orrery. It borrows that look only; it does not claim
// Rahul worked on one (docs/DECISIONS.md, D22).

const params = {
  core: {
    radius: param(1.1, 0.6, 1.6),
    tiers: param(5, 3, 7, 1),
    drop: param(0.55, 0.25, 0.8),
    taper: param(0.15, 0.05, 0.25),
    lines: param(6, 0, 16, 1),
  },
  scanner: {
    reach: param(0.5, 0.2, 1.2),
    drop: param(0.75, 0.1, 1.4),
    size: param(0.2, 0.1, 0.4),
  },
  rings: {
    count: param(3, 1, 4, 1),
    radius: param(1.25, 0.8, 2),
    grow: param(0.3, 0, 0.6),
    phase: param(130, 0, 360, 1),
  },
  lens: {
    radius: param(0.34, 0.15, 0.7),
    count: param(4, 1, 8, 1),
    gap: param(0.2, 0.08, 0.4),
    taper: param(0.2, 0, 0.3),
  },
}
type Values = MachineValues<typeof params>
type Core = Values['core']

/**
 * The tiered rig, with its top plate at height `top`. A function so the same rig can be hung
 * lower when something stands on its mount.
 */
export function tiered(top: number) {
  const tierY = (c: Core, tier: number) => top - tier * c.drop
  const tierRadius = (c: Core, tier: number) => Math.max(0.12, c.radius * (1 - c.taper * tier))

  return {
    params,
    /** The top face of the mount: where anything standing on the rig stands. */
    mountTop: top + 0.405,
    build: {
      core: ({ core }: Values) => {
        const tiers = Math.round(core.tiers)
        const each = Array.from({ length: tiers }, (_, tier) => tier)

        const plates = each.map((tier) =>
          drum(tierRadius(core, tier), 0.05).translate(0, tierY(core, tier), 0),
        )
        const mount = [
          drum(0.16, 0.35).translate(0, top + 0.2, 0),
          drum(0.3, 0.05).translate(0, top + 0.38, 0),
        ]
        const posts = each.slice(0, -1).flatMap((tier) => {
          const radius = tierRadius(core, tier + 1) * 0.8
          return around(3, () =>
            rod([radius, tierY(core, tier), 0], [radius, tierY(core, tier + 1), 0], 0.025),
          ).map((post) => post.rotateY(tier * 0.6))
        })

        // Signal lines run down through every plate, bowing out between one plate and the next.
        const lines = around(Math.round(core.lines), (line) => {
          const sway = line % 2 === 0 ? 0.07 : -0.07
          const points = each.flatMap((tier): Point[] => {
            const at: Point = [tierRadius(core, tier) * 0.55, tierY(core, tier), 0]
            if (tier === tiers - 1) return [at]
            const between = (tierRadius(core, tier) + tierRadius(core, tier + 1)) / 2
            return [at, [between * 0.55 + 0.09, tierY(core, tier) - core.drop / 2, sway]]
          })
          return pipe(points, 0.016, 64)
        })

        return [...plates, ...mount, ...posts, ...lines]
      },

      // A straight arm off the top plate, with a drum-shaped head hanging from its end.
      scanner: ({ core, scanner }: Values) => {
        const out = -core.radius - scanner.reach
        const arm = top + 0.05
        const head = top - scanner.drop
        const s = scanner.size
        return [
          rod([-core.radius + 0.15, arm, 0], [out, arm, 0], 0.03),
          ball(0.05).translate(out, arm, 0),
          rod([out, arm, 0], [out, head + s * 0.6, 0], 0.03),
          drum(s, s * 1.1).translate(out, head, 0),
          drum(s * 1.12, s * 0.12).translate(out, head + s * 0.62, 0),
          drum(s * 1.12, s * 0.12).translate(out, head - s * 0.62, 0),
        ]
      },

      // Orbits: each of the lowest plates carries a ring on an arm, wider the lower it hangs.
      rings: ({ core, rings }: Values) => {
        const tiers = Math.round(core.tiers)
        const count = Math.min(Math.round(rings.count), tiers)
        return Array.from({ length: count }, (_, orbit) => {
          const tier = tiers - count + orbit
          const y = tierY(core, tier)
          const radius = rings.radius + orbit * rings.grow
          const turn = rad(rings.phase) * orbit
          return [
            ring(radius, 0.02).translate(0, y, 0),
            rod([tierRadius(core, tier), y, 0], [radius, y, 0], 0.022).rotateY(turn),
            ball(0.09).translate(radius, y, 0).rotateY(turn),
          ]
        }).flat()
      },

      // The tip: the stack narrows downward from the last plate.
      lens: ({ core, lens }: Values) =>
        apertureStack(lens.radius, Math.round(lens.count), lens.gap, lens.taper).map((piece) =>
          piece.rotateX(Math.PI).translate(0, tierY(core, Math.round(core.tiers) - 1) - 0.14, 0),
        ),
    },
  }
}

const rig = tiered(1.6)

export const chandelier = defineMachine({
  id: 'B',
  label: 'Tiered, hanging',
  params: rig.params,
  build: rig.build,
})
