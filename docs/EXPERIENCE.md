# Experience

What the visitor sees and does. Read [VISION](VISION.md) first.

**Status of this doc:** the structure (one object, four parts, eight beats, the interaction rules) is the agreed direction. The Machine's silhouette and the detail of each part were settled on 2026-10-06 and redrawn on 2026-10-07 after outside feedback; how its points are drawn was settled on 2026-10-07. Colour, type, motion and the wording of the copy are still open and get settled by prototyping. The last section says which is which.

## The Machine

A strange instrument floating in darkness. It is not a robot, has no face, and its purpose is not obvious. It is drawn mostly as **points**, like a LiDAR scan, with thin lines and a few solid surfaces appearing as parts wake up.

### The shape

Picked by Rahul on 2026-10-07, on the workbench, as the third of three ([DECISIONS D32](DECISIONS.md)). It replaces the shape signed off the day before ([D23](DECISIONS.md), [D25](DECISIONS.md)), keeping its rig and its outline. It looks like computing hardware, not like an observatory instrument ([D22](DECISIONS.md)). Five words for the feeling: futuristic, nested, wired, kinetic, dense.

It is a tall rig that hangs. Every part is on the rig's axis and drawn in the rig's vocabulary: plates, posts, lines and cans. Nothing sticks out to one side and nothing stands on top as a second shape.

- **The rig (Core).** A stack of round plates that narrow as they descend, joined by posts. The top plate is solid; the others are open in the middle, and a bundle of straight lines drops through all of them. It hangs from a short mount at the top. The look is borrowed from the inside of a quantum computer; the Machine does not claim Rahul worked on one.
- **The roof (Scanner).** The top plate is a roof. Four solar panels stand on it in a ring, tilted outward, each drawn as a grid of cells. A scanning puck sits on the mount above them and sweeps a fan of beams down one panel. The 3D scanning was for solar: roofs rebuilt in 3D and panels placed on them ([CONTENT](CONTENT.md)).
- **The orbits (Rings).** The three lowest plates each carry a thin ring on three spokes, with a row of beads on it, more beads the wider the ring. The rings get wider as the plates get narrower, so the outline is a diamond. The spokes line up into three ribs and are drawn faintly. The beads are the things being scheduled: they drift round their rings and settle into even spacing ([DECISIONS D25](DECISIONS.md), [D26](DECISIONS.md)).
- **The stage (Lens).** Under the last plate, where the chip sits in a real rig: a cube of eight cubes, drawn by its edges, on a small plate hung from three thin posts. Every line of the bundle runs into its roof and one tip leaves below. Data in, an answer out.

Because the Scanner is at the top, the Rings in the middle and the Lens at the bottom, the parts wake from the top of the Machine to the bottom, and after the Core the camera only travels down.

As points (round 4) it is one cloud sampled from these surfaces. The thinner a piece is, the more closely its points are packed, so the lines, rings and beams do not vanish behind the plates; and a point is sized as part of the object, so the Machine is the same picture on a phone as on a monitor ([D27](DECISIONS.md)). The look Rahul chose on 2026-10-07 sits between an even scan and a drawing led by its lines: the plates are a thin scatter and the lines, rings and beams are the brightest things in it ([D28](DECISIONS.md)).

The code is `src/experience/machine/machine.ts`, and every number in it is a slider on the workbench.

It has four parts. Each part stands for **a kind of work** Rahul has done, and is one connected piece of the shape. The company and the years are small print beside it, not the point ([DECISIONS D24](DECISIONS.md)).

| Part | The work | Which piece of the Machine | Small print |
| --- | --- | --- | --- |
| **Core** | Data engineering: pipelines, microservices, throughput | The rig: the tiers and the lines running down through them | S2T, 2021 to 2023 |
| **Scanner** | Turning LiDAR point clouds into 3D models | The roof: the puck, its beams and the solar panels | Etavolt, 2023 to 2024 |
| **Rings** | Scheduling, bookings, calendars: many moving things kept in order | The orbit rings | Uniad, 2024 onward |
| **Lens** | LLM analytics: turning raw data into something a person can read | The stage: the cube under the last plate, and the tip | Cognizant, 2024 onward |

