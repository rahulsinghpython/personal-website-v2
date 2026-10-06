import { machine } from './machine'
import type { MachineDef } from './part'

// The options the workbench switches between when a round is deciding the shape. Rounds 2 and 3
// are finished, so there is one: the Machine. Round 4's options are ways of drawing its points,
// and live in workbench/cloud.ts.
export const variants: MachineDef[] = [machine]
