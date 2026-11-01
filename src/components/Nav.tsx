import { useEffect, useState } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { LanguageSwitch } from './LanguageSwitch'

export function Nav() {
  const { t } = useLang()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    ['#invitation', t.nav.invitation],
    ['#celebrations', t.nav.celebrations],
    ['#venues', t.nav.venues],
  ] as const

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <nav className="nav-inner" aria-label="Primary">
        <a href="#top" className="monogram" aria-label="Nisarg & Devanshi">
          N<span className="amp">&amp;</span>D
        </a>
        <ul className="nav-links">
          {links.map(([href, label]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          <LanguageSwitch />
          <a href="#rsvp" className="btn small nav-rsvp">
            {t.nav.rsvp}
          </a>
        </div>
      </nav>
    </header>
  )
}
