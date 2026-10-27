# Experience

What the visitor sees and does. Read [VISION](VISION.md) first.

**Status of this doc:** rewritten on 2026-10-19, when Rahul replaced the Machine with a city ([DECISIONS D38](DECISIONS.md)), and on 2026-10-20 when the city came to be built from the map up ([D39](DECISIONS.md)). The direction is agreed: a laser scan of a city at night round Marina Bay, reached by the dust pouring down out of the opening line, with each job something happening in the city. It was chosen from rough sketches, kept in `workbench/city-sketches.html`; the one called From the map is the direction. The city's layout, its landmarks, the look, the camera's poses and the copy are settled in rounds on the workbench. The last section says which is which. The Machine this replaces is described in D23 to D35 and in this file at `27a83cb`.

## The city

A city at night, drawn as a laser scan: points, a few lines, and surfaces only where Rahul's work has rebuilt something. It is Singapore, built round Marina Bay, because that is where Rahul is from.

### The layout

As in the sketch, kept over a layout true to the map, because the experience matters more than accuracy ([DECISIONS D40](DECISIONS.md)). It is `src/experience/city/layouts.ts`, drawn on the workbench.

- **The water.** The Singapore River runs into Marina Bay. The river is how the visitor arrives: the haze comes down onto it as rain ([DECISIONS D44](DECISIONS.md)).
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

Every claim is pinned to its proof in the city, like a surveyor's notes on a scan ([DECISIONS D45](DECISIONS.md)). Picked by Rahul from three systems on 2026-10-24.

