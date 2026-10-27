// Mirrors the Career section of docs/CONTENT.md. Change the doc first.
// The only figures allowed are the two scale numbers (D15). No percentages.

export type PartId = 'core' | 'scanner' | 'rings' | 'lens'
export type EraId = 's2t' | 'etavolt' | 'uniad' | 'cognizant'

export type YearMonth = { year: number; month: number }

/**
 * A place in the city a claim points at (docs/DECISIONS.md, D45). Only a name here: where it is
 * in 3D is the scene's business (src/experience/city/pins.ts).
 */
export type PinId =
  | 'streets'
  | 'services'
  | 'legacy'
  | 'cloud'
  | 'mesh'
  | 'roofs'
  | 'hall'
  | 'platform'
  | 'blk'
  | 'database'
  | 'tuition'
  | 'viaduct'
  | 'crown'
  | 'tower'
  | 'charts'
  | 'rollout'
  | 'plane'

/** One line of a job's work, the strongest first. */
export type Claim = {
  /** The whole line, as the page and the Index say it. */
  text: string
  /** The few words pinned in the city. */
  tag: string
  /** What kind of claim it is, over the line when its pin opens. */
  kind: string
  /** Where in the city it points. Some claims have nothing there to point at. */
  pin?: PinId
  /** Words drawn onto the blocks round the pin when it opens, one a block. */
  spread?: readonly string[]
}

export type Era = {
  id: EraId
  /** The id of this era's beat: the name of the part of the Machine it once was (D38). */
  part: PartId
  /** The kind of work, which the page leads with. The company is small print (D24). */
  field: string
  company: string
  /** The long form of the company name, where the short one is an abbreviation. */
  companyFull?: string
  role: string
  start: YearMonth
  /** null while the role is current. */
  end: YearMonth | null
  claims: readonly Claim[]
}

/** In the order of the career, oldest first, which is the order of the story. */
export const eras: readonly Era[] = [
  {
    id: 's2t',
    part: 'core',
    field: 'Data engineering',
    company: 'S2T',
    companyFull: 'Software & Simulation Technologies',
    role: 'Data Engineer, Jr. Team Lead',
    start: { year: 2021, month: 6 },
    end: { year: 2023, month: 6 },
    claims: [
      {
        text: 'In-house APIs in Flask and FastAPI, handling over 10,000 requests a second.',
        tag: '10,000 requests a second',
        kind: 'Throughput',
        pin: 'streets',
      },
      {
        text: 'Designed and built a microservices architecture in Python, Docker and Kubernetes.',
        tag: 'Microservices, designed and built',
        kind: 'Architecture',
        pin: 'services',
      },
      {
        text: 'Migrated legacy C++ to Python.',
        tag: 'Legacy C++, moved to Python',
        kind: 'Migration',
        pin: 'legacy',
      },
      {
        text: 'Serverless, storage and databases on Azure and AWS.',
        tag: 'Serverless on Azure and AWS',
        kind: 'Cloud',
        pin: 'cloud',
      },
      {
        text: 'Led the API development team. Presented the software on international business trips.',
        tag: 'Led the API team. Took it abroad',
        kind: 'Leadership',
        pin: 'plane',
      },
    ],
  },
  {
    id: 'etavolt',
    part: 'scanner',
    field: 'LiDAR to 3D',
    company: 'Etavolt',
    role: 'Software Engineer',
    start: { year: 2023, month: 8 },
    end: { year: 2024, month: 6 },
    claims: [
      {
        text: 'Shipped two development cycles of software that builds 3D meshes from point clouds and LiDAR, in React, Three.js and Python.',
        tag: 'Laser scans in, 3D meshes out',
        kind: 'The software',
        pin: 'mesh',
      },
      {
        text: 'Made for solar: roofs reconstructed in 3D, analysed, and solar panels placed on them.',
        tag: 'Roofs rebuilt, panels placed',
        kind: 'For solar',
        pin: 'roofs',
      },
      {
        text: 'One of the meshes was the Science Centre.',
        tag: 'One was the Science Centre',
        kind: 'This building',
        pin: 'hall',
      },
      {
        text: 'Led full-stack development of a customer acquisition platform.',
        tag: 'Led the full stack',
        kind: 'The platform',
        pin: 'platform',
      },
      {
        text: 'Presented the technology to clients, investors and stakeholders.',
        tag: 'Pitched to investors',
        kind: 'The pitch',
      },
    ],
  },
  {
    id: 'uniad',
    part: 'rings',
    field: 'Platforms at scale',
    company: 'Uniad',
    role: 'Lead Software Engineer',
    start: { year: 2024, month: 8 },
    end: { year: 2024, month: 12 },
    claims: [
      {
        text: 'Maintained a secure platform for over 10,000 users across Asia.',
        tag: '10,000+ users across Asia',
        kind: 'Scale',
        pin: 'blk',
      },
      {
        text: 'Designed the relational database behind finance, user management, lesson bookings, calendar and access control.',
        tag: 'One database, five systems',
        kind: 'Data model',
        pin: 'database',
        spread: ['Finance', 'Users', 'Bookings', 'Calendar', 'Access'],
      },
      {
        text: 'Built an enterprise product for tuition centres.',
        tag: 'Built for tuition centres',
        kind: 'Product',
        pin: 'tuition',
      },
      {
        text: 'Set up CI/CD for deployment and testing.',
        tag: 'CI/CD for deploys and tests',
        kind: 'Delivery',
        pin: 'viaduct',
      },
      {
        text: 'Supported by SMU Institute of Innovation & Entrepreneurship, NTU Innovation Lab and NUS Enterprise.',
        tag: 'Backed by SMU, NTU and NUS',
        kind: 'Backed by',
      },
    ],
  },
  {
    id: 'cognizant',
    part: 'lens',
    field: 'Applied AI',
    company: 'Cognizant',
    role: 'Software Engineer',
    start: { year: 2024, month: 12 },
    end: null,
    claims: [
      {
        text: "Built and deployed AI products for GovTech and Singapore's Ministry of Digital Development and Information (MDDI).",
        tag: 'AI for GovTech and MDDI',
        kind: 'Who for',
        pin: 'crown',
      },
      {
        text: 'Worked with data scientists on products that use LLMs for analytics, insight and decision support.',
        tag: 'LLMs for decision support',
        kind: 'What it does',
        pin: 'tower',
      },
      {
        text: 'Drag-and-drop interfaces with dynamic charting.',
        tag: 'Drag, drop, chart',
        kind: 'Interface',
        pin: 'charts',
      },
      {
        text: 'Rolled out across Whole-of-Government infrastructure, meeting its security and regulatory requirements.',
        tag: 'Across Whole-of-Government',
        kind: 'Rollout',
        pin: 'rollout',
      },
      {
        text: 'Full-stack in React, TypeScript and Django.',
        tag: 'React, TypeScript, Django',
        kind: 'Stack',
      },
    ],
  },
]

/** A claim's name on the page, which its pin in the city shares: `core-1` is the Core's first. */
export const claimId = (era: Era, index: number) => `${era.part}-${index + 1}`
