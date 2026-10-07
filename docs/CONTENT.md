# Content

The only source of facts about Rahul for this site. When code needs a fact, it comes from here (and from `src/content/`, which must mirror this file). **If something is not here, ask Rahul. Do not fill gaps.**

**Where these facts came from:** the old site at `../personal-website` (`src/components/web/TimelineView.tsx` and `ProfileCard.tsx`), read on 2026-10-05, then reviewed with Rahul the same day. What Rahul confirmed, changed and dropped is recorded in [Confirmed with Rahul](#confirmed-with-rahul) at the bottom and in [DECISIONS D15](DECISIONS.md). The work descriptions under each era were confirmed in general terms, not line by line; if one turns out to be wrong, correct it here first.

## Identity

| | |
| --- | --- |
| Name | Rahul Singh |
| Name on the opening screen | Rahul (first name only) |
| Title | Software Engineer / AI Engineer |
| Based in | Singapore. Stated on the site. |
| Availability | Not stated anywhere on the site. |
| Email | rahulsinghpython@gmail.com |
| GitHub | https://github.com/rahulsinghpython |
| LinkedIn | https://www.linkedin.com/in/rahulsinghcomputerengineer/ |

## Career

Four eras, in the order the Machine assembles. Each maps to a part; see [EXPERIENCE](EXPERIENCE.md#the-machine). Roles and dates are confirmed. Uniad and Cognizant are both current and run at the same time.

### 1. S2T (Software & Simulation Technologies) → Core

- **Role:** Data Engineer, Jr. Team Lead
- **Dates:** Jun 2021 to Jun 2023
- **Work:**
  - Designed and built a microservices architecture with Python, Docker and Kubernetes.
  - Built in-house APIs with Flask and FastAPI handling over 10,000 requests per second.
  - Migrated legacy C++ code into Python.
  - Used Azure and AWS: serverless, storage, databases.
  - Led the API development team; presented software on international business trips.
- **Number that may be stated:** 10,000+ requests per second.

### 2. Etavolt → Scanner

- **Role:** Software Engineer
- **Dates:** Aug 2023 to Jun 2024
- **Work:**
  - Led full-stack development of a customer acquisition platform.
  - Shipped two development cycles of 3D modelling software that builds meshes from point cloud and LiDAR data, using React, Three.js and Python.
  - The 3D work was for solar: reconstructing roofs in 3D, analysing them, and optimising panel placement. One of the reconstructions was a mesh of the Science Centre.
  - Presented the technology to clients, investors and stakeholders.
- **Number that may be stated:** none.

This era is the conceptual centre of the site. The Machine is drawn as a point cloud because of this work.

### 3. Uniad → Rings

- **Role:** Lead Software Engineer
- **Dates:** Aug 2024 to present
- **Work:**
  - Maintains a secure platform for 10,000+ users across Asia.
  - Built an enterprise product for tuition centres.
  - Set up CI/CD for deployment and testing.
  - Designed the relational database for finance, user management, lesson bookings, calendar and access control.
- **Also:** supported by SMU Institute of Innovation & Entrepreneurship, NTU Innovation Lab and NUS Enterprise. May be named.
- **Number that may be stated:** 10,000+ users across Asia.
- **Product screens seen in the old site's assets:** dashboard, students, calendar synced across users, invoicing, PDF generation, onboarding and sign-up.

### 4. Cognizant → Lens

- **Role:** Software Engineer
- **Dates:** Dec 2024 to present
- **Work:**
  - Built and deployed AI-driven products for GovTech and Singapore's Ministry of Digital Development and Information (MDDI). Both may be named.
  - Full-stack with React (TypeScript) and Python Django.
  - Worked with data scientists on products that use LLMs for analytics, insight and decision support.
  - Built drag-and-drop interfaces with dynamic charting.
  - Rolled out across Whole-of-Government infrastructure, meeting security and regulatory requirements.
- **Number that may be stated:** none.

### Numbers that are not used

The old site also claimed percentages: latency reduced by 50%, uptime increased by 200%, a 300% performance improvement from the C++ migration, and efficiency increased by 150% at Etavolt. **All four are dropped.** They have no baseline or unit and Rahul does not stand behind them. Do not reintroduce them. The only figures on the site are the two scale numbers above.

## Technologies

From the old site: Python, TypeScript, JavaScript, React, Vue, Flutter, Java, Docker, Kubernetes, AWS, Azure, Google Cloud, Bash.

There is no skills section on this site and no logo tiles. A technology is mentioned only where it is part of what a specific era built.

## Projects

Projects appear inside the part for their era. The work is described in text, and since 2026-10-08 it may also be **shown**: Rahul cleared everything the old site showed.

| Project | Era / part | Status |
| --- | --- | --- |
| LiDAR point-cloud-to-mesh software, for solar | Etavolt / Scanner | Described in text. Screenshots and video: cleared. |
| Tuition centre management platform | Uniad / Rings | Described in text. Screenshots: cleared. |

**No personal projects in this release.** Rollcall (LLM résumé tailoring, in a sibling repo) stays off the site for now; Rahul may add personal projects later.

Screenshots and a LiDAR mesh video are in the old repo under `src/assets/carousel/`. **All of it is cleared for reuse.** Rahul, on 2026-10-08: "All from my previous personal website can be used". What is there, read the same day:

| Era | Files | What they are |
| --- | --- | --- |
| S2T | 3 images | Two road-show photos and a team photo. No product screens. |
| Etavolt | 5 images, 1 video | Roof reconstruction in 3D, panel placement and optimising, solar roof analysis, the Science Centre mesh; the video is mesh construction from LiDAR (4 MB). |
| Uniad | 8 images | Dashboard and overview, students, calendar synced across users, invoicing, PDF generation, onboarding, sign-up. |
| Cognizant | 3 images | Team and event photos only. **Nothing of this work may be shown.** Rahul, on 2026-10-08: it comes under the secrets act. It is described in text only, within what is cleared to be named ([Confirmed with Rahul](#confirmed-with-rahul), row 4). Do not make or look for screenshots of it. |

Cleared means allowed, not required: which of these go in a project panel is chosen when the panels are built. They are copied in and resized then, under the budgets in [PERFORMANCE](PERFORMANCE.md); one photo is 9.6 MB as it stands. Nothing else from the old site is ported.

## Voice

- **Second person, present tense.** The site speaks to the visitor: "You've found Rahul."
- **Short.** One line per beat where possible. A beat never has a paragraph.
- **Concrete over descriptive.** "10,000 requests a second", not "high-performance APIs".
- **No adjectives about Rahul.** Never "passionate", "driven", "detail-oriented". The old site's "passionate software engineer with a knack for..." is exactly what this site does not say.
- **No exclamation marks, no emoji.**
- **Capitals for statements, set small.** Monospace for years and numbers.
- **Dry is fine.** A little wit is welcome; cleverness that hides a fact is not.

## Copy

What the site says now, in `src/content/beats.ts`. Not final: copy is settled in Phase 5. Rahul's steer on 2026-10-05: the wording is free, be creative with it. The facts underneath are not free. Rewrite within the voice rules, using only what this doc confirms.

Each era beat has a readout line built from the era's data (years, company, full role), then the statement below, then that era's project and work lines.

| Beat | Readout | Statement |
| --- | --- | --- |
| Found | | `YOU'VE FOUND RAHUL.` |
| Signal | | `SOMETHING WAS BUILT HERE.` |
| Core | `2021 — 2023 / S2T / DATA ENGINEER, JR. TEAM LEAD` | `IT STARTED WITH PIPES. 10,000 REQUESTS A SECOND.` |
| Scanner | `2023 — 2024 / ETAVOLT / SOFTWARE ENGINEER` | `I WROTE SOFTWARE THAT TURNS LASER SCANS INTO 3D MODELS. YOU'VE BEEN LOOKING AT ONE.` |
| Rings | `2024 — NOW / UNIAD / LEAD SOFTWARE ENGINEER` | `10,000 PEOPLE. ONE SCHEDULE THAT HOLDS.` |
| Lens | `2024 — NOW / COGNIZANT / SOFTWARE ENGINEER` | `LANGUAGE MODELS FOR SINGAPORE'S GOVERNMENT. DATA IN, DECISIONS OUT.` |
| Whole | | `FIVE YEARS. ONE MACHINE.` |
| Contact | | `YOU FOUND ME. SAY SOMETHING.` |

**Added back on 2026-10-07, with the scene:** the Scanner statement's second sentence, `YOU'VE BEEN LOOKING AT ONE.` It is the third reveal in [EXPERIENCE](EXPERIENCE.md#the-reveal-budget). It is only true while the visitor is looking at a point cloud. The Index does not carry the statements, but the story page still shows the line when the scene cannot start (no JavaScript, no WebGL). Revisit it with the no-WebGL fallback in Phase 5.

**Leans on the Machine:** `FIVE YEARS. ONE MACHINE.` reads as a figure of speech on the plain site. Revisit if it confuses anyone before the scene ships.

## Confirmed with Rahul

Answered on 2026-10-05.

| # | Question | Answer |
| --- | --- | --- |
| 1 | Are the roles and dates right? | Yes, all four. Uniad and Cognizant are both current, at the same time. No newer role. |
| 2 | Name on the opening screen? | "Rahul". The full name still appears in the page title, the Index and contact. |
| 3 | Which numbers can be stated? | Only the two scale numbers: 10,000+ requests per second (S2T) and 10,000+ users across Asia (Uniad). Every percentage is dropped. |
| 4 | What can be named in text? | That the Etavolt 3D work was for solar; the Science Centre mesh; GovTech and MDDI as who the Cognizant products were for; Uniad's three supporters. |
| 5 | Personal projects? | None for now. |
| 6 | Location and availability? | Based in Singapore, stated. Availability is not mentioned. |
| 7 | Title? | Software Engineer / AI Engineer. |
| 8 | What can be shown? | Answered on 2026-10-08: everything the old site showed, the screenshots, photos and the LiDAR mesh video. See [Projects](#projects). |

## Still needs Rahul

1. **The LinkedIn URL** above was carried over from the old site and has not been checked.