- **The beat's text** sits at the left edge on a dark band, at the bottom of a tall window: the job's number and its field in the accent, the headline large, leading with the work, the company, role and years as small print, then every [claim](CONTENT.md#claims) as its own numbered line, the strongest first. It is the whole job, readable with no scene, and the Index says the same.
- **The pins.** Each claim with something in the city to point at has a numbered pin there, with a few of its words: the requests on the streets, the scanned roof, BLK 2024, the train for CI/CD, the Lens's tower, and the plane leaving Changi, which crosses the sky at Core and takes its pin with it ([DECISIONS D54](DECISIONS.md)). During a job's beat the city dims except its subject, as D38 proposed.
- **Held, not scrolled** ([D46](DECISIONS.md)). While the scene runs, the text is held still on the window rather than rolling up it like film credits. On the way to the next beat it fades early, the city moves alone, and as the beat arrives the headline comes in, then the claims one after another, each line with its pin. The scroll slows a little for that stretch: a job's section is 1.3 windows tall, the extra spent on its claims arriving.
- **Pointing**, never needed: pointing at a claim's line or its pin opens the pin's full sentence and dims the rest; a tap on touch. A pin in the city opens once the pointer is still on it, so sweeping the Scanner's beam over the building opens none ([D51](DECISIONS.md)). The open tag grows away from its pin from a corner that stays put, so it never moves out from under the pointer, and it is kept inside the window. The database's line draws its five systems onto five HDB blocks.
- **Whole** puts one tag a job at its subject, and its list links to each job.
- **On a small screen** the pins stay numbered points over the city and the list is read under it.

All of it is real text in the page (rule 3); the pins repeat it and are hidden from assistive technology.

### Easter eggs

Small things a visitor finds. Rahul wants them. Each is found, never forced; none advances the story; none states a fact that is not in [CONTENT](CONTENT.md).

- In the sketch, liked: the Merlion spouting; a train on its viaduct; a block numbered `BLK 2024`, the year Rahul joined Uniad.
- Picked by Rahul in the references round (2026-10-20): otters, a family crossing a path or surfacing in the river; a cat on a void deck that looks up when the pointer passes; the Supertrees playing a few seconds of their light show when found; a plane leaving Changi at the Core beat, for the international business trips.
- How they are found: the mouse coming onto one plays it, and on touch a tap, on the home page and on the exhibit ([DECISIONS D55](DECISIONS.md)). Built 2026-10-26, the three from the sketch ([DECISIONS D53](DECISIONS.md)): the Merlion spouts into the bay; the train, out of sight, pulls in to where the visitor pointed, or blinks as its doors close if it is there; BLK 2024 carries its number on its end wall, and found, a band of light runs up it. Built 2026-10-28, the four picked after ([D54](DECISIONS.md)): otters surface where the river is found and swim a little way downstream; the cat at the foot of BLK 2024 looks up as the pointer passes; the Supertrees play a few seconds of their light show; and the plane leaving Changi crosses the sky at Core, the pin for the trips abroad.
- Still open: other block numbers that are Rahul's years, and anything else found while building.

## The beats

The page is one long scroll. The canvas is fixed behind it and the city responds to how far the visitor has scrolled.

| # | Beat | What the visitor sees | What they learn |
| --- | --- | --- | --- |
| 0 | **Found** | Black. Small type in the middle of the window, a size up from the other statements: `YOU'VE FOUND RAHUL.` A faint haze of light in the dark round it. Moving the pointer lights the haze near it. At the foot of the window, `SCROLL TO LOOK CLOSER` (`SWIPE UP` on touch), and an amber chevron under it bouncing downward; it fades on the first scroll and is a link to the next beat ([D48](DECISIONS.md)). | Something is here. Nothing is explained. |
| 1 | **Signal** | First scroll. The opening line crumbles into bright grains that fall into the haze ([DECISIONS D37](DECISIONS.md)). Then the haze comes down as rain onto the river and the bay, flashing as it hits the water, and spreads from the water across the land as a map: the bay, the river, the roads, every footprint ([D44](DECISIONS.md)). | The haze was a place all along. |
| 2 | **Core** | The city rises out of the map, building by building, and the camera glides down to the CBD. Requests run along the river and the streets as light. The first tag: the work, with the years and the company in small print. | Things in the city light up, and each one is a kind of work. |
| 3 | **Scanner** | A roof stands as raw points. The visitor sweeps a beam across it, and behind the beam the points grow into tiles of surface, the mesh rebuilt from them closes in over the tiles, and the roofs get their solar panels ([D51](DECISIONS.md)). The beam waits dim at the building's edge; once per visit, a moment after the visitor stops here, it slides partway in and back, the strip it passes starting to close and falling back to points, to show what it does ([D52](DECISIONS.md)). | Rahul built this kind of software. They have been looking at a scan the whole time. |
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
3. **Scroll is never hijacked.** The page scrolls natively. The scene eases toward the scroll position, which gives smoothness without taking control from the visitor. When the visitor stops scrolling, the browser's own scroll snap finishes the move on the nearest beat, where its words are whole. It never starts a move ([DECISIONS D47](DECISIONS.md)).
4. **Scrolling back undoes it.** The story is a pure function of progress. Scroll up and the city goes dark and back into dust exactly as it came.
5. **Every interaction means something.** If an interaction does not teach the visitor about a job, cut it. Easter eggs are the exception: they say something about the place, and they are small.
6. **Never required.** Every interaction is a bonus. A visitor who only scrolls still gets the full story.

### Interactions

Only the first release's are in scope now; see [ROADMAP](ROADMAP.md).

| Where | Input | Result | Release |
| --- | --- | --- | --- |
| Found | Pointer move | Dust near the pointer brightens, like a torch, and more of it shows. Built ([DECISIONS D36](DECISIONS.md)) | First |
| Scanner | Pointer sweep, or a sideways drag on touch | Points on the building under the beam become surface and the roofs get their panels. Built ([DECISIONS D51](DECISIONS.md)); the waiting beam and its one teaser, [D52](DECISIONS.md) | First |
| Anywhere | Hover, or a tap on touch | An easter egg, where there is one. All seven built ([DECISIONS D53](DECISIONS.md), [D54](DECISIONS.md)), played on hover ([D55](DECISIONS.md)) | First, which ones open |
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

## Contact, at any time

`CONTACT` sits in the header beside `INDEX` on every page with the city. It opens the three ways to reach Rahul in place, over the city, without scrolling the story to its end, with a button that copies the email address. A native popover, so it works with scripts off and closes on Escape or a click elsewhere ([DECISIONS D48](DECISIONS.md)). The Contact beat still ends the story.

## The exhibit

The city on its own, at `/exhibit`, linked from the header as `EXHIBIT` ([DECISIONS D48](DECISIONS.md)). No story and no scroll: the city whole and lit as the story leaves it at Whole, the four jobs tagged at their subjects, and a caption at the foot of the window. The visitor drags to turn it, scrolls or pinches to come closer, and right-drags or uses two fingers to move along the ground, kept over the map and never under it. The camera moves only when the visitor moves it and comes to rest a moment after; the traffic, the river and the train move as on the home page. The calm camera of the story does not apply here: this is the one place the visitor may swing round the city, because they are the one swinging it.

## The résumé

`/resume`, linked from the header as `RESUME` on the story and the exhibit ([DECISIONS D49](DECISIONS.md)). Each page of the PDF as a sheet of paper on the dark page, drawn by PDF.js, the same on a phone as on a laptop, its text selectable and its links live. Beside it, `DOWNLOAD PDF` in the accent and `OPEN IN A NEW TAB`; on a phone they come first and the sheets follow. A blank sheet holds the place while the viewer loads, and without scripts the page still offers the file. The PDF is Rahul's own file, replaced by hand; the site does not write it.

## Other contexts

**Touch and small screens.** Same story, same beats. The beat's subject sits in the upper part of the screen with text below. There is no pointer torch; the Scanner sweep becomes a drag. Fewer points (see tiers in [PERFORMANCE](PERFORMANCE.md)).

**Reduced motion.** No crumbling, no rain and no lighting up in sequence. The city is shown whole and lit, the camera cuts between beats instead of travelling, nothing moves on its own, and the content scrolls normally.

**No WebGL, or it fails.** The content layer is already a complete page. A static image of the lit city stands in for the canvas.

**Keyboard and screen readers.** The canvas is hidden from assistive technology. All content and every link is reachable in the DOM in reading order. Anything a click in the city can open is also reachable from a normal link or button.

## The look

Direction only. Exact tokens are chosen during the build.

- **Background:** near-black, not pure black, so the dust has something to sit in.
- **Points, cold:** cold off-white, low brightness.
- **Accent, lit:** one warm colour. Working choice is a solar amber, which fits "powering on" and the Etavolt solar work. One accent only.
- **Type:** two families. A tight grotesque for statements, set small and in capitals, and for a job's headline, set large in sentence case ([DECISIONS D45](DECISIONS.md)). A monospace for instrument readouts: years, numbers, labels.
- **Text placement:** at the edges, on a dark band, never over the beat's subject, and held still while the scene runs ([D46](DECISIONS.md)). The exceptions are the opening line, which stands in the middle because there is nothing yet ([DECISIONS D37](DECISIONS.md)), and the pins in the city.
- **Words:** few. See the voice rules in [CONTENT](CONTENT.md).

## Fixed versus open

**Fixed.** Change only with a new entry in [DECISIONS](DECISIONS.md).

- One world: a laser-scanned city at night round Marina Bay, with its landmarks in front.
- The way in: the opening line crumbles into the haze, and the haze rains down onto the river and the bay and spreads from the water as the map (D44).
- The four jobs as things happening in the city, in the order of the career.
- Drawn primarily as points.
- The eight beats and their order.
- A calm camera.
- The interaction rules.
- How the scanned surface is drawn: each point grows into a tile of the wall, with the rebuilt mesh's lines over the tiles ([D51](DECISIONS.md)).
- The Index exists and shares the content data.

**Open.** Settle by prototyping, then write the answer back here.

- The city's layout and the detail of each landmark.
- How the map is drawn, and how fast the city rises from it.
- The timing of a beat's words: how early they go and how fast the claims follow each other ([DECISIONS D46](DECISIONS.md)). How the words sit over the city is picked ([D45](DECISIONS.md)).
- Which easter eggs beyond the seven picked.
- What the visitor can do at the Whole beat.
- How many points each tier draws. A city fills the window on every beat, so these start again from measurement.
- The accent colour and the typefaces.
- All copy. Drafts are in [CONTENT](CONTENT.md), rewritten on 2026-10-24 to lead with the work ([DECISIONS D45](DECISIONS.md)).
- How long each beat is in scroll distance.
