import { defineMachine, param, type ParamValues } from '../part'
import { apertureStack, around, band, dish, drum, lathe, pipe, rad, ring, rod } from '../shapes'

// Silhouette C: long and directional. A cable cut open, each layer peeled further back than the
// one inside it, with fibres running out of the middle into the Lens. Hoops fan out behind and a
// dish stands on top. From the references: the cut-open fibre cable, the turbofan and Cassini.
//
// The body is built along the Y axis like everything else, then laid down so its front faces +Z.

const FRONT = 0.7
/** The gap the fibres cross between the tip of the body and the first plate of the Lens. */
const RUN = 0.9

const core = {
  radius: param(0.24, 0.1, 0.5),
  layers: param(4, 2, 6, 1),
  step: param(0.15, 0.05, 0.3),
  reveal: param(0.5, 0.1, 0.9),
  length: param(2.6, 2, 4),
  fibres: param(7, 0, 12, 1),
}
type Core = ParamValues<typeof core>

const back = (c: Core) => FRONT - c.length
const layerRadius = (c: Core, layer: number) => c.radius + layer * c.step
/** How far forward a layer reaches. The innermost reaches furthest. */
const layerFront = (c: Core, layer: number) => Math.max(back(c) + 0.2, FRONT - layer * c.reveal)
/** The body's radius at a point along its length. */
function bodyRadius(c: Core, along: number) {
  let radius = layerRadius(c, 0)
  for (let layer = 0; layer < Math.round(c.layers); layer++)
    if (layerFront(c, layer) >= along) radius = layerRadius(c, layer)
  return radius
}

const layDown = Math.PI / 2

export const trunk = defineMachine({
  id: 'C',
  label: 'Cable, cut open',
  params: {
    core,
    scanner: {
      dish: param(0.6, 0.3, 1),
      mast: param(0.55, 0.2, 1.2),
      tilt: param(35, -10, 80, 1),
      along: param(0.3, -1, 0.8),
    },
    rings: {
      count: param(3, 1, 5, 1),
      radius: param(1.05, 0.7, 1.8),
      grow: param(0.25, 0, 0.5),
      stagger: param(0.3, 0, 0.6),
      tube: param(0.035, 0.01, 0.1, 0.005),
    },
    lens: {
      radius: param(0.45, 0.2, 0.8),
      count: param(4, 1, 8, 1),
      gap: param(0.22, 0.08, 0.4),
      taper: param(0.16, 0, 0.3),
    },
  },
  build: {
    core: ({ core, lens }) => {
      const layers = Math.round(core.layers)
      const outer = layerRadius(core, layers - 1)

      // One stepped profile: a boot at the back, then each layer's shoulder, inwards to the tip.
      const profile: [number, number][] = [
        [0, back(core) - 0.35],
        [outer * 0.55, back(core) - 0.35],
        [outer, back(core)],
      ]
      for (let layer = layers - 1; layer >= 0; layer--) {
        profile.push([layerRadius(core, layer), layerFront(core, layer)])
        if (layer > 0) profile.push([layerRadius(core, layer - 1), layerFront(core, layer)])
      }
      profile.push([0, layerFront(core, 0)])

      const collars = Array.from({ length: layers }, (_, layer) =>
        band(layerRadius(core, layer), layerRadius(core, layer) + 0.03, 0.05).translate(
          0,
          layerFront(core, layer) - 0.07,
          0,
        ),
      )

      // The fibres leave the innermost layer and splay out to meet the first plate of the Lens.
      const tip = layerFront(core, 0)
      const fibres = around(Math.round(core.fibres), () =>
        pipe(
          [
            [core.radius * 0.6, tip - 0.05, 0],
            [core.radius * 0.7, tip + RUN * 0.3, 0],
            [lens.radius * 0.6, tip + RUN * 0.75, 0],
            [lens.radius * 0.66, tip + RUN, 0],
          ],
          0.024,
        ),
      )

      return [lathe(profile), ...collars, ...fibres].map((piece) => piece.rotateX(layDown))
    },

    // A dish on a mast, standing on the body.
    scanner: ({ core, scanner }) => {
      const foot = bodyRadius(core, scanner.along)
      const top = foot + scanner.mast
      return [
        rod([0, foot - 0.02, scanner.along], [0, top, scanner.along], 0.035),
        drum(0.09, 0.08).translate(0, foot + 0.02, scanner.along),
        ...[drum(0.07, 0.1).translate(0, -0.03, 0), ...dish(scanner.dish)].map((piece) =>
          piece.rotateX(rad(scanner.tilt)).translate(0, top, scanner.along),
        ),
      ]
    },

    // Hoops around the back of the body, each wider and further back than the last.
    rings: ({ core, rings }) =>
      Array.from({ length: Math.round(rings.count) }, (_, hoop) => {
        const along = -0.6 - hoop * rings.stagger
        const radius = rings.radius + hoop * rings.grow
        const body = bodyRadius(core, along)
        return [
          ring(radius, rings.tube).translate(0, along, 0),
          ...around(3, () => rod([body, along, 0], [radius, along, 0], 0.02)).map((strut) =>
            strut.rotateY(hoop * 0.7),
          ),
        ]
      })
        .flat()
        .map((piece) => piece.rotateX(layDown)),

    lens: ({ core, lens }) =>
      apertureStack(lens.radius, Math.round(lens.count), lens.gap, lens.taper).map((piece) =>
        piece.translate(0, layerFront(core, 0) + RUN, 0).rotateX(layDown),
      ),
  },
})
