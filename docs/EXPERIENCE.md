# Experience

What the visitor sees and does. Read [VISION](VISION.md) first.

**Status of this doc:** rewritten on 2026-10-19, when Rahul replaced the Machine with a city ([DECISIONS D38](DECISIONS.md)), and on 2026-10-20 when the city came to be built from the map up ([D39](DECISIONS.md)). The direction is agreed: a laser scan of a city at night round Marina Bay, reached by the dust pouring down out of the opening line, with each job something happening in the city. It was chosen from rough sketches, kept in `workbench/city-sketches.html`; the one called From the map is the direction. The city's layout, its landmarks, the look, the camera's poses and the copy are settled in rounds on the workbench. The last section says which is which. The Machine this replaces is described in D23 to D35 and in this file at `27a83cb`.

## The city

A city at night, drawn as a laser scan: points, a few lines, and surfaces only where Rahul's work has rebuilt something. It is Singapore, built round Marina Bay, because that is where Rahul is from.

### The layout

As in the sketch, kept over a layout true to the map, because the experience matters more than accuracy ([DECISIONS D40](DECISIONS.md)). It is `src/experience/city/layouts.ts`, drawn on the workbench.

- **The water.** The Singapore River runs into Marina Bay. The river is how the visitor arrives: the dust pours down into it.
- **The landmarks, round the water and in front,** so the city reads as Singapore from the first view: Marina Bay Sands across the bay, the ArtScience Museum in front of it, the Supertrees behind it, the Flyer and the Esplanade on the north shore, the Merlion at the river mouth. Drawn in code and kept recognisable, not traced.
- **The CBD,** towers on the river's south bank.
- **The heartland,** HDB slabs and point blocks all round, kept plain. This is where the windows are. Its one landmark is Pinnacle@Duxton, towers joined by sky bridges, drawn with care like the landmarks round the bay.
- **The MRT,** a train on a viaduct through the heartland.

Rahul's work is never pinned to a real building, with one wanted exception: the Science Centre, whose mesh Rahul really built ([CONTENT](CONTENT.md)), as the building that is scanned. The reference is the mesh image in the old site's assets (Etavolt), found on 2026-10-20. It stands in the heartland: the real one is in Jurong, far from the bay, and the city is Singapore drawn small. The Lens tower must never look like a ministry building.

### From the map up

Rahul's Etavolt work took LiDAR from online map data and rebuilt a rough mesh of each building ([CONTENT](CONTENT.md)). The city is built the same way ([DECISIONS D39](DECISIONS.md)). The river of dust lands flat as a map: the shore of the bay, the river's banks, the roads and every building's footprint, traced in thin lines like a plan. Then each building rises out of its footprint, its roof going up and its walls stretching under it, a few at a time as the visitor scrolls. So the visitor has watched Rahul's method build the city before the Scanner beat says so.

Detail goes where it counts. The seven landmarks round the bay and Pinnacle@Duxton are drawn with care; every other building is a plain extruded block, which is what an extrusion from map data gives. A city at night is its lights: points sit on edges and windows, faces are nearly empty, the water is black. Nothing is coloured by height and there are no sensor rings: that is a lidar demo, not this work.

### Cold and lit

Colour carries state, as before ([DECISIONS D11](DECISIONS.md)). The city at rest is cold off-white and dim. What Rahul's work touches is lit in the warm accent, and stays lit for the rest of the story. Surfaces appear only where something was scanned. A visitor should be able to tell how far through the story they are from what is lit.

### Where each job is

Each job is a kind of work, with the company as small print ([DECISIONS D24](DECISIONS.md)), in the order Rahul came to it.

| Beat | The work | What happens in the city | Small print |
| --- | --- | --- | --- |
| **Core** | Data engineering: pipelines, microservices, throughput | Requests run along the river and the streets as light | S2T, 2021 to 2023 |
| **Scanner** | Turning LiDAR point clouds into 3D models | One roof is scanned from points into surface and gets its solar panels | Etavolt, 2023 to 2024 |
| **Rings** | Scheduling, bookings, calendars | Windows light up across the HDB blocks, block by block | Uniad, 2024 onward |
| **Lens** | LLM analytics: raw data into something a person can read | One tower in the CBD lights up and turns it all into an answer | Cognizant, 2024 onward |

The beats keep the ids of the Machine's parts. No visitor sees them.

### The words over the city

