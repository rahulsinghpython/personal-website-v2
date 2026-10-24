// The numbers a shape depends on, each with the range the workbench's sliders can tune it over.

/** One number a shape depends on, with the range it can be tuned over. */
export type ParamSpec = { value: number; min: number; max: number; step?: number }
export type ParamSchema = Record<string, ParamSpec>

/** Shorthand for a ParamSpec. */
export const param = (value: number, min: number, max: number, step = 0.01): ParamSpec => ({
  value,
  min,
  max,
  step,
})

/** The values of one group of parameters. */
export type ParamValues<S extends ParamSchema = ParamSchema> = { readonly [K in keyof S]: number }

export function defaultValues(schema: ParamSchema): Record<string, number> {
  return Object.fromEntries(Object.entries(schema).map(([key, spec]) => [key, spec.value]))
}
