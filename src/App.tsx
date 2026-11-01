import { AnimatePresence, LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Closing } from './components/Closing'
import { Countdown } from './components/Countdown'
import { Events } from './components/Events'
import { Gallery } from './components/Gallery'
import { Hero } from './components/Hero'
import { Invitation } from './components/Invitation'
import { Nav } from './components/Nav'
import { Opening } from './components/Opening'
import { Rsvp } from './components/Rsvp'
import { SaveTheDate } from './components/SaveTheDate'
import { Venues } from './components/Venues'
import { useLang } from './i18n/LanguageContext'

const OPENED_KEY = 'nwd-opened'

function alreadyOpened() {
  try {
    // deep links (e.g. /#rsvp shared on WhatsApp) skip the envelope
    if (window.location.hash && window.location.hash !== '#top') return true
    return sessionStorage.getItem(OPENED_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const { t } = useLang()
  const [opened, setOpened] = useState(alreadyOpened)

  useEffect(() => {
    document.body.classList.toggle('locked', !opened)
  }, [opened])

  const handleOpen = () => {
    try {
      sessionStorage.setItem(OPENED_KEY, '1')
    } catch {
      /* ignore */
    }
    window.scrollTo(0, 0)
    setOpened(true)
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
          <main id="main">
            <Hero ready={opened} />
            <Invitation />
            <Countdown />
            <SaveTheDate />
            <Events />
            <Venues />
            <Gallery />
            <Rsvp />
            <Closing />
          </main>
          <footer className="site-footer">{t.footer.made} · nisarg-weds-devanshi.site</footer>
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}
