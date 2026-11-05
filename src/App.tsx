import { AnimatePresence, LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Closing } from './components/Closing'
import { Countdown } from './components/Countdown'
import { Events } from './components/Events'
import { Hero } from './components/Hero'
import { Invitation } from './components/Invitation'
import { Nav } from './components/Nav'
import { Opening } from './components/Opening'
import { Rsvp } from './components/Rsvp'
import { Venues } from './components/Venues'
import { FallingPetals } from './components/Scenery'
import { useLang } from './i18n/LanguageContext'

/**
 * Every visit — including a refresh — starts at the envelope, at the top of the page.
 * A shared deep link (e.g. /#rsvp on WhatsApp) still opens the envelope first and then
 * glides to that section; on a refresh the leftover #hash is ignored.
 */
function initialTarget(): string | null {
  const hash = window.location.hash
  const nav = performance.getEntriesByType?.('navigation')[0] as PerformanceNavigationTiming | undefined
  if (hash) history.replaceState(null, '', window.location.pathname + window.location.search)
  if (!hash || hash === '#top' || nav?.type === 'reload') return null
  return hash.slice(1)
}

// read once per page load, before anything renders
const TARGET = initialTarget()

export default function App() {
  const { t } = useLang()
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('locked', !opened)
  }, [opened])

  const handleOpen = () => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setOpened(true)
    if (TARGET) {
      // let the veil dissolve first, then glide to the shared section
      window.setTimeout(() => document.getElementById(TARGET)?.scrollIntoView({ behavior: 'smooth' }), 900)
    }
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <a className="skip-link" href="#rsvp">
          {t.nav.rsvp}
        </a>
        <AnimatePresence>{!opened && <Opening key="opening" onOpen={handleOpen} />}</AnimatePresence>
        <div inert={!opened}>
          <Nav />
          {opened && <FallingPetals />}
          <main id="main">
            <Hero ready={opened} />
            <div className="border-band" aria-hidden="true" />
            <Invitation />
            <Countdown />
            <Events />
            <Venues />
            <Rsvp />
            <Closing />
          </main>
          <div className="border-band" aria-hidden="true" />
          <footer className="site-footer">{t.footer.made}</footer>
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}
