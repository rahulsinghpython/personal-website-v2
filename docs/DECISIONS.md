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
