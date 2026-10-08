# Architecture

How the site is built. The content layer, the Index and prerendering exist. The scene layer is mounted on the home page in a first version: the Machine as points, driven by scroll (see [ROADMAP](ROADMAP.md) for what Phase 3 still owes). Where a section below describes something not built yet, it says so. Read [EXPERIENCE](EXPERIENCE.md) for what is being built and [PERFORMANCE](PERFORMANCE.md) for the limits it must stay inside.

## Stack

| Layer | Choice | Installed | Why |
| --- | --- | --- | --- |
| Package manager | pnpm | 12.9.1 (pinned in `packageManager`), on Node 24.19.0 (`.nvmrc`) | Rahul's choice. |
| Build | Vite | vite 8.3.2, @vitejs/plugin-react 6.1.1 | Rahul already ships with it. Fast, simple, good code splitting. |
| UI | React + TypeScript (strict) | react and react-dom 19.3.0, typescript 7.0.2, @types/react and @types/react-dom 19.3.0 | Same reason. One mental model for the DOM and the scene. |
| 3D | three.js through React Three Fiber, with selected helpers from drei | three 0.186.1, @types/three 0.186.0, @react-three/fiber 9.8.1, @react-three/drei 10.7.9 (installed 2026-10-05) | Rahul has shipped three.js. R3F lets scene and DOM share state. The only drei helper in use is `OrbitControls`, on the workbench. R3F's peer range is React `>=19 <19.4`, so React stays below 19.4 until R3F widens it. |
| Shared state | zustand | zustand 5.0.15 (installed 2026-10-05) | Tiny, and readable from inside the render loop without causing React re-renders. So far it holds only the workbench's state. |
| Workbench panel | Tweakpane | tweakpane 4.0.5, @tweakpane/core 2.0.5 for its types (dev only, nothing shipped) | The control panel of the design workbench. See [DECISIONS D20](DECISIONS.md). |
| Choreography | GSAP, one paused master timeline | gsap 3.15.0 (installed 2026-10-07). Only `gsap/gsap-core` is imported | The whole story is one timeline whose position is set from scroll progress. The core alone is enough because everything animated is a number on a plain object; no ScrollTrigger and no CSS plugin ([DECISIONS D30](DECISIONS.md)). |
| Prerendering | vite-prerender-plugin | vite-prerender-plugin 0.5.14 (dev only, nothing shipped) | Writes every page's HTML at build time, so content is readable with JavaScript off. See [DECISIONS D16](DECISIONS.md). |
| Styling | Tailwind CSS | tailwindcss 4.3.3, @tailwindcss/vite 4.3.3 | Matches Rahul's other current projects. It looks for class names in `src/` only (set in `src/styles/index.css`); by default it scans the whole repo, and words in docs and scripts became shipped CSS. |
| Lint and format | oxlint, Prettier | oxlint 1.86.0, prettier 3.9.9 | Same. |
| Bundle check | `scripts/check-size.mjs`, run at the end of `pnpm build` and in CI | No package | Fails the build when a size budget is exceeded. Reads Vite's manifest (`build.manifest`). See [DECISIONS D19](DECISIONS.md). |
| Hosting | Vercel | Not set up yet | Same. |

Versions were the latest stable on 2026-10-05, when the scaffold was made and when Phase 2 added three.js. When a later phase adds a "not yet" row, install the latest stable then and record it here. Do not copy versions from other repos.

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
│   the Machine, driven by scroll progress      │  aria-hidden, lazy-loaded
└──────────────────────────────────────────────┘
```

**Content layer.** One semantic section per beat, holding that beat's text. It must exist in the built HTML, not be created by JavaScript after load. The acceptance test: view-source shows every career fact, and the page is readable with JavaScript disabled.

**How it is prerendered.** `src/main.tsx` is both the browser entry and the prerender entry. In the browser it hydrates the HTML that is already there. During `vite build`, vite-prerender-plugin loads the same module in Node and calls its exported `prerender()` once per page, which renders `<App>` to a string with `react-dom/server` and returns it with that page's title and description. The plugin writes the result into `#root` of `dist/index.html`, follows the link to the Index, and writes `dist/plain/index.html` the same way. Three things follow from this:

