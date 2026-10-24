# Decisions

What has been decided, why, and what was passed over. Read this before proposing a different approach. To change a decision, add a new entry that supersedes the old one; do not edit history.

**Accepted** means Rahul set or confirmed it. **Proposed** means a chat put it forward and it is the working assumption until Rahul says otherwise.

D3 to D5 and D7 to D11 were proposed in the documentation pass on 2026-10-05 and accepted by Rahul the same day. D14 was proposed in that pass and accepted at the start of Phase 2, also on 2026-10-05.

---

### D1. Documentation before code — Accepted, 2026-10-05

Work on this repo happens across many separate chats. Without shared direction each would build its own idea of the site. So the direction is written down first and the docs are the source of truth.

### D2. The whole site is one object — Accepted, 2026-10-05

Rahul's direction: a single strange object in the dark, dormant at first, which the visitor comes to understand is Rahul's whole career. Projects are parts of it, not cards. One object is memorable, gives the site a point of view, and keeps the scene small.

### D3. The Machine is drawn as a point cloud — Accepted, 2026-10-05

**Why:** at Etavolt, Rahul built software that turns LiDAR point clouds into meshes. A Machine that begins as scattered points and reconstructs itself demonstrates that work instead of describing it. Points are also the cheapest thing a GPU draws, they need no lighting or textures, and a scatter of points in the dark is naturally mysterious, which serves the opening.

**Passed over:** a polished, lit, textured model (needs an artist, heavy to load, looks like every other 3D portfolio); an abstract blob or shader sphere (means nothing, which Rahul ruled out).

### D4. Geometry is procedural — Accepted, 2026-10-05

**Why:** the reference site was made by a studio with 3D artists. This one is made by one engineer. If the look depends on a hand-modelled asset, the project stalls waiting for one. Shapes built in code can be changed in minutes, cost no download, and suit the point-cloud look.

**Passed over:** a Blender-modelled glTF. Can be revisited later for a single part if code cannot get the shape right, with a new decision.

### D5. Four parts, one per career era, assembled chronologically — Accepted, 2026-10-05

Core (S2T), Scanner (Etavolt), Rings (Uniad), Lens (Cognizant). Each part's function echoes that era's work. Chronological assembly means scrolling the page is watching the career get built. If a fifth era appears, it becomes a fifth part.

**Open within this:** the exact silhouette. Settled in the greybox phase.

### D6. Motion only in response to input; render on demand — Accepted, 2026-10-05

Rahul's direction: "the 3D doesn't constantly move; the user causes meaningful changes." Made strict here: no idle animation at all, settle within about 1.5 seconds, then the canvas stops drawing. Besides making each change feel earned, this means an idle page uses no GPU, which is the largest single performance win available.

**Passed over:** a subtle idle shimmer. It would force continuous rendering for little gain. Can be revisited as a high-tier-only extra.

### D7. Content is HTML first; the Index exists — Accepted, 2026-10-05

**Why:** a recruiter with thirty seconds on a phone must not have to play with a 3D object to find a job title. Real HTML also gives search engines, screen readers and no-WebGL devices a complete page for free. The Index and the main experience read the same content data so they cannot drift apart.

### D8. Native scroll, no smooth-scroll library — Accepted, 2026-10-05

**Why:** the page scrolls exactly as the visitor's device scrolls. Smoothness comes from the Machine easing toward the scroll position, not from intercepting the scroll. This avoids the accessibility and "the page feels broken" problems of scroll-jacking and removes a dependency.

**Passed over:** Lenis or similar. Reconsider only if native scroll plus easing demonstrably feels worse on real devices.

### D9. Stack: Vite, React, TypeScript, React Three Fiber, zustand, GSAP, Tailwind, Vercel — Accepted, 2026-10-05

**Why:** it is what Rahul already ships with, so there is nothing new to learn except the scene itself. R3F lets the DOM and the scene share one state model.

**Passed over:** Next.js (server features this site does not need); Astro (good for static content, but the DOM and the scene share state closely enough that the page would end up as one React island anyway); Webflow, as the reference site uses (Rahul is an engineer and the scene is custom code).

