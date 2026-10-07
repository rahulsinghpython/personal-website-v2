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

Projects appear inside the part for their era. The work itself may be described in text now; what can be **shown** is still open.

| Project | Era / part | Status |
| --- | --- | --- |
| LiDAR point-cloud-to-mesh software, for solar | Etavolt / Scanner | Described in text. Screenshots and video: not yet cleared. |
| Tuition centre management platform | Uniad / Rings | Described in text. Screenshots: not yet cleared. |

**No personal projects in this release.** Rollcall (LLM résumé tailoring, in a sibling repo) stays off the site for now; Rahul may add personal projects later.

Screenshots and a LiDAR mesh video exist in the old repo under `src/assets/carousel/`. None is cleared for reuse. Check each with Rahul before using it; the Cognizant work is for government and the old site showed only team photos for it.

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

## Still needs Rahul

1. **What can be shown** (not just named): the screenshots and the LiDAR mesh video from the old repo. Needed when project panels are built in Phase 4, not before.
2. **The LinkedIn URL** above was carried over from the old site and has not been checked.