- Anything that runs when a module is imported must be safe in Node. Browser-only code goes behind a `typeof window` check or inside an effect.
- `App` takes the path as a prop and never reads `location` while rendering, so the build and the browser render the same tree.
- `react-dom/server` is imported inside `prerender()` so it stays out of the client bundle. The build still emits it as a chunk in `dist/assets/` (about 63 KB gzipped) that no page ever requests. It is the edge build because the browser build opens a `MessageChannel` on import, which stops `vite build` from exiting.

In `vite dev` there is no prerendering: `#root` starts empty and the app renders on the client.

**Pages.** There are two, and no router: `/` is the story and `/plain` is the Index ([DECISIONS D17](DECISIONS.md)). `src/routes.ts` maps a path to a page. Links between them are ordinary links and load a new document.

**Scene layer.** A fixed full-viewport canvas behind the content. It is loaded in a separate chunk after the first paint, so the opening screen (text on black) never waits for three.js. If the chunk fails or WebGL is missing, the content layer is already a complete page.

The opening screen is deliberately just type on a dark background. That is why no loading screen is needed.

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
scroll position ──▶ target progress ──▶ eased progress ──▶ master timeline position
                                              │
                                              ├──▶ camera pose
                                              ├──▶ shader uniforms (assembly, wake, per part)
                                              └──▶ current beat (written to the store when it changes)
```

- Target progress comes from the scroll position, measured against the sections: a beat has arrived when the bottom of its section meets the bottom of the window, which is where its text sits. Between two arrivals progress moves evenly. When every section is one window tall this is the scroll position divided by the scrollable height; when one is taller, as on a phone, the scene still stays in step with the text ([DECISIONS D31](DECISIONS.md)). `src/state/progress.ts`.
- Eased progress chases the target a little each frame. This is what makes the Machine feel smooth while the page itself scrolls natively.
- The scene is a **pure function of eased progress**. Same progress, same picture. That makes it reversible (scroll up to undo), testable (set progress to any value and look), and easy to debug.

### Rendering on demand

The canvas does not run a continuous loop. A frame is drawn only when something asked for one: scroll, pointer movement over an interactive area, a click, a resize. While eased progress is still catching up, frames keep being requested; once it has settled, rendering stops entirely, unless a part has ambient motion ([DECISIONS D26](DECISIONS.md)), in which case frames continue at a capped rate, 30 a second, while the canvas is visible. The only ambient motion is the beads, and they move only once the Rings are awake, so nothing is drawn at rest before the Rings beat on any tier. This is the technical side of "the visitor causes the motion" and it is the single largest performance win. See [PERFORMANCE](PERFORMANCE.md).

## How the Machine is drawn

**Geometry is generated, not loaded.** Each part is described in code as a set of simple shapes (cylinders, tori, discs, tubes along curves). There is no model file.

**Points are sampled from that geometry once**, at startup or at build time. Each point gets, as vertex attributes:

- its position in the assembled Machine,
- its position as dust,
- which part it belongs to,
- a small random offset so points do not all move in step.

Two things about the sampling are deliberate ([DECISIONS D27](DECISIONS.md)). Points are not shared out by surface area alone: the thinner a piece is, the more closely its points are packed, or the plates would take nearly every point and the lines would vanish. And a point's size is in the Machine's own units, not in pixels, so the Machine is the same picture on a phone and on a monitor.

**All point animation happens in the vertex shader.** The CPU sets a handful of uniforms per frame (overall progress, how assembled and how awake each part is, pointer position for the torch and the scan beam). The GPU interpolates every point between dust and assembled and picks its colour and size. No per-point work happens in JavaScript after setup.

**The whole cloud is one draw call**, or one per part if that makes per-part control simpler. Lines and the few solid surfaces are a small number of additional draw calls.

**No lights, no shadows, no environment map, no textures.** Points and lines are unlit and coloured in the shader. Glow is faked with additive blending and soft point sprites, not a bloom pass.

Parts are data. Adding or changing a part should mean editing its description, not writing new rendering code:

```ts
// shape of the idea, not final code
type Part = {
  id: 'core' | 'scanner' | 'rings' | 'lens'
  era: EraId                    // links to src/content
  build: () => BufferGeometry[] // the shapes points are sampled from
  window: [number, number]      // the slice of progress in which it assembles
}
```

## Planned layout

```
src/
  content/         typed facts: site, eras, projects, beats (copy). Mirrors docs/CONTENT.md.
  sections/        the DOM beats. Story.tsx lays out all eight; the four era beats share EraBeat.tsx.
                   Scene.tsx is the one place the page reaches the scene, by a dynamic import.
  index-view/      the Index (plain version), served at /plain
  experience/      everything inside the canvas
    machine/       part definitions, point sampling, shaders
      part.ts      what a part is: parameters in, geometry out
      shapes.ts    the few operations parts are made from: lathe, ring, rod, pipe, repeat
      points.ts    the Machine as a point cloud: surface sampling, the points material, the chosen look
      machine.ts   the Machine: the signed-off silhouette and the picked detail of each part
      cube.ts      the cube of cubes with a city on its roof, which the Lens carries
      variants.ts  the shapes the workbench switches between; one, now the shape is settled
    camera/        camera.ts: the camera's pose at each beat, and how a pose is applied
    timeline.ts    the master timeline, and the plain object it writes the story into
    ink.ts         where the letters of the opening line are on the page, and the mask that rubs it out (D37)
    Experience.tsx the lazy-loaded entry to the scene: the canvas and the frame loop
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

