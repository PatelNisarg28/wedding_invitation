import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useState } from 'react'
import { events, venues, WEDDING_START } from '../content/wedding'
import { useLang } from '../i18n/LanguageContext'
import { SectionHead } from './Reveal'

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
            <p className="cd-target">
              {l(main.name)} · {fmtDate(main.start, { year: true })} · {fmtTime(main.start)} · {l(venues[main.venueId].name)}
            </p>
          </>
        )}
      </div>
    </section>
  )
}
