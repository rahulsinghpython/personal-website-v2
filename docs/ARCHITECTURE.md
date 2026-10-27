# Architecture

How the site is built. The content layer, the Index and prerendering exist. The scene layer is mounted on the home page: the city as points, driven by scroll ([DECISIONS D44](DECISIONS.md)); see [ROADMAP](ROADMAP.md) for what Phase 3b still owes. Where a section below describes something not built yet, it says so. Read [EXPERIENCE](EXPERIENCE.md) for what is being built and [PERFORMANCE](PERFORMANCE.md) for the limits it must stay inside.

**The site happens in a city ([DECISIONS D38](DECISIONS.md)), drawn on the home page since 2026-10-24 ([D44](DECISIONS.md)).** The Machine it replaced was deleted on 2026-10-25, with its code, the workbench's `machine` world and GSAP ([D50](DECISIONS.md)); it is in git history up to `93798bd`. The city's code is in `src/experience/city/`: geometry generated in code, sampled to one cloud of points, moved in the vertex shader. Its story is a plain function of the beat, `seekCity` in `src/experience/city/story.ts`. Its ambient motion is the traffic, the river and the train, which move once the city has risen, on the way to Core (D43).

## Stack

| Layer | Choice | Installed | Why |
| --- | --- | --- | --- |
| Package manager | pnpm | 12.9.1 (pinned in `packageManager`), on Node 24.19.0 (`.nvmrc`) | Rahul's choice. |
| Build | Vite | vite 8.3.2, @vitejs/plugin-react 6.1.1 | Rahul already ships with it. Fast, simple, good code splitting. |
| UI | React + TypeScript (strict) | react and react-dom 19.3.0, typescript 7.0.2, @types/react and @types/react-dom 19.3.0 | Same reason. One mental model for the DOM and the scene. |
| 3D | three.js through React Three Fiber, with selected helpers from drei | three 0.186.1, @types/three 0.186.0, @react-three/fiber 9.8.1, @react-three/drei 10.7.9 (installed 2026-10-05) | Rahul has shipped three.js. R3F lets scene and DOM share state. The only drei helper in use is `OrbitControls`, on the workbench. R3F's peer range is React `>=19 <19.4`, so React stays below 19.4 until R3F widens it. |
| Shared state | zustand | zustand 5.0.15 (installed 2026-10-05) | Tiny, and readable from inside the render loop without causing React re-renders. So far it holds only the workbench's state. |
| Workbench panel | Tweakpane | tweakpane 4.0.5, @tweakpane/core 2.0.5 for its types (dev only, nothing shipped) | The control panel of the design workbench. See [DECISIONS D20](DECISIONS.md). |
| Prerendering | vite-prerender-plugin | vite-prerender-plugin 0.5.14 (dev only, nothing shipped) | Writes every page's HTML at build time, so content is readable with JavaScript off. See [DECISIONS D16](DECISIONS.md). |
| Styling | Tailwind CSS | tailwindcss 4.3.3, @tailwindcss/vite 4.3.3 | Matches Rahul's other current projects. It looks for class names in `src/` only (set in `src/styles/index.css`); by default it scans the whole repo, and words in docs and scripts became shipped CSS. |
| Lint and format | oxlint, Prettier | oxlint 1.86.0, prettier 3.9.9 | Same. |
| PDF viewer | react-pdf over PDF.js | react-pdf 11.0.0, pdfjs-dist 6.3.289, the version react-pdf pins (installed 2026-10-25) | Draws the résumé PDF the same in every browser, phones included, with selectable text and live links. Rahul's choice over the browser's own viewer ([DECISIONS D49](DECISIONS.md)). Loaded lazily on `/resume` only, from `src/resume/PdfSheet.tsx`, which sets PDF.js's worker as react-pdf asks. pdfjs-dist is a direct dependency only so the worker's file can be found. |
| Bundle check | `scripts/check-size.mjs`, run at the end of `pnpm build` and in CI | No package | Fails the build when a size budget is exceeded. Reads Vite's manifest (`build.manifest`). See [DECISIONS D19](DECISIONS.md). |
| Hosting | Vercel | Not set up yet | Same. |

Versions were the latest stable on 2026-10-05, when the scaffold was made and when Phase 2 added three.js. When a later phase adds a "not yet" row, install the latest stable then and record it here. Do not copy versions from other repos.

