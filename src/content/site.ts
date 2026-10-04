// Mirrors the Identity table in docs/CONTENT.md. Change the doc first.

export type ContactLink = {
  id: 'email' | 'github' | 'linkedin'
  label: string
  /** What the visitor reads. Kept printable: an address, not "click here". */
  text: string
  href: string
}

export const site = {
  name: 'Rahul Singh',
  /** The opening screen uses the first name only. */
  firstName: 'Rahul',
  title: 'Software Engineer / AI Engineer',
  location: 'Singapore',
  contact: [
    {
      id: 'email',
      label: 'Email',
      text: 'rahulsinghpython@gmail.com',
      href: 'mailto:rahulsinghpython@gmail.com',
    },
    {
      id: 'github',
      label: 'GitHub',
      text: 'github.com/rahulsinghpython',
      href: 'https://github.com/rahulsinghpython',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      text: 'linkedin.com/in/rahulsinghcomputerengineer',
      href: 'https://www.linkedin.com/in/rahulsinghcomputerengineer/',
    },
  ],
} as const satisfies {
  name: string
  firstName: string
  title: string
  location: string
  contact: readonly ContactLink[]
}
