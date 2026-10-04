// Mirrors the Career section of docs/CONTENT.md. Change the doc first.
// The only figures allowed are the two scale numbers (D15). No percentages.

export type PartId = 'core' | 'scanner' | 'rings' | 'lens'
export type EraId = 's2t' | 'etavolt' | 'uniad' | 'cognizant'

export type YearMonth = { year: number; month: number }

export type Era = {
  id: EraId
  /** The part of the Machine this era becomes. Also the id of its beat. */
  part: PartId
  company: string
  /** The long form of the company name, where the short one is an abbreviation. */
  companyFull?: string
  role: string
  start: YearMonth
  /** null while the role is current. */
  end: YearMonth | null
  work: readonly string[]
}

/** In the order the Machine assembles: oldest first. */
export const eras: readonly Era[] = [
  {
    id: 's2t',
    part: 'core',
    company: 'S2T',
    companyFull: 'Software & Simulation Technologies',
    role: 'Data Engineer, Jr. Team Lead',
    start: { year: 2021, month: 6 },
    end: { year: 2023, month: 6 },
    work: [
      'Designed and built a microservices architecture in Python, Docker and Kubernetes.',
      'In-house APIs in Flask and FastAPI, handling over 10,000 requests a second.',
      'Legacy C++ migrated to Python.',
      'Serverless, storage and databases on Azure and AWS.',
      'Led the API development team. Presented the software on international business trips.',
    ],
  },
  {
    id: 'etavolt',
    part: 'scanner',
    company: 'Etavolt',
    role: 'Software Engineer',
    start: { year: 2023, month: 8 },
    end: { year: 2024, month: 6 },
    work: [
      'Led full-stack development of a customer acquisition platform.',
      'Presented the technology to clients, investors and stakeholders.',
    ],
  },
  {
    id: 'uniad',
    part: 'rings',
    company: 'Uniad',
    role: 'Lead Software Engineer',
    start: { year: 2024, month: 8 },
    end: null,
    work: [
      'Maintains a secure platform for over 10,000 users across Asia.',
      'Designed the relational database behind finance, user management, lesson bookings, calendar and access control.',
      'Set up CI/CD for deployment and testing.',
      'Supported by SMU Institute of Innovation & Entrepreneurship, NTU Innovation Lab and NUS Enterprise.',
    ],
  },
  {
    id: 'cognizant',
    part: 'lens',
    company: 'Cognizant',
    role: 'Software Engineer',
    start: { year: 2024, month: 12 },
    end: null,
    work: [
      "Built and deployed AI products for GovTech and Singapore's Ministry of Digital Development and Information (MDDI).",
      'Worked with data scientists on products that use LLMs for analytics, insight and decision support.',
      'Full-stack in React, TypeScript and Django.',
      'Drag-and-drop interfaces with dynamic charting.',
      'Rolled out across Whole-of-Government infrastructure, meeting its security and regulatory requirements.',
    ],
  },
]