GSAP, which drove the Machine's story, was removed with it on 2026-10-25 ([D50](DECISIONS.md)): the city's story is a plain function of the beat.

Deliberately not used: a smooth-scroll library (see [DECISIONS D8](DECISIONS.md)), a UI component kit, a post-processing stack, a physics engine, a CMS.

### Adding a dependency

The default is to use a good existing package over writing our own, and to ask Rahul before adding it ([DECISIONS D13](DECISIONS.md)). Several pieces described below already have well-known packages (three.js ships a surface sampler; drei has helpers for performance monitoring and tier detection). Propose those when the work reaches them, with their size against the budget in [PERFORMANCE](PERFORMANCE.md). Add each accepted package to the table above with its reason.

## Two layers

The page is two layers that never depend on each other to render.

```
┌──────────────────────────────────────────────┐
│ Content layer (DOM)                           │  real HTML, scrolls natively
│   <section data-beat="found"> … </section>    │  readable with JS off
│   <section data-beat="signal"> … </section>   │  what search engines and
│   …                                           │  screen readers see
├──────────────────────────────────────────────┤
│ Scene layer (<canvas>, position: fixed)       │  behind the content
│   the city, driven by scroll progress         │  aria-hidden, lazy-loaded
└──────────────────────────────────────────────┘
```

**Content layer.** One semantic section per beat, holding that beat's text. It must exist in the built HTML, not be created by JavaScript after load. The acceptance test: view-source shows every career fact, and the page is readable with JavaScript disabled.

**How it is prerendered.** `src/main.tsx` is both the browser entry and the prerender entry. In the browser it hydrates the HTML that is already there. During `vite build`, vite-prerender-plugin loads the same module in Node and calls its exported `prerender()` once per page, which renders `<App>` to a string with `react-dom/server` and returns it with that page's title and description. The plugin writes the result into `#root` of `dist/index.html`, follows the link to the Index, and writes `dist/plain/index.html` the same way. Three things follow from this:

- Anything that runs when a module is imported must be safe in Node. Browser-only code goes behind a `typeof window` check or inside an effect.
- `App` takes the path as a prop and never reads `location` while rendering, so the build and the browser render the same tree.
- `react-dom/server` is imported inside `prerender()` so it stays out of the client bundle. The build still emits it as a chunk in `dist/assets/` (about 63 KB gzipped) that no page ever requests. It is the edge build because the browser build opens a `MessageChannel` on import, which stops `vite build` from exiting.

In `vite dev` there is no prerendering: `#root` starts empty and the app renders on the client.

**Pages.** There are four, and no router: `/` is the story, `/plain` is the Index ([DECISIONS D17](DECISIONS.md)), `/exhibit` is the city on its own, to look round ([D48](DECISIONS.md)), and `/resume` shows the résumé PDF, `public/resume.pdf`, drawn by PDF.js through a lazy import of its own, and offers it for download ([D49](DECISIONS.md)). The exhibit reaches its scene through a second lazy import, `src/experience/Exhibit.tsx`, which draws the same city with the same code (`src/experience/city/draw.ts`) and adds only the camera: three.js's own `OrbitControls`, so no new package. `src/routes.ts` maps a path to a page. Links between them are ordinary links and load a new document.

**Scene layer.** A fixed full-viewport canvas behind the content. It is loaded in a separate chunk after the first paint, so the opening screen (text on black) never waits for three.js. If the chunk fails or WebGL is missing, the content layer is already a complete page.

The opening screen is deliberately just type on a dark background. That is why no loading screen is needed.

**The pins** ([DECISIONS D45](DECISIONS.md)). A third, thin layer over the content: a fixed element the size of the canvas (`src/sections/Scene.tsx`), with no pointer events of its own, that the scene fills with HTML pins (`src/experience/city/pins.ts`). Each pin is a claim's place in the city, worked out from the city's plan; on every frame the scene draws, it is projected through the camera and its element moved there with a transform. Nothing goes through React, a frame where nothing moved writes nothing, and a tag's size is read only when it comes out, opens or closes. The pins repeat the claims and are `aria-hidden`. A claim's line on the page and its pin share a name in `data-claim`, which is how pointing at one lights both.

