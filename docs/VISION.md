# Vision

## The idea in one sentence

You arrive in the dark, Rahul's name crumbles into points, and the points pour down into a city scanned at night: Singapore, round Marina Bay. By the time you have scrolled for twenty seconds you understand that what lights up in it is Rahul's entire career, in the order it happened.

Until 2026-10-19 the site was built round a single object, the Machine. Rahul replaced it with the city ([DECISIONS D38](DECISIONS.md)).

## Where this comes from

The spark was [landonorris.com](https://landonorris.com). It works because it feels like a person's world and not a filled-in template: bold 3D, a strong point of view, and it still loads fast.

What we take from it:

- **A world, not a layout.** The site has a place and an atmosphere before it has sections.
- **One confident idea**, carried all the way through.
- **Flashy and fast at the same time.** These are not opposites if the idea is chosen with cost in mind.

What we do not take:

- Its look. No neon lime, no helmet, no racing language.
- Its production model. That site was made by a studio (OFF+BRAND) with 3D artists and motion designers. This one is made by one engineer, so the idea must be buildable in code. See [DECISIONS D4](DECISIONS.md).
- Constant motion. Our scene changes when the visitor does something; what moves by itself is small.

## Who it is for

| Visitor | What they have | What they must leave with |
| --- | --- | --- |
| Recruiter or hiring manager | 30 seconds, maybe on a phone | Who Rahul is, what Rahul has done, how to get in touch. The Index gives this instantly. |
| Engineer or peer | Curiosity, a good GPU, will poke at things | "How was that built?" and the answer is Rahul's real work. |
| Friend, or a stranger sent the link | No context | A reason to send it to someone else. |

The site has to serve the first row without boring the other two, and delight the other two without blocking the first.

## Principles

**1. One world carries everything.**
The city is the navigation, the timeline and the portfolio. Projects are not cards; they are things in it. One place is memorable where a page of sections is not. It is Singapore because that is where Rahul is from, and the landmarks say so before any text does.

**2. Curiosity first, then payoff, quickly.**
The opening explains nothing. The visitor should wonder what they are looking at. But the mystery is short: within about twenty seconds of scrolling they must understand that what lights up in the city is a career. Mystery that lasts longer than that is just confusion.

**3. The visitor causes the change.**
Scrolling brings the city down out of the dust and lights it, one job at a time. Moving the pointer lights the dust. Sweeping across a roof reconstructs it. When the visitor stops, the story stops. This makes every change feel earned. A little ambient motion is allowed where it means something ([DECISIONS D26](DECISIONS.md)); nothing in the story happens by itself.

**4. The medium is the proof.**
Rahul built software that turns LiDAR point clouds into 3D models. So the city is a point cloud, a laser scan, and part of it is reconstructed in front of you. The site does not claim the skill; it demonstrates it. Wherever possible, each job shows itself by doing a small version of its work in the city.

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
- A postcard. The landmarks say where Rahul is from; they are not the subject, and the camera never swoops round the skyline.
- Anything that needs a Blender artist to exist.
- Sound, in the first version.

## What success looks like

- A first-time visitor says some version of "oh, it's a whole career" without being told.
- Someone forwards the link for the site itself, not for the résumé. The résumé is still there, at `/resume`, as the one plain document outside the world ([DECISIONS D49](DECISIONS.md)): a visitor who needs it gets it as it is.
- A recruiter on a mid-range phone gets name, current role and contact in under five seconds.
- It meets every number in [PERFORMANCE](PERFORMANCE.md).
- An engineer who opens DevTools finds nothing embarrassing.
