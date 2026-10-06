# Performance

The site has to look expensive and be cheap. This doc says why that is possible, what the limits are, and how to check them.

## Why it can be fast

The concept was picked partly for its cost. Each visual choice removes a whole category of work.

| Choice | What it avoids |
| --- | --- |
| The world is black | No skybox, no environment map, no ground, no fog passes |
| The Machine is points and lines | No lighting, no shadows, no materials that need textures |
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
| Scene chunk (three.js, R3F, scene code), gzipped | ≤ 300 KB, loaded after first paint |
| Whole experience, transferred | ≤ 1 MB |
| Font files | ≤ 2 families, subset, WOFF2 |
| Image textures in the scene | 0 |

### Runtime

| Metric | Budget |
| --- | --- |
| Frame rate while scrolling, laptop with integrated graphics | 60 fps |
| Frame rate while scrolling, low tier | ≥ 30 fps, steady |
| Frames rendered at rest | 0 on the low tier, with reduced motion, with the tab hidden or the canvas off screen. Elsewhere only ambient motion, at a capped rate to be set in Phase 3 ([DECISIONS D26](DECISIONS.md)) |
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
| Points | up to 150,000 | up to 60,000 | up to 20,000 |
| Pixel ratio cap | 2 | 1.5 | 1 |
| Pointer torch | Yes | Yes | Off |
| Optional per-part interactions | Yes | Yes | Off |
| Post-processing | Only if a decision allows it | No | No |

Stepping down must never change the story, only the density. The point counts are starting guesses to tune in the greybox phase.

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

The development machine has a discrete GPU (RTX 4070 Ti), so it is a high-tier device. It cannot stand in for the mid or low tier. Test on real hardware, not only throttled desktop Chrome. The reference devices are not chosen yet; that is an open question in [ROADMAP](ROADMAP.md).

### The bundle check

`scripts/check-size.mjs` enforces the three size rows of the Loading table and fails the build when one is exceeded ([DECISIONS D19](DECISIONS.md)). It is a tripwire for the scene leaking into the critical path, not a measure of how the site runs.

- **Critical path**, per page: the HTML, every script, stylesheet and preload it references, and what those import statically.
- **Scene chunk:** everything the lazy entries under `src/experience/` pull in that the page has not already loaded.
- **Whole experience:** the home page's critical path plus the scene chunk.
- Any other file in `dist/` fails the check, apart from the `react-dom/server` chunk that no page requests.

Sizes are gzipped by Node's zlib, in units of 1,000 bytes. `vite build` prints figures about 1% higher for the same files. Measured on 2026-10-05, before three.js: critical path 76.2 kB for `/` and 75.9 kB for `/plain`.
