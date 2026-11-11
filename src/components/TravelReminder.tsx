import { AnimatePresence, m } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useLang } from '../i18n/LanguageContext'
import {
  buildIcs,
  calendarName,
  customTravelDate,
  googleUrl,
  icsPath,
  LAST_REMINDER_DAY,
  travelDate,
  travelItem,
  travelItemAt,
  TRAVEL_LEADS,
  type TravelLead,
} from '../lib/calendar'

export type Platform = 'ios' | 'android' | 'other'
export function detectPlatform(): Platform {
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

export function CalButtons({ ics, google, platform, download }: { ics: string; google: string; platform: Platform; download?: string }) {
  const { t } = useLang()
  const apple = (
    <a key="a" className={`btn cal-btn ${platform === 'ios' ? '' : 'ghost'}`} href={ics} type="text/calendar" download={download}>
      <CalIcon kind="apple" />
      <span>{t.calendar.apple}</span>
    </a>
  )
  const g = (
    <a key="g" className={`btn cal-btn ${platform === 'ios' ? 'ghost' : ''}`} href={google} target="_blank" rel="noopener noreferrer">
      <CalIcon kind="google" />
      <span>{t.calendar.google}</span>
    </a>
  )
  return <div className="cal-buttons">{platform === 'ios' ? [apple, g] : [g, apple]}</div>
}

/**
 * "Remind me to book travel" — shown with the RSVP only to guests who accept.
 * One swipeable row of choices; "Custom" opens a date and time picker (India time).
 */
export function TravelReminder() {
  const { t, lang, fmtDate, fmtTime } = useLang()
  const platform = useMemo(detectPlatform, [])

  const now = Date.now()
  const leads = TRAVEL_LEADS.filter((d) => travelDate(d).getTime() > now)
  // start on "1 month before" while it is still ahead, otherwise the soonest option left
  const [lead, setLead] = useState<TravelLead | 'custom'>(leads.includes(30) ? 30 : (leads[0] ?? 'custom'))
  const today = new Date(now + 330 * 60_000).toISOString().slice(0, 10)
  const [customDay, setCustomDay] = useState(() => (leads[0] ? new Date(travelDate(leads[0]).getTime() + 330 * 60_000).toISOString().slice(0, 10) : today))
  const [customTime, setCustomTime] = useState('10:00')

  // past the first celebration there is nothing left to remind about
  if (today > LAST_REMINDER_DAY) return null

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

  return (
    <div className="cal-card travel-card">
      <h3>{t.calendar.travelTitle}</h3>
      <p className="cal-sub">{t.calendar.travelSub}</p>
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
      <p className="cal-tip">{t.calendar.tip}</p>
    </div>
  )
}
