# Roadmap

The authority on what is built and what comes next. Update the status table when a phase starts or finishes.

## Status

| Phase | Name | Status |
| --- | --- | --- |
| 0 | Direction | Done 2026-10-05. Docs written; concept, stack and principles accepted by Rahul. |
| 1 | Foundations | In progress since 2026-10-05. Built on 2026-10-05: facts confirmed by Rahul, content modules, content layer, the Index at `/plain`, prerendering. Readable with scripts blocked; Lighthouse mobile performance 100 on both pages, measured on a local production build. Left: deploy to Vercel (Rahul will say when), then re-measure on the deployed preview. |
| 2 | Greybox | Done 2026-10-07, begun 2026-10-05. Built: the bundle-size check and CI ([D19](DECISIONS.md)); the workbench, showing placeholder shapes ([D20](DECISIONS.md), [D21](DECISIONS.md)). Round 1 finished on 2026-10-06: nine references liked, outcome in [REFERENCES](REFERENCES.md), look drawn from computing hardware ([D22](DECISIONS.md)). Round 2 finished on 2026-10-06: Rahul signed off the silhouette, a hanging tiered rig with a small cube in gimbals on top ([D23](DECISIONS.md), [EXPERIENCE](EXPERIENCE.md#the-shape)). Round 3: each part now stands for a kind of work, with the company as small print ([D24](DECISIONS.md)); Round 3 finished on 2026-10-06: version 2 of all four parts ([D25](DECISIONS.md)). Small ambient motion is now allowed ([D26](DECISIONS.md)). Round 4 finished on 2026-10-07: the Machine as points, in a look between two of the three shown ([D27](DECISIONS.md), [D28](DECISIONS.md)). The scene chunk was measured with a throwaway build: 243.8 kB of 300 ([PERFORMANCE](PERFORMANCE.md#the-bundle-check)). **Finished on 2026-10-07, with one criterion put off by Rahul:** frame rate was measured on the development machine only; the mid and low tiers move to Phase 5 ([D28](DECISIONS.md)). |
| 3 | Choreography | Not started |
| 4 | Interactions | Not started |
| 5 | Finish | Not started |
| 6 | Later | Not scheduled |

The order is chosen so that **the site is shippable at the end of every phase**. Phase 1 alone produces a complete, fast, plain site. Each later phase adds a layer on top without the layer below depending on it.

## Phase 1. Foundations

A working site with no 3D.

- Done: scaffold the stack in [ARCHITECTURE](ARCHITECTURE.md); record the installed versions there.
- Done: move the confirmed facts from [CONTENT](CONTENT.md) into typed modules in `src/content/`.
- Done: build the content layer: one section per beat, real copy, near-black. Type is system font stacks for now; the typefaces are chosen in Phase 5.
- Done: build the Index.
- Done: prerender so the HTML contains all content.
- Not started: deploy to Vercel with preview deployments. Ask Rahul first.
- Moved to the start of Phase 2: the CI bundle-size check ([D18](DECISIONS.md)).

**Done when:** the page is readable with JavaScript disabled; Lighthouse mobile performance is 95 or higher; Rahul has confirmed the facts in CONTENT.

## Phase 2. Greybox

Find the Machine. This is the creative risk of the whole project, so it comes early and stays rough. It follows rounds 1 to 4 of [DESIGN-PROCESS](DESIGN-PROCESS.md).

- Done, before three.js is installed: a bundle-size check that fails the build, and so CI, when a size budget in [PERFORMANCE](PERFORMANCE.md) is exceeded. A script over the build output ([D19](DECISIONS.md)).
- Done: the workbench, a development-only page at `/workbench/` with free camera and a control panel. It includes a benchmark mode that reports cost per frame, draw calls, points and sampling time, which is how runtime performance is measured ([PERFORMANCE](PERFORMANCE.md#measuring)).
- Done: round 1, references. Two batches, nine likes; outcome in [REFERENCES](REFERENCES.md).
- Done: round 2, silhouette. Signed off on 2026-10-06 ([D23](DECISIONS.md)); the shape is `src/experience/machine/machine.ts`.
- Done: round 3, parts. Rahul picked version 2 of every part ([D25](DECISIONS.md)): open plates with a bundle of lines (Core), a drum in a fork with its fan of beams (Scanner), beaded rings (Rings), two gimbals and a bigger cube (Lens). The versions and silhouettes he passed over were removed from the code on 2026-10-06; they are in git history at `4393c8e`.
- Done: round 4, points. Sampling and the points material are `src/experience/machine/points.ts` ([D27](DECISIONS.md)). Three looks were shown side by side at desktop size and at phone size; Rahul picked a mix of two, which is `POINT_LOOK` in that file ([D28](DECISIONS.md)).
- Done on the development machine only: measure points and frame cost ([PERFORMANCE](PERFORMANCE.md#measured-on-the-development-machine)). Moved to Phase 5 by Rahul: measuring on a mid and a low device, and setting the tier point counts ([D28](DECISIONS.md)).
- Done: a throwaway build with the scene mounted lazily, to read the scene chunk's size ([D21](DECISIONS.md)). 243.8 kB of 300, without GSAP; reverted.

Rounds 5 (colour and type) and 6 (motion) happen in Phases 5 and 3, on the same workbench.

**Done when:** Rahul signs off the silhouette; the mid tier holds 60 fps and the low tier 30 fps with the Machine on screen; the shape is written back into [EXPERIENCE](EXPERIENCE.md).

**How it ended:** the silhouette was signed off ([D23](DECISIONS.md)) and the shape is in EXPERIENCE. The frame-rate criterion was not met and not failed: no mid or low device was measured, by Rahul's choice, and it is now a Phase 5 item ([D28](DECISIONS.md)).

## Phase 3. Choreography

Make scrolling build it.

- Progress from scroll, eased; on-demand rendering.
- Dust to dormant to awake in the vertex shader, per part.
- Camera path through the eight beats, in step with the DOM sections.
- Scrolling back reverses everything exactly.

**Done when:** a first-time viewer, unprompted, says what the object is by beat 3; zero frames render at rest; all runtime budgets in [PERFORMANCE](PERFORMANCE.md) hold.

## Phase 4. Interactions

The first-release interactions from [EXPERIENCE](EXPERIENCE.md#interactions-by-part).

- Pointer torch on the dust.
- Scanner sweep: points become surface under the beam.
- Whole beat: drag to rotate, click a part to open it, project panels.

**Done when:** each works with mouse and touch, each has a keyboard-reachable equivalent for any content it reveals, and none is required to get the story.

## Phase 5. Finish

- Tier detection and automatic step-down.
- Reduced motion path. No-WebGL fallback image.
- Final typefaces, accent colour, spacing, copy.
- Social preview image, favicon, metadata.
- Real-device testing. Accessibility pass.
- Carried over from Phase 2 ([D28](DECISIONS.md)): name the reference devices; measure the mid tier at 60 fps and the low tier at 30 fps on them; set the tier point counts in [PERFORMANCE](PERFORMANCE.md); time point sampling on the low device and move it to build time or a worker if it passes 50 ms.
- Custom domain.

**Done when:** every budget is met on the reference devices and Rahul is happy to send the link to someone.

## Phase 6. Later

Not scheduled; ideas that passed the "would this serve the principles" test.

- Core, Rings and Lens interactions.
- More projects inside parts.
- A fifth part when there is a fifth era.
- Sound, off by default.
- A high-tier-only visual extra, if a decision allows it.

## Open questions for Rahul

Answered on 2026-10-05: the Machine concept, the stack and the principles are accepted (see [DECISIONS](DECISIONS.md)).

Direction:

1. **Design process:** answered on 2026-10-05. The workbench-and-rounds approach in [DESIGN-PROCESS](DESIGN-PROCESS.md) is accepted ([D14](DECISIONS.md)).
2. **Workbench control panel:** answered on 2026-10-05. Tweakpane ([D20](DECISIONS.md)).

Copy: since [D24](DECISIONS.md) a part stands for a kind of work and the company is small print, but the content layer and the Index still lead with company and role. Rewriting them to lead with the work is not scheduled; it is outside the greybox phase.

Content: roles and dates, the opening name, the numbers, what can be named, personal projects, location and title were answered on 2026-10-05 ([CONTENT](CONTENT.md#confirmed-with-rahul), [D15](DECISIONS.md)). Still open, in [CONTENT](CONTENT.md#still-needs-rahul):

3. Which screenshots and video can be shown from each employer? Needed by Phase 4.
4. Is the LinkedIn URL carried over from the old site still right?

Practical:

5. **Reference devices:** which phone and which laptop should the budgets be tested on? Put off by Rahul on 2026-10-07 ([D28](DECISIONS.md)); needed by Phase 5.
6. **Domain:** what will the site live at?
