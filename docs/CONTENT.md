# Content

The only source of facts about Rahul for this site. When code needs a fact, it comes from here (and later from `src/content/`, which must mirror this file). **If something is not here, ask Rahul. Do not fill gaps.**

**Where these facts came from:** the old site at `../personal-website` (`src/components/web/TimelineView.tsx` and `ProfileCard.tsx`), read on 2026-10-05. That site is old, so everything below is **unconfirmed until Rahul checks it**. Items needing Rahul's attention are collected at the bottom.

## Identity

| | |
| --- | --- |
| Name | Rahul Singh |
| Title, as used on the old site | Software Engineer / Data Engineer |
| Based in | Singapore (inferred from employers; confirm) |
| Email | rahulsinghpython@gmail.com |
| GitHub | https://github.com/rahulsinghpython |
| LinkedIn | https://www.linkedin.com/in/rahulsinghcomputerengineer/ |

## Career

Four eras, in the order the Machine assembles. Each maps to a part; see [EXPERIENCE](EXPERIENCE.md#the-machine).

### 1. S2T (Software & Simulation Technologies) → Core

- **Role:** Data Engineer, Jr. Team Lead
- **Dates:** Jun 2021 to Jun 2023
- **Work:**
  - Designed and built a microservices architecture with Python, Docker and Kubernetes.
  - Built in-house APIs with Flask and FastAPI handling over 10,000 requests per second.
  - Migrated and optimised legacy C++ code into Python.
  - Used Azure and AWS: serverless, storage, databases.
  - Led the API development team; presented software on international business trips.
- **Numbers on the old site:** 10,000+ requests/second; latency reduced by 50%; "uptime increased by 200%"; "300% performance improvement" from the C++ migration.

### 2. Etavolt → Scanner

- **Role:** Software Engineer
- **Dates:** Aug 2023 to Jun 2024
- **Work:**
  - Led full-stack development of a customer acquisition platform.
  - Shipped two development cycles of 3D modelling software that builds meshes from point cloud and LiDAR data, using React, Three.js and Python.
  - Presented the technology to clients, investors and stakeholders.
- **Numbers on the old site:** efficiency increased by 150%.
- **Inferred from the old site's image filenames (confirm):** the 3D work was for solar: reconstructing roofs in 3D, analysing them, and optimising panel placement, including a mesh of the Science Centre.

This era is the conceptual centre of the site. The Machine is drawn as a point cloud because of this work.

### 3. Uniad → Rings

- **Role:** Lead Software Engineer
- **Dates:** Aug 2024 to present
- **Work:**
  - Maintains a secure platform for 10,000+ users across Asia.
  - Built an enterprise product for tuition centres.
  - Set up CI/CD for deployment and testing.
  - Designed the relational database for finance, user management, lesson bookings, calendar and access control.
- **Also:** supported by SMU Institute of Innovation & Entrepreneurship, NTU Innovation Lab and NUS Enterprise.
- **Product screens seen in the old site's assets:** dashboard, students, calendar synced across users, invoicing, PDF generation, onboarding and sign-up.

### 4. Cognizant → Lens

- **Role:** Software Engineer
- **Dates:** Dec 2024 to present
- **Work:**
  - Built and deployed AI-driven products for GovTech and Singapore's Ministry of Digital Development and Information (MDDI).
  - Full-stack with React (TypeScript) and Python Django.
  - Worked with data scientists on products that use LLMs for analytics, insight and decision support.
  - Built drag-and-drop interfaces with dynamic charting.
  - Rolled out across Whole-of-Government infrastructure, meeting security and regulatory requirements.

## Technologies

From the old site: Python, TypeScript, JavaScript, React, Vue, Flutter, Java, Docker, Kubernetes, AWS, Azure, Google Cloud, Bash.

There is no skills section on this site and no logo tiles. A technology is mentioned only where it is part of what a specific era built.

## Projects

Projects appear inside the part for their era. None are confirmed yet.

| Project | Era / part | Status |
| --- | --- | --- |
| LiDAR point-cloud-to-mesh software | Etavolt / Scanner | In the old site. Confirm what can be shown publicly. |
| Tuition centre management platform | Uniad / Rings | In the old site. Confirm what can be shown publicly. |
| Rollcall (LLM résumé tailoring that may never invent facts) | Personal | Seen in a sibling repo, not on the old site. Rahul to say whether it goes on the site and where it lives in the Machine. |

Screenshots and a LiDAR mesh video exist in the old repo under `src/assets/carousel/`. Check each for confidentiality before reuse; the Cognizant work is for government and the old site showed only team photos for it.

## Voice

- **Second person, present tense.** The site speaks to the visitor: "You've found Rahul Singh."
- **Short.** One line per beat where possible. A beat never has a paragraph.
- **Concrete over descriptive.** "10,000 requests a second", not "high-performance APIs".
- **No adjectives about Rahul.** Never "passionate", "driven", "detail-oriented". The old site's "passionate software engineer with a knack for..." is exactly what this site does not say.
- **No exclamation marks, no emoji.**
- **Capitals for statements, set small.** Monospace for years and numbers.
- **Dry is fine.** A little wit is welcome; cleverness that hides a fact is not.

## Draft copy

Drafts to show the tone. None of it is approved; rewrite freely within the voice rules.

| Beat | Draft |
| --- | --- |
| Found | `YOU'VE FOUND RAHUL SINGH.` |
| Signal | `SOMETHING WAS BUILT HERE.` |
| Core | `2021 — 2023 / S2T / DATA ENGINEER` then `IT STARTED WITH PIPES. 10,000 REQUESTS A SECOND.` |
| Scanner | `2023 — 2024 / ETAVOLT / SOFTWARE ENGINEER` then `I WROTE SOFTWARE THAT TURNS LASER SCANS INTO 3D MODELS. YOU'VE BEEN LOOKING AT ONE.` |
| Rings | `2024 — / UNIAD / LEAD ENGINEER` then `10,000 PEOPLE. ONE SCHEDULE THAT HOLDS.` |
| Lens | `2024 — / COGNIZANT / SOFTWARE ENGINEER` then `LANGUAGE MODELS FOR SINGAPORE'S GOVERNMENT. DATA IN, DECISIONS OUT.` |
| Whole | `FIVE YEARS. ONE MACHINE.` |
| Contact | `YOU FOUND ME. SAY SOMETHING.` |

## Needs Rahul

1. **Are the dates still right?** Uniad and Cognizant both say "present" as of the old site. Any role since?
2. **Name on the opening screen:** "Rahul Singh" or just "Rahul"?
3. **Which numbers can you stand behind?** "Uptime increased by 200%" does not parse (uptime cannot rise 200%); it needs restating as the real before and after, or dropping. "300% performance improvement" and "150% efficiency" would be stronger with what was measured.
4. **What can be shown** from Etavolt, Uniad and Cognizant: screenshots, the LiDAR video, product names, client names?
5. **Personal projects** to include: Rollcall? Anything else?
6. **Location and availability:** should the site say where you are based or whether you are open to work?
7. **A current title:** is "Software Engineer / Data Engineer" still how you describe yourself?
