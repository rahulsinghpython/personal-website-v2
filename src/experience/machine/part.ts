import type { BufferGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

export type PartId = 'core' | 'scanner' | 'rings' | 'lens'

/** The order the parts assemble in, which is the order the career happened in. */
export const PART_ORDER: PartId[] = ['core', 'scanner', 'rings', 'lens']

/** One number a part's shape depends on, with the range it can be tuned over. */
export type ParamSpec = { value: number; min: number; max: number; step?: number }
export type ParamSchema = Record<string, ParamSpec>

/** Shorthand for a ParamSpec. */
export const param = (value: number, min: number, max: number, step = 0.01): ParamSpec => ({
  value,
  min,
  max,
  step,
})

/** The values of one part's parameters. */
export type ParamValues<S extends ParamSchema = ParamSchema> = { readonly [K in keyof S]: number }

export type MachineSchema = Record<PartId, ParamSchema>

/** Every parameter value of one Machine: part, then parameter name. */
export type MachineValues<S extends MachineSchema = MachineSchema> = {
  readonly [P in PartId]: ParamValues<S[P]>
}

/**
 * A part is a function from the Machine's parameters to the shapes it is made of, in the
 * Machine's space. It is given every part's values, not only its own, because where a part sits
 * depends on its neighbours: the Scanner stands on top of the Core, however tall the Core is.
 */
export type PartDef = {
  id: PartId
  params: ParamSchema
  build: (values: MachineValues) => BufferGeometry[]
}

/** One whole Machine: the four parts, in the order they assemble. */
export type MachineDef = { id: string; label: string; parts: PartDef[] }

/** Checks each `build` against the parameter names, then forgets them so Machines can share a list. */
export function defineMachine<S extends MachineSchema>(machine: {
  id: string
  label: string
  params: S
  build: { [P in PartId]: (values: MachineValues<S>) => BufferGeometry[] }
}): MachineDef {
  return {
    id: machine.id,
    label: machine.label,
    parts: PART_ORDER.map((id) => ({
      id,
      params: machine.params[id],
      build: machine.build[id] as PartDef['build'],
    })),
  }
}

export function defaultValues(schema: ParamSchema): Record<string, number> {
  return Object.fromEntries(Object.entries(schema).map(([key, spec]) => [key, spec.value]))
}

/** A Machine with every parameter at the value it was given in code. */
export function machineDefaults(machine: MachineDef): MachineValues {
  return Object.fromEntries(
    machine.parts.map((part) => [part.id, defaultValues(part.params)]),
  ) as MachineValues
}

/**
 * How a piece turns about the Machine's axis in the story. `turn` is its share of the turn the
 * Rings make as they lock; `drift` is how fast it keeps moving afterwards, in radians a second.
 * It is kept on the geometry, so it stays with the piece as the piece is moved into place.
 */
export function spinning(piece: BufferGeometry, turn: number, drift = 0): BufferGeometry {
  piece.userData.spin = [turn, drift]
  return piece
}

export const spinOf = (piece: BufferGeometry): [turn: number, drift: number] =>
  piece.userData.spin ?? [0, 0]

/**
 * Gives a piece more or less than its share of the points: 1 is what its size earns it. For a
 * piece that holds the shape together and should not be the brightest thing in it.
 */
export function weighted(piece: BufferGeometry, share: number): BufferGeometry {
  piece.userData.share = share
  return piece
}

export const shareOf = (piece: BufferGeometry): number => piece.userData.share ?? 1

/** Builds a part as a single geometry, so a part is one draw call and one surface to sample. */
export function buildPart(part: PartDef, values: MachineValues): BufferGeometry {
  const pieces = part.build(values)
  // Some shapes come indexed and some do not; they can only be merged when they agree.
  const flat = pieces.map((piece) => (piece.index ? piece.toNonIndexed() : piece))
  const merged = mergeGeometries(flat)
  for (const piece of new Set([...pieces, ...flat])) piece.dispose()
  if (!merged) throw new Error(`The shapes of ${part.id} cannot be merged into one geometry.`)
  return merged
}
