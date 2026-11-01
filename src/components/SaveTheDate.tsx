import { AnimatePresence, m } from 'framer-motion'
import { useMemo, useState } from 'react'
import { events } from '../content/wedding'
import { useLang } from '../i18n/LanguageContext'
import { eventItem, googleUrl, icsPath, travelDate, travelItem, TRAVEL_LEADS, type TravelLead } from '../lib/calendar'
import { IconChevron } from './Ornaments'
import { Reveal, SectionHead } from './Reveal'

type Platform = 'ios' | 'android' | 'other'
function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

const BASE = import.meta.env.BASE_URL

function CalIcon({ kind }: { kind: 'apple' | 'google' }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      {kind === 'apple' ? <path d="M9 14.5l2 2 4-4" /> : <path d="M12 12.5v4M10 14.5h4" />}
    </svg>
  )
}

function CalButtons({ ics, google, platform }: { ics: string; google: string; platform: Platform }) {
  const { t } = useLang()
  const apple = (
    <a key="a" className={`btn cal-btn ${platform === 'ios' ? '' : 'ghost'}`} href={ics} type="text/calendar">
      <CalIcon kind="apple" />
      <span>
        {t.calendar.apple}
        {platform === 'ios' && <small>{t.calendar.iosHint}</small>}
      </span>
    </a>
  )
  const g = (
    <a key="g" className={`btn cal-btn ${platform === 'ios' ? 'ghost' : ''}`} href={google} target="_blank" rel="noopener noreferrer">
      <CalIcon kind="google" />
      <span>
        {t.calendar.google}
        {platform === 'android' && <small>{t.calendar.androidHint}</small>}
      </span>
    </a>
  )
  return <div className="cal-buttons">{platform === 'ios' ? [apple, g] : [g, apple]}</div>
}

export function SaveTheDate() {
  const { t, lang, l, fmtDate, fmtTime } = useLang()
  const platform = useMemo(detectPlatform, [])
  const [showEach, setShowEach] = useState(false)

  const now = Date.now()
  const leads = TRAVEL_LEADS.filter((d) => travelDate(d).getTime() > now)
  const [lead, setLead] = useState<TravelLead | undefined>(leads[0])

  const main = events.find((e) => e.highlight)!

  return (
    <section className="section" id="save-the-date" aria-labelledby="std-title">
      <div className="container">
        <SectionHead id="std-title" eyebrow={t.calendar.eyebrow} title={t.calendar.title} lede={t.calendar.intro} />
        <div className="cal-grid">
          <Reveal className="cal-card">
            <h3>{t.calendar.addTitle}</h3>
            <p className="cal-sub">{t.calendar.addSub}</p>
            <CalButtons ics={`${BASE}${icsPath('wedding', lang)}`} google={googleUrl(eventItem(main, lang))} platform={platform} />
            <button type="button" className="cal-more" aria-expanded={showEach} onClick={() => setShowEach((v) => !v)}>
              {t.calendar.eachGoogle}
              <IconChevron width={16} height={16} style={{ transform: `rotate(${showEach ? 90 : 0}deg)`, transition: 'transform .3s' }} />
            </button>
            <AnimatePresence initial={false}>
              {showEach && (
                <m.ul
                  className="cal-each"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {events.map((ev) => (
                    <li key={ev.id}>
                      <span>
                        <b>{l(ev.name)}</b>
                        <small>
                          {fmtDate(ev.start, { weekday: false })} · {fmtTime(ev.start)}
                        </small>
                      </span>
                      <a href={googleUrl(eventItem(ev, lang))} target="_blank" rel="noopener noreferrer">
                        + {t.calendar.addOne}
                      </a>
                    </li>
                  ))}
                </m.ul>
              )}
            </AnimatePresence>
          </Reveal>

          {lead && (
            <Reveal className="cal-card" delay={0.1}>
              <h3>{t.calendar.travelTitle}</h3>
              <p className="cal-sub">{t.calendar.travelSub}</p>
              <div className="lead-chips" role="radiogroup" aria-label={t.calendar.travelTitle}>
                {leads.map((d) => (
                  <button key={d} type="button" role="radio" aria-checked={lead === d} onClick={() => setLead(d)}>
                    {t.calendar.lead[d]}
                  </button>
                ))}
              </div>
              <p className="remind-on" aria-live="polite">
                {t.calendar.remindOn(fmtDate(travelDate(lead).toISOString(), { year: true }))}
              </p>
              <CalButtons ics={`${BASE}${icsPath(`travel-${lead}d`, lang)}`} google={googleUrl(travelItem(lead, lang))} platform={platform} />
            </Reveal>
          )}
        </div>
        <p className="cal-tip">{t.calendar.tip}</p>
      </div>
    </section>
  )
}
