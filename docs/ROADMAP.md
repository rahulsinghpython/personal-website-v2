# Roadmap

The authority on what is built and what comes next. Update the status table when a phase starts or finishes.

## Status

| Phase | Name | Status |
| --- | --- | --- |
| 0 | Direction | Done 2026-10-05. Docs written; concept, stack and principles accepted by Rahul. |
| 1 | Foundations | In progress since 2026-10-05. Built on 2026-10-05: facts confirmed by Rahul, content modules, content layer, the Index at `/plain`, prerendering. Readable with scripts blocked; Lighthouse mobile performance 100 on both pages, measured on a local production build. Left: deploy to Vercel (Rahul will say when), then re-measure on the deployed preview. |
| 2 | Greybox | Done 2026-10-07, begun 2026-10-05. Built: the bundle-size check and CI ([D19](DECISIONS.md)); the workbench, showing placeholder shapes ([D20](DECISIONS.md), [D21](DECISIONS.md)). Round 1 finished on 2026-10-06: nine references liked, outcome in [REFERENCES](REFERENCES.md), look drawn from computing hardware ([D22](DECISIONS.md)). Round 2 finished on 2026-10-06: Rahul signed off the silhouette, a hanging tiered rig with a small cube in gimbals on top ([D23](DECISIONS.md)). Round 3: each part now stands for a kind of work, with the company as small print ([D24](DECISIONS.md)); Round 3 finished on 2026-10-06: version 2 of all four parts ([D25](DECISIONS.md)). Small ambient motion is now allowed ([D26](DECISIONS.md)). Round 4 finished on 2026-10-07: the Machine as points, in a look between two of the three shown ([D27](DECISIONS.md), [D28](DECISIONS.md)). The scene chunk was measured with a throwaway build: 243.8 kB against a budget of 300 kB, raised to 400 kB the same day ([D29](DECISIONS.md), [PERFORMANCE](PERFORMANCE.md#the-bundle-check)). **Finished on 2026-10-07, with one criterion put off by Rahul:** frame rate was measured on the development machine only; the mid and low tiers move to Phase 5 ([D28](DECISIONS.md)). |
| 3 | Choreography | Done 2026-10-08, begun 2026-10-07. Built: the scene mounted on the home page through one lazy import; progress read from scroll and eased; rendering on demand; dust to dormant to awake in the vertex shader, per part; a camera pose per beat; the beads drifting once the Rings are awake; the workbench's story scrubber. GSAP's core only ([D30](DECISIONS.md)). Round 6 finished on 2026-10-08: Rahul scrolled it on his tablet, picked the second of two camera paths and kept the assembly as built ([D31](DECISIONS.md), [D35](DECISIONS.md)). The first-time-viewer test is Rahul's report of one showing. **Finished with device frame rates still unmeasured,** as Phase 2 left them. |
| 3b | The city | Direction accepted 2026-10-19 ([D38](DECISIONS.md)): the Machine gives way to a laser-scanned city round Marina Bay. Chosen from sketches (`workbench/city-sketches.html`). References marked 2026-10-20; the city is built from the map up ([D39](DECISIONS.md)). Layout greybox built on 2026-10-20 ([D40](DECISIONS.md)): Rahul kept the sketched layout and its camera; the city's story can be scrubbed on the workbench. The landmarks redrawn to read at a glance on 2026-10-24 ([D41](DECISIONS.md)), and the city drawn as points the same day, in the look of the sketch ([D42](DECISIONS.md)), with its traffic, river and train ([D43](DECISIONS.md)). Also on 2026-10-24 the home page drew the city for the first time, the opening restyled for it: the name crumbles into a haze that rains down onto the river and the bay ([D44](DECISIONS.md)). The words over the city the same day: every claim pinned to its proof, the copy leading with the work ([D45](DECISIONS.md)), the text held still and arriving with the camera ([D46](DECISIONS.md)). The Machine's code deleted on 2026-10-25 ([D50](DECISIONS.md)). **Finished on 2026-10-25, with frame cost unmeasured:** asked how the rain, the rise, the words' timing, the snap, the traffic and the density felt, Rahul said "I think all that is fine, I want to go to the next segment". Frames at rest and frame cost on his tablet move to Phase 5's device measuring ([D28](DECISIONS.md)). |
| 4 | Interactions | Begun 2026-10-08, paused 2026-10-19 until the city exists ([D38](DECISIONS.md)), resumed 2026-10-25. Built 2026-10-25: the Scanner sweep, the surface picked by Rahul from five ([D51](DECISIONS.md)). Built, first version: the pointer torch ([D36](DECISIONS.md)), which lights dust and so carries over. Built 2026-10-25, not yet tried by Rahul: the exhibit at `/exhibit`, the city to look round, and Contact opened in place from the header ([D48](DECISIONS.md)); the résumé page at `/resume`, showing Rahul's own PDF ([D49](DECISIONS.md)). Built 2026-10-26, not yet seen by Rahul: the Scanner's waiting beam and teaser ([D52](DECISIONS.md)); the first three easter eggs, the Merlion, the train and BLK 2024 ([D53](DECISIONS.md)). Built 2026-10-28: the other four, the otters, the cat, the Supertrees' light show, and the plane leaving Changi with the Core beat's last pin ([D54](DECISIONS.md)), all seven played on hover, with the cat and the otters made bigger once Rahul could not see them ([D55](DECISIONS.md)). Left: the Whole beat's interactions and project panels. |
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
- Done: round 2, silhouette. Signed off on 2026-10-06 ([D23](DECISIONS.md)); the shape was `src/experience/machine/machine.ts`, deleted on 2026-10-25 ([D50](DECISIONS.md)).
- Done: round 3, parts. Rahul picked version 2 of every part ([D25](DECISIONS.md)): open plates with a bundle of lines (Core), a drum in a fork with its fan of beams (Scanner), beaded rings (Rings), two gimbals and a bigger cube (Lens). The versions and silhouettes he passed over were removed from the code on 2026-10-06; they are in git history at `4393c8e`.
- Done: round 4, points. Sampling and the points material were `src/experience/machine/points.ts`, since deleted, ([D27](DECISIONS.md)). Three looks were shown side by side at desktop size and at phone size; Rahul picked a mix of two, which is `POINT_LOOK` in that file ([D28](DECISIONS.md)).
- Done on the development machine only: measure points and frame cost ([PERFORMANCE](PERFORMANCE.md#measured-on-the-development-machine)). Moved to Phase 5 by Rahul: measuring on a mid and a low device, and setting the tier point counts ([D28](DECISIONS.md)).
- Done: a throwaway build with the scene mounted lazily, to read the scene chunk's size ([D21](DECISIONS.md)). 243.8 kB without GSAP, against a budget that was 300 kB and is now 400 kB ([D29](DECISIONS.md)); reverted.

Rounds 5 (colour and type) and 6 (motion) happen in Phases 5 and 3, on the same workbench.

**Done when:** Rahul signs off the silhouette; the mid tier holds 60 fps and the low tier 30 fps with the Machine on screen; the shape is written back into [EXPERIENCE](EXPERIENCE.md).

**How it ended:** the silhouette was signed off ([D23](DECISIONS.md)) and the shape is in EXPERIENCE. The frame-rate criterion was not met and not failed: no mid or low device was measured, by Rahul's choice, and it is now a Phase 5 item ([D28](DECISIONS.md)).

## Phase 3. Choreography

Make scrolling build it.

- Done, first version: progress from scroll, eased; on-demand rendering.
- Done, first version: dust to dormant to awake in the vertex shader, per part.
- Done, first version: camera path through the eight beats, in step with the DOM sections.
- Done: scrolling back reverses everything exactly. Checked by scrolling away and back and comparing the camera.
- Done on 2026-10-08: round 6 of [DESIGN-PROCESS](DESIGN-PROCESS.md). Rahul scrolled it on his tablet. The camera path: the second of two, where the camera stays above the Machine and ends closer. The dust layout, assembly order and overlap, and easing: kept as built ([D35](DECISIONS.md)).
- Done: the shape was redrawn after outside feedback. Rahul picked the third of three on the workbench: every part on the rig's axis, solar panels on the top plate, the wide rings kept ([D32](DECISIONS.md)). The home page draws it, with a new camera pose for every beat.
- Done, as reported by Rahul on 2026-10-08: he showed it to someone. Asked whether they understood what the object was by the solar panels section, which is beat 3, his answer was "Yes the person could see it well". The chat did not see the showing and has nothing more exact than that. The same person's remarks on the shape led to the redraw ([D32](DECISIONS.md)).
- Built on 2026-10-08, not yet scrolled by Rahul: the opening line is centred and crumbles into the dust on the first scroll, after outside feedback ([D37](DECISIONS.md)). It reopens the opening that round 6 kept; `?words=0` shows the opening without it.
- Known and left for later: on a phone the text of the era beats covers the lower part of the Machine (spacing is Phase 5); the Lens beat's text touches the top of the rig on a wide window; React Three Fiber logs a three.js deprecation warning (`THREE.Clock`) to the console; nothing labels a part on the Machine itself yet.

**Done when:** a first-time viewer, unprompted, says what the object is by beat 3; zero frames render at rest; all runtime budgets in [PERFORMANCE](PERFORMANCE.md) hold.

**How it ended:** the viewer test is met on Rahul's word, above. Frames at rest were measured on 2026-10-07 ([PERFORMANCE](PERFORMANCE.md#measured-on-the-site-on-the-development-machine)): none before the Rings wake, and only the beads after; the render loop has not changed since. The runtime budgets were not met and not failed: frame cost was measured on the development machine only, and not again after the high tier was raised to four times the points ([D33](DECISIONS.md)), where the one check is Rahul's tablet, by eye. Device measurement is a Phase 5 item ([D28](DECISIONS.md)).

## Phase 3b. The city

Replace the Machine with the city ([D38](DECISIONS.md), [EXPERIENCE](EXPERIENCE.md#the-city)). The same process as Phase 2: rounds on the workbench, Rahul picks by looking.

- Done 2026-10-19: the direction, from four sketched directions and two rounds on the one picked.
- Done 2026-10-20: references, on `workbench/references-city.html`, outcome in [REFERENCES](REFERENCES.md#the-city). The landmarks are settled, Pinnacle@Duxton joins them, no scan look was picked, and from that the city is built from the map up ([D39](DECISIONS.md)). The Science Centre's shape is taken from the mesh image in the old site's assets (Etavolt). Its look is not: Rahul, on 2026-10-20, "I think my mesh looks quite bad, we can do a better one now". How the scanned surface is drawn is a round of its own, and it should still read as rebuilt from a scan, points closing into faces, not as a polished render.
- Done 2026-10-20: the layout as a greybox on the workbench: the water, the landmarks, the CBD, the heartland ([D40](DECISIONS.md)). The city has its own code in `src/experience/city/`, and the workbench switches between it and the Machine. Rahul kept the sketched layout over one true to the map: the experience matters more than accuracy. Measured on the development machine: 10 draw calls, 14,000 triangles, about 0.1 ms of GPU a frame, no frames at rest.
- Built 2026-10-20, not yet scrubbed by Rahul: the city's story on the workbench, with the sketch's camera, the map landing and the city rising building by building ([D40](DECISIONS.md)). `/workbench/?view=story&beat=1.5`, then drag the beat.
- Built 2026-10-24: the landmarks, each recognisable at the size the camera sees it ([D41](DECISIONS.md)). Judged in the story's own views, not in close-ups. Rahul has seen them as points; the Esplanade and the Merlion were redrawn from what he said, and await his look.
- Done 2026-10-24: the city as points, in the sketch's look, windows in the dark, picked by Rahul from three, and lit and dimmed by beat ([D42](DECISIONS.md)). The Esplanade and the Merlion redrawn once seen as points. `/workbench/?view=story&beat=4&draw=points`.
- Built 2026-10-24, not yet seen moving by Rahul: the traffic, the river as streams of light and the train, moving mostly with the scroll and a little on their own ([D43](DECISIONS.md)).
- Density, size and how cold the city is against what is lit, by eye, measured on Rahul's tablet, since a city fills the window on every beat.
- Built 2026-10-24, not yet scrolled by Rahul: the choreography on the home page, the opening as rain onto the river and the bay, then each job lighting up, with the sketch's calm camera ([D44](DECISIONS.md)). Rahul scrolls it, on his tablet too.
- Done 2026-10-24: how the words sit over the city. Every claim pinned to its proof, picked by Rahul from three systems, and the copy rewritten to lead with the work, in the content layer and the Index alike ([D45](DECISIONS.md)). The text held still and swapped with the camera instead of scrolling, each claim arriving with its pin ([D46](DECISIONS.md)); its timing waits for Rahul to scroll it. Left: the plane from Changi, which gives the Core's fifth claim its pin.
- Done 2026-10-24: the city replaces the Machine on the home page ([D44](DECISIONS.md)).
- Done 2026-10-25: the Machine's code deleted, with the workbench's `machine` world and GSAP, at Rahul's word before he had scrolled the city ([D50](DECISIONS.md)).

**Done when:** the home page draws the city; Rahul has scrolled it on his tablet; frames at rest and frame cost are measured there.

## Phase 4. Interactions

The first-release interactions from [EXPERIENCE](EXPERIENCE.md#interactions).

- Built, first version, not yet tried by Rahul: pointer torch on the dust ([D36](DECISIONS.md)).
- Done 2026-10-25, not yet swept by Rahul on a device: the Scanner sweep ([D51](DECISIONS.md)). A mouse over the Science Centre, or a finger dragged sideways across it, aims a beam; where it has passed, the points grow into tiles of surface with the rebuilt mesh's lines over them, and once a roof is rebuilt its solar panels go on. Away from the beat it is points again. Picked by Rahul from five recorded looks. Built 2026-10-26, not yet seen by Rahul on a device: the beam waits dim at the building's edge, and once per visit, a moment after the visitor stops at the beat, slides two-fifths across and back, the strip it passes starting to close and falling back to points ([D52](DECISIONS.md)).
- Easter eggs: the Merlion, the train and `BLK 2024` from the sketch, built 2026-10-26, not yet seen by Rahul ([D53](DECISIONS.md)); the otters, the cat on the void deck, the Supertrees' light show and the plane from Changi, picked by Rahul on 2026-10-20 ([EXPERIENCE](EXPERIENCE.md#easter-eggs)), built 2026-10-28, not yet seen by Rahul ([D54](DECISIONS.md)).
- Whole beat: what the visitor can do now there is no object to turn; click a subject to open it; project panels.

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

Copy: answered on 2026-10-24. The content layer and the Index lead with the work, the company and role in small print, as the city does ([D24](DECISIONS.md), [CONTENT](CONTENT.md#confirmed-with-rahul)). The rewrite is in Phase 3b, with how the words sit over the city.

Content: roles and dates, the opening name, the numbers, what can be named, personal projects, location and title were answered on 2026-10-05 ([CONTENT](CONTENT.md#confirmed-with-rahul), [D15](DECISIONS.md)). Still open, in [CONTENT](CONTENT.md#still-needs-rahul):

3. Which screenshots and video can be shown from each employer? Answered on 2026-10-08: everything the old site showed ([CONTENT](CONTENT.md#projects)).
4. Is the LinkedIn URL carried over from the old site still right? Answered on 2026-10-24: yes.

Practical:

5. **The Science Centre:** answered on 2026-10-20. Rahul could not find the project's own files, but the old site has the mesh as an image, `src/assets/carousel/etavolt/mesh_contruction_science_centre.jpg`, cleared in [CONTENT](CONTENT.md#projects). That is enough to draw it from.
6. **Easter eggs:** answered on 2026-10-20. Beyond the three in the sketch: the otters, the cat on the void deck, the Supertrees' light show and the plane from Changi ([EXPERIENCE](EXPERIENCE.md#easter-eggs)).
7. **Reference devices:** which phone and which laptop should the budgets be tested on? Put off by Rahul on 2026-10-07 ([D28](DECISIONS.md)); needed by Phase 5.
8. **Domain:** what will the site live at?