The names are handles for us and never shown to a visitor; the Lens is no longer shaped like a lens. Parts still assemble **in the order Rahul came to the work**, so the Machine is built the way the career was.

### Three states

Every point, and so every part, is in one of three states.

1. **Dust.** Scattered, dim, unreadable. Looks like noise or stars.
2. **Dormant.** In position. The shape is readable but cold and unlit.
3. **Awake.** Powered on. Warm accent colour, lines drawn, surfaces filled. The lines are built ([DECISIONS D34](DECISIONS.md)); the surfaces are not.

Colour carries state, not decoration: cold white means dormant, the warm accent means awake. A visitor should be able to tell how far through the story they are from colour alone.

## The beats

The page is one long scroll. The canvas is fixed behind it and the Machine responds to how far the visitor has scrolled.

| # | Beat | What the visitor sees | What they learn |
| --- | --- | --- | --- |
| 0 | **Found** | Black. Small type: `YOU'VE FOUND RAHUL.` Faint dust in the dark. Moving the pointer lights the dust near it. | Something is here. Nothing is explained. |
| 1 | **Signal** | First scroll. The dust pulls inward and a silhouette forms. Dormant, unlabelled. | The dust was an object all along. |
| 2 | **Core** | Camera moves in. The Core locks together and wakes. First label appears: the work, with the years and the company in small print. | The object has parts, and a part is a kind of work. |
| 3 | **Scanner** | The Scanner assembles as raw points. The visitor sweeps across it and surface appears where they sweep. | Rahul built this kind of software. They have been looking at it the whole time. |
| 4 | **Rings** | Rings form around the Core, turn, and lock. | Scale and orchestration: 10,000+ users. |
| 5 | **Lens** | A scatter of points is pulled through the Lens and resolves into something legible. | LLM products for Singapore's government. |
| 6 | **Whole** | Camera pulls back. All four parts awake and working together, each labelled. The visitor can now rotate the Machine and click any part. | Five years, one machine. |
| 7 | **Contact** | The Machine stays. Short line and three links. | How to get in touch. |

**How the beats are built.** Settled by Rahul scrolling it on 2026-10-08 ([DECISIONS D31](DECISIONS.md), [D35](DECISIONS.md)). At Signal all four parts gather from dust into a loose silhouette: the outline of the whole Machine can be read, but soft, as a haze. Then each part's beat closes that part up exactly and wakes it as it closes: each point turns to the accent as it lands, so the haze condenses into lit lines. A part that has not had its beat is still haze beside the sharp, lit ones. The Rings turn as they lock, and once awake their beads drift. The camera has one pose per beat and travels between them, always from above the Machine, and ends closer than it began. A beat's picture is finished a little before its text has fully arrived, and holds a little after.

### The reveal budget

The "oh, it's a whole career" moment must land by beat 2 or 3, about twenty seconds into normal scrolling. Beats 0 and 1 are short on purpose. If testing shows people take longer, shorten the early beats; do not add explanatory text.

There are three small discoveries, each one a reward for scrolling:

1. Beat 1: the dust is an object.
2. Beat 2: the object's parts are kinds of work.
3. Beat 3: the way it is drawn is itself Rahul's work.

Beat 6 is the payoff, not a new reveal.

## Interaction rules

These are the rules that make principle 3 in [VISION](VISION.md) real.

