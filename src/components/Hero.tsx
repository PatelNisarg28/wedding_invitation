import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { city, couple, events, venues, WEDDING_START } from '../content/wedding'
import { useLang } from '../i18n/LanguageContext'
import { IconArrow, IconPin, Mandala } from './Ornaments'
import { Bell, Bougainvillea, Diya, ElephantEmblem, FloorPetals, Pillar, TitleOrnament, Urli } from './Scenery'

const EASE = [0.22, 1, 0.36, 1] as const

function IconCalendar(p: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...p} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01" strokeWidth="2.2" />
    </svg>
  )
}

export function Hero({ ready }: { ready: boolean }) {
  const { t, l, fmtDate } = useLang()
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const mandalaY = useTransform(scrollY, [0, 800], [0, reduce ? 0 : 140])
  const contentY = useTransform(scrollY, [0, 700], [0, reduce ? 0 : -50])
  const fade = useTransform(scrollY, [0, 520], [1, reduce ? 1 : 0.25])
  const main = events.find((e) => e.highlight)!

  const item = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1.1, ease: EASE, delay: 0.35 + i * 0.13 },
  })
  // scenery grows in from the edges, a beat after the text starts
  const grow = (i: number, from: 'top' | 'side' | 'bottom') => ({
    initial: { opacity: 0, y: from === 'top' ? -24 : from === 'bottom' ? 24 : 0, scale: from === 'side' ? 0.96 : 1 },
    animate: ready ? { opacity: 1, y: 0, scale: 1 } : {},
    transition: { duration: 1.6, ease: EASE, delay: 0.2 + i * 0.15 },
  })

  return (
    <section className="hero" id="top" aria-labelledby="hero-names">
      <m.div className="hero-mandala" style={{ y: mandalaY }}>
        <Mandala className="spin-slow" />
      </m.div>

      <m.div className="hero-pillar left" {...grow(0, 'side')}>
        <Pillar />
      </m.div>
      <m.div className="hero-pillar right" {...grow(0, 'side')}>
        <Pillar />
      </m.div>

      <m.div className="hero-bloom left" {...grow(1, 'top')}>
        <Bougainvillea />
      </m.div>
      <m.div className="hero-bloom right" {...grow(1, 'top')}>
        <Bougainvillea />
      </m.div>
      <m.div className="hero-bell left" {...grow(2, 'top')}>
        <Bell />
      </m.div>
      <m.div className="hero-bell right" {...grow(2, 'top')}>
        <Bell />
      </m.div>

      <m.div className="hero-content" style={{ y: contentY, opacity: fade }}>
        <m.div {...item(0)}>
          <ElephantEmblem />
        </m.div>
        <m.div className="hero-kicker" {...item(1)}>
          <span aria-hidden="true" />
          {t.hero.kicker}
          <span aria-hidden="true" />
        </m.div>
        <m.h1 className="hero-names" id="hero-names" {...item(2)}>
          <span>{l(couple.groom)}</span>
          <span className="amp">&amp;</span>
          <span>{l(couple.bride)}</span>
        </m.h1>
        <m.div className="hero-rule" aria-hidden="true" {...item(3)}>
          <TitleOrnament />
          <TitleOrnament style={{ transform: 'scaleX(-1)' }} />
        </m.div>
        <m.ul className="hero-facts" {...item(4)}>
          <li>
            <IconCalendar />
            <time dateTime={WEDDING_START}>{fmtDate(WEDDING_START, { year: true })}</time>
          </li>
          <li>
            <IconPin />
            <span>
              {l(venues[main.venueId].name)}, {l(city).split(',')[0]}
            </span>
          </li>
        </m.ul>
        <m.div {...item(5)}>
          <a href="#rsvp" className="btn hero-cta">
            {t.nav.rsvp}
            <IconArrow width={18} height={18} />
          </a>
        </m.div>
      </m.div>

      <m.div className="hero-ground left" {...grow(3, 'bottom')}>
        <Diya className="diya" />
        <Urli className="urli" />
        <FloorPetals className="floor-petals" />
      </m.div>
      <m.div className="hero-ground right" {...grow(3, 'bottom')}>
        <Urli className="urli" />
        <Diya className="diya" />
        <FloorPetals className="floor-petals" />
      </m.div>
    </section>
  )
}