**Held text** ([D46](DECISIONS.md)). While the scene runs it adds `held` to the page, and each beat's text (`data-panel`) is held fixed where it stood when its beat arrived, instead of scrolling. The scene sets each text's opacity and the arrival of each claim line from eased progress, in the same frame as the pins and on one shared timing (`src/experience/hold.ts`, `src/experience/cue.ts`). The sections keep their heights, so the scroll and the progress measured from it are unchanged. Without the scene the text scrolls as an ordinary page.

## State

Three kinds of state, kept apart on purpose.

| State | Lives in | Changes | Read by |
| --- | --- | --- | --- |
| **Progress** (0 to 1) | A plain mutable value outside React | Every frame while scrolling | The render loop only |
| **Scene state**: current beat, opened part, tier, reduced motion | zustand store. Not built yet: nothing in the DOM reads it until Phase 4, and the scene picks its tier and reads reduced motion once, when it mounts | A few times per visit | DOM and scene |
| **Content** | Typed modules in `src/content/` | Never at runtime | Sections, the Index, part labels |

The rule that protects frame rate: **nothing that changes every frame goes through React state.** Progress is read directly inside the frame loop. React re-renders only when the beat or the opened part changes.

### Progress drives everything

```
scroll position ──▶ target progress ──▶ eased progress ──▶ the city's story (seekCity)
                                              │
                                              ├──▶ camera pose
                                              ├──▶ shader uniforms (rain, rise, what is lit)
                                              ├──▶ the pins and the held text (D45, D46)
                                              └──▶ current beat (written to the store when it changes)
```

- Target progress comes from the scroll position, measured against the sections: a beat has arrived when the bottom of its section meets the bottom of the window, which is where its text sits. Between two arrivals progress moves evenly. When every section is one window tall this is the scroll position divided by the scrollable height; when one is taller, as on a phone, the scene still stays in step with the text ([DECISIONS D31](DECISIONS.md)). On the way to a beat that dwells, a job or Whole, whose section is 1.3 windows tall, the second half of the scroll is spent on the last 40 per cent of the way, where its claims arrive ([D46](DECISIONS.md)). `src/state/progress.ts`.
- Eased progress chases the target a little each frame. This is what makes the city feel smooth while the page itself scrolls natively.
- The scene is a **pure function of eased progress**. Same progress, same picture. That makes it reversible (scroll up to undo), testable (set progress to any value and look), and easy to debug.

### Rendering on demand

The canvas does not run a continuous loop. A frame is drawn only when something asked for one: scroll, pointer movement over an interactive area, a click, a resize. While eased progress is still catching up, frames keep being requested; once it has settled, rendering stops entirely, unless a part has ambient motion ([DECISIONS D26](DECISIONS.md)), in which case frames continue at a capped rate, 30 a second, while the canvas is visible. The only ambient motion is the city's traffic, river and train, and they move on their own only once the city has risen, so nothing is drawn at rest before then on any tier, and never on the low tier ([DECISIONS D43](DECISIONS.md)). This is the technical side of "the visitor causes the motion" and it is the single largest performance win. See [PERFORMANCE](PERFORMANCE.md).

## How the city is drawn

**Geometry is generated, not loaded.** The city is a layout described as data (`city/layouts.ts`): the water, the roads, the CBD, the heartland and where each landmark stands. `city/city.ts` turns it into blocks and simple shapes (boxes, drums, lathed profiles, rods), each marked with when it rises; the eight landmarks are drawn in `city/landmarks.ts` from the operations in `shapes.ts`. There is no model file ([DECISIONS D4](DECISIONS.md)).

