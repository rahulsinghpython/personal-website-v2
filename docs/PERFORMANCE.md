# Performance

The site has to look expensive and be cheap. This doc says why that is possible, what the limits are, and how to check them.

## Why it can be fast

The concept was picked partly for its cost. Each visual choice removes a whole category of work.

| Choice | What it avoids |
| --- | --- |
| The world is black | No skybox, no environment map, no ground, no fog passes |
| The city is points | No lighting, no shadows, no materials that need textures |
| Geometry is generated in code | No model downloads, no texture downloads, no decoder libraries |
| Points move in the vertex shader | No per-point JavaScript per frame; the CPU sets a few numbers |
| The whole cloud is one draw call | Draw-call count stays tiny however many points there are |
| The story moves only when the visitor moves it | The canvas renders nothing at rest on the low tier, and only small ambient motion elsewhere |
| The first screen is text on black | Nothing to wait for; three.js loads afterwards |
| Glow is additive blending | No post-processing pipeline |

For reference, landonorris.com (built by OFF+BRAND on Webflow, with WebGL for 3D and Rive for motion) is reported to stay fast through lazy-loading, optimised asset delivery and lean code ([case study](https://www.itsoffbrand.com/our-work/lando-norris)). We use the same habits, and go further by having almost no assets to deliver.

## Budgets

These are targets set before any code exists. Measure a baseline at the end of the first 3D phase; if a number proves wrong, change it here with a [DECISIONS](DECISIONS.md) entry. Do not quietly exceed it.

### Loading

| Metric | Budget |
| --- | --- |
| Opening text visible | Without waiting for the scene chunk |
| Largest Contentful Paint | ≤ 1.5 s desktop; ≤ 2.5 s on Lighthouse's mobile preset |
| Cumulative Layout Shift | ≤ 0.02 |
| Lighthouse performance score, mobile | ≥ 90 |
| Critical path (HTML, CSS, fonts, entry JS), gzipped | ≤ 100 KB |
| Scene chunk (three.js, R3F, scene code), gzipped | ≤ 400 KB, loaded after first paint. Raised from 300 KB on 2026-10-07 ([DECISIONS D29](DECISIONS.md)) |
| Whole experience, transferred | ≤ 1 MB |
| The résumé viewer (PDF.js and its worker), gzipped | ≤ 600 KB, loaded after first paint on `/resume` only. 567 KB on 2026-10-25, most of it the worker ([DECISIONS D49](DECISIONS.md)) |
| The résumé PDF, gzipped | ≤ 500 KB. Loaded only on `/resume` ([DECISIONS D49](DECISIONS.md)) |
| Font files | ≤ 2 families, subset, WOFF2 |
| Image textures in the scene | 0 |
| A picture in a job's panel at Whole | ≤ 150 KB each, loaded only when its panel opens ([DECISIONS D56](DECISIONS.md)) |
| The film in Etavolt's panel | ≤ 4 MB, loaded only when it is played ([D56](DECISIONS.md)) |

### Runtime

| Metric | Budget |
| --- | --- |
| Frame rate while scrolling, laptop with integrated graphics | 60 fps |
| Frame rate while scrolling, low tier | ≥ 30 fps, steady |
| Frames rendered at rest | 0 on the low tier, with reduced motion, with the tab hidden or the canvas off screen. Elsewhere only ambient motion, capped at 30 frames a second ([DECISIONS D26](DECISIONS.md), [D31](DECISIONS.md)), and only from the beat where something first moves: the Rings for the Machine, the Core for the city ([D38](DECISIONS.md)) |
| Draw calls | ≤ 30 |
| Long tasks (> 50 ms) after load | None during scroll |
| Allocations inside the frame loop | None |
| React re-renders per frame | None |

Point sampling at startup is the one piece of heavy CPU work. If it takes more than 50 ms on the low tier, move it to build time or a worker.

## Tiers

The site picks a tier at startup from device signals, and steps down a tier if measured frame rate stays below target.

| | High | Mid | Low |
| --- | --- | --- | --- |
| Typical device | Desktop or laptop with a discrete GPU | Laptop with integrated graphics, recent phone | Older or budget phone |
| Points | up to 600,000 | up to 60,000 | up to 20,000 |
| Pixel ratio cap | 2 | 1.5 | 1 |
| Pointer torch | Yes | Yes | Off |
| Scanner sweep | Yes | Yes | Yes |
| Easter eggs | Yes | Yes | Yes |
| Optional per-part interactions | Yes | Yes | Off |
| Post-processing | Only if a decision allows it | No | No |

Stepping down must never change the story, only the density. The point counts are starting guesses. The greybox phase measured only the development machine, so they are set when the site is tested on real devices, in Phase 5 ([DECISIONS D28](DECISIONS.md)). The look chosen in round 4 draws three quarters of each count. The high count was raised from 150,000 on 2026-10-08, from one tablet judged by eye ([DECISIONS D33](DECISIONS.md)); the mid and low counts are untouched.

### The city

The city replaces the Machine ([DECISIONS D38](DECISIONS.md)), and three things about it cost more.

- **It fills the window on every beat.** The Machine filled part of it. Filling the window is what dropped frames on Rahul's tablet when the dust did it ([DECISIONS D33](DECISIONS.md)). The tier counts above were set for the Machine; the city's are measured again on that tablet before they are set.
- **The canvas rests less.** The traffic, the river and the train move from the Core beat on, so on the high and mid tiers the canvas draws up to 30 frames a second while the city is on screen, for most of the page. Moving the points costs little; drawing the frame is the cost, and on a phone it is battery.
- **The Scanner sweep** ([DECISIONS D51](DECISIONS.md)) adds four draw calls at the Scanner beat only: 3,200 tiles, 40,236 line segments, 104 panels and the beam. It is built once when the scene attaches, beside the city's sampling: 31 ms on the development machine, which counts towards the 50 ms that sampling on the low tier is allowed. It draws while the beam moves and the surface closes, and stops a moment after: on the low tier, where nothing else moves, measured on 2026-10-25 on the development machine, no draw calls in two seconds at rest before a sweep or after it settled. It is on every tier, since it is the Scanner beat's point and costs little. The beam waiting at the building is still and costs no frames; its teaser ([D52](DECISIONS.md)) draws about 4.2 seconds once per visit on the high and mid tiers, and is off on the low tier and with reduced motion.
- **The easter eggs** ([DECISIONS D53](DECISIONS.md)) and the four after them ([D54](DECISIONS.md)) add one draw call once the city stands: about 2,300 points for the Merlion's spout, BLK 2024's number, the cat, the otters and the plane. The train, the band up BLK 2024 and the Supertrees' show are the city's own points. The plane moves with the scroll and asks for no frames of its own. Pointing at the city tests the eggs against the camera as the last frame left it, so it draws nothing until the pointer comes onto one; then frames are drawn for the few seconds it plays, then stops, on every tier.
- **More pieces.** Landmarks and many buildings are more geometry to sample than one rig. Time the sampling on a slow CPU early, and move it to build time or a worker if it passes 50 ms.

## Rules

**Do**

- Load everything under `src/experience/` lazily, after first paint.
- Keep the canvas on demand rendering. Request a frame only in response to input or while easing has not settled.
- Stop all rendering when the tab is hidden or the canvas is off screen.
- Put per-point work in shaders.
- Reuse vectors, colours and matrices; create them once outside the loop.
- Import only the drei helpers actually used.
- Dispose geometries and materials when they are replaced.

**Do not**

- Call `setState` or write to the store every frame.
- Add ambient motion outside the limits in [DECISIONS D26](DECISIONS.md): it must be small, in the shader, paused when hidden or off screen, and off on the low tier.
- Add a model file, texture, video background or HDRI without a decision entry.
- Add post-processing to fix a look that a shader tweak could achieve.
- Add a dependency without checking its gzipped size against the budget and clearing it with Rahul ([DECISIONS D13](DECISIONS.md)). Using a good package is preferred over hand-rolling; the check is about cost, not about avoiding packages.
- Add a loading screen.

## Measuring

| What | With | When |
| --- | --- | --- |
| LCP, CLS, score | Lighthouse (the Chrome DevTools MCP can run it) | End of every phase, on the deployed preview |
| Cost per frame (CPU and GPU, in ms), draw calls, points, sampling time | The workbench's benchmark mode, driven through the Chrome DevTools MCP | Whenever the scene changes |
| Long tasks | Chrome DevTools performance trace | Whenever the scene changes |
| Real frame rate | The workbench readout in an ordinary browser window, then the reference devices | Before a tier number is set or changed |
| Bundle budgets | `scripts/check-size.mjs`, at the end of every `pnpm build` and in CI | Every build |
| Frames at rest | Confirm the frame counter stops a second or two after input stops | Whenever the render loop is touched |

**Read cost per frame, not frames per second, from the automated browser.** The Chrome that the DevTools MCP drives does not run at the display's refresh rate: measured on 2026-10-05 it drew about 41 frames a second on an empty page, with gaps between 15 and 33 ms, on a machine whose display is 165 Hz. A frame rate read through it is wrong. What it measures correctly is how long a frame takes (the GPU timer extension is available) and every count. The targets are 16.7 ms a frame for 60 fps and 33.3 ms for 30 fps.

The development machine has a discrete GPU (RTX 4070 Ti), so it is a high-tier device. It cannot stand in for the mid or low tier. Test on real hardware, not only throttled desktop Chrome. The reference devices are not chosen yet; Rahul has put that off until later ([DECISIONS D28](DECISIONS.md)), and it stays an open question in [ROADMAP](ROADMAP.md).

### The bundle check

`scripts/check-size.mjs` enforces the three size rows of the Loading table and fails the build when one is exceeded ([DECISIONS D19](DECISIONS.md)). It is a tripwire for the scene leaking into the critical path, not a measure of how the site runs.

- **Critical path**, per page: the HTML, every script, stylesheet and preload it references, and what those import statically.
- **Scene chunk:** everything the lazy entries under `src/experience/` pull in that the page has not already loaded.
- **Whole experience:** the home page's critical path plus the scene chunk.
- Any other file in `dist/` fails the check, apart from the `react-dom/server` chunk that no page requests.

Sizes are gzipped by Node's zlib, in units of 1,000 bytes. `vite build` prints figures about 1% higher for the same files. Measured on 2026-10-05, before three.js: critical path 76.2 kB for `/` and 75.9 kB for `/plain`. Measured again on 2026-10-06, with three.js installed and nothing mounted: the same two figures.

**The scene chunk, measured once.** On 2026-10-06 a throwaway build mounted the Machine as points on the home page through one lazy import, and was then reverted ([DECISIONS D21](DECISIONS.md)). The scene chunk was 243.8 kB: three.js, React Three Fiber, the Machine's shapes and the points material. It did not include GSAP, which Phase 3 adds, or any drei helper. The budget was 300 kB then, which left about 56 kB for both and for the choreography code. On 2026-10-07 the minified files in the gsap 3.15.0 npm package were gzipped without installing it: the core is 28.4 kB and ScrollTrigger 18.0 kB, so the two would have taken the chunk to about 290 kB before any Phase 3 code. Rahul raised the budget to 400 kB ([DECISIONS D29](DECISIONS.md)), which leaves about 156 kB over the measured chunk, or about 110 kB once GSAP and ScrollTrigger are in. GSAP is still brought to Rahul before it is installed ([DECISIONS D13](DECISIONS.md)). The same build put the critical path at 77.1 kB for `/` and 76.8 kB for `/plain`, 0.9 kB more than with no scene, which is the cost of the lazy mount.

**The scene chunk, shipped.** On 2026-10-07, with the first choreography mounted and GSAP's core in it, the scene chunk is 265.0 kB of 400: about 21 kB more than the throwaway build, for the core, the timeline, the camera and the larger shader. The critical path is 77.3 kB for `/` and 77.0 kB for `/plain`. On 2026-10-24 the city replaced the Machine on the page and GSAP left it: the scene chunk is 254.4 kB, the critical path 77.5 kB for `/` and 77.1 kB for `/plain` ([DECISIONS D44](DECISIONS.md)). The same day the claims, their pins and the held text came in: the scene chunk is 257.1 kB, the critical path 79.8 kB for `/` and 79.2 kB for `/plain` ([D45](DECISIONS.md), [D46](DECISIONS.md)). On 2026-10-25 the exhibit's camera took it to 263.4 kB ([D48](DECISIONS.md)), and the Scanner sweep to 268.0 kB ([D51](DECISIONS.md)); on 2026-10-26 its teaser to 268.3 kB ([D52](DECISIONS.md)) the first three easter eggs to 271.8 kB ([D53](DECISIONS.md)), and on 2026-10-28 the other four to 274.9 kB ([D54](DECISIONS.md)). The critical path of `/` is 83.5 kB.

### Measured on the site, on the development machine

2026-10-07, in the automated Chrome, 1440 by 900. Draw calls were counted by wrapping the WebGL draw function, so these are frames really drawn.

| | Frames drawn in 2 s at rest |
| --- | --- |
| Found, Core (before the Rings wake), high tier | 0 |
| Whole, high tier, beads drifting | 50, against a cap of 30 a second. The automated browser paces frames unevenly, so read this as "capped", not as a rate |
| Whole, low tier (`?tier=low`) | 0 |
| Found, reduced motion | 0 |

Scrolling away and back to the same position gave the same camera position and pose, to four decimal places.

Start-up on the production build (`pnpm preview`): one long task of 72 ms as the scene attaches, which is three.js being evaluated, the points being sampled and the shader compiled. That is on a fast desktop CPU, so it will be several times longer on a phone. It happens after the text is on screen and not during scroll, so it breaks no row above, but it is the number to bring down if Lighthouse's blocking-time score suffers once deployed.

### The city on the workbench, on the development machine

2026-10-24, look A of the points round ([DECISIONS D42](DECISIONS.md)) with the traffic, the river and the train moving ([D43](DECISIONS.md)), story view, 1600 by 900, frames counted by the workbench readout.

| | |
| --- | --- |
| Points, draw calls | 90,000, 1 |
| GPU time per frame at the Rings beat, median | 0.21 ms |
| Sampling the points, development server | about 60 ms |
| Frames drawn in 3 s at rest, before the city has risen (Signal) | 0 |
| Frames drawn in 3 s at rest, Whole, high tier, moving | 92: capped at 30 a second |
| Frames drawn in 3 s at rest, Whole, low tier | 0 |

The motion is worked out in the vertex shader; the CPU sets three numbers a frame.

### Measured on the development machine

A high-tier device (RTX 4070 Ti, i5-13600KF), so these say the scene is cheap there and nothing about the mid or low tier. It is the only device measured in the greybox phase; Rahul put the others off ([DECISIONS D28](DECISIONS.md)).

Workbench benchmark, 2026-10-07, with the look chosen in round 4, which draws three quarters of each tier's points. Each tier's settings were run on this machine in a 2560 by 1440 viewport at that tier's pixel-ratio cap, so the high column is a 5120 by 2880 drawing buffer, more than any screen this machine drives.

| | High settings | Mid settings | Low settings |
| --- | --- | --- | --- |
| Points | 112,500 | 45,000 | 15,000 |
| Draw calls | 1 | 1 | 1 |
| GPU time per frame, median / 95th percentile | 0.44 / 2.36 ms | 0.20 / 0.21 ms | 0.08 / 0.08 ms |
| CPU time in render, median | 0.1 ms | 0.1 ms | 0.1 ms |
| Sampling the points | about 47 ms | about 21 ms | about 15 ms |
| Frames drawn in 2 s at rest | 0 | 0 | 0 |

With the camera about three times closer than the whole-Machine view, where each point covers about nine times as many pixels, the high settings cost 0.92 ms a frame at the median and 3.6 ms at the 95th percentile. A frame at 165 Hz is 6.1 ms and at 60 Hz 16.7 ms, so on this machine the cloud fits inside a frame with room to spare at every setting.

What this does not show:

- **Frame rate on a mid or low device.** Not measured. The tier point counts above are still the starting guesses. One data point, by eye: the high tier did not lag on Rahul's Samsung Galaxy Tab FE on 2026-10-08, so tablets are now guessed to be high ([DECISIONS D31](DECISIONS.md)).
- **Sampling on a slow CPU.** It is the number to watch. It has a fixed part of about 10 ms that does not shrink with the point count, and a low-tier phone's CPU is several times slower than this one, so 15 ms here is likely to pass the 50 ms limit above there. Measure it on a phone before deciding whether sampling moves to build time or a worker.
- **Start-up in a production build.** The workbench is the development server: loading it showed three long tasks, of 219, 101 and 56 ms, which include unminified modules and React's development build. Measure long tasks again on the built site once the scene is mounted, in Phase 3.
