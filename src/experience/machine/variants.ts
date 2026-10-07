import { axial, flared } from './axial'
import { machine } from './machine'
import type { MachineDef } from './part'

// The options the workbench switches between when a round is deciding the shape. A is the
// Machine, as signed off in rounds 2 and 3 and as the home page draws it. B and C are
// silhouettes proposed after outside feedback (docs/DECISIONS.md, D32); only the workbench shows
// them. Round 4's options are ways of drawing the points, and live in workbench/cloud.ts.
export const variants: MachineDef[] = [machine, axial, flared]
