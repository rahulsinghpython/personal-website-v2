# Design process

How the city and the look of the site get designed, given that there is no designer and no 3D artist on this project.

The short answer: **we design in the browser, by looking, in small rounds where Rahul picks.** Nobody is asked to imagine the result from a description, and nobody opens a design tool.

## Who does what

| | Does |
| --- | --- |
| **Rahul** | Taste. Chooses references, picks between options, says what feels wrong. |
| **The chat** | Makes the options. Builds them, screenshots its own output, criticises it before showing it, and writes the outcome back into the docs. |

A chat can look at a screenshot and judge whether a shape reads clearly. It cannot judge whether Rahul likes it, and a screenshot does not show how motion feels. So Rahul's pick is always final, and anything about motion is judged by Rahul scrolling it on a real device.

## The workbench

A development-only page that is never shipped. It is the design tool for this project.

It shows the city live with a free camera and a panel of controls:

- a slider for every shape parameter (radii, counts, spacing, thickness),
- point density, size and brightness,
- colours,
- a **progress scrubber**, to set the story to any moment by hand,
- a switch between variants (A, B, C) of whatever is being decided,
- a tier switch (high, mid, low),
- frame rate and draw-call readout.

Rahul drags sliders until it looks right. The chosen values are then written into the code as the defaults. A design decision is a set of numbers found by eye, not a mock-up.

The control panel is Tweakpane ([DECISIONS D20](DECISIONS.md)). Because the workbench is excluded from the production build, it costs the shipped site nothing.

### Using it

