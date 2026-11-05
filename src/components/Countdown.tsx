import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useState } from 'react'
import { city, events, venues, WEDDING_START } from '../content/wedding'
import { useLang } from '../i18n/LanguageContext'
import { Divider, IconPin } from './Ornaments'
import { SectionHead } from './Reveal'
import { PalaceSkyline } from './Scenery'

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01" strokeWidth="2.2" />
    </svg>
  )
}

const TARGET = new Date(WEDDING_START).getTime()

export function diffParts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 }
}

function Cell({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, '0')
  return (
    <div className="cd-cell">
      <div className="cd-num" aria-hidden="true">
        <AnimatePresence initial={false}>
          <m.span
            key={v}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {v}
          </m.span>
        </AnimatePresence>
      </div>
      <div className="cd-label">{label}</div>
    </div>
  )
}

export function Countdown() {
  const { t, l, fmtDate, fmtTime } = useLang()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let id = 0
    const tick = () => {
      setNow(Date.now())
      // align to the next whole second so all tiles change together
      id = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5)
    }
    id = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5)
    const onVis = () => document.visibilityState === 'visible' && setNow(Date.now())
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const remaining = TARGET - now
  const done = remaining <= 0
  const p = diffParts(remaining)
  const main = events.find((e) => e.highlight)!

  return (
    <section className="section countdown-band" aria-labelledby="cd-title">
      <div className="container">
        <SectionHead id="cd-title" eyebrow={t.countdown.eyebrow} title={t.countdown.title} />
        {done ? (
          <p className="cd-done" role="status">
            {t.countdown.done}
          </p>
        ) : (
          <>
            <div
              className="countdown"
              role="timer"
              aria-label={`${p.days} ${t.countdown.days}, ${p.hours} ${t.countdown.hours}, ${p.minutes} ${t.countdown.minutes}`}
            >
              <Cell value={p.days} label={t.countdown.days} />
              <Cell value={p.hours} label={t.countdown.hours} />
              <Cell value={p.minutes} label={t.countdown.minutes} />
              <Cell value={p.seconds} label={t.countdown.seconds} />
            </div>
            <div className="cd-details">
              <Divider className="cd-divider" />
              <p className="cd-line">
                <IconCalendar />
                <span>{l(main.name)}</span>
                <i className="sep" aria-hidden="true" />
                <span className="when">
                  {fmtDate(main.start, { year: true })}
                  <i className="sep" aria-hidden="true" />
                  {fmtTime(main.start)}
                </span>
              </p>
              <p className="cd-line">
                <IconPin />
                <span>
                  {l(venues[main.venueId].name)}, {l(city).split(',')[0]}
                </span>
              </p>
            </div>
          </>
        )}
      </div>
      <PalaceSkyline className="cd-palace" />
    </section>
  )
}