**Points are sampled from that geometry once**, when the scene attaches (`city/points.ts`), where they mean something: on windows, edges and roofs, the rest left dark ([D42](DECISIONS.md)). Each point gets, as vertex attributes: its place in the city; its place in the haze of the opening (`aDust`) and where it lands on the water as rain (`aWater`); which group it belongs to (`aGroup`: a job's subject, the CBD, the landmarks, and so on), so a beat can light or dim it; when its building rises (`aRise`); whether it is a window (`aWindow`); how it moves if it is traffic, the river or the train (`aMove`, `aPath`); and a little brightness and jitter of its own, so points do not all move in step.

**All point animation happens in the vertex shader.** The CPU sets a handful of uniforms per frame from the story (`city/draw.ts`, `applyCity`): how far the haze has rained down and the city risen, how lit and how bright each group is, the share of windows lit, how far the traffic has moved, the pointer for the torch. No per-point work happens in JavaScript after setup.

**The whole city is one draw call**, and the opening line's grains one more. The map's lines are one more, drawn only around Signal.

**The Scanner sweep** ([D51](DECISIONS.md)) is the one place surface is drawn, as the city's rule says: where the scan has rebuilt something. `city/scan.ts` builds, once, the Science Centre's tiles (one instanced draw), a mesh remeshed from its shape and drawn as lines, its solar panels and the beam: four draw calls, at the Scanner beat only. What has been swept is 32 numbers across the building, from raw points to rebuilt, held in uniforms the tiles, the lines, the panels and the city's own points all read, so the Science Centre's points give way where the surface comes in. The beam is aimed by casting the pointer's ray through the story's camera; the frame loop asks for frames only while the sweep is still closing. The teaser ([D52](DECISIONS.md)) drives the same beam and holds its own 32 numbers, which fall back to zero; the shaders read the greater of the two, so it never leaves anything rebuilt.

**The easter eggs** ([D53](DECISIONS.md), [D54](DECISIONS.md)), in `city/eggs.ts`, are found by testing the pointer against where each stands, projected through the camera as the last frame left it: the Merlion and its water, the cat, the box BLK 2024 stands in, the grove, the train's line and the river's. The spout, the painted number, the cat, the otters and the plane are one draw call of their own; the train, the band up BLK 2024 and the Supertrees' show are the city's points, moved and lit through `uTrain`, `uBlk` and `uShow`. The plane's path is `city/plane.ts`, a function of the beat, which the pins read too so the Core beat's last pin stays on it. `watchEggs` does the pointing for the home page and the exhibit alike, and a drag that turned the exhibit's camera plays nothing.

**No lights, no shadows, no environment map, no textures.** Points are unlit and coloured in the shader, cold or lit in the accent. Glow is faked with additive blending and soft point sprites, not a bloom pass. A point's size is in the city's own units, not in pixels, so the city is the same picture on a phone and on a monitor.

**The exhibit** (`/exhibit`, [D48](DECISIONS.md)) draws the same cloud with the same code, held at Whole, with three.js's `OrbitControls` for a camera the visitor moves.

## Planned layout

```
src/
  content/         typed facts: site, eras, projects, beats (copy), and the exhibit's and résumé's
                   words. Mirrors docs/CONTENT.md.
  sections/        the pages. Story.tsx lays out all eight beats; the four era beats share EraBeat.tsx.
                   Header.tsx is every page's header and Contact. Scene.tsx is where the story reaches
                   the scene, Exhibit.tsx the exhibit, Resume.tsx the résumé, each by a dynamic import.
  index-view/      the Index (plain version), served at /plain
  resume/          PdfSheet.tsx: the résumé PDF drawn by PDF.js, the résumé page's lazy entry (D49)
  experience/      everything inside the canvas
    shapes.ts      the few operations the city and its landmarks are made from: lathe, ring, rod, repeat
    params.ts      a number a shape depends on, with the range the workbench can tune it over
    city/          the city (D38 to D46)
      plan.ts      the flat map: points, outlines, distances
      layouts.ts   the layout as data: water, roads, viaduct, CBD, open ground, landmarks
      landmarks.ts the eight landmarks
      city.ts      a layout turned into blocks, then into shapes and map lines, each marked with when it rises
      points.ts    the city as points: sampling, the points material, the chosen look
      story.ts     the city's story as a function of the beat: the camera, the rain, the rise, what is lit
      draw.ts      what the home page and the exhibit share: the layout, the look, the story into a material
      pins.ts      each claim pinned to its proof in the city (D45)
      scan.ts      the Scanner sweep: the beam, the surface rebuilt where it has passed, the panels (D51)
      eggs.ts      the easter eggs: what the pointer finds and what each plays (D53, D54)
      plane.ts     the plane leaving Changi, where it is at a beat, and its pin (D54)
    camera/        camera.ts: how a pose is applied and the picture framed
    ink.ts         where the letters of the opening line are on the page, and the mask that rubs it out (D37)
    cue.ts         when a beat's words and pins come and go (D46)
    hold.ts        the beats' text held still on the window (D46)
    Experience.tsx the story's lazy entry: the canvas and the frame loop
    Exhibit.tsx    the exhibit's lazy entry: the city held at Whole, and the visitor's camera (D48)
  state/           progress.ts: progress, read from scroll. tiers.ts: the tier numbers, and a
                   stand-in for tier detection until Phase 5. The store is not built yet.
  styles/
  routes.ts        which path is which page; page titles
  App.tsx          picks the page for a path
  main.tsx         browser entry (hydrates) and prerender entry (build time)
workbench/         the design tool. Development only; never built. See "The workbench".
scripts/
  check-size.mjs   the bundle check
docs/
```

`src/experience/` and `workbench/` are the only places allowed to import three.js. Everything else in `src/` must work if the scene never loads, and reaches it through a lazy import: one for the story, one for the exhibit. oxlint enforces this (`no-restricted-imports` in `.oxlintrc.json`): three.js, React Three Fiber and anything under `src/experience/` cannot be imported from the rest of `src/`, and nothing in `src/` can import the workbench or Tweakpane. The rule also catches the dynamic import, so `src/sections/Scene.tsx` and `src/sections/Exhibit.tsx` switch it off for that one line. A static import slipping in there would not be caught by lint; the bundle check would catch it, because the critical path would pass its budget.

## The workbench

The design tool described in [DESIGN-PROCESS](DESIGN-PROCESS.md#the-workbench). It lives in `workbench/`, outside `src/`, with its own `workbench/index.html`, and is served by `pnpm dev` at `/workbench/`.

**It cannot ship.** `vite build` builds only the root `index.html`, and nothing in `src/` imports `workbench/`, so it is never part of the production module graph. It has no `prerender` script and no page links to it, so it is never rendered at build time either. Two checks back this up: the lint rule above, and `scripts/check-size.mjs`, which fails the build on any HTML page other than the site's four and on any file no budget covers.

**The split.** The city's code is in `src/experience/city/` and ships with the scene. The workbench only imports it and adds the tools around it:

| File | What it is |
| --- | --- |
| `store.ts` | The workbench's own settings in zustand: tier, view, shading, side by side, thumbnail, phone size, the story's beat. Mirrored to the URL. |
| `city.ts` | The city's state: the layout and its numbers, the looks as points, what is shown, how far it has risen outside the story. Mirrored to the URL. |
| `CityScene.tsx` | The city in a viewport, as the greybox (ground, water, map lines and the solid pieces, which rise in the shader) or as points. In the `story` view it places the camera from `src/experience/city/story.ts`. |
| `cloud.ts` | Whether the city is drawn solid or as points. Mirrored to the URL. |
| `camera.ts` | One camera pose shared by every viewport, and the preset views. A mutable value, because it changes every frame while orbiting. |
| `Viewport.tsx` | One canvas showing one option, rendering on demand: the orbit, the greybox's light, the wheel that scrubs the story in the `story` view, and the probe that measures frames. |
| `Panel.tsx` | The Tweakpane panel: the shared settings, the story's scrubber, the city's controls with a tab per layout and per look, then the readout. |
| `stats.ts` | Cost per frame (CPU and GPU), draw calls, frames drawn, and the benchmark. |

`window.__workbench` exposes `get`, `set`, `benchmark`, `stats`, `cloud` and `city`, so the workbench can be driven from the console or the Chrome DevTools MCP.

## Fallbacks

| Condition | Result |
| --- | --- |
| JavaScript off | Content layer only. Fully readable. |
| WebGL unavailable or context lost | Content layer plus a static image of the lit city. |
| `prefers-reduced-motion` | The city shown whole and lit; camera cuts between beats; no crumbling, no rain, no rise; nothing moves on its own (`seekCityStill`). Phase 5 reviews it. |
| Low tier device | Fewer points, lower pixel ratio, optional interactions off. See tiers in [PERFORMANCE](PERFORMANCE.md). |
| Visitor clicks `INDEX` | The Index at `/plain`: same content, no canvas. |

## Accessibility

- Canvas is `aria-hidden`. It carries no information that is not also in the DOM.
- Reading order in the DOM matches the story order.
- Anything that can be opened by clicking in the city also has a real link or button.
- Text contrast is checked against the near-black background, including the accent colour.
- Focus is always visible.