`src/experience/` and `workbench/` are the only places allowed to import three.js. Everything else in `src/` must work if the scene never loads, and reaches it through one lazy import. oxlint enforces this (`no-restricted-imports` in `.oxlintrc.json`): three.js, React Three Fiber and anything under `src/experience/` cannot be imported from the rest of `src/`, and nothing in `src/` can import the workbench or Tweakpane. The rule also catches the dynamic import, so `src/sections/Scene.tsx` switches it off for that one line. A static import slipping in there would not be caught by lint; the bundle check would catch it, because the critical path would pass its budget.

## The workbench

The design tool described in [DESIGN-PROCESS](DESIGN-PROCESS.md#the-workbench). It lives in `workbench/`, outside `src/`, with its own `workbench/index.html`, and is served by `pnpm dev` at `/workbench/`.

**It cannot ship.** `vite build` builds only the root `index.html`, and nothing in `src/` imports `workbench/`, so it is never part of the production module graph. It has no `prerender` script and no page links to it, so it is never rendered at build time either. Two checks back this up: the lint rule above, and `scripts/check-size.mjs`, which fails the build on any HTML page other than `/` and `/plain` and on any file no budget covers.

**The split.** The Machine's own code (each part as a function of its parameters) is in `src/experience/machine/` and will ship with the scene. The workbench only imports it and adds the tools around it:

| File | What it is |
| --- | --- |
| `store.ts` | The workbench's state in zustand: variant, tier, view, every parameter value. Mirrored to the URL. |
| `cloud.ts` | How the points are drawn: the sliders' values, starting from the chosen look. Mirrored to the URL. |
| `camera.ts` | One camera pose shared by every viewport. A mutable value, because it changes every frame while orbiting. |
| `Viewport.tsx` | One canvas showing one variant, rendering on demand. With the story on, it puts the timeline at the scrubber's beat; in the `story` view the camera is the visitor's. |
| `Panel.tsx` | The Tweakpane panel: a tab per variant, a folder per part, a slider per parameter, and the readout. |
| `stats.ts` | Cost per frame (CPU and GPU), draw calls, frames drawn, and the benchmark. |

`window.__workbench` exposes `get`, `set`, `benchmark`, `stats` and `cloud`, so the workbench can be driven from the console or the Chrome DevTools MCP.

## Fallbacks

| Condition | Result |
| --- | --- |
| JavaScript off | Content layer only. Fully readable. |
| WebGL unavailable or context lost | Content layer plus a static image of the finished Machine. |
| `prefers-reduced-motion` | Machine shown assembled and awake; camera cuts between beats; no assembly animation; the beads do not drift. Built in Phase 3 in this plain form; Phase 5 reviews it. |
| Low tier device | Fewer points, lower pixel ratio, optional interactions off. See tiers in [PERFORMANCE](PERFORMANCE.md). |
| Visitor clicks `INDEX` | The Index at `/plain`: same content, no canvas. |

## Accessibility

- Canvas is `aria-hidden`. It carries no information that is not also in the DOM.
- Reading order in the DOM matches the story order.
- Every part that can be opened by clicking the Machine also has a real link or button.
- Text contrast is checked against the near-black background, including the accent colour.
- Focus is always visible.
