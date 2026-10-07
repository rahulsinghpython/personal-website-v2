# personal-website-v2

Rahul Singh's personal site. It is not a portfolio template. It is one dark 3D world built around one object, **the Machine**, which the visitor slowly realises is Rahul's whole career.

**Status: the plain site exists (content layer, the Index, prerendered HTML). The Machine is mounted on the home page, assembled by scrolling; its motion is settled. Phase 3 is finished; Phase 4, the interactions, is next.** [docs/ROADMAP.md](docs/ROADMAP.md) is the authority on what is built and what is next.

## Read before you build

| Doc | Read it when |
| --- | --- |
| [docs/VISION.md](docs/VISION.md) | Always, first. Why the site exists and the principles everything else follows. |
| [docs/EXPERIENCE.md](docs/EXPERIENCE.md) | Touching anything the visitor sees or does: the Machine, the scroll beats, interactions. |
| [docs/DESIGN-PROCESS.md](docs/DESIGN-PROCESS.md) | Deciding how anything looks or moves. How options get made and how Rahul picks. |
| [docs/CONTENT.md](docs/CONTENT.md) | Writing any copy or stating any fact about Rahul. |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Writing code: stack, layers, state, how the Machine is rendered. |
| [docs/PERFORMANCE.md](docs/PERFORMANCE.md) | Adding anything that costs bytes or frames. |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Before proposing a different approach. It may already have been weighed. |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Picking up work: phases, status, open questions for Rahul. |

## Rules that do not bend

Each one is explained in the doc it links to. If a task seems to need breaking one, stop and raise it with Rahul.

1. **One object.** Everything hangs off the Machine. No second hero, no card grids, no section that could be lifted from a template. ([VISION](docs/VISION.md))
2. **The visitor causes the change.** The story advances only when the visitor scrolls; nothing assembles, wakes or moves the camera on its own. Small ambient motion that adds to a part's meaning is allowed, within the limits in [DECISIONS D26](docs/DECISIONS.md). ([EXPERIENCE](docs/EXPERIENCE.md#interaction-rules))
3. **Content is HTML first.** Every fact is real text in the DOM and readable with JavaScript off. The canvas is decoration on top. ([ARCHITECTURE](docs/ARCHITECTURE.md#two-layers))
4. **The budget is a contract.** A feature that breaks [PERFORMANCE](docs/PERFORMANCE.md) is not done.
5. **Procedural, not modelled.** The Machine is generated in code. No dependency on a 3D artist or a Blender file. ([DECISIONS D4](docs/DECISIONS.md))
6. **Never invent facts.** Employers, dates, numbers and project names come from [CONTENT](docs/CONTENT.md) only. If it is not there, ask.
7. **Take the philosophy of Lando's site, not its look.** No neon lime, no helmet, no racing motifs.

## Vocabulary

Use these words the same way in code, commits and conversation.

- **The Machine**: the single 3D object at the centre of the site.
- **Part**: one of the Machine's four subsystems. Each part stands for one kind of work Rahul has done, in the order he came to it: **Core**, **Scanner**, **Rings**, **Lens**. The company is small print ([DECISIONS D24](docs/DECISIONS.md)).
- **Dust**: the Machine's points while scattered and unreadable (the opening state).
- **Dormant / awake**: a part that is assembled but unlit / a part that is powered on.
- **Beat**: one step of the scroll story (Found, Signal, Core, Scanner, Rings, Lens, Whole, Contact).
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
