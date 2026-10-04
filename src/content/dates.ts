import type { Era } from './eras'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** The instrument readout: "2021 — 2023", or "2024 — now" for a current role. */
export function yearRange({ start, end }: Era): string {
  return `${start.year} — ${end ? end.year : 'now'}`
}

/** The Index's fuller form: "Jun 2021 to Jun 2023", or "Aug 2024 to present". */
export function monthRange({ start, end }: Era): string {
  const from = `${MONTHS[start.month - 1]} ${start.year}`
  return `${from} to ${end ? `${MONTHS[end.month - 1]} ${end.year}` : 'present'}`
}
