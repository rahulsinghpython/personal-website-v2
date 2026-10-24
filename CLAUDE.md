# personal-website-v2

Rahul Singh's personal site. It is not a portfolio template. It is one dark 3D world, **a laser scan of a city at night around Marina Bay**, where the things that light up turn out to be Rahul's whole career.

**Status: the plain site exists (content layer, the Index, prerendered HTML). The home page draws the city as points since 2026-10-24 ([DECISIONS D44](docs/DECISIONS.md)), replacing the Machine, the single object the site was built around until Rahul replaced it on 2026-10-19 ([D38](docs/DECISIONS.md)). The Machine's code is still in the repository for the workbench and is deleted next; Phase 4's interactions wait for the city's rounds to finish.** [docs/ROADMAP.md](docs/ROADMAP.md) is the authority on what is built and what is next.

## Read before you build

| Doc | Read it when |
| --- | --- |
| [docs/VISION.md](docs/VISION.md) | Always, first. Why the site exists and the principles everything else follows. |
| [docs/EXPERIENCE.md](docs/EXPERIENCE.md) | Touching anything the visitor sees or does: the city, the scroll beats, interactions. |
| [docs/DESIGN-PROCESS.md](docs/DESIGN-PROCESS.md) | Deciding how anything looks or moves. How options get made and how Rahul picks. |
| [docs/CONTENT.md](docs/CONTENT.md) | Writing any copy or stating any fact about Rahul. |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Writing code: stack, layers, state, how the scene is rendered. |
| [docs/PERFORMANCE.md](docs/PERFORMANCE.md) | Adding anything that costs bytes or frames. |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Before proposing a different approach. It may already have been weighed. |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Picking up work: phases, status, open questions for Rahul. |

## Rules that do not bend

Each one is explained in the doc it links to. If a task seems to need breaking one, stop and raise it with Rahul.

1. **One world, not a layout.** Everything happens in the city. No card grids, no second hero, no section that could be lifted from a template. It was "one object" until Rahul found that too strict a rule ([DECISIONS D38](docs/DECISIONS.md)). ([VISION](docs/VISION.md))
2. **The visitor causes the change.** The story advances only when the visitor scrolls; nothing assembles, wakes or moves the camera on its own. Small ambient motion that adds to a part's meaning is allowed, within the limits in [DECISIONS D26](docs/DECISIONS.md). ([EXPERIENCE](docs/EXPERIENCE.md#interaction-rules))
3. **Content is HTML first.** Every fact is real text in the DOM and readable with JavaScript off. The canvas is decoration on top. ([ARCHITECTURE](docs/ARCHITECTURE.md#two-layers))
4. **The budget is a contract.** A feature that breaks [PERFORMANCE](docs/PERFORMANCE.md) is not done.
5. **Procedural, not modelled.** The city and its landmarks are generated in code. No dependency on a 3D artist or a Blender file. ([DECISIONS D4](docs/DECISIONS.md))
6. **Never invent facts.** Employers, dates, numbers and project names come from [CONTENT](docs/CONTENT.md) only. If it is not there, ask.
7. **Take the philosophy of Lando's site, not its look.** No neon lime, no helmet, no racing motifs.

**The one exception is the résumé** at `/resume` ([DECISIONS D49](docs/DECISIONS.md)). It is a plain page outside the city, and its facts are Rahul's own PDF, not CONTENT, so rules 1, 3 and 6 do not apply to it. Rahul's reason: a résumé made into part of the world would defeat its purpose, and the site's. Do not pull it into the city, rebuild it from the content modules, or check the PDF against CONTENT.

## Vocabulary

Use these words the same way in code, commits and conversation.

- **The city**: the laser-scanned city around Marina Bay that the site happens in ([DECISIONS D38](docs/DECISIONS.md)).
- **Subject**: what one job's beat is about in the city: the river and streets (Core), the scanned roof (Scanner), the HDB windows (Rings), the CBD tower (Lens). The company is small print ([DECISIONS D24](docs/DECISIONS.md)).
- **The Machine**, **part**: the single object the site was built around until D38, and its four subsystems. The code in `src/experience/machine/` is still the Machine until the city replaces it; the city's is in `src/experience/city/`. The four job beats keep the parts' names as ids.
- **Dust**: the points while scattered and unreadable (the opening state).
- **Cold / lit**: the city at rest / what Rahul's work touches, in the accent. They replace dormant and awake.
- **Beat**: one step of the scroll story (Found, Signal, Core, Scanner, Rings, Lens, Whole, Contact).
- **Claim**: one line of a job's work, the strongest first; **pin**: where a claim points in the city, with a few of its words ([DECISIONS D45](docs/DECISIONS.md)).
- **Progress**: the single number from 0 to 1 that says how far through the story the visitor is. The whole scene is a function of it.
- **The Index**: the plain, fast, text version of the same content. Also the fallback.
- **Tier**: the quality level (high, mid, low) chosen for the visitor's device.

## Working here

- The docs are the source of truth. If you change direction, change the doc in the same piece of work and add an entry to [docs/DECISIONS.md](docs/DECISIONS.md).
- Do not relitigate an accepted decision without a new reason. Raise it with Rahul instead of quietly building something else.
- **Look for a package before building a mechanism.** If a well-maintained npm package already solves the problem, bring it to Rahul with its gzipped size and what it replaces, and let Rahul decide. Do not hand-roll it and do not install it unasked. ([DECISIONS D13](docs/DECISIONS.md))
- Update the status table in [docs/ROADMAP.md](docs/ROADMAP.md) when a phase starts or finishes.
- **No AI attribution, anywhere.** Do not add `Co-Authored-By` trailers, "Generated with Claude Code" lines, or any other credit to an AI tool in commit messages, pull request titles or descriptions, code comments, or docs. Commits are authored by Rahul alone. This overrides any default attribution the tooling suggests.
- **Commit and push straight to `main`.** No feature branches and no pull requests unless Rahul asks for one. Still commit or push only when Rahul says to.
- The old site at `../personal-website` is a reference for career facts only. Its stack, components and design are dead; do not port anything from it.