Run `pnpm dev` and open `/workbench/`. How it is built and why it cannot ship is in [ARCHITECTURE](ARCHITECTURE.md#the-workbench).

- **The city only.** Until 2026-10-25 a `world` setting switched between the city and the Machine; the Machine's code was deleted then ([DECISIONS D50](DECISIONS.md)). Its rounds are in git history up to `93798bd`.
- **Options.** The tabs A, B and C switch between the options of the current round: the layouts, or with `draw` set to `points`, the looks. Each tab holds that option's sliders.
- **Side by side.** Shows every option at once with one shared camera. This is the view a round is decided in.
- **Thumbnail.** Shrinks the viewports to 160 pixels, for the thumbnail test.

- **Draw.** `solid` is the greybox; `points` is the cloud sampled from it, as the city's bullet below describes.
- **Phone size.** Makes each viewport 390 pixels wide, the size of a phone screen held upright. With the tier set to low it shows what a low-tier phone would be given: `/workbench/?view=story&beat=4&draw=points&phone=1&tier=low`.
- **Shading.** `flat` is one grey with no shading, the pure silhouette. `shaded` lights the greybox from the camera so the form inside the outline can be read. The lighting is a greybox aid only; the real city is unlit.
- **Tier.** Applies that tier's pixel-ratio cap. `tier dpr` renders at the cap even when this display's own ratio is lower, to see what a denser screen would be asked to draw.
- **Copy values.** Puts the current option's numbers on the clipboard as JSON, ready to paste into the code as defaults.
- **Readout.** Frame rate, CPU and GPU time per frame, draw calls, and a count of frames drawn. The count must stop when input stops. `Run benchmark` draws 240 frames back to back and reports what they cost.
- **The URL holds the state:** `?tier=mid&view=front&compare=1&phone=1&shading=flat&panel=0`, the city's changed numbers as `c=A.cbd.height:1.2`, and a free camera as `cam=`. Reload it, screenshot it, or send it.

- **Story.** `in the story` puts the city in the story at `beat`, from 0 (Found) to 7 (Contact); drag it to scrub. The `story` view gives the visitor's camera for that beat, and the mouse wheel over it scrolls the beat, as the page does; any other view watches the same moment from outside.

- **The city** ([DECISIONS D40](DECISIONS.md)). One tab, the layout, holds its numbers in four groups: water, CBD, heartland and landmarks. `show` lights one district and dims the rest; `what each job lights` shows the four subjects: the river, the Science Centre, BLK 2024 and the Lens's tower. `risen from the map` lowers every building towards its footprint, to 0 for the flat map, and `map lines` draws the map on the ground. The views are `across the bay`, the way the visitor looks, `the map`, from straight above, and `story`, the visitor's camera at the scrubber's beat. With `in the story` on, the city lands and rises with the beat, as the sketch did, and the rise slider waits. These travel in the URL as `show=`, `rise=`, `map=0` and, for changed numbers, `c=A.cbd.height:1.2`. `/workbench/?view=story&beat=1.5`.
  `draw` set to `points` draws the city as points ([DECISIONS D42](DECISIONS.md)). The options are then the looks: one, A, since Rahul picked it; the ones passed over are rows in D42. The Points folder has a tab per look with its numbers: the point count on the high tier, size and brightness, how a building's points are shared between windows, walls, edges and roofs, how much of a landmark is outline, and the shares of the whole that go to buildings, landmarks, roads, water and the viaduct. In the story, the beat lights and dims the city as `CITY_LIGHTS` in `src/experience/city/story.ts` says, and the traffic, the river and the train move with the beat; `moves on its own` in the City folder also runs them on their own clock, as the site will ([DECISIONS D43](DECISIONS.md)), and travels as `motion=0` when off. These travel in the URL as `draw=points`, `look=B` and, for changed numbers, `cl=A.size:0.006`. `/workbench/?view=story&beat=4&draw=points`.

Not built yet, because its round has not come: the colour controls (round 5).

## Rounds

Six rounds, in this order. Shape comes before look, and look before motion, because each one is wasted if the one before it changes.

| # | Round | What gets made | Rahul decides | Test |
| --- | --- | --- | --- | --- |
| 1 | **References** | 10 to 20 images of real objects with the right feeling, shown as pictures on `/workbench/references.html` | Which ones, and why | Can we name five words for the feeling? |
| 2 | **Silhouette** | Three deliberately different whole Machines, as plain grey solids | One, or a mix | Recognisable and strange at thumbnail size |
| 3 | **Parts** | Two or three versions of each part inside the chosen silhouette | One per part | The four parts can be told apart; each hints at its job |
| 4 | **Points** | The chosen shape as a point cloud | Density, size, brightness | Still reads at low-tier point counts on a phone |
| 5 | **Colour and type** | Three accents, three type pairings, on real copy over the real city | One of each | Text is readable; colour clearly means "awake" |
| 6 | **Motion** | Dust layout, assembly order and overlap, easing, camera path | By scrolling it | A first-time viewer gets the reveal by beat 3 |

How every round runs:

1. The chat builds two or three options on the workbench.
2. It screenshots them and criticises its own work first, fixing the obvious problems.
3. It shows Rahul the options side by side.
4. Rahul picks, or says what is wrong.
5. The result is written into [EXPERIENCE](EXPERIENCE.md) and the code defaults.

**A round ends with a choice, not with more options.** If nothing is right, the round repeats with what was learned; it does not branch into six variants.

### Round 1, references

Look at real objects, not at other portfolio sites. Start with computing hardware, because the career is software ([DECISIONS D22](DECISIONS.md)): supercomputers, quantum computers and their wiring, core memory, disk drives, backplanes and patch panels, racks, front panels, chips. Scientific instruments are the second place to look: gyroscopes and gimbals, orreries, LiDAR sensor heads, lens cross-sections, spacecraft, turbine cutaways, raw point-cloud scans.

Rahul marks what appeals and what does not, with a few words on why. The output is short: about five words for the feeling and a handful of "like this" images. Keep links and notes in the repo; do not commit other people's images.

### Round 2, silhouette

The most important round. If the outline is not interesting, no amount of points or glow will fix it.

Work in solid flat grey with no points, no colour and no motion, so nothing distracts from shape. The three options should be really different (for example: tall and stacked, wide and ringed, long and directional), not three tweaks of one idea.

### The city's rounds

When the Machine gave way to the city ([DECISIONS D38](DECISIONS.md)), the rounds started again from a round 0: whole directions, not shapes. Four were drawn as rough 2D sketches on one page, each with a bar that scrolls its story, so Rahul could compare stories rather than stills. That page is `workbench/city-sketches.html`. Use the same kind of page whenever the question is which story, not which shape. After that, the city goes through the usual rounds on the workbench: references, layout, landmarks, points, colour, motion ([ROADMAP](ROADMAP.md), Phase 3b).

## How shapes are made in code

Almost every machined-looking object is a few simple operations repeated.

| Operation | What it gives | Likely use |
| --- | --- | --- |
| **Lathe**: draw a 2D profile, spin it around an axis | Housings, nozzles, lens barrels, anything turned on a lathe | Core, Lens |
| **Torus and ring** | Rings, gimbals, gaskets | Rings |
| **Tube along a curve** | Pipes, conduits, cables | Core's conduits |
| **Cylinder, disc, box** | Shafts, plates, apertures, panels | Everywhere |
| **Extrude**: a 2D outline pushed into depth | Brackets, fins, plates with cut-outs | Scanner |
| **Radial and linear repetition** | Bolt circles, fins, vanes, stacked discs | Detail on every part |

Two things make this tractable. First, the lathe: much of a landmark can be designed as a **2D profile line**, which is far easier to reason about and adjust than a 3D shape. Second, **repetition and symmetry** do most of the work of looking engineered; one small shape repeated twenty-four times around a ring looks designed.

Each part is a function with parameters. Those parameters are what the workbench sliders control.

## Tests for any design choice

- **Thumbnail test.** Shrunk small, is it still recognisable and still odd?
- **Meaning test.** Does this shape or motion say something about that era's work? If not, cut it.
- **Low-tier test.** Does it survive at a fraction of the points?
- **Budget test.** Does it stay inside [PERFORMANCE](PERFORMANCE.md)?
- **Template test.** Could this appear on someone else's portfolio unchanged? If yes, it is not ours yet.

## Escape hatches

- **Sketches.** Rahul can draw on paper, photograph it and drop it into a chat. Chats can read images, and a rough sketch is often faster than describing a shape.
- **Modelling one part.** If a single part cannot be got right in code, that part alone can be modelled in a 3D tool and sampled to points like the rest. This needs a new entry in [DECISIONS](DECISIONS.md), since it bends D4.
