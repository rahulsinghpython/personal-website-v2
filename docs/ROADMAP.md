# Roadmap

The authority on what is built and what comes next. Update the status table when a phase starts or finishes.

## Status

| Phase | Name | Status |
| --- | --- | --- |
| 0 | Direction | Done 2026-10-05. Docs written; concept, stack and principles accepted by Rahul. |
| 1 | Foundations | Not started |
| 2 | Greybox | Not started |
| 3 | Choreography | Not started |
| 4 | Interactions | Not started |
| 5 | Finish | Not started |
| 6 | Later | Not scheduled |

The order is chosen so that **the site is shippable at the end of every phase**. Phase 1 alone produces a complete, fast, plain site. Each later phase adds a layer on top without the layer below depending on it.

## Phase 1. Foundations

A working site with no 3D.

- Scaffold the stack in [ARCHITECTURE](ARCHITECTURE.md); record the installed versions there.
- Move the confirmed facts from [CONTENT](CONTENT.md) into typed modules in `src/content/`.
- Build the content layer: one section per beat, real copy, near-black, final type direction.
- Build the Index.
- Prerender so the HTML contains all content.
- Deploy to Vercel with preview deployments.
- Add a bundle-size check to CI.

**Done when:** the page is readable with JavaScript disabled; Lighthouse mobile performance is 95 or higher; Rahul has confirmed the facts in CONTENT.

## Phase 2. Greybox

Find the Machine. This is the creative risk of the whole project, so it comes early and stays rough. It follows rounds 1 to 4 of [DESIGN-PROCESS](DESIGN-PROCESS.md).

- Build the workbench: a development-only page with free camera and a control panel.
- Round 1, references: collect and narrow with Rahul.
- Round 2, silhouette: three different whole Machines in flat grey; Rahul picks.
- Round 3, parts: refine each of the four parts inside the chosen silhouette.
- Round 4, points: sample to a point cloud; tune density, size and brightness.
- Measure points and frame rate on real devices; set the tier point counts.

Rounds 5 (colour and type) and 6 (motion) happen in Phases 5 and 3, on the same workbench.

**Done when:** Rahul signs off the silhouette; the mid tier holds 60 fps and the low tier 30 fps with the Machine on screen; the shape is written back into [EXPERIENCE](EXPERIENCE.md).

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

1. **Design process:** is the workbench-and-rounds approach in [DESIGN-PROCESS](DESIGN-PROCESS.md) how you want to work ([D14](DECISIONS.md))?
2. **Workbench control panel:** which package? First check under [D13](DECISIONS.md), due at the start of Phase 2.

Content, in full in [CONTENT](CONTENT.md#needs-rahul):

3. Are the roles and dates current?
4. "Rahul Singh" or "Rahul" on the opening screen?
5. Which numbers can be stated, and what can be shown from each employer?
6. Which personal projects go in?

Practical:

7. **Reference devices:** which phone and which laptop should the budgets be tested on?
8. **Domain:** what will the site live at?
