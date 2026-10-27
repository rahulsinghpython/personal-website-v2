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

Four eras, in the order the story tells them. Each is one job beat in the city; see [EXPERIENCE](EXPERIENCE.md#where-each-job-is). Roles and dates are confirmed. Cognizant is current. Uniad ended in Dec 2024, the month Cognizant began (Rahul, 2026-10-28).

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
  - It was a pre-sales visualisation for people interested in buying solar: LiDAR data taken from online map data, reconstructed into a mesh that roughly resolves what the building looks like. Confirmed by Rahul on 2026-10-20. Name the source only as map data; see below.
  - Presented the technology to clients, investors and stakeholders.
- **Number that may be stated:** none.

**Naming the data source.** Say "map data", not the name of the map service it came from. Chat's advice on 2026-10-20, because the repo and the site are public; Rahul may override.

This era is the conceptual centre of the site. The city is drawn as a laser scan because of this work.

### 3. Uniad → Rings

- **Role:** Lead Software Engineer
- **Dates:** Aug 2024 to Dec 2024
- **Work:**
  - Maintained a secure platform for 10,000+ users across Asia.
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

Cleared means allowed, not required: which of these go in a project panel is chosen when the panels are built. Chosen on 2026-10-28, see [The Whole beat's panels](#the-whole-beats-panels). They are copied in and resized then, under the budgets in [PERFORMANCE](PERFORMANCE.md); one photo is 9.6 MB as it stands. Nothing else from the old site is ported.

### The Whole beat's panels

What opens when a job is chosen at Whole ([DECISIONS D56](DECISIONS.md)), in `src/content/panels.ts`. Rahul picked every set offered on 2026-10-28. The pictures are resized copies in `public/work/`; their captions say only what CONTENT already says, and the alt text describes what is in each picture.

| Job | Name | What it did | Shown |
| --- | --- | --- | --- |
| S2T | the field, Data engineering | Led the API development team, and presented the software on international business trips. | Two road-show photos and the Singapore team. |
| Etavolt | LiDAR point-cloud-to-mesh software | The project's summary above: meshes from point clouds and LiDAR, for solar, two cycles shipped, the Science Centre. | The mesh-from-LiDAR film; roofs reconstructed in 3D, the Science Centre mesh, solar roof analysis, panels placed on a complex roof, optimising where the panels go. |
| Uniad | Tuition centre management platform | An enterprise product for tuition centres: students, lesson bookings on a calendar synced across users, invoicing and PDF generation, over one relational database. | Dashboard, calendar synced across users, students, invoicing, PDF generation. Onboarding and sign-up are left out. |
| Cognizant | the field, Applied AI | AI products for government, built with data scientists and rolled out across it; then its claims. | Nothing: "Government work: none of it can be shown." Nor the team photos. |

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

Each job beat leads with the work ([DECISIONS D45](DECISIONS.md)): a readout with the job's number and its field, the statement as the headline, set large in sentence case, a readout of company, role and years as small print, then the job's [claims](#claims), numbered. The other beats' statements are set small in capitals.

| Beat | Readout | Statement |
| --- | --- | --- |
| Found | | `YOU'VE FOUND RAHUL.` |
| Signal | | `SOMETHING WAS BUILT HERE.` |
| Core | `JOB 1 OF 4 / DATA ENGINEERING`, then `S2T / DATA ENGINEER, JR. TEAM LEAD / 2021 — 2023` | APIs that hold 10,000 requests a second. |
| Scanner | `JOB 2 OF 4 / LIDAR TO 3D`, then `ETAVOLT / SOFTWARE ENGINEER / 2023 — 2024` | Software that turns laser scans into 3D models. You've been looking at one. |
| Rings | `JOB 3 OF 4 / PLATFORMS AT SCALE`, then `UNIAD / LEAD SOFTWARE ENGINEER / 2024 — NOW` | One platform. 10,000+ users across Asia. |
| Lens | `JOB 4 OF 4 / APPLIED AI`, then `COGNIZANT / SOFTWARE ENGINEER / 2024 — NOW` | Language models for Singapore's government. Data in, decisions out. |
| Whole | `THE WHOLE CAREER` | Four jobs. Five years. One city. |
| Contact | | `YOU FOUND ME. SAY SOMETHING.` |

**Added back on 2026-10-07, with the scene:** the Scanner statement's second sentence, `YOU'VE BEEN LOOKING AT ONE.` It is the third reveal in [EXPERIENCE](EXPERIENCE.md#the-reveal-budget). It is only true while the visitor is looking at a point cloud. The Index does not carry the statements, but the story page still shows the line when the scene cannot start (no JavaScript, no WebGL). Revisit it with the no-WebGL fallback in Phase 5.

**Rewritten for the city on 2026-10-24:** Whole's `FIVE YEARS. ONE MACHINE.`, written for the Machine, is now `Four jobs. Five years. One city.` ([DECISIONS D45](DECISIONS.md)).

**Added on 2026-10-25** ([DECISIONS D48](DECISIONS.md)): under Found's line, the readout `SCROLL TO LOOK CLOSER`, or `SWIPE UP TO LOOK CLOSER` on a touch screen, the one hint the opening gives; and `CONTACT` in the header, which opens the contact links in place.

### The exhibit

In `src/content/exhibit.ts`. It states nothing about Rahul beyond what the story does.

| Part | Copy |
| --- | --- |
| Readout | `EXHIBIT` |
| Title | `THE CITY` |
| Caption | Marina Bay at night, drawn as a laser scan. What is lit is Rahul's work. |
| How | `DRAG TO LOOK ROUND. SCROLL OR PINCH TO COME CLOSER.` |
| Without the scene | `THE CITY NEEDS JAVASCRIPT AND WEBGL. THE STORY AND THE INDEX READ WITHOUT THEM.` |

### The résumé

In `src/content/resume.ts`. The PDF itself is `public/resume.pdf`, Rahul's own file: what it says is his, not this doc's.

| Part | Copy |
| --- | --- |
| Readout | `RESUME` |
| Download | `DOWNLOAD PDF`, saved as `Rahul-Singh-Resume.pdf` |
| Open | `OPEN IN A NEW TAB` |
| Without scripts, or if the PDF cannot be drawn | `OPEN THE PDF` |
| Where the PDF cannot be shown | This browser can't show the PDF here. |

## Claims

Each job's work, as the page says it and the Index lists it, in `src/content/eras.ts`: one line a claim, the strongest first. Each has a few words for its tag in the city and the place it is pinned to ([DECISIONS D45](DECISIONS.md)); a claim with nothing in the city to point at has no pin. The facts are the Career section's, and the projects' summaries are carried here, so the story page does not repeat them.

**S2T, Core**

| # | Claim | Tag | Pinned to |
| --- | --- | --- | --- |
| 1 | In-house APIs in Flask and FastAPI, handling over 10,000 requests a second. | 10,000 requests a second | the streets of the CBD, where the requests run |
| 2 | Designed and built a microservices architecture in Python, Docker and Kubernetes. | Microservices, designed and built | a CBD tower |
| 3 | Migrated legacy C++ to Python. | Legacy C++, moved to Python | another CBD tower |
| 4 | Serverless, storage and databases on Azure and AWS. | Serverless on Azure and AWS | the top of the tallest CBD tower but the Lens's |
| 5 | Led the API development team. Presented the software on international business trips. | Led the API team. Took it abroad | the plane leaving Changi, which crosses the sky at this beat |

**Etavolt, Scanner**

| # | Claim | Tag | Pinned to |
| --- | --- | --- | --- |
| 1 | Shipped two development cycles of software that builds 3D meshes from point clouds and LiDAR, in React, Three.js and Python. | Laser scans in, 3D meshes out | the Science Centre's drum |
| 2 | Made for solar: roofs reconstructed in 3D, analysed, and solar panels placed on them. | Roofs rebuilt, panels placed | its flat roof |
| 3 | One of the meshes was the Science Centre. | One was the Science Centre | its hall |
| 4 | Led full-stack development of a customer acquisition platform. | Led the full stack | a block nearby |
| 5 | Presented the technology to clients, investors and stakeholders. | Pitched to investors | none |

**Uniad, Rings**

| # | Claim | Tag | Pinned to |
| --- | --- | --- | --- |
| 1 | Maintained a secure platform for over 10,000 users across Asia. | 10,000+ users across Asia | BLK 2024 |
| 2 | Designed the relational database behind finance, user management, lesson bookings, calendar and access control. | One database, five systems | over the blocks round BLK 2024; opened, it names five of them Finance, Users, Bookings, Calendar and Access |
| 3 | Built an enterprise product for tuition centres. | Built for tuition centres | a block in front |
| 4 | Set up CI/CD for deployment and testing. | CI/CD for deploys and tests | the viaduct, where the train runs |
| 5 | Supported by SMU Institute of Innovation & Entrepreneurship, NTU Innovation Lab and NUS Enterprise. | Backed by SMU, NTU and NUS | none |

**Cognizant, Lens**

| # | Claim | Tag | Pinned to |
| --- | --- | --- | --- |
| 1 | Built and deployed AI products for GovTech and Singapore's Ministry of Digital Development and Information (MDDI). | AI for GovTech and MDDI | the top of the Lens's tower |
| 2 | Worked with data scientists on products that use LLMs for analytics, insight and decision support. | LLMs for decision support | the Lens's tower |
| 3 | Drag-and-drop interfaces with dynamic charting. | Drag, drop, chart | a CBD tower |
| 4 | Rolled out across Whole-of-Government infrastructure, meeting its security and regulatory requirements. | Across Whole-of-Government | another CBD tower |
| 5 | Full-stack in React, TypeScript and Django. | React, TypeScript, Django | none |

Each job is named by its field, first on the page and in the Index: Data engineering, LiDAR to 3D, Platforms at scale, Applied AI.

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
| 9 | Is the LinkedIn URL right? | Answered on 2026-10-24: yes, the URL above is right. |
| 10 | Should the copy lead with the work or with the company and role? | Answered on 2026-10-24: with the work. Rahul: "we should lead with work". The company and role become small print, as in the city ([DECISIONS D24](DECISIONS.md)). |

## Still needs Rahul

Nothing open.
