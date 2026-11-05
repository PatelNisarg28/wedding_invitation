import { AnimatePresence, m } from 'framer-motion'
import { useMemo, useState } from 'react'
import { events } from '../content/wedding'
import { useLang } from '../i18n/LanguageContext'
import {
  buildIcs,
  calendarName,
  customTravelDate,
  eventItem,
  googleUrl,
  icsPath,
  LAST_REMINDER_DAY,
  travelDate,
  travelItem,
  travelItemAt,
  TRAVEL_LEADS,
  type TravelLead,
} from '../lib/calendar'
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

function CalButtons({ ics, google, platform, download }: { ics: string; google: string; platform: Platform; download?: string }) {
  const { t } = useLang()
  const apple = (
    <a key="a" className={`btn cal-btn ${platform === 'ios' ? '' : 'ghost'}`} href={ics} type="text/calendar" download={download}>
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
  // start on "1 month before" while it is still ahead, otherwise the soonest option left
  const [lead, setLead] = useState<TravelLead | 'custom'>(leads.includes(30) ? 30 : (leads[0] ?? 'custom'))
  const today = new Date(now + 330 * 60_000).toISOString().slice(0, 10)
  const [customDay, setCustomDay] = useState(() => (leads[0] ? new Date(travelDate(leads[0]).getTime() + 330 * 60_000).toISOString().slice(0, 10) : today))
  const [customTime, setCustomTime] = useState('10:00')
  const showTravel = today <= LAST_REMINDER_DAY

  // the reminder the buttons below will add
  const remindAt = lead === 'custom' ? customTravelDate(customDay, customTime) : travelDate(lead)
  const remindValid = !!remindAt && remindAt.getTime() > now
  const travelIcs =
    lead === 'custom'
      ? remindValid
        ? `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs([travelItemAt(remindAt!, lang)], calendarName(lang)))}`
        : ''
      : `${BASE}${icsPath(`travel-${lead}d`, lang)}`
  const travelGoogle = lead === 'custom' ? (remindValid ? googleUrl(travelItemAt(remindAt!, lang)) : '') : googleUrl(travelItem(lead, lang))

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

          {showTravel && (
            <Reveal className="cal-card" delay={0.1}>
              <h3>{t.calendar.travelTitle}</h3>
              <p className="cal-sub">{t.calendar.travelSub}</p>
              {/* one swipeable row of choices; "Custom" opens a date and time picker */}
              <div className="lead-chips" role="radiogroup" aria-label={t.calendar.travelTitle}>
                {leads.map((d) => (
                  <button key={d} type="button" role="radio" aria-checked={lead === d} onClick={() => setLead(d)}>
                    {t.calendar.lead[d]}
                  </button>
                ))}
                <button type="button" role="radio" aria-checked={lead === 'custom'} onClick={() => setLead('custom')}>
                  {t.calendar.custom}
                </button>
              </div>
              <AnimatePresence initial={false}>
                {lead === 'custom' && (
                  <m.div
                    className="custom-when"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="custom-fields">
                      <label>
                        <span>{t.calendar.customDate}</span>
                        <input className="input" type="date" value={customDay} min={today} max={LAST_REMINDER_DAY} onChange={(e) => setCustomDay(e.target.value)} />
                      </label>
                      <label>
                        <span>{t.calendar.customTime}</span>
                        <input className="input" type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)} />
                      </label>
                    </div>
                    <p className="custom-hint">{t.calendar.customHint}</p>
                  </m.div>
                )}
              </AnimatePresence>
              {remindValid && (
                <>
                  <p className="remind-on" aria-live="polite">
                    {t.calendar.remindOn(fmtDate(remindAt!.toISOString(), { year: true }), fmtTime(remindAt!.toISOString()))}
                  </p>
                  <CalButtons ics={travelIcs} google={travelGoogle} platform={platform} download={lead === 'custom' ? 'travel-reminder.ics' : undefined} />
                </>
              )}
            </Reveal>
          )}
        </div>
        <p className="cal-tip">{t.calendar.tip}</p>
      </div>
    </section>
  )
}
