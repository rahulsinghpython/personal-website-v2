# Architecture

How the site is built. Only the scaffold exists so far (see [ROADMAP](ROADMAP.md)); the rest is the plan the build phases follow. Read [EXPERIENCE](EXPERIENCE.md) for what is being built and [PERFORMANCE](PERFORMANCE.md) for the limits it must stay inside.

## Stack

| Layer | Choice | Installed | Why |
| --- | --- | --- | --- |
| Package manager | pnpm | 12.9.1 (pinned in `packageManager`), on Node 24.19.0 (`.nvmrc`) | Rahul's choice. |
| Build | Vite | vite 8.3.2, @vitejs/plugin-react 6.1.1 | Rahul already ships with it. Fast, simple, good code splitting. |
| UI | React + TypeScript (strict) | react and react-dom 19.3.0, typescript 7.0.2, @types/react and @types/react-dom 19.3.0 | Same reason. One mental model for the DOM and the scene. |
| 3D | three.js through React Three Fiber, with selected helpers from drei | Not yet; added in Phase 2 | Rahul has shipped three.js. R3F lets scene and DOM share state. |
| Shared state | zustand | Not yet; added in the phase that first needs it | Tiny, and readable from inside the render loop without causing React re-renders. |
| Choreography | GSAP, one paused master timeline | Not yet; added in Phase 3 | The whole story is one timeline whose position is set from scroll progress. |
| Styling | Tailwind CSS | tailwindcss 4.3.3, @tailwindcss/vite 4.3.3 | Matches Rahul's other current projects. |
| Lint and format | oxlint, Prettier | oxlint 1.86.0, prettier 3.9.9 | Same. |
| Hosting | Vercel | Not set up yet | Same. |

Versions were the latest stable on 2026-10-05, when the scaffold was made. When a later phase adds a "not yet" row, install the latest stable then and record it here. Do not copy versions from other repos.

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

**Content layer.** One semantic section per beat, holding that beat's text. It must exist in the built HTML, not be created by JavaScript after load. The acceptance test: view-source shows every career fact, and the page is readable with JavaScript disabled. How the HTML is prerendered is chosen during scaffolding; the test is what matters.

**Scene layer.** A fixed full-viewport canvas behind the content. It is loaded in a separate chunk after the first paint, so the opening screen (text on black) never waits for three.js. If the chunk fails or WebGL is missing, the content layer is already a complete page.

The opening screen is deliberately just type on a dark background. That is why no loading screen is needed.

## State

Three kinds of state, kept apart on purpose.

| State | Lives in | Changes | Read by |
| --- | --- | --- | --- |
| **Progress** (0 to 1) | A plain mutable value outside React | Every frame while scrolling | The render loop only |
| **Scene state**: current beat, opened part, tier, reduced motion | zustand store | A few times per visit | DOM and scene |
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

- Target progress is the scroll position divided by the scrollable height.
- Eased progress chases the target a little each frame. This is what makes the Machine feel smooth while the page itself scrolls natively.
- The scene is a **pure function of eased progress**. Same progress, same picture. That makes it reversible (scroll up to undo), testable (set progress to any value and look), and easy to debug.

### Rendering on demand

The canvas does not run a continuous loop. A frame is drawn only when something asked for one: scroll, pointer movement over an interactive area, a click, a resize. While eased progress is still catching up, frames keep being requested; once it has settled, rendering stops entirely. This is the technical side of "the visitor causes the motion" and it is the single largest performance win. See [PERFORMANCE](PERFORMANCE.md).

## How the Machine is drawn

**Geometry is generated, not loaded.** Each part is described in code as a set of simple shapes (cylinders, tori, discs, tubes along curves). There is no model file.

**Points are sampled from that geometry once**, at startup or at build time. Each point gets, as vertex attributes:

- its position in the assembled Machine,
- its position as dust,
- which part it belongs to,
- a small random offset so points do not all move in step.

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
  content/         typed facts: site, eras, projects. Mirrors docs/CONTENT.md.
  sections/        the DOM beats, one component per beat
  index-view/      the Index (plain version)
  experience/      everything inside the canvas
    machine/       part definitions, point sampling, shaders
    camera/        camera pose as a function of progress
    timeline.ts    the master timeline
    Experience.tsx the lazy-loaded entry to the scene
  state/           store, progress, tier detection
  styles/
  App.tsx
  main.tsx
docs/
```

`src/experience/` is the only place allowed to import three.js. Everything outside it must work if that folder never loads.

## Fallbacks

| Condition | Result |
| --- | --- |
| JavaScript off | Content layer only. Fully readable. |
| WebGL unavailable or context lost | Content layer plus a static image of the finished Machine. |
| `prefers-reduced-motion` | Machine shown assembled and awake; camera cuts between beats; no assembly animation. |
| Low tier device | Fewer points, lower pixel ratio, optional interactions off. See tiers in [PERFORMANCE](PERFORMANCE.md). |
| Visitor clicks `INDEX` | The Index: same content, no canvas. |

## Accessibility

- Canvas is `aria-hidden`. It carries no information that is not also in the DOM.
- Reading order in the DOM matches the story order.
- Every part that can be opened by clicking the Machine also has a real link or button.
- Text contrast is checked against the near-black background, including the accent colour.
- Focus is always visible.