**Constraint that comes with it:** a plain Vite React app renders nothing without JavaScript, so the content layer must be prerendered into the HTML at build time. See [ARCHITECTURE](ARCHITECTURE.md#two-layers).

### D10. No audio and no post-processing in the first release — Accepted, 2026-10-05

Both are easy to add later and easy to get wrong. Sound needs consent UI; bloom is costly on phones and the look can be reached with additive blending.

### D11. Colour means state — Accepted, 2026-10-05

Cold off-white for dormant, one warm accent for awake. Working accent is amber. One accent only, so that colour always tells the visitor something. The exact values are open.

### D12. The old site is a source of facts only — Accepted, 2026-10-05

Rahul: v1 is very old and much of it is broken; it is useful for the experiences only. Nothing is ported from `../personal-website`: not its stack (Ant Design, Aceternity-style components), not its layout, not its copy. Its facts were transcribed into [CONTENT](CONTENT.md) and are unconfirmed until Rahul reviews them.

### D13. Prefer an existing package; check with Rahul first — Accepted, 2026-10-05

Rahul: chats should check in when a good npm package solves the problem, so we do not reinvent the wheel.

**How to apply:** before writing a general-purpose mechanism (easing, scroll progress, device tier detection, surface sampling, gesture handling, prerendering and the like), look for a maintained package. Bring Rahul the candidate with: what it replaces, its gzipped size against the [PERFORMANCE](PERFORMANCE.md) budget, whether it tree-shakes, and how actively it is maintained. Rahul decides. Record the outcome here or in the stack table in [ARCHITECTURE](ARCHITECTURE.md).

**What this does not cover:** the Machine itself. Its shapes, shaders and choreography are the site's identity and are written here. A package that supplies a ready-made look (a particle preset, a prebuilt 3D hero) is not a wheel we are reinventing; it is the template we are avoiding.

**Earlier entries that ruled a package out** (D8 on smooth-scroll, D10 on post-processing) are about the behaviour, not about avoiding dependencies. They stand unless Rahul reopens them.

### D14. Design happens in the browser, on a workbench — Accepted, 2026-10-05

**Why:** there is no designer or 3D artist, and a procedural object cannot be mocked up in a design tool anyway. So the design tool is a development-only page where the Machine is live and every parameter is a slider. Decisions are made by looking at real output and picking between two or three built options, in a fixed order: references, silhouette, parts, points, colour and type, motion. Full process in [DESIGN-PROCESS](DESIGN-PROCESS.md).

**Passed over:** designing in Figma or Blender first (a second tool to learn, and the result would still have to be rebuilt in code); writing a detailed visual spec up front (nobody can judge a shape from prose).

### D15. Content confirmed; percentages dropped — Accepted, 2026-10-05

Rahul went through the open questions in [CONTENT](CONTENT.md#confirmed-with-rahul). What that settled:

- **Roles and dates stand.** Uniad and Cognizant are both current and concurrent.
- **Only two figures are stated:** 10,000+ requests per second (S2T) and 10,000+ users across Asia (Uniad). The old site's four percentage claims are dropped because they have no baseline or unit and Rahul does not stand behind them.
- **The opening screen says "Rahul"**, not "Rahul Singh". The full name stays in the page title, the Index and contact.
- **Title is "Software Engineer / AI Engineer".** It replaces the old site's "Software Engineer / Data Engineer"; data engineering still shows in the S2T era, where that title was held.
- **Singapore is stated; availability is not mentioned.**
- **No personal projects in this release.** Rollcall stays off the site.
- **May be named in text:** solar and the Science Centre mesh (Etavolt), GovTech and MDDI (Cognizant), Uniad's three supporters.
- **Wording is free, facts are not.** Rahul: no need to fixate on the old text; be creative. Copy is rewritten within the voice rules using only confirmed facts.

**Still open:** which screenshots and video can be shown. Not needed before Phase 4.

### D16. Prerender with vite-prerender-plugin — Accepted, 2026-10-05

The first package brought to Rahul under D13. It fills the gap D9 left open: a Vite React app has no HTML without JavaScript.

**Why:** it is a build-time dev dependency, so it ships 0 KB. It is small (36 KB unpacked, six small dependencies), maintained in the Preact organisation (24 releases since February 2024, 0.5.14 on 2026-09-26) and its peer range includes Vite 8. It is framework-agnostic: we supply a short `prerender()` that calls `react-dom/server`, which was already installed. How it is wired is in [ARCHITECTURE](ARCHITECTURE.md#two-layers).

**Passed over:** `vite-react-ssg` (requires `react-router-dom`, pulls in jsdom); `vike` (a whole framework, 1.7 MB unpacked, restructures the project); `@prerenderer/rollup-plugin` (drives Puppeteer, last published May 2024, no Vite 8 peer); a hand-written script on Vite's SSR build (about 40 lines, but a mechanism we would own).

**Known costs:** it is pre-1.0 with one maintainer. The build emits the `react-dom/server` chunk into `dist/assets/` even though no page requests it. If either becomes a problem, the hand-written script is the fallback.

### D17. The Index is its own page at /plain; no router; the story hydrates — Accepted, 2026-10-05

**The Index is a second prerendered page,** not a view toggled on the home page. It can then never load the scene, it has its own URL to send to a recruiter, and its content is not duplicated in the home page's DOM. It lives at `/plain` because `/index` collides with the home page's file name. The visible label stays `INDEX`.

**No router package.** Two static pages need a path check, not a router. Reconsider if the site ever has client-side navigation between views that share state.

**React hydrates in Phase 1 even though nothing is interactive yet.** This costs about 72 KB gzipped of the 100 KB critical-path budget (the whole critical path measures 77 KB). It was chosen so that Phase 2 can attach the scene without restructuring. **Passed over:** shipping no JavaScript until Phase 2.

### D18. The CI bundle-size check moves to the start of Phase 2 — Accepted, 2026-10-05

It was listed under Phase 1. Rahul agreed to add it just before three.js is installed instead.

**Why:** the check exists to catch dependencies inflating the bundle, and Phase 1 adds none. The critical path measures 77 KB against a 100 KB budget, so nothing is about to break. Phase 2 is where three.js, React Three Fiber and drei arrive and where the scene chunk's 300 KB budget first applies.

**Still to decide then, under D13:** a package such as `size-limit`, or a short script over the build output.

### D19. The bundle check is a script, and it is a tripwire, not the performance gate — Accepted, 2026-10-05

Settles what D18 left open.

**The check is `scripts/check-size.mjs`,** with no dependencies. It runs at the end of `pnpm build`, so a build over budget fails locally, in CI and on the host alike. `.github/workflows/ci.yml` runs typecheck, lint and the build on every push to `main`. Because pushes go straight to `main`, CI marks the commit red after it lands; it does not reject the push.

**Why a script and not `size-limit`:** the budgets are sums over what a page loads, not limits on named files. `size-limit` picks files by filename glob, so three.js arriving in a new shared chunk that `index.html` preloads would match no glob and pass. The script reads each built HTML page for the files it references and Vite's manifest for what those import, so it measures what the browser is told to load. It also fails on any file in `dist/` that no budget covers, which is how a development-only page leaking into the production build would be caught. The measuring itself is a few lines of zlib; the package would not have saved the part that matters.

**What it is for:** one mistake, three.js or the scene landing in the critical path so the opening text waits for it. Whether the scene chunk is 260 or 320 KB is not something a visitor feels.

**What it is not:** a measure of how the site runs. Rahul: performance does not just mean network. This site's performance is decided at runtime: fill rate from overlapping additive point sprites (which grows with point size and pixel ratio, not point count), main-thread work when the scene attaches (evaluating three.js, sampling points, compiling shaders), frames rendered at rest, draw calls. Those are measured on the workbench, in a real Chrome driven through the Chrome DevTools MCP. See [PERFORMANCE](PERFORMANCE.md#measuring).

**Passed over:** `size-limit` with `@size-limit/file` (above); a Lighthouse gate in CI (Rahul: not needed; Lighthouse stays a manual end-of-phase measurement); gating frame rate in CI (runners have no GPU).

**Known cost:** `build.manifest` is on, so `dist/.vite/manifest.json` is deployed with the site. No page requests it.

### D20. The workbench control panel is Tweakpane — Accepted, 2026-10-05

Brought to Rahul under D13. It replaces a hand-built panel of sliders, folders and readouts. It is used only on the workbench, so it ships 0 KB; the bundle check fails if it ever reaches the production build.

**Why:** it edits a plain object that we own, so the panel is only a view of the Machine's parameters. The same object can be set from the Chrome DevTools MCP for screenshots and benchmarks, and the chosen values can be copied into the code as they are. Tabs (for the A, B, C variant switch) and graphed readouts (for frame cost and draw calls) are built in. It has no dependencies.

**Passed over:** Leva (keeps the values in its own store behind a React hook, so the scene would depend on a dev tool's state; 11 dependencies, one of them the archived Stitches); lil-gui (the same plain-object model and a more recent release, but no tabs and no graphed readouts, which would have to be hand-built).

**Known cost:** the last release, 4.0.5, was in November 2024. It has no dependencies and touches only the DOM, so the risk is judged low for a tool that never ships. lil-gui is the fallback.

### D21. The workbench lives outside `src/`, and three.js is fenced in by lint — Accepted, 2026-10-05

Rahul approved the plan before the workbench was written. What it settled:

- **The workbench is `workbench/` at the repo root, with its own HTML entry.** It is kept out of the production build by not being an input to it, not by a development-only branch that tree-shaking has to remove. `src/` is what ships; `workbench/` is the tool. **Passed over:** a `/workbench` route inside the app behind `import.meta.env.DEV`, which would put dev-only code one mistake away from the entry chunk and from prerendering.
- **The rule in ARCHITECTURE changes** from "`src/experience/` is the only place allowed to import three.js" to "`src/experience/` and `workbench/`". oxlint now enforces it.
- **zustand is installed now, not in Phase 3.** The workbench needs state that the panel, the viewports and the Chrome DevTools MCP all set. It was already the accepted choice (D9).
- **The frame-cost readout and the benchmark are our own code** (`workbench/stats.ts`), over three.js's render info and the GPU timer-query extension. **Passed over:** drei's `StatsGl` overlay, which draws its own panel and does not hand its numbers to a benchmark.
- **Tailwind looks for class names in `src/` only, and not in `src/experience/`.** By default it scans the whole repo, and words in docs, scripts and the Machine's code (`ring`, `grid`, `relative`) became rules in the shipped CSS.
- **The scene does not attach to the page in Phase 2.** The production build contains no three.js until Phase 3, so the Phase 1 pages are unchanged. The scene chunk's size is measured once at the end of Phase 2 with a throwaway build.

### D22. The Machine's look comes from computing hardware first — Accepted, 2026-10-06

Rahul's direction, given in round 1. The first batch of references followed the list in DESIGN-PROCESS and was all scientific instruments: armillary spheres, orreries, lenses, spacecraft. Rahul: he is a software person, the list was too "sciency", and the references should be tech: computers, wires, quantum machines.

**What changes:** the visual vocabulary. The Machine should look like it belongs to computing (racks, wiring, storage, a quantum rig) more than to an observatory. DESIGN-PROCESS now says to look at computing hardware first. A second batch of references was collected in [REFERENCES](REFERENCES.md).

**What does not change:** one object, four parts, the era each part stands for, drawn as points (D2, D3, D5). The four likes from the first batch (orrery, Cassini, turbofan, gimbal) still stand as taste: things that could move, subsystems on one body, a machine recognised at a glance, rings inside rings.

**A limit that comes with it:** borrowing the look of a quantum computer or a supercomputer must not imply Rahul worked on one. The parts stand for the eras in CONTENT and nothing else (rule 6).

**Also in this round:** references are shown as pictures on a development-only page, `workbench/references.html`, because a list of links asked Rahul to imagine the images. The pictures load from Wikimedia and are not stored in the repo.

### D23. The silhouette: a hanging tiered rig with a small cube in gimbals on top — Accepted, 2026-10-06

Rahul's sign-off for round 2. The shape is described in [EXPERIENCE](EXPERIENCE.md#the-shape).

**How it was reached.** Round 1 ended with nine references liked and five words: futuristic, nested, wired, kinetic, dense ([REFERENCES](REFERENCES.md)). Three silhouettes were built from them: A, a cube of cubes in gimbal rings; B, a tiered rig that hangs, after the inside of a quantum computer; C, a cable cut open. Rahul liked A and B together. A first mix hung a large cube in gimbals under B's tiers; he preferred B kept whole with A as a much smaller piece on top. That is the shape signed off. His words: "Nice nice looks quite good."

**A rule that came out of it: nothing is bolted onto a ring that turns.** On A, the Scanner rode the outer gimbal ring and the Lens stuck out from it. Rahul: the gimbal rings are good, but putting things on them breaks physics. So the gimbal is built the way a real one is: the outer ring on one pin, each ring pivoted inside the next, the cube on an axle through the innermost. This holds for any later version of the Rings.

**Passed over:** A on its own; the cable, cut open (the only one where fibres visibly ran from the Core into the Lens, which is worth remembering for round 3); the first mix, with the cube in gimbals as the large lower half.

**Still open:** which of the four parts the crown belongs to, and each part's detail. Round 3.

### D24. A part stands for a kind of work; the company is small print — Accepted, 2026-10-06

Rahul's direction at the start of round 3. It changes the emphasis of D5, which tied each part to a career era named by its employer.

**Why:** asked which employer the crown should stand for, Rahul questioned why the company was getting so much weight. His answer: the company can be small print, and the focus should be on the work.

**What changes:**

- Each part is defined by the work: data pipelines (Core), turning LiDAR point clouds into 3D models (Scanner), scheduling (Rings), LLM analytics (Lens). A label on the Machine leads with the work; the company and years sit beside it in small print.
- A piece of the shape is given to a part by what it looks like it does, not by argument about an employer. The tiers with lines running through them and the tip are the Core; the arm is the Scanner; the orbit rings are the Rings; the cube in gimbals on top is the Lens.
- Every part is one connected piece. Before this, the cube counted as Core and its gimbals as Rings, which split two parts across the Machine.

**What does not change:** four parts, in the order Rahul came to the work, which is still the order of the career (D5). The part names stay as handles in code and docs even though the Lens is no longer lens-shaped; no visitor sees them. No fact changes: employers, years and roles are as in CONTENT.

**Not done here:** the content layer and the Index still lead with company and role. Rewriting that copy to lead with the work is its own piece of work, listed in [ROADMAP](ROADMAP.md).

### D25. Round 3: version 2 of every part; the beads are the things being scheduled — Accepted, 2026-10-06

Three versions of each part were built inside the signed-off silhouette. Rahul picked version 2 of all four:

- **Core:** plates open in the middle, with the lines dropping straight through them as one bundle into a nozzle.
- **Scanner:** a drum held in a fork at the end of the arm, drawn with the fan of beams it sweeps.
- **Rings:** each orbit ring on three spokes, carrying a row of beads, more of them the wider the ring.
- **Lens:** the crown with two gimbal rings and a bigger cube, so it still reads at its small size.

**The beads.** Rahul asked whether the beads could be skills, rotating around. Decided against, on the chat's advice and with his agreement: tech names on floating balls is the best-known feature of 3D portfolio templates; VISION lists a skills section as an anti-goal and CONTENT says a technology is mentioned only beside the work that used it; and the rings already stand for scheduling. The beads are the things being scheduled. They slide round their rings and settle into even spacing. Technologies stay in the text beside the work that used them.

**Passed over:** version 1 (as signed off in round 2) and version 3 of each part; skills on the beads, with names at the edge of the screen and the matching bead lighting on hover.

### D26. Small ambient motion is allowed — Accepted, 2026-10-06

Rahul's direction. It relaxes D6, which allowed no motion at all without input.

**Why:** Rahul: "nothing moves unless the visitor moves it" is too strict; small animations can enhance the product. The beads drifting round their rings is the first case.

**The rule now:**

- Small, slow motion with no input is allowed where it adds to a part's meaning.
- The story still advances only when the visitor scrolls. Ambient motion never assembles a part, wakes one, or moves the camera.
- It is done in the shader, with no per-point work in JavaScript.
- It pauses when the tab is hidden, when the canvas is off screen, and when the system asks for reduced motion. It is off on the low tier.

**What it costs.** D6 called drawing nothing at rest the largest performance win available, and that is given up on the high and mid tiers while the Machine is on screen. The guardrails above keep the rest. The "frames at rest: 0" budget in PERFORMANCE changes with this; the idle frame rate gets a cap when it is first measured, in Phase 3.

**Still ruled out:** motion as decoration. Floating blobs, an auto-rotating Machine, parallax on everything.

### D27. Points are sized as part of the Machine, and packed closer on thin pieces — Proposed, 2026-10-06

Two changes a chat made to round 4 before showing it to Rahul, after screenshotting the first version and finding it failed the round's own test.

**A point's size is in the Machine's units, not in pixels.** The first version drew every point a fixed number of CSS pixels wide. On a phone the Machine is drawn about half as wide as on a monitor, so the same points sat twice as close together, and with the low tier's boost on top the cube and the plates were solid white. The test for the round is "still reads at low-tier point counts on a phone", and it did not. Now a point is a fixed fraction of the Machine, so every screen shows the same picture at a different scale. A point that would be narrower than a pixel is drawn one pixel wide and dimmer by the area it gained.

**Points are packed closer the thinner a piece is.** By area alone the five plates take most of the points and read as flat static, and the bundle of lines through them, which is what makes the Core look like a pipeline, could not be seen. Each piece's thickness is taken as its surface area over its longest side, which for a rod or a ring comes out in proportion to its radius whatever its length. One number, `thin`, sets how strongly thin pieces are favoured. The share per part from the first version stays, as a second, coarser control.

**Passed over:** lifting each piece by its total area (tried first: a short spoke came out brighter than a long one of the same radius); a size that follows the window only part of the way (the picture would still differ between screens); leaving both alone and tuning brightness down (the phone and the monitor cannot both be right with one value).

**What it costs:** on a large monitor each point covers more pixels than before, so the picture is softer there than fixed-size points would be. Sampling makes one sampler per piece instead of one per part; on the development machine it measured about 40 ms for 150,000 points, against 61 ms recorded for the first version in an earlier session, so it is no slower (see [PERFORMANCE](PERFORMANCE.md#measured-on-the-development-machine)).

**Still Rahul's:** which look, or which numbers. Three are on the workbench: fine and even, balanced, and line-led. Settled in D28.

### D28. Round 4: a mix of looks 2 and 3; device measurement is put off — Accepted, 2026-10-07

Rahul's pick, and his direction on measuring: "a mix of 2 and 3, for now just benchmark on mine, we'll worry about lower devices later."

**The look.** Three were shown side by side, at desktop size and at phone size:

| | Density | Size | Brightness | Boost | Thin | Shares: core, scanner, rings, lens |
| --- | --- | --- | --- | --- | --- | --- |
| 1, Haze: small dim points, the plates a soft fog | 1 | 0.009 | 0.45 | 0.35 | 0.25 | 1, 1.5, 2.2, 1 |
| 2, Scan: the plates and the lines in balance | 1 | 0.012 | 0.42 | 0.35 | 0.5 | 1, 1, 2, 0.8 |
| 3, Wire: fewer points, the lines and rings lead | 0.5 | 0.013 | 0.42 | 0.35 | 0.7 | 1, 1, 2, 0.7 |
| **Chosen: between 2 and 3** | 0.75 | 0.013 | 0.42 | 0.35 | 0.6 | 1, 1, 2, 0.75 |

The chosen row is halfway between 2 and 3, worked out by the chat; Rahul asked for a mix and did not give numbers. It is `POINT_LOOK` in `src/experience/machine/points.ts` and what the workbench sliders start from. The pick was made on top of D27's two changes, which Rahul was told about and did not question. The three looks are no longer in the code; any of them can be seen again by putting its row in the workbench URL as `pts=`.

**Measuring.** The phase was meant to end with the mid tier holding 60 fps and the low tier 30 fps on real devices. Rahul put that off: the greybox phase is measured on the development machine only, and lower devices are dealt with later. So:

- The tier point counts in PERFORMANCE stay starting guesses. They are set in Phase 5, with real-device testing.
- Whether sampling has to move to build time or a worker is decided then too. It cannot be judged on a fast CPU.
- The reference devices are still not named.

**What was measured** is in [PERFORMANCE](PERFORMANCE.md#measured-on-the-development-machine): on Rahul's machine every tier's settings cost under 1 ms of GPU time a frame at the median, in one draw call, with nothing drawn at rest.

**The risk taken on:** Phase 3 builds the choreography without knowing what a phone can hold. If the low tier turns out to need far fewer points, the look at that count has not been seen on a real phone, only at phone size on a monitor.

### D29. The scene chunk's budget is 400 kB, not 300 — Accepted, 2026-10-07

Rahul, before Phase 3 started: "300 kb is way too small of a budget." A chat measured what Phase 3 would add and offered 350, 400, 500 or leaving it; Rahul picked 400. This supersedes the 300 kB figure that D18 mentions.

**Why 300 was wrong.** It was set before any code existed. The throwaway build at the end of Phase 2 measured the scene chunk at 243.8 kB, most of it three.js and React Three Fiber, which our code cannot shrink. GSAP 3.15.0, gzipped from the minified files in its npm package without installing it, is 28.4 kB for the core and 18.0 kB for ScrollTrigger. With both, the chunk is about 290 kB before any choreography code, any Phase 4 interaction, any drei helper or tier detection. The budget was governing about 10 kB.

**Why 400.** It leaves about 110 kB after GSAP and ScrollTrigger, and about 128 kB if ScrollTrigger turns out not to be needed. That is room for Phases 3 to 5 without the number being argued over at every step, and the check still trips if something large arrives by accident, such as all of drei or a post-processing library.

**What it costs.** The scene chunk loads after first paint, so a larger one delays the Machine appearing, not the opening text. On Lighthouse's mobile preset (1.6 Mbps) each 100 kB is about half a second. Evaluating more script when the scene attaches is main-thread work, which is measured as long tasks on the built site in Phase 3 ([PERFORMANCE](PERFORMANCE.md#measured-on-the-development-machine)).

**What does not change.** The critical path stays at 100 kB and the whole experience at 1 MB. LCP, CLS and the Lighthouse score keep their budgets, and those are what a visitor feels. D19 still holds: the check is a tripwire, not the performance gate. D13 still holds: GSAP, and ScrollTrigger if it is wanted, are brought to Rahul with these sizes before they are installed. This entry raises a limit; it approves no package.

**Passed over:** 350 kB (enough for Phase 3, likely to need raising again in Phase 4); 500 kB (a tripwire that loose would not catch a leaked library, and the Machine could arrive about a second later on a slow connection); keeping 300 kB and reading scroll progress without ScrollTrigger (still leaves under 30 kB for everything after GSAP's core).

### D30. GSAP's core only: no ScrollTrigger, no CSS plugin — Accepted, 2026-10-07

Brought to Rahul under D13 with the sizes in D29; he said yes to installing the core alone.

**What is used.** gsap 3.15.0, imported as `gsap/gsap-core`. The story is one paused timeline, and the frame loop sets its position from eased progress. Importing `gsap` itself would also register its plugin for animating CSS, which nothing here needs: everything on the timeline is a number on a plain object that the frame loop copies into shader uniforms and the camera.

**Why not ScrollTrigger.** It is 18 kB gzipped for pinning, scrubbing and scroll-linked triggers. The page scrolls natively (D8), nothing is pinned, and progress is read from the scroll position in a few lines (`src/state/progress.ts`). Add it only if a later beat needs something those lines cannot do.

**What it cost.** The scene chunk went from 243.8 kB to 265.0 kB with the core and all of the first choreography.

**One thing to know.** Moving the timeline wakes gsap's own ticker, which then runs for about two seconds before sleeping again. So the timeline is not touched on a frame where progress has not changed, or the ticker would never sleep while the beads drift.

### D31. The first choreography — Accepted as built on 2026-10-08, the camera path apart (D35)

What a chat built on 2026-10-07 so that there was something to scroll, written down then as open choices. Rahul has since scrolled it on his tablet and asked for no change to the assembly (D35).

**Gather, then lock.** EXPERIENCE says a silhouette forms at Signal and also that each part assembles in its own beat. Both are kept by giving assembly two stages. At Signal every part's dust gathers to a loose silhouette, each point still a little way back toward where it was as dust. In its own beat a part locks, closing the rest of the way, and then wakes from the top down. A part that has not had its beat reads as haze beside the sharp ones. **Passed over:** assembling everything exactly at Signal (the later beats would have nothing to do but change colour); leaving the later parts as dust until their beat (no silhouette at Signal).

**Changed the same day, at Rahul's asking:** a part no longer locks and then wakes in a sweep from its top down. He asked for the colour to arrive the way the cloud turns into the shape, so each point turns to the accent as it lands, in its own time. The top-down order is still worked out for every point (`aOrder`) but not used; it goes if this stays. It stayed, and `aOrder` was removed on 2026-10-08.

**Dust is a ball of random points** about nine units across, and which dust point becomes which point of the Machine is random too. **Not tried yet:** dust that keeps some of the Machine's structure, like an exploded view.

**Progress is measured against the sections,** not taken as scroll position over page height. See ARCHITECTURE. It makes no difference on a desktop, where every section is one window tall.

**The Machine is drawn off centre,** to the right in a wide window and upward in a tall one, by sliding the camera's view and not by turning it. The field of view is 30 degrees across the shorter side, as on the workbench.

**The beads drift only once the Rings are awake,** at up to 0.06 radians a second, neighbouring rings in opposite directions. The rate is capped at 30 frames a second. This sets the cap that D26 left to Phase 3. Nothing is drawn at rest before the Rings beat.

**The scene catches up with the scroll position** by closing about two thirds of the gap every 0.22 seconds (0.4 since D47), and stops drawing when the gap can no longer be seen.

**The awake colour is a placeholder amber,** `#ffa726`, and an awake point is a quarter brighter than a dormant one. Round 5 picks the accent.

**The tier is guessed:** a phone is mid, anything else is high, nothing is low, and `?tier=` in the address sets it by hand. Detection is Phase 5. At first every touch device was mid. On 2026-10-08 Rahul found the Machine grainy and sparse on his tablet, a Samsung Galaxy Tab FE, tried `?tier=high`, and reported that it looked better and did not lag. So a touch screen at least 600 CSS pixels across its shorter side is now high. That is one tablet judged by eye, not a measurement.

**Reduced motion is honoured now,** in the plain form ARCHITECTURE describes, because shipping the animation without it would be worse than shipping it early.

### D32. The shape is redrawn: every part on the rig's axis, solar panels on the roof — Accepted, 2026-10-07

Reopens the shape signed off in D23 and D25. Three shapes were on the workbench: A, the one signed off; B, with every part moved onto the rig's axis; and C, which is B with A's wide rings. Rahul picked C, from a tablet. The home page draws it. His words: "yes C is nice". The motion is still unsettled (D31), and he has not yet scrolled it.

**Why it was reopened.** Two new reasons, both after the Machine was first seen assembled on the page. Rahul: the rig in the middle is good, but the parts around it are confusing and do not sit with a portfolio this technical. Someone he showed it to: the top part and the left part look off. Those are the crown and the arm, the two pieces that break the rig's symmetry. The rig is drawn like computing hardware (D22); the crown is a gyroscope, the arm is a lamp on a bracket and the orbits are an orrery, which is the instrument look D22 moved away from.

**What B changed.** The rig is kept. The other three parts are redrawn in its vocabulary (plates, posts, lines, cans) and moved onto its axis.

- **Scanner:** a scanning puck on the mount, over a roof of solar panels standing on the top plate, with beams from the puck down onto each panel. The panels are Rahul's addition: the 3D work was for solar, rebuilding roofs and placing panels on them ([CONTENT](CONTENT.md)).
- **Rings:** a beaded track close around each of the three lowest plates, on short spokes, following the rig's taper.
- **Lens:** the cube of cubes on a stage hung under the last plate, where the chip sits in a real rig. The lines of the bundle run into its roof and one tip leaves below. This is the idea D23 said was worth remembering from the cable silhouette: lines that visibly run from the Core into the Lens.

**What C changed from B.** Shown A and B side by side, Rahul liked B but said A also has a really nice shape, and asked for something in between. C has A's outline back: the rings widen as the plates narrow, so the rig is a diamond. They are narrower than A's, and their spokes line up into three ribs instead of pointing three ways.

**What does not change:** one object, four parts, the work each stands for, the order they assemble in. D23's rule that nothing is bolted onto a ring that turns still holds: the spokes turn with their ring.

**Three fixes after the pick,** proposed by the chat from close-ups of C as points and agreed by Rahul. The cube was a haze behind its cage, so it is drawn by its edges, its faces faintly, and the cage is three thin posts. The ring spokes were the brightest lines on the Machine, so they get under a third of the points their size earns. The puck was a blur and a beam to every panel looked like tent ropes, so the puck is taller with three rims and there is one fan of beams, on one panel. The second and third needed a piece to be able to take more or less than its share of points: `weighted` in `part.ts`.

**The camera.** A new pose for every beat, first values from the chat like the rest of D31. The parts now wake from the top of the Machine to the bottom, so after the Core the camera only travels down. The Lens is seen from a little below, so the lowest ring does not cut across the frame.

**A and B were removed from the code the same day,** once the commit that holds them was pushed (`31d5e96`). The picked shape is `src/experience/machine/machine.ts`, and the workbench shows it as its one variant. **Not done:** the city on the cube's roof does not read as points. The Scanner beat's sweep (EXPERIENCE) is not built; the fan of beams is where it would start.

### D33. The high tier draws four times the points — Accepted, 2026-10-08

Rahul's direction; the number is the chat's. On his tablet, a Samsung Galaxy Tab FE, the Machine looked grainy and sparse. His words: the performance guesses were "a bit conservative", and "I kinda want it to blow my mind".

**What he tried,** with `?points=` in the address, which sets a tier's count by hand (`tierBudget` in `src/state/tiers.ts`; `?dpr=` does the same for the pixel-ratio cap). 300,000 and 600,000 points drawn were smooth. 1,200,000 lagged a little.

**What changes.** The high tier's count goes from 150,000 to 600,000, so 450,000 are drawn: below the last count he saw run smoothly, to leave room for a device slower than his. A tablet is guessed to be high (D31).

**Points get finer, not brighter.** A point's size and brightness were chosen at 150,000 (D28). That count is now a constant of the look, apart from the tier table, so more points are each drawn smaller and dimmer and the whole stays about as bright. Before, the look was tied to whatever the high tier's count was, and raising it would have changed nothing but the cost.

**What this has not been checked against.** It is one device, by eye, with no frame times. The mid and low counts are unchanged and still unmeasured, so a phone now draws a tenth of what a tablet does. Anything that is not a phone is guessed to be high, which includes a laptop with integrated graphics on a large screen, and nothing steps a tier down yet when frames are slow; both are Phase 5. Sampling 450,000 points at startup has not been timed on any device; PERFORMANCE asks for it to be moved to build time or a worker if it is slow.

**The dust is thinner than the Machine, from the same day.** At the new count the opening dropped frames on Rahul's tablet while the dust dispersed and formed, and nowhere else. Dust fills the window, which costs far more than the same points packed into the Machine. So only about 110,000 points are drawn as dust, roughly what the high tier drew before, each bolder so the dust is as bright; the rest are not drawn until they are most of the way in, and so appear as the cloud closes (`dustLook` in `points.ts`). Not yet confirmed on the tablet. Two smaller things went in with it: the canvas no longer changes size as a touch browser's toolbar hides, and is no longer re-measured on every scroll event.

### D34. An awake part is drawn with lines, and the far side is dimmer — Lines accepted, depth proposed, 2026-10-08

Built for Rahul to compare on his tablet. He has scrolled it there and accepted the lines: "I think the lines are good". He has not said anything about the depth. After D33 he said the Machine was still missing something and asked whether more points was the only way to make it crisp. The chat's answer: points are soft at any count, and two things were missing.

**Lines.** EXPERIENCE has always said an awake part has "lines drawn"; waking only changed the colour. Now the centre line of every rod and ring and the rim of every plate and can is a true one-pixel line (`src/experience/machine/lines.ts`), a few thousand segments in one more draw call. They are read back from each shape's vertices, so they follow every move a shape is given. A part's lines are drawn in during the last third of its waking, each from one end and in its own time: the haze closes into a scan, then the scan resolves into a drawing. **Passed over for now:** lines wider than a pixel, which three.js does with an add-on that would add to the scene chunk; filled surfaces, the other half of that sentence in EXPERIENCE.

**Depth.** Everything is added on top of everything else, so the far side of the Machine was as bright as the near side and it read as flat. A point or a line is now up to 60% dimmer the farther behind the Machine's middle it is, and up to a quarter brighter in front. It is a few lines in the vertex shader and costs nothing to draw.

**Comparing.** `?lines=0` and `?depth=0` in the address turn each off.

**Still Rahul's:** whether the depth stays, and how strong it is. The lines stay as built, one pixel wide at their first brightness.

### D35. Round 6: the camera stays above the Machine, and ends closer — Accepted, 2026-10-08

Two camera paths were on the home page for Rahul to scroll on his tablet, the second at `?path=b`. He picked the second. His words: "Your version is good". It is now the one path, and the switch is gone.

**What the chat saw in stills of the first path,** one every half beat, in a wide window and a tall one. Found to Rings held up. Two things did not. The camera looked down on the Rings (28 degrees above level) and up at the Lens (14 below), then down again on the whole Machine, so it passed level twice, and at level every ring is a flat bar across the frame. And the Machine was small at the end: about two thirds of the window's height at Whole and less at Contact, which is the payoff.

**What changed.** Three poses; the other five are as D32 left them.

- **Lens:** from 20 degrees above, not from below. The camera never passes level, so the rings stay open the whole way down and back. The price is the reason D32 went below: the front of the lowest ring crosses the top of the cube. This replaces that part of D32.
- **Whole and Contact:** closer, 9.6 and 10.6 units against 11.5 and 13.

**Passed over:** the first path, in git history at `cdb79af`.

**The assembly stays as built.** Asked about the opening, each part's arrival against its text, and how closely the scene follows the scroll, Rahul answered "all fine". So the dust layout, the order and overlap of assembly, the easing and the poses from Found to Rings are the values of D31 and D32, now chosen and no longer first guesses. No second option was built for any of them: he did not find anything wrong to answer with one. That ends round 6. The top-down wake order that D31 kept in case (`aOrder`) is removed.

### D36. The pointer torch — Proposed, 2026-10-08

The first interaction of Phase 4, built as EXPERIENCE describes it: at Found, moving the pointer lights the dust near it. Rahul has not tried it yet; every number is a first value from the chat.

**What it does.** Dust within a circle round the pointer is up to three and a half times as bright, fading to nothing at the circle's edge, which is 0.42 of half the window's height away. Inside the circle the dust that is normally held back is drawn too (D33 draws only about a quarter of the points as dust), so the dark under the torch is denser as well as brighter. The light follows the pointer a moment behind, and comes up and goes down over about a third of a second when the pointer arrives or leaves the window.

**It lights dust and nothing else.** How lit a point is, is scaled by how far it still is from its place on the Machine. So the torch fades by itself as the dust gathers at Signal and is gone once the silhouette has formed; it never touches the Machine. That also keeps the cost where it is cheap: a pointer moving asks for frames only until the last part has gathered, and after that it asks for none.

**Who gets it.** A mouse only. Touch has no hover, as EXPERIENCE says. It is off on the low tier (PERFORMANCE). With reduced motion there is no dust, so there is nothing to light.

**All in the vertex shader,** as ARCHITECTURE planned: three uniforms, no work per point in JavaScript, no new draw call. Checked in a still with the torch placed by hand, in the software renderer. **Not checked:** how it feels to move, which is Rahul's; its frame cost with a real pointer on a real GPU.

**A fault found on the way.** At Found a few orange specks stood where the Machine would be: the first pixel of every drawn line (D34) was showing before the line had begun. Fixed in `lines.ts`.

### D37. The opening line crumbles into the dust — Proposed, 2026-10-08

Someone Rahul showed the site to suggested drawing `YOU'VE FOUND RAHUL.` in points, letting it disperse into the cloud, and then forming the Machine as now. Rahul asked what the chat thought, chose the chat's quieter version to try, and asked while it was being built for the line to be centred. He has not scrolled it yet; every number is a first value from the chat. This reopens the opening that D35 kept as built, on the same ground D32 reopened the shape: feedback from outside.

**What was passed over: a title drawn in points.** Points cannot draw small capitals, so the line would become a large title, which is the best-known three.js effect there is. It would also show in the first frame that points form things, which is the discovery Signal is for. And the real heading has to stay in the page (rule 3), so it would show first and be swapped for points when the scene loads.

**What is built.** The heading stays what it is: real text, drawn by the browser. Up to 5,000 points stand on its letters, hidden under the ink. On the first scroll the line is rubbed out from its left end, a moment ahead of the points on each letter, so for an instant each letter stands as grains; then the grains leave, each in its own time, and scatter outward across the window on curved paths. `RAHUL.` goes last. They are larger and brighter than the dust they fly through, and stay so while the dust gathers, so they can be followed out and then in: they cool only as they settle into the silhouette. Scrolling back puts the line together again.

**The line is centred.** Rahul, while it was being built: at the bottom left it "is not really catching my eye". The Found line now stands in the middle of the window, which is where the Machine forms, so it crumbles on the spot. This is the one exception to "text at the edges": at Found there is no Machine for the text to be beside. The other seven beats keep their text at the edge. After seeing the scatter he asked for the font to be "slightly bigger": the line is a size up from the other statements, 24 CSS pixels against 18 on a wide window and 20 against 16 on a phone. The step is the chat's.

**How it got there, in three tries on 2026-10-08.** First every grain went to the middle of the cloud and stayed lit until the cloud closed. Rahul: "I still liked how you were dispersing it out but just wanted it in center". Second, the grains scattered and cooled into the dust where they landed, as they had when the line was at the bottom left. Before he had seen that he asked for something else: "scatter them slowly into the model", which "will leave more time for anyone to notice", "with a more prominent path". The third is what is built: scattered wide, slower, and lit all the way in.

**The grains are the Machine's own points.** Each is a copy of a point of the cloud, picked evenly from those whose place as dust is within 4.2 units of the middle, which is about what the window shows at Found. Nothing is drawn twice: a landed grain is drawn only while the point it is a copy of is one that D33 holds back, and not once that point appears. It is one more draw call of a few thousand points, during the first beat only.

**How the letters are found.** Each letter is drawn onto a canvas that is never shown, where the browser put it and in the font the browser used, and the grains are placed on the pixels that came out inked (`src/experience/ink.ts`). It is read again when the line is laid out differently or a font arrives. **No package:** nothing was found that reads the ink of a heading already on the page; the text libraries for three.js draw their own text from their own font files, which is the title that was passed over.

**How the line is rubbed out.** A mask on the heading, moved by an animation that is never played, only set to a position on each frame. Setting a style each frame would make a string each frame, and PERFORMANCE allows no allocation in the frame loop. At rest the heading has nothing of ours on it. The mask does not print.

**Who gets it.** Every tier, with fewer grains where there are fewer points (3% of the cloud, at most 5,000). Not with reduced motion, where there is no dust. With no scene the heading is simply a centred heading. `?words=0` in the address leaves the line alone, to compare.

**What it cost.** The scene chunk went from 267.4 kB to 269.6 kB.

**Checked** in stills through the first scroll, in a wide window. The first try was also looked at in a phone-sized window and by scrolling away and back, which put the line back whole; the third changed only where the grains go and how long they stay lit. **Not checked:** how it feels to scroll, which is Rahul's; the third try at phone size; a real phone or tablet; a line that wraps onto two lines, which is built for but has not happened at any size tried.

**Still Rahul's:** whether it stays; how fast it crumbles (the last grain has landed 0.6 of the way to Signal); how far the grains scatter (4.2 units); how many there are, and how much larger and brighter than the dust (about four CSS pixels across against the dust's two or three). In stills the middle of the scatter is close to a snowfall, and fewer or softer grains would calm it.

**One thing slowness costs.** The page scrolls natively, so the line travels up the window as it crumbles: `RAHUL.` goes when the line is about a fifth of the way from the top. Any slower and it would leave the window before it had finished. Holding the line in the middle while it crumbles would remove the limit, and would be the first thing on the page to be pinned (D30). Not built; Rahul's to ask for.

### D38. The Machine gives way to a city: a laser scan of Singapore around Marina Bay — Accepted, 2026-10-19, with parts proposed

Rahul, on 2026-10-19, with the Machine on the home page: "the more I look at the machine, the more I feel like on a overall thing, it does not feel good". The opening, his name crumbling into the dust and the dust becoming a model, he called very nice; "but after that looking at a super computer, doesnt really leave much of a nice touch". He called rule 1, one object, "a bit stupid to be a hard rule like that" and asked for other angles. This supersedes D2 and the one-object half of D5, and with them the Machine's shape (D23, D25, D32) and its camera path (D35).

**How it was reached.** Four directions were drawn as live sketches on one page, each scrubbed with a bar: A, Flow, a river of data down the page; B, City, a scanned city at night; C, Becoming, one cloud reshaped into each job's object; D, Words, no object, only the lines of text. Two more were described and not drawn: a scan of Rahul himself, and a workshop of small toys. Rahul: "B is actually quite nice", and he liked A's first transition: "maybe we can make it flow down into the city?" He asked for a Singapore touch, iconic landmarks, "which will also symbolize where I'm from". A second sketch put them on the horizon; to him they were "really quite shadowed at the back". The third, Bay, builds the city round Marina Bay with the landmarks round the water in front. His words on it: "Very nice", and "pretty much we are on a good track". The sketches are in `workbench/city-sketches.html`, as he saw them.

**What is decided.**

- **One world, not one object.** The site is a laser scan of a city at night, drawn in points, built round Marina Bay. Rule 1 in CLAUDE.md says this now.
- **The way in.** The opening line still crumbles into the dust (D37). The dust then pours down as a river, the Singapore River, into the bay.
- **Each job is something happening in the city,** in the order of the career: requests running as light along the river and the streets (S2T); one roof scanned from points into surface (Etavolt); windows lighting up across the HDB blocks (Uniad); one tower in the CBD turning it all into an answer (Cognizant). The story ends on the view across the bay to Marina Bay Sands, lit.
- **The landmarks stand round the water, in front,** so the city reads as Singapore from the first view: Marina Bay Sands, the ArtScience Museum, the Supertrees, the Flyer, the Esplanade, the Merlion. Drawn in code (D4); the sketch's are rough stand-ins.
- **The camera is calm.** Rahul, after seeing the third sketch: the camera "might have a bit too much movement for some ppeople". It faces one way, within about 15 degrees, and glides from subject to subject like a slow drone. It never swings round the city. With reduced motion it cuts. The sketch was changed to this the same day.
- **The traffic keeps moving.** Rahul likes it. It is ambient motion under D26: worked out in the shader, at most 30 frames a second, paused when the tab is hidden or the canvas off screen, off on the low tier and with reduced motion. Asked whether it is costly: moving the points is cheap; what costs is that the canvas never rests while it moves, which matters for a phone's battery.
- **Easter eggs.** Rahul likes the three in the sketch: the Merlion spouting, a train on its viaduct, a block numbered BLK 2024, the year he joined Uniad. He wants more: "we can also consider otters, cats and various other things too".

**Proposed by the chat, shown in the sketch, not picked by name.**

- **How the words sit over the city.** Rahul asked whether the city would take the spotlight from the information. The answer drawn: during each job's beat the city dims except its subject, and a short tag is pinned to the subject, like the labels in a scanning tool. The beat's full text sits at the left edge on a dark band, so it is read before the city is. He said the direction was on a good track after seeing it; he was not shown an alternative.
- **The rule for easter eggs.** Each is found, never forced. None advances the story. None states a fact that is not in CONTENT.
- **Rahul's work is pinned to made-up buildings only.** The Lens tower must never look like a ministry building: the Cognizant work comes under the secrets act (CONTENT). The one exception wanted is the Science Centre, a mesh Rahul really built, as the roof the Scanner beat scans, once there are references to draw it from. Marina Bay Sands also treats its outline as a trademark for commercial use; a personal site is a different case, but it is one more reason the landmarks are drawn, not traced.

**What does not change.** Drawn as a point cloud (D3). Generated in code, with no model files (D4). Every fact is real text in the page (D7). Native scroll (D8). Colour means state (D11): the city at rest is cold, and what Rahul's work touches is lit in the accent. The eight beats and their order, the opening (D37), the pointer torch (D36), the Index, the tiers.

**What it costs.** The Machine's shape, parts and camera path are superseded. Its code stays on the home page until the city replaces it; nothing is deleted yet. The beats keep their ids (`core`, `scanner`, `rings`, `lens`) in code. A city fills the window on every beat, where the Machine filled part of it, and dust filling the window already dropped frames on Rahul's tablet (D33), so the point counts start again from measurement. The Scanner sweep, about to be built on the Machine's solar panels, is paused; it moves to the scanned roof.

**Open.** References for the Science Centre. Which easter eggs, beyond the three. The city's layout and the detail of each landmark, in rounds on the workbench. What the visitor can do at the Whole beat, now that there is no object to turn. The Whole beat's copy, `FIVE YEARS. ONE MACHINE.`, which no longer fits.

### D39. The city is built from the map up — Accepted, 2026-10-20

The chat's proposal from the references round for the city ([REFERENCES](REFERENCES.md#the-city)), built as the fourth sketch in `workbench/city-sketches.html`. Rahul, having seen it: "I think its much better". He also agreed that the data source is named only as online map data.

**Why.** No laser scan was picked, and Rahul explained why: the model he built at Etavolt came from LiDAR data taken from online map data, reconstructed by an algorithm into a rough mesh of the building, as a pre-sales visualisation for people interested in buying solar ([CONTENT](CONTENT.md)). So a lidar look (sensor rings, colour by height) would be a tech demo that is not his work. He also asked the chat to stop following his picks one by one and look at the whole.

**The proposal.**

- **The dust lands as a map.** At Signal the river of dust spreads out flat: the shore of the bay, the river's banks, the roads and every building's footprint, traced in thin lines like a plan.
- **Then the city rises out of it.** Each building is extruded from its footprint, its roof going up and its walls stretching under it, a few at a time as the visitor scrolls. The city is made by Rahul's method before the site says so, and the Scanner beat says so: "you've been looking at one" stays true.
- **Detail where it counts.** The seven landmarks Rahul liked and Pinnacle@Duxton are drawn with care. Every other building is a plain extruded block, which is what an extrusion from map data gives, so the quiet parts of the city are honest too.
- **A city at night is its lights.** Points sit on edges and windows; faces are nearly empty; the water is black.
- **Surface only where it is earned.** The Science Centre is the one building that becomes a real surface, at the Scanner beat, better than Rahul's old mesh.

**Passed over:** drawing the city as a raw lidar scan, from any of the six scans in the references round.

**Open.** How the map is drawn and how fast the city rises, settled on the workbench. The facts were checked on 2026-10-20: the data was LiDAR, taken from online map data, so "laser scans into 3D models" stays true and the copy does not change.

### D40. The city has its own code beside the Machine's; the sketched layout and its camera are kept — Accepted, 2026-10-20

Rahul's direction at the start of the layout greybox (Phase 3b): a switch on the workbench between the Machine and the city, with the city's code in its own folder, rather than forcing the city into the Machine's four-part structure.

**The structure.**

- **`src/experience/city/`** holds the city: `plan.ts` (the flat map), `layouts.ts` (the layout as data: the bay, the river, the roads, the viaduct, the CBD's outline, open ground, and a place for every landmark), `landmarks.ts` (the eight landmarks as greybox massing), `city.ts` (the layout turned into blocks and shapes, each marked with when it rises) and `story.ts` (the city's story as a function of the beat). Nothing in it imports `machine/`. The city is tuned by four groups of numbers (water, CBD, heartland, landmarks), not by four parts.
- **Shared pieces moved up a level** so the city does not depend on code that will be deleted: the shape operations are `src/experience/shapes.ts`, the parameter specs `src/experience/params.ts`. `applyCamera` takes a lens, so the city can frame wider than the Machine.
- **The workbench's `world`** is `city` by default and `machine` with `?world=machine`. The Machine's links now need `world=machine`.

**The layout: as sketched.** Two layouts were built for the round: A, the "From the map" sketch in 3D, and B, every piece where it really is on the map, the visitor looking south-east across the bay. The chat recommended B for its accuracy. Rahul picked A: "I want the sketched version and the way the camera is moving because no one really has time to analyse how accurate the model is to singapore map. We need to focus more on the experience." He allowed mixing in a little of B as long as the experience stays good, and repeated that accuracy is not the focus. What A kept from building B: the wider Marina Bay Sands and blocks kept off the roads, both shared code. Mirroring A to the real map was not done: the camera path is built round A's composition. B's code was removed before it was committed.

**The story on the workbench.** The `story` view and the beat scrubber now work for the city, as the sketch moved:

- The camera has the sketch's pose at each beat, eased over the whole beat as the sketch did. The sketch had seven stages; Whole is new, the camera rising over the bay before it comes down for the view across it. It faces one way within about 25 degrees: the sketch's own range, a little wider than EXPERIENCE's 15.
- The lens is the sketch's: 40 degrees across the shorter side, against the Machine's 30, and the city slides right as the text band arrives at Signal.
- The map lands in the first half of the way from Signal to Core, its lines showing while the city is flat. Then every building rises out of its footprint in its own turn, Marina Bay Sands first among the landmarks, done in the shader.
- Two changes from the sketch, for the experience. Pinnacle@Duxton, which the sketch did not have, stands in the heartland beside BLK 2024, where the Rings beat sees both; first placed beside the CBD, it hid the CBD at Core. And the Science Centre stands on open ground, so the Scanner beat sees its roof clear.

**Passed over:** B, above. Building the city as another `MachineDef` with four parts, which Rahul asked not to do. A separate workbench page for the city, which would duplicate the camera, readout and benchmark.

**Open:** how the story feels, which is Rahul's, scrubbing it on the workbench and later scrolling it; the numbers in each group; the landmarks' detail, which is the next round; the poses, which are the sketch's as they stand.

### D41. The landmarks: each one's outline, and the one feature that names it — Proposed, 2026-10-24

The next step of Phase 3b: the landmarks, each recognisable at the size the camera sees it. After D40 the test is the story's camera, not a close-up: what a visitor takes in at a glance while scrolling (`docs/EXPERIENCE.md`; Rahul: the experience matters more than accuracy). Rahul has not seen it yet.

**What changed,** judged first in close-ups and then in stills of every beat (`src/experience/city/landmarks.ts`):

- **Marina Bay Sands:** broad towers, about half their spacing across, where they were posts; the ship has a pointed bow over the north tower. It read as a gate before.
- **ArtScience Museum:** ten broad fingers rising from a round base and leaning out, the longest towards the water. It read as a dish of fan blades.
- **Supertrees:** wide, shallow canopies opening near the top, where they were funnels, and the skyway between the two tallest.
- **Esplanade:** the two domes, each criss-crossed by a lattice of ribs spiralling up from the base, the sunshades that make it the durian. Spikes were tried first; without them it was two blobs, but as points they read as fur, "like a bacteria" (D42). Moved onto the waterfront between the Merlion and the Flyer, at [1.15, 0.6], and turned so its two domes run along the shore, as the real ones do, not towards Pinnacle@Duxton, which it ran into at Whole.
- **Merlion:** crouched, lower and longer than it is tall: a lion's head ringed by a flared mane sitting straight on a broad chest, with no neck, a fish's body tapering back and curling up into a forked tail, and the arc of water from its snout into the bay. Turned to face the bay. The water is what reads from afar. Redrawn twice the same day. The first version, an upright tube with a round head and the jet from its top, read as phallic to Rahul ("quite disrespectful"). The second, crouched, read as "a weird sea lion". It is now drawn as its side, since the visitor only ever sees it side on: a silhouette like a chess knight's, pushed into depth with rounded edges, with the wave it sits on, its chest, the open mouth under the snout, the mane in locks down the back and the fish's tail curling up into a fork behind. Never an upright column with a round head.
- **Pinnacle@Duxton:** seven slim towers in a shallow bow, each clear of the next, with the two sky bridges. Lowered to 0.62 and set back behind BLK 2024: taller, nearer and more curved, it walled off the Rings beat, and it read as a round cage.
- **The Flyer and the Science Centre** already read and are unchanged.

**Still greybox.** This is massing for the solids on the workbench. How the landmarks look as points, and how far they are lit, are the points round.

**Cost,** measured on the development machine in the Rings beat's view: 10 draw calls, 16,400 triangles, about 1 ms of GPU a frame, 20 ms to build in the development server, no frames at rest.

**Open:** whether each reads to Rahul, who judges by looking. The Merlion is still the weakest up close, though at story distance only the crouched figure and its water show.

### D42. The city as points, as the sketch drew it: windows in the dark — Accepted, 2026-10-24

The points round of Phase 3b, brought forward. Rahul, looking at D41's landmarks as grey solids: "it kinda looks very low quality ... the demo one was much more higher quality". The demo is the sketch he picked, "From the map", and its quality was never in its shapes, which are rougher than D41's: it was 16,000 points placed by meaning, windows on a grid, edges, roofs and lights on the roads, in the dark, with the accent on what is lit. Judging landmark detail as grey solids was judging the wrong thing, so the city is now drawn as points on the workbench and every later look round is judged that way.

**What is built** (`src/experience/city/points.ts`, on the workbench with `draw=points`):

- **One cloud, one draw call.** Ordinary buildings, the landmarks, the Science Centre, the viaduct, the roads and the water are each placed their own way and drawn by one shader. Each point knows its group (cbd, lens, heartland, rings, landmarks, science, mrt, roads, river, bay), when its building rises, and, for the heartland, which window it is.
- **Three looks, deliberately different,** side by side with `compare=1`:
  - **A, windows:** the sketch. Points on each building's window grid, so a window's points land on one spot and read as one light, with corners and roofs; the walls between are dark. Marina Bay Sands and Pinnacle@Duxton, which are buildings full of rooms, get windows too. 90,000 points on the high tier.
  - **B, scan:** points spread evenly over every surface, closing into faces. Reads as a laser scan; murkier. 240,000 points.
  - **C, outlines:** every building as its edges, the map drawn upwards. Crisp, close to a CAD wireframe. 120,000 points.
- **The map lands as points.** At Signal the city is flat, so its points lie on the footprints; with the map lines this is the plan the sketch drew.
- **Cold and lit, by beat** (`CITY_LIGHTS` in `src/experience/city/story.ts`), as the sketch lit it: during each job's beat the city dims to 0.55 except its subject, which turns to the accent. Core lights the roads and the river, Scanner the Science Centre, Rings the heartland's windows block by block (whole blocks in B and C, which have no windows) and BLK 2024, Lens the tower. An earlier subject stays half lit while a later one has the beat, and everything Rahul's work touched is fully lit again at Whole and Contact.

**Two changes from the sketch, proposed by the chat.**

- **The landmarks stay cold at the end.** The sketch turned them amber at Contact. The accent means Rahul's work (D11, EXPERIENCE "Cold and lit"), and the landmarks are not his work, so they are brighter at Whole and Contact but white. With D41's broad towers, amber made Marina Bay Sands a solid orange slab.
- **The river is sparse.** As a dense strip it read as an orange carpet at Core. It will carry the traffic's motion in the motion round.

**Cost,** on the development machine at the Rings beat, high tier: one draw call; GPU per frame 0.21 ms median for A, 0.39 ms for B; sampling 61 ms for A and 112 ms for B in the development server. On the low tier's 20,000 points at phone size A still reads as the city. The tier counts are still set on real devices in Phase 5.

**Picked: A.** Rahul: "Yes agree with A." He also agreed that the landmarks stay cold. B and C were removed from the code; as rows of numbers they were, in the order of the Points folder (count, size, brightness, boost, windows, walls, edges, roofs, outline, thin, blocks, landmarks, roads, water, mrt): B, scan: `240000, 0.0055, 0.5, 0.35, 0, 0.78, 0.06, 0.16, 0, 0.35, 0.6, 0.3, 0.04, 0.04, 0.02`; C, outlines: `120000, 0.0065, 0.7, 0.35, 0, 0, 1, 0, 0.85, 0.5, 0.5, 0.36, 0.06, 0.06, 0.02`.

**Seen as points, three landmarks changed the same day** (D41 has the detail). The Esplanade's spikes read as fur, "like a bacteria", so its domes are ribbed instead. The Merlion, crouched, read as "a weird sea lion", so it is drawn as its side. And the Esplanade moved onto the waterfront between the Merlion and the Flyer, where the real one is: at Whole its spiky domes ran into Pinnacle@Duxton's curved row and the two read as one shape; now there is dark ground between them.

**Open:** density, size and how cold the city is against what is lit, by eye on Rahul's tablet. The traffic, the river's flow and the train are motion, for the motion round; Rahul: "We can be creative with the river and traffic." At the Rings beat the Esplanade's domes stand in front of Pinnacle's left end; they are told apart, but it is the place to look if the Rings view feels busy.

### D43. The traffic, the river and the train move, mostly with the scroll — Proposed, 2026-10-24

The city's ambient life, which D38 kept from the sketch: the traffic, the river and the train. Rahul, on the river and the traffic: "We can be creative". Built on the workbench; not yet seen moving by Rahul.

**What moves** (`src/experience/city/points.ts`, `FLOW` in `src/experience/city/story.ts`):

- **Cars:** every road carries cars both ways, the left lane one way and the right the other, as in Singapore. A car is four points, a headlight and a trail fading behind it, so at story distance each reads as a short streak. Amber at Core, where they are the requests running through the city, and cold after.
- **The river:** requests as packets of light, flowing downstream in five streams and fading out into the bay. A packet is five points, brightest at its head, and every stream has its own pace. A river of evenly scattered points read as an orange carpet; packets in streams read as data moving.
- **The train:** three lit cars on the viaduct, which run its length and then wait out of sight. It lights at the Rings beat with BLK 2024, since Uniad's work is scheduling, and stays half lit after, as every subject does (D42). Proposed by the chat.

**How it moves.** Mostly with the scroll: a car moves 0.5 city units a beat, the river 0.35 and the train 0.9, so the visitor drives the city and scrolling back runs it back (rule 2). A little on its own clock, the ambient motion D26 allows: 0.12, 0.05 and 0.25 units a second. The clock runs only once the city has risen on the way to Core, at most 30 frames a second, not while the tab is hidden, never on the low tier or with reduced motion, and it only adds up while it runs, so pausing never makes the traffic jump. The motion is in the vertex shader: each moving point carries where it starts and its speed, and the CPU sets how far a point at a speed of 1 has gone. On the workbench, `moves on its own` in the City folder turns the clock off (`motion=0`).

**Cost:** nothing measurable on the GPU beyond D42's; frames at rest are in PERFORMANCE.

**Open:** whether it feels right scrolled, which is Rahul's, on the workbench and then on his tablet. The speeds. At the Rings beat the Esplanade's domes still peek over Pinnacle@Duxton's left end from behind it.

### D44. The city on the home page; the opening restyled as rain — Proposed, 2026-10-24

Rahul asked for the city on the home page, and for the opening to keep the crumbling name but take "a fresh angle": "the name crumbling into grains is nice but we enhance it into suiting this scene now". Built and checked in the browser; not yet scrolled by Rahul.

**The opening** (`src/experience/city/story.ts`, `src/experience/city/points.ts`):

- **Found:** the name in the middle of the window, in a faint haze of light: a third of the city's points, hanging in a wide, shallow cloud round where the camera looks, thinning to no outline at its edges. The pointer torch lights the haze (D36).
- **The first scroll** crumbles the name from its left end, as before (D37), but its grains fall into the haze, across at an even pace and down faster and faster, as rain falls, and cool into it.
- **Then the rain.** From a little after the crumbling starts to just before Signal, the haze comes down as rain: every point falls, brighter while it falls, onto the nearest water, the river or the bay, flashes as it hits it, and spreads from there over the land to its place on the map. The nearer the water its place, the sooner it falls, so the map spreads out from the river: the shore of the bay lights up as a ring and the city streams out from it. The rest of the points come in as they spread. Singapore's rain feeding the river is the touch of place; the data landing before the city is built from it is Rahul's method (D39) again.
- **From Signal on,** the story is the workbench's: the map's lines, the city rising, each job lit, the traffic (D40 to D43).

**The page.** `src/experience/Experience.tsx` now draws the city, look A (D42), at the tier's budget or 90,000 points, whichever is fewer. It keeps what the Machine's page had: progress eased from the scroll, frames drawn only when something changed, the opening line read off the page, the torch. The story is `seekCity`, a plain function of the beat, not a GSAP timeline, so the page no longer loads GSAP and the scene chunk fell from 269.6 to 254.4 kB. With reduced motion there is no haze, no crumbling and no rain: the city is whole and lit, and the camera cuts between beats (`seekCityStill`).

**Checked in the automated Chrome, 1600 by 900:** no frames drawn at rest at Found or Signal; about 26 a second at Core and Whole while the traffic moves, under the cap of 30; none at Core on the low tier, which still reads at 20,000 points; none at Found with reduced motion.

**Left:** the Machine's code, kept for the workbench's comparison until Rahul has scrolled the city on the page, then deleted with the workbench's `machine` world and GSAP. At Core the job's text sits over the buildings; how the words sit over the city is its own item (D38). Sampling the points runs on the main thread when the scene attaches; on a phone that is the number to watch (PERFORMANCE).

### D45. The words over the city: every claim pinned to its proof — Accepted, 2026-10-24

The job beats said everything in one block at the bottom left: a readout, a statement, then every project and work line in the same small grey type, over the subject. Rahul: it "completely ruined how the info will be displayed", it was an under-engineered way to show the information, and the site has to sell him. The best facts weighed the same as the least, and nothing said what the lit city proved.

**How it was reached.** Three systems were sketched over real shots of each beat, in a private artifact (`Reading the City`): A, Survey pins, every claim pinned to its proof; B, Inspector, the screen as a point-cloud tool with a properties panel and a layers list; C, Focus pull, one claim at a time in large type while the city blurs. Rahul: "A is actually quite solid", but not if it added scrolling, so the claims stopped taking turns on the scroll. On the next version the opened label jumped away from the pointer; it was fixed to open in place, and Rahul said "much better, lets go".

**What it is.**

- **The beat's text, at the left on a dark band** (at the bottom on a tall window): the job and the kind of work in the accent, the headline large, which leads with the work, the company, role and years as small print, then every claim as its own numbered line, the strongest first. It is the whole job, readable with no scene, and the Index says the same lines.
- **The pins.** Each claim that has something in the city to point at gets a numbered pin there, with a short tag: the requests on the streets, the microservices on a CBD tower, the scanned roof, BLK 2024, the train for CI/CD, the Lens tower. As a job's beat arrives, its pins light one after another, inside the scroll that already brings it in: each job is still one window, and the page is no longer. At rest every pin is out at once.
- **Pointing**, a bonus and never needed. Pointing at a claim's line or its pin opens the pin's full sentence and dims the others; on touch a tap does it. The database's line draws its five systems onto five HDB blocks. A tag opens in place: it hangs from the corner nearest its pin and grows away from it, so it never moves out from under the pointer; it is kept inside the window, closed and open alike, which keeps that true.
- **Whole** puts one tag a job at its subject, the career as a map of the city, and its list links to each job.
- **On a small screen** the pins stay numbered points and the list is read under the city; a tap opens one. A pin whose point is out of the window is not drawn.
- **With reduced motion** a job's pins are all out at its beat, with no lighting in turn.

**The copy.** The work lines became claims (`src/content/eras.ts`, CONTENT): each with its full line, a few words for the tag, the kind of claim and the place it points at. The project summaries are carried by the claims; the Index keeps the projects' names. The headlines lead with the work, and Whole's line, written for the Machine, is now `Four jobs. Five years. One city.` A job's headline is set large in sentence case, not small in capitals: the statements of the other beats are unchanged.

**How it is built.** The pins are HTML in a layer over the page the size of the canvas (`src/sections/Scene.tsx`), made by the scene (`src/experience/city/pins.ts`) and placed on every frame it draws, by projecting each pin's point through the camera; nothing goes through React and a frame where nothing moved writes nothing. Their points come from the city's plan, so they move with it. They are hidden from assistive technology: they repeat what the page says.

**Cost:** the critical path rose 2.0 kB, to 79.5 kB for `/`, for the styles and the claims; the scene chunk 2.0 kB, to 256.4 kB.

**Checked in the automated Chrome**, at 1600 by 900, 1280 by 720, 1180 by 820, 1024 by 768, 768 by 1024 and 504 by 846: every pin's tag inside the window, closed and open, and an opened tag covering where it was and still under the pointer. Not yet scrolled by Rahul on a real device.

**Open:** the Core's fifth claim, the business trips abroad, has no pin until the plane from Changi exists. Where each tag hangs was chosen by eye at 1600 by 900. Whether to add B's layers list, to show where the visitor is in the career and that two jobs run at once, or C's focus pull for each headline.

### D46. The text held still, and a beat's words arriving with the camera — Proposed, 2026-10-24

With D45 on the page, Rahul: the whole left side moving with the scroll "feels like a credit of a movie". He suggested fixing the text to the scene and moving the bullet points instead.

**What it is.** While the scene runs, each beat's text is held in one place on the window, where it stood when its beat arrived: at the bottom left, or the bottom of a tall window. Nothing rolls. On the way to the next beat the text fades out early, the city moves on its own for a stretch with no words over it, and near the end of the way the new heading comes in, then the claims one after another, each line arriving with its pin in the city (`src/experience/cue.ts`). They rise 8 pixels as they come, a breath and not a roll. The bullets are what moves, as Rahul suggested, but by arriving with their pins rather than by scrolling, which would have been the credits again. The sections stay, so the scroll is not taken over.

**Slower where the claims light up.** Rahul, scrolling it: "slow down the scroll a bit at the highlighting segments". The jobs' sections and Whole's are 1.3 windows tall instead of one (`dwell`, `src/sections/Beat.tsx`), and on the way to them the first half of the scroll takes the story the first 60 per cent of the way, the camera's move, at about the pace it had, and the second half the rest, where the heading and the claims arrive: about 1.6 times the scroll they had (`src/state/progress.ts`). The scroll slows there; it is never held. The page is 9.5 windows long instead of 8.

The words also wait for the camera and for the city: before this the Core's pins came in while the city was still a flat map, hanging over towers not yet risen.

**What does not change.** Without the scene, the text scrolls with the page in its sections, as before. The opening line still scrolls and crumbles where it stands (D37). A text too tall for the window, less 96 pixels kept for the city, scrolls as without the scene. A job's dark band is held with its text and fades with it. Text that is not showing takes no pointer; a screen reader still reads every beat; a link reached by the keyboard in a text not showing scrolls to its beat. With reduced motion each beat's words cut in and out halfway between beats.

**Cost:** 0.3 kB on the critical path, to 79.8 kB, and 0.7 kB in the scene chunk, to 257.1 kB. A held text writes its opacity only when it changes.

**Checked in the automated Chrome** at 1600 by 900 and 504 by 667: no beat's text too tall to hold; every pin's tag inside the window and under the pointer, as in D45. Not yet scrolled by Rahul.

**Open:** the timing, by Rahul scrolling it: how early the words go, how long the city moves alone, how fast the lines follow each other (`cue.ts`), and how much slower the claims' stretch is (`progress.ts`).

### D47. The scroll comes to rest on a beat — Proposed, 2026-10-25

Rahul, scrolling the home page: a scroll can stop between beats, "quite useless", and he "started reading at the wrong time of the scroll". Both have one cause. Between beats the camera is mid-move and one beat's words have gone before the next's come in. And a beat's words were whole at one scroll position only, its arrival: the lines finished coming in just as it arrived, and began to fade just past it (`src/experience/cue.ts`, D46). Reading while scrolling meant reading words still arriving, and a small overshoot faded them out.

**What changes.** While the scene runs, the page snaps: `scroll-snap-type: y mandatory`, with a point at the foot of each beat's section, which is where its words are whole (`src/styles/index.css`). The browser does it, so it costs no script. Dragging on a phone or a trackpad still scrubs the story under the finger; letting go glides on to the nearest beat. A mouse wheel moves a beat a notch. A 1-pixel mark at the foot of the section is what snaps, not the section, because the browser lets a scroll rest anywhere in a box taller than the window, and a job's section is (D46). A text too tall to hold (`loose`) is still read by scrolling freely through it. `?snap=0` in the address turns it off, to compare.

The words also stay whole for the first 12 per cent of the way past their beat before they fade, so a scroll that rests a little beyond a beat still reads. The pins keep the same time.

**Against interaction rule 3.** The page finishes a move the visitor started and never starts one, so the visitor still causes every change (interaction rule 1). EXPERIENCE's rule 3 says so now.

**What it costs.** With a mouse wheel, the slower stretch where the claims light up (D46) passes in one notch: the claims still arrive one after another, over the scene's easing, not over the scroll. On touch it stays. The Index and the page without the scene scroll as before.

**Slower to follow.** Rahul, scrolling it: snapping is better, but slow it down a bit. The browser sets the snap's own speed and CSS cannot change it, so the scene follows the scroll more slowly instead: `CHASE` in `src/experience/Experience.tsx` from 0.22 to 0.4 seconds (D31's figure). A beat's move is 95 per cent done in about 1.2 seconds instead of 0.66, still inside the 1.5 seconds of D26, and the canvas stops drawing about a second after that. Dragging feels a little looser under the finger.

**Checked in the automated Chrome** at 1440 by 900: a scroll left at 30, 70 or 90 per cent of the way between any two beats came to rest on one of them, the job beats included. `?snap=0` leaves it where it was left. Not yet scrolled by Rahul.

**Open:** whether mandatory snap feels right on Rahul's phone and laptop, or the softer `proximity`; how long the words stay past their beat.

### D48. A hint to scroll, Contact at any time, and the city as an exhibit — Proposed, 2026-10-25

Rahul asked for three things: a hint to scroll on the landing page, "cause it just says you've found rahul"; a more immediate way to get in touch, because a visitor "might just wanna do that straight"; and "a view where I have an exhibition of the 3D world we just created".

**The hint.** A first version, `SCROLL` in dim grey over a still line, was too quiet; Rahul: make it intuitive "so the user notices". Now, at the foot of the window under the opening line, `SCROLL TO LOOK CLOSER` (`SWIPE UP TO LOOK CLOSER` on a touch screen) comes in a moment after the page, so the change catches the eye. Under it, an amber chevron pointing down bounces, the way the page goes. A drop of light falling down a thin line and landing with a ripple, as the haze is about to rain onto the bay (D44), was tried first; Rahul asked for "a bouncing downward arrow" instead, which a visitor reads at once. It is a link to the next beat, for a visitor who clicks rather than scrolls. It says nothing of what is there, so the opening still explains nothing (VISION, principle 2). Where the browser can tie an animation to the scroll it fades over the first 12 per cent of a window; elsewhere it scrolls away with the line. It is CSS on the page, not the canvas, so it costs no frames.

*Against interaction rule 2*, which allows no looping decoration: the arrow bounces, by Rahul's ask, only on the opening screen, only until the visitor first scrolls, and not with reduced motion, where it stands still.

A fact found while building it: since D46 the held-text style also caught the Found beat, so the opening line sat at the bottom left of the window instead of in the middle. It is centred again (`src/styles/index.css`).

**Contact.** `CONTACT`, in the accent, beside `INDEX` in the header of the story and the exhibit (`src/sections/Header.tsx`). It opens a panel under the button with the same three rows as the Contact beat, and a button that copies the email address, for a visitor with no mail app behind `mailto:`. A native popover: it works with scripts off, sits over the city and the pins, and closes on Escape or a click anywhere else. A link to `#contact` was the other way, and was passed over: it would sweep the whole story past in a second to reach the end.

**The exhibit.** A third page, `/exhibit`, linked from the header as `EXHIBIT`: the city on its own, with no story and no scroll. It is the city as the story leaves it at Whole, risen and lit, the four jobs tagged at their subjects (D45), drawn by a second lazy entry with the same code as the home page; only the camera is new. Drag turns it, scroll or pinch comes closer towards the pointer, a right drag or two fingers moves along the ground; the camera never goes under the ground or past the edge of the map, and glides to rest a moment after input stops. The story's calm camera (D38) is not bent: it is about the camera moving on its own, and here only the visitor moves it. The traffic, the river and the train move on the same terms as on the home page (D26, D43). Prerendered like the other pages, with a caption that reads without the scene; `scripts/check-size.mjs` knows the page.

**Cost:** the critical path of `/` rose 1.8 kB, to 81.9 kB; `/exhibit`'s is 80.2 kB. The scene chunks together rose 6.3 kB, to 263.4 kB, most of it `OrbitControls`, which ships with three.js.

**Checked in the automated Chrome** at 1440 by 900 and at 390 by 844 with touch: the opening line centred with the hint under it; Contact open and closed; on the exhibit a drag turned the city and the wheel came closer, and the whole map is in the window on both sizes. Not yet tried by Rahul.

**Open:** the words (`SCROLL TO LOOK CLOSER`, `EXHIBIT`); how fast the arrow bounces; whether the exhibit wants the landmarks named, like labels in a museum; where on a phone the exhibit's city sits, low in the window for now.

### D49. A résumé page that shows the PDF — Proposed, 2026-10-25

Rahul asked for a résumé page, "maybe with a mini renderer", then, while three designs were being drawn up to choose from: "just make a dummy pdf first, I'll replace it later". So the designs were not drawn, and the page presents a PDF that Rahul owns.

**What it is.** `/resume`, linked from the header as `RESUME` on the story and the exhibit. At the left, the name, title and place, `DOWNLOAD PDF` in the accent, and `OPEN IN A NEW TAB`; on a phone these come first. At the right, each page of the PDF as a sheet of paper on the dark page, as wide as its column allows up to about A4 on a screen. Prerendered, and readable with scripts off: a blank sheet holds the place, offering the file to open.

**Drawn by PDF.js, through react-pdf.** The first version used the browser's own viewer in an `<object>`, with its toolbar and sidebar asked away. It looked different in each browser and could not show the PDF on a phone, which got a button instead. Offered pdf.js, Rahul: "yes use new package lol dont reinvent the wheel". So react-pdf 11.0.0, the React wrapper over PDF.js, draws each page to a canvas with its text layer, so the text can be selected and copied, and its link layer, so the PDF's own links work. Phones get the same sheets. It is loaded by a lazy import of its own (`src/resume/PdfSheet.tsx`), after the page is on screen, as the scene is on the home page, so the page's critical path does not carry it. pdfjs-dist is also a direct dependency, at the version react-pdf pins, only so the worker's file can be found under pnpm. The header gets an optional dark fade on this page, where text scrolls under it.

**The PDF.** `public/resume.pdf`, copied into the build as it is. For now it is a one-page placeholder written by hand (no library): Rahul's name, title, contact links and the word `PLACEHOLDER`. Rahul replaces it with his own, keeping the name. Its facts are his, outside CONTENT; the page around it states only what CONTENT does.

**Passed over, for now:** a résumé built from the content modules, which would overlap the Index.

**Cost:** 567.3 kB gzipped for the viewer, loaded on `/resume` only: 188.9 kB of PDF.js and react-pdf, 376.1 kB of PDF.js's worker, 2.3 kB of CSS. A new budget of 600 kB in PERFORMANCE, and one of 500 kB for the PDF itself, both checked by `scripts/check-size.mjs`, which also fails the build if the PDF is missing. Every page's critical path rose by about 0.6 kB, to 83.5 kB for `/`. The header's four items fit one row at 390 pixels wide, its links a little closer on a phone.

**Checked in the automated Chrome** at 1440 by 900 and at 390 by 844 with touch: the placeholder drawn as a sheet, its text in the text layer, no console warnings, no sideways scroll. Not yet tried by Rahul.

**Open:** the real PDF; whether the Index and the résumé should become one page.
