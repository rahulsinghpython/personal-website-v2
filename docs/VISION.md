# Vision

## The idea in one sentence

You arrive in the dark, find a strange object, and by the time you have scrolled for twenty seconds you understand that the object is Rahul's entire career, assembled in the order it happened.

## Where this comes from

The spark was [landonorris.com](https://landonorris.com). It works because it feels like a person's world and not a filled-in template: bold 3D, a strong point of view, and it still loads fast.

What we take from it:

- **A world, not a layout.** The site has a place and an atmosphere before it has sections.
- **One confident idea**, carried all the way through.
- **Flashy and fast at the same time.** These are not opposites if the idea is chosen with cost in mind.

What we do not take:

- Its look. No neon lime, no helmet, no racing language.
- Its production model. That site was made by a studio (OFF+BRAND) with 3D artists and motion designers. This one is made by one engineer, so the idea must be buildable in code. See [DECISIONS D4](DECISIONS.md).
- Constant motion. Our scene stays still until the visitor does something.

## Who it is for

| Visitor | What they have | What they must leave with |
| --- | --- | --- |
| Recruiter or hiring manager | 30 seconds, maybe on a phone | Who Rahul is, what Rahul has done, how to get in touch. The Index gives this instantly. |
| Engineer or peer | Curiosity, a good GPU, will poke at things | "How was that built?" and the answer is Rahul's real work. |
| Friend, or a stranger sent the link | No context | A reason to send it to someone else. |

The site has to serve the first row without boring the other two, and delight the other two without blocking the first.

## Principles

**1. One object carries everything.**
The Machine is the navigation, the timeline and the portfolio. Projects are not cards; they are parts of it. One object is memorable where a page of sections is not, and it keeps the scene cheap.

**2. Curiosity first, then payoff, quickly.**
The opening explains nothing. The visitor should wonder what they are looking at. But the mystery is short: within about twenty seconds of scrolling they must understand that the object is a career. Mystery that lasts longer than that is just confusion.

**3. The visitor causes the change.**
Nothing moves by itself. Scrolling assembles the Machine. Moving the pointer lights the dust. Sweeping across a part reconstructs it. When the visitor stops, the world stops. This makes every change feel earned, and it means an idle page costs the GPU nothing.

**4. The medium is the proof.**
Rahul built software that turns LiDAR point clouds into 3D models. So the Machine is a point cloud that reconstructs itself in front of you. The site does not claim the skill; it demonstrates it. Wherever possible, a part shows its era's work by doing a small version of it.

**5. Useful before impressive.**
Every fact is real text, readable with no JavaScript, no WebGL and no patience. The 3D is a layer on top of a site that already works. A plain view, the Index, is always one click away.

**6. Fast is part of the design.**
Performance is not a cleanup step at the end. The idea itself was picked because it is cheap: points on black, no lighting, no textures, no idle rendering. See [PERFORMANCE](PERFORMANCE.md).

**7. Restraint.**
Near-black, one accent colour, two typefaces, few words. If something can be removed without losing meaning, it goes.

## Anti-goals

- A grid of project cards, a skills section with logo tiles, a timeline component, a "Hi, I'm Rahul 👋" hero.
- Adjectives about Rahul ("passionate", "detail-oriented"). Show the work and the numbers.
- Motion for decoration: floating blobs, auto-rotating models, parallax on everything, looping background animation.
- Scroll-jacking. The page scrolls at the speed the visitor scrolls it.
- A loading screen with a percentage counter. The first screen is text on black and needs no loading.
- Anything that needs a Blender artist to exist.
- Sound, in the first version.

## What success looks like

- A first-time visitor says some version of "oh, it's a whole career" without being told.
- Someone forwards the link for the site itself, not for the résumé.
- A recruiter on a mid-range phone gets name, current role and contact in under five seconds.
- It meets every number in [PERFORMANCE](PERFORMANCE.md).
- An engineer who opens DevTools finds nothing embarrassing.