A city is busier than one object was, and it would win against the text. Proposed ([DECISIONS D38](DECISIONS.md)) and shown in the sketch: during each job's beat the city dims except its subject, and a short tag is pinned to the subject, like the labels in a scanning tool, with the years, the company and one line. The beat's full text sits at the left edge on a dark band, so it is read before the city is. All of it is real text in the page (rule 3); the tag is the canvas repeating it.

### Easter eggs

Small things a visitor finds. Rahul wants them. Each is found, never forced; none advances the story; none states a fact that is not in [CONTENT](CONTENT.md).

- In the sketch, liked: the Merlion spouting; a train on its viaduct; a block numbered `BLK 2024`, the year Rahul joined Uniad.
- Picked by Rahul in the references round (2026-10-20): otters, a family crossing a path or surfacing in the river; a cat on a void deck that looks up when the pointer passes; the Supertrees playing a few seconds of their light show when clicked; a plane leaving Changi at the Core beat, for the international business trips.
- Still open: other block numbers that are Rahul's years, and anything else found while building.

## The beats

The page is one long scroll. The canvas is fixed behind it and the city responds to how far the visitor has scrolled.

| # | Beat | What the visitor sees | What they learn |
| --- | --- | --- | --- |
| 0 | **Found** | Black. Small type in the middle of the window, a size up from the other statements: `YOU'VE FOUND RAHUL.` Faint dust in the dark. Moving the pointer lights the dust near it. | Something is here. Nothing is explained. |
| 1 | **Signal** | First scroll. The opening line crumbles into bright grains ([DECISIONS D37](DECISIONS.md)), and the dust pours down as a river and lands flat as a map: the bay, the river, the roads, every footprint. | The dust was a place all along. |
| 2 | **Core** | The city rises out of the map, building by building, and the camera glides down to the CBD. Requests run along the river and the streets as light. The first tag: the work, with the years and the company in small print. | Things in the city light up, and each one is a kind of work. |
| 3 | **Scanner** | A roof stands as raw points. The visitor sweeps across it and surface appears where they sweep. | Rahul built this kind of software. They have been looking at a scan the whole time. |
| 4 | **Rings** | Windows light up across the HDB blocks. | Scale and orchestration: 10,000+ users. |
| 5 | **Lens** | A tower in the CBD lights up and answers. | LLM products for Singapore's government. |
| 6 | **Whole** | The camera rises over the bay. Everything Rahul's work touched is lit. | Five years, one city. |
| 7 | **Contact** | The view across the bay to Marina Bay Sands, lit. Short line and three links. | How to get in touch. |

**How the beats are built.** A first version is on the workbench: the sketch's camera pose at each beat, the map landing at Signal and the city rising building by building on the way to Core ([DECISIONS D40](DECISIONS.md)). Not settled until Rahul has scrubbed and then scrolled it. The Machine's choreography ([DECISIONS D31](DECISIONS.md), [D35](DECISIONS.md)) carries over only in principle: one camera pose per beat; a beat's picture is finished a little before its text has fully arrived and holds a little after; scrolling back undoes it exactly.

**The camera is calm** ([DECISIONS D38](DECISIONS.md)). Rahul found the sketch's camera moved too much for some people. It faces one way, within about 15 degrees (the sketch's poses, kept for now, range over 25), and glides from subject to subject like a slow drone. It never swings round the city. With reduced motion it cuts between beats.

### The reveal budget

The "oh, it's a whole career" moment must land by beat 2 or 3, about twenty seconds into normal scrolling. Beats 0 and 1 are short on purpose. If testing shows people take longer, shorten the early beats; do not add explanatory text.

There are three small discoveries, each one a reward for scrolling:

1. Beat 1: the dust is a place.
2. Beat 2: what lights up in it is a kind of work.
3. Beat 3: the way it is drawn is itself Rahul's work.

Beat 6 is the payoff, not a new reveal.

## Interaction rules

These are the rules that make principle 3 in [VISION](VISION.md) real.

1. **The visitor causes the change.** The story advances only on input: scroll, pointer move, click or tap, and drag. Nothing lights, assembles or moves the camera on its own.
2. **Small ambient motion is allowed; decoration is not.** After input stops, the big motion eases to rest within about 1.5 seconds. What may keep moving is small, slow, and part of the city's meaning: the traffic, the river, the train ([DECISIONS D26](DECISIONS.md), [D38](DECISIONS.md)). It pauses when the tab is hidden, the canvas is off screen or the system asks for reduced motion, and it is off on the low tier. No idle camera drift, no breathing, no floating particles.
3. **Scroll is never hijacked.** The page scrolls natively. The scene eases toward the scroll position, which gives smoothness without taking control from the visitor.
4. **Scrolling back undoes it.** The story is a pure function of progress. Scroll up and the city goes dark and back into dust exactly as it came.
5. **Every interaction means something.** If an interaction does not teach the visitor about a job, cut it. Easter eggs are the exception: they say something about the place, and they are small.
6. **Never required.** Every interaction is a bonus. A visitor who only scrolls still gets the full story.

