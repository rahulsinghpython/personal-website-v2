# Decisions

What has been decided, why, and what was passed over. Read this before proposing a different approach. To change a decision, add a new entry that supersedes the old one; do not edit history.

**Accepted** means Rahul set or confirmed it. **Proposed** means a chat put it forward and it is the working assumption until Rahul says otherwise.

D3 to D5 and D7 to D11 were proposed in the documentation pass on 2026-10-05 and accepted by Rahul the same day.

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

### D14. Design happens in the browser, on a workbench — Proposed, 2026-10-05

**Why:** there is no designer or 3D artist, and a procedural object cannot be mocked up in a design tool anyway. So the design tool is a development-only page where the Machine is live and every parameter is a slider. Decisions are made by looking at real output and picking between two or three built options, in a fixed order: references, silhouette, parts, points, colour and type, motion. Full process in [DESIGN-PROCESS](DESIGN-PROCESS.md).

**Passed over:** designing in Figma or Blender first (a second tool to learn, and the result would still have to be rebuilt in code); writing a detailed visual spec up front (nobody can judge a shape from prose).
