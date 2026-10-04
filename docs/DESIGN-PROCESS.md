# Design process

How the Machine and the look of the site get designed, given that there is no designer and no 3D artist on this project.

The short answer: **we design in the browser, by looking, in small rounds where Rahul picks.** Nobody is asked to imagine the result from a description, and nobody opens a design tool.

## Who does what

| | Does |
| --- | --- |
| **Rahul** | Taste. Chooses references, picks between options, says what feels wrong. |
| **The chat** | Makes the options. Builds them, screenshots its own output, criticises it before showing it, and writes the outcome back into the docs. |

A chat can look at a screenshot and judge whether a shape reads clearly. It cannot judge whether Rahul likes it, and a screenshot does not show how motion feels. So Rahul's pick is always final, and anything about motion is judged by Rahul scrolling it on a real device.

## The workbench

A development-only page that is never shipped. It is the design tool for this project.

It shows the Machine live with a free camera and a panel of controls:

- a slider for every shape parameter (radii, counts, spacing, thickness),
- point density, size and brightness,
- colours,
- a **progress scrubber**, to set the story to any moment by hand,
- a switch between variants (A, B, C) of whatever is being decided,
- a tier switch (high, mid, low),
- frame rate and draw-call readout.

Rahul drags sliders until it looks right. The chosen values are then written into the code as the defaults. A design decision is a set of numbers found by eye, not a mock-up.

The control panel should come from an existing package, not be hand-built ([DECISIONS D13](DECISIONS.md)). Because the workbench is excluded from the production build, it costs the shipped site nothing.

## Rounds

Six rounds, in this order. Shape comes before look, and look before motion, because each one is wasted if the one before it changes.

| # | Round | What gets made | Rahul decides | Test |
| --- | --- | --- | --- | --- |
| 1 | **References** | 10 to 20 images of real objects with the right feeling | Which ones, and why | Can we name five words for the feeling? |
| 2 | **Silhouette** | Three deliberately different whole Machines, as plain grey solids | One, or a mix | Recognisable and strange at thumbnail size |
| 3 | **Parts** | Two or three versions of each part inside the chosen silhouette | One per part | The four parts can be told apart; each hints at its job |
| 4 | **Points** | The chosen shape as a point cloud | Density, size, brightness | Still reads at low-tier point counts on a phone |
| 5 | **Colour and type** | Three accents, three type pairings, on real copy over the real Machine | One of each | Text is readable; colour clearly means "awake" |
| 6 | **Motion** | Dust layout, assembly order and overlap, easing, camera path | By scrolling it | A first-time viewer gets the reveal by beat 3 |

How every round runs:

1. The chat builds two or three options on the workbench.
2. It screenshots them and criticises its own work first, fixing the obvious problems.
3. It shows Rahul the options side by side.
4. Rahul picks, or says what is wrong.
5. The result is written into [EXPERIENCE](EXPERIENCE.md) and the code defaults.

**A round ends with a choice, not with more options.** If nothing is right, the round repeats with what was learned; it does not branch into six variants.

### Round 1, references

Look at real instruments, not at other portfolio sites. Good places to look: gyroscopes and gimbals, astrolabes and orreries, LiDAR sensor heads, camera lens cross-sections, satellite instruments, engine and turbine cutaways, raw point-cloud scans of buildings.

Rahul marks what appeals and what does not, with a few words on why. The output is short: about five words for the feeling and a handful of "like this" images. Keep links and notes in the repo; do not commit other people's images.

### Round 2, silhouette

The most important round. If the outline is not interesting, no amount of points or glow will fix it.

Work in solid flat grey with no points, no colour and no motion, so nothing distracts from shape. The three options should be really different (for example: tall and stacked, wide and ringed, long and directional), not three tweaks of one idea.

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

Two things make this tractable. First, the lathe: much of the Machine can be designed as a **2D profile line**, which is far easier to reason about and adjust than a 3D shape. Second, **repetition and symmetry** do most of the work of looking engineered; one small shape repeated twenty-four times around a ring looks designed.

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
