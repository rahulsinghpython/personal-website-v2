import { useState } from 'react'
import { opens, site } from '../content/site'
import { useOnScreen } from './onScreen'

/** Puts the email address on the clipboard, for a visitor with no mail app behind `mailto:`. */
function CopyEmail() {
  // Only once the page has scripts: without them the button could do nothing.
  const hydrated = useOnScreen()
  const [copied, setCopied] = useState(false)
  const email = site.contact.find((link) => link.id === 'email')
  if (!hydrated || !email || !navigator.clipboard) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Refused by the browser: the address is still there to read and select.
    }
  }

  return (
    <button type="button" onClick={copy} className="readout mt-3 py-1 text-cold hover:text-lit">
      <span aria-live="polite">{copied ? 'Copied' : 'Copy email address'}</span>
    </button>
  )
}

/**
 * The links at the top right of every page with the city, and Contact: the ways to reach Rahul
 * opened in place, without scrolling the story to its end (D48). A native popover, so it opens
 * and closes with scripts off, on Escape and on a click anywhere else. `backed` lays a dark fade
 * across the top of the window behind it, for a page whose text scrolls under it (the résumé).
 */
export function Header({
  links,
  backed = false,
}: {
  links: readonly { href: string; label: string }[]
  backed?: boolean
}) {
  return (
    <header
      className={`fixed top-0 right-0 z-10 flex p-3 sm:p-7 print:hidden ${
        backed ? 'left-0 justify-end bg-linear-to-b from-void from-60% to-void/0' : ''
      }`}
    >
      {links.map((link) => (
        <a key={link.href} href={link.href} className="readout block px-2 py-3 text-cold sm:p-3">
          {link.label}
        </a>
      ))}
      <button
        type="button"
        popoverTarget="reach"
        className="readout block px-2 py-3 text-lit sm:p-3"
      >
        Contact
      </button>
      <div id="reach" popover="auto" aria-label="Contact" className="reach">
        <ul className="contact">
          {site.contact.map((link) => (
            <li key={link.id}>
              <a href={link.href} {...opens(link)}>
                <span className="readout">{link.label}</span>
                <span className="break-all">{link.text}</span>
              </a>
            </li>
          ))}
        </ul>
        <CopyEmail />
      </div>
    </header>
  )
}