1. **The visitor causes the change.** The story advances only on input: scroll, pointer move, click or tap, and drag. Nothing assembles, wakes or moves the camera on its own.
2. **Small ambient motion is allowed; decoration is not.** After input stops, the big motion eases to rest within about 1.5 seconds. What may keep moving is small, slow, and part of a part's meaning: the beads drifting round the Rings. It pauses when the tab is hidden, the canvas is off screen or the system asks for reduced motion, and it is off on the low tier ([DECISIONS D26](DECISIONS.md)). No idle spin of the whole Machine, no breathing, no floating particles.
3. **Scroll is never hijacked.** The page scrolls natively. The Machine eases toward the scroll position, which gives smoothness without taking control from the visitor.
4. **Scrolling back undoes it.** The scene is a pure function of progress. Scroll up and the Machine disassembles exactly as it assembled.
5. **Every interaction means something.** If an interaction does not teach the visitor about that part's work, cut it.
6. **Never required.** Every interaction is a bonus. A visitor who only scrolls still gets the full story.

### Interactions by part

Only the first two are in scope for the first release. The rest are later phases; see [ROADMAP](ROADMAP.md).

| Where | Input | Result | Release |
| --- | --- | --- | --- |
| Found | Pointer move | Dust near the pointer brightens, like a torch | First |
| Scanner | Pointer sweep, or drag on touch | Points under the beam become surface | First |
| Whole | Drag | Rotate the Machine | First |
| Whole | Click a part | Camera goes to the part; its detail opens | First |
| Core | Scroll or drag | Pulses run through the conduits | Later |
| Rings | Drag | Rings turn and snap into alignment | Later |
| Lens | Scroll | Scatter resolves into a readable shape | Later |

### Projects

Projects live **inside** parts, as components of them, never as a separate grid. Clicking a part in the Whole beat opens it: the camera moves in, the part separates slightly to show what is inside, and an HTML panel gives the project's name, what it did and a link. Which projects exist is in [CONTENT](CONTENT.md).

## The Index

A plain text version of everything: name, one line, the four eras with roles and facts, projects, contact. No canvas.

- Reached from a small, always-visible link (working label: `INDEX`). It is its own page, at `/plain`.
- Built from the same content data as the main experience, so the two can never disagree.
- It is also what a visitor gets with no WebGL, and what search engines and screen readers read.
- It should be good in its own right: fast, well set, printable.

## Other contexts

**Touch and small screens.** Same story, same beats. The Machine sits in the upper part of the screen with text below. There is no pointer torch; the Scanner sweep becomes a drag. Fewer points (see tiers in [PERFORMANCE](PERFORMANCE.md)).

**Reduced motion.** If the visitor's system asks for reduced motion, there is no assembly animation. The Machine is shown fully assembled and awake, the camera cuts between beats instead of travelling, and the content scrolls normally.

**No WebGL, or it fails.** The content layer is already a complete page. A static image of the finished Machine stands in for the canvas.

**Keyboard and screen readers.** The canvas is hidden from assistive technology. All content and every link is reachable in the DOM in reading order. Anything a click on the Machine can open is also reachable from a normal link or button.

## The look

Direction only. Exact tokens are chosen during the build.

- **Background:** near-black, not pure black, so the dust has something to sit in.
- **Points, dormant:** cold off-white, low brightness.
- **Accent, awake:** one warm colour. Working choice is a solar amber, which fits "powering on" and the Etavolt solar work. One accent only.
- **Type:** two families. A tight grotesque for statements, set small and in capitals. A monospace for instrument readouts: years, numbers, labels on parts.
- **Text placement:** at the edges, never over the Machine. The object owns the centre.
- **Words:** few. See the voice rules in [CONTENT](CONTENT.md).

## Fixed versus open

**Fixed.** Change only with a new entry in [DECISIONS](DECISIONS.md).

- One object; four parts; the kind of work each part stands for; chronological assembly.
- Drawn primarily as points.
- The eight beats and their order.
- The interaction rules.
- The Index exists and shares the content data.

**Open.** Settle by prototyping, then write the answer back here.

- How many points each tier draws. The silhouette, each part's detail and the look of the points are settled; see "The shape" above. The point counts wait for real devices ([DECISIONS D28](DECISIONS.md)).
- The name "the Machine" as visitor-facing language. It is a working name for us; the site may never say it.
- The accent colour and the typefaces.
- All copy. Drafts are in [CONTENT](CONTENT.md).
- How long each beat is in scroll distance.