### Interactions

Only the first release's are in scope now; see [ROADMAP](ROADMAP.md).

| Where | Input | Result | Release |
| --- | --- | --- | --- |
| Found | Pointer move | Dust near the pointer brightens, like a torch, and more of it shows. Built ([DECISIONS D36](DECISIONS.md)) | First |
| Scanner | Pointer sweep, or drag on touch | Points on the roof under the beam become surface | First |
| Anywhere | Hover, click or tap | An easter egg, where there is one | First, which ones open |
| Whole | Drag | Look round the bay, within limits. Open: the old interaction was turning the Machine | First |
| Whole | Click a subject | The camera glides to it; its detail opens | First |
| Core, Rings, Lens | Scroll or drag | Each job does a little more of its work | Later |

### Projects

Projects live **inside** the city, at their subject, never as a separate grid. Clicking a subject in the Whole beat opens it: the camera glides in and an HTML panel gives the project's name, what it did and a link. Which projects exist is in [CONTENT](CONTENT.md).

## The Index

A plain text version of everything: name, one line, the four eras with roles and facts, projects, contact. No canvas.

- Reached from a small, always-visible link (working label: `INDEX`). It is its own page, at `/plain`.
- Built from the same content data as the main experience, so the two can never disagree.
- It is also what a visitor gets with no WebGL, and what search engines and screen readers read.
- It should be good in its own right: fast, well set, printable.

## Other contexts

**Touch and small screens.** Same story, same beats. The beat's subject sits in the upper part of the screen with text below. There is no pointer torch; the Scanner sweep becomes a drag. Fewer points (see tiers in [PERFORMANCE](PERFORMANCE.md)).

**Reduced motion.** No pouring and no lighting up in sequence. The city is shown whole and lit, the camera cuts between beats instead of travelling, nothing moves on its own, and the content scrolls normally.

**No WebGL, or it fails.** The content layer is already a complete page. A static image of the lit city stands in for the canvas.

**Keyboard and screen readers.** The canvas is hidden from assistive technology. All content and every link is reachable in the DOM in reading order. Anything a click in the city can open is also reachable from a normal link or button.

## The look

Direction only. Exact tokens are chosen during the build.

- **Background:** near-black, not pure black, so the dust has something to sit in.
- **Points, cold:** cold off-white, low brightness.
- **Accent, lit:** one warm colour. Working choice is a solar amber, which fits "powering on" and the Etavolt solar work. One accent only.
- **Type:** two families. A tight grotesque for statements, set small and in capitals. A monospace for instrument readouts: years, numbers, the tags in the city.
- **Text placement:** at the edges, on a dark band, never over the beat's subject. The exceptions are the opening line, which stands in the middle because there is nothing yet ([DECISIONS D37](DECISIONS.md)), and the tags pinned in the city.
- **Words:** few. See the voice rules in [CONTENT](CONTENT.md).

## Fixed versus open

**Fixed.** Change only with a new entry in [DECISIONS](DECISIONS.md).

- One world: a laser-scanned city at night round Marina Bay, with its landmarks in front.
- The way in: the opening line crumbles into the dust, and the dust pours down as a river into the city.
- The four jobs as things happening in the city, in the order of the career.
- Drawn primarily as points.
- The eight beats and their order.
- A calm camera.
- The interaction rules.
- The Index exists and shares the content data.

**Open.** Settle by prototyping, then write the answer back here.

- The city's layout and the detail of each landmark.
- How the map is drawn, and how fast the city rises from it.
- How the words sit over the city: the spotlight, tags and dark band are proposed, not picked.
- Which easter eggs beyond the seven picked, and how each is found.
- How the scanned surface is drawn. It reads as rebuilt from a scan, points closing into faces, and is better than Rahul's old mesh, which he does not want copied (2026-10-20). The mesh image is a reference for the Science Centre's shape only.
- What the visitor can do at the Whole beat.
- How many points each tier draws. A city fills the window on every beat, so these start again from measurement.
- The accent colour and the typefaces.
- All copy. Drafts are in [CONTENT](CONTENT.md); the Whole beat's `FIVE YEARS. ONE MACHINE.` no longer fits.
- How long each beat is in scroll distance.
