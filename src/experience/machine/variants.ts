import { machine } from './machine'
import type { MachineDef } from './part'

// The options the workbench switches between for whatever round is being decided.
//
// Round 3 of docs/DESIGN-PROCESS.md: Rahul picked version 2 of every part, so that is the Machine
// shown. Versions 1 and 3 are still behind each part's `version` slider until round 4 starts.
export const variants: MachineDef[] = [machine(2, 'A', 'The Machine: version 2 of every part')]
