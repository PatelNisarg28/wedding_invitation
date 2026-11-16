import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { buildIcs, calendarName, customTravelDate, googleUrl, LAST_REMINDER_DAY, rsvpReminderDate, rsvpReminderItem } from '../lib/calendar'
import { IconClose, IconHeart } from './Ornaments'
import { CalButtons, detectPlatform } from './TravelReminder'

const SAVED_KEY = 'nwd-rsvp'
const EASE = [0.22, 1, 0.36, 1] as const
const REMIND_IN = [1, 3, 7] as const
type Choice = (typeof REMIND_IN)[number] | 'custom'
const istDay = (ms: number) => new Date(ms + 330 * 60_000).toISOString().slice(0, 10)
/** desktop "about to leave" only counts after the guest has had a look around */
const EXIT_INTENT_AFTER_MS = 20_000

function hasReplied() {
  try {
    return !!window.localStorage.getItem(SAVED_KEY)
  } catch {
    return false
  }
}

/**
 * A gentle "before you go" card for guests who haven't sent their RSVP.
 *
 * - Back button (phones, laptops, Alt+←): every time, until the guest has replied. We keep one
 *   "guard" history entry on top of the page; pressing back lands on the entry underneath and,
 *   instead of leaving, we show the card. Closing the card puts the guard back.
 *   The guard is always added inside a tap, click or key press: Chrome skips history entries
 *   that a page adds without one, which would let back leave without asking.
 * - Laptops: the pointer leaving through the top of the window (towards the tabs / close),
 *   once per visit, after 20 seconds on the page.
 *
 * Never shown once an RSVP has been sent from this device.
 */
export function ExitPrompt({ armed }: { armed: boolean }) {
  const { t, lang, fmtDate, fmtTime } = useLang()
  const p = t.exitPrompt
  const [open, setOpen] = useState(false)
  const [remind, setRemind] = useState(false)
  const [choice, setChoice] = useState<Choice>(1)
  const [customDay, setCustomDay] = useState(() => istDay(Date.now() + 86_400_000))
  const [customTime, setCustomTime] = useState('10:00')
  const replied = useRef(false)
  const armedRef = useRef(armed)
  const guardOn = useRef(false)
  const intentShown = useRef(false)
  const viaBack = useRef(false)
  const openRef = useRef(false)
  const yesRef = useRef<HTMLButtonElement>(null)
  const platform = useMemo(detectPlatform, [])

  const hasAnswered = () => replied.current || hasReplied()

  /** put a guard entry on top of the page (call only from a tap, click or key handler) */
  const addGuard = () => {
    if (guardOn.current || hasAnswered()) return
    history.replaceState({ ...(history.state ?? {}), nwd: 'base' }, '')
    history.pushState({ nwd: 'guard' }, '')
    guardOn.current = true
  }

  useEffect(() => {
    armedRef.current = armed
  }, [armed])
  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    const onSent = () => (replied.current = true)
    window.addEventListener('nwd:rsvp-sent', onSent)
    // the first tap (usually "Open Invitation") and every tap after the card closes set the guard
    // (not while the card is open: its own buttons decide whether to stay or leave)
    const onGesture = () => !openRef.current && addGuard()
    window.addEventListener('click', onGesture, true)
    window.addEventListener('keydown', onGesture, true)

    const onPop = (e: PopStateEvent) => {
      if ((e.state as { nwd?: string } | null)?.nwd !== 'base') return
      guardOn.current = false
      // still on the envelope, or already replied: the guest meant to leave, so carry on
      if (!armedRef.current || hasAnswered()) return history.back()
      viaBack.current = true
      setRemind(false)
      setOpen(true)
    }
    window.addEventListener('popstate', onPop)

    return () => {
      window.removeEventListener('nwd:rsvp-sent', onSent)
      window.removeEventListener('click', onGesture, true)
      window.removeEventListener('keydown', onGesture, true)
      window.removeEventListener('popstate', onPop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // laptops: the pointer heads for the tab bar
  useEffect(() => {
    if (!armed) return
    const since = Date.now()
    const onLeave = (e: MouseEvent) => {
      if (e.clientY > 0 || e.relatedTarget || intentShown.current || hasAnswered() || Date.now() - since < EXIT_INTENT_AFTER_MS) return
      intentShown.current = true
      viaBack.current = false
      setRemind(false)
      setOpen(true)
    }
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => document.documentElement.removeEventListener('mouseleave', onLeave)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed])

  /** close the card and stay: the guard goes back so the next back press asks again */
  const dismiss = () => {
    setOpen(false)
    addGuard()
  }

  useEffect(() => {
    if (!open) return
    document.body.classList.add('locked')
    yesRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismiss()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('locked')
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const goRsvp = () => {
    dismiss()
    window.setTimeout(() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' }), 250)
  }
  const leave = () => {
    setOpen(false)
    // from the back button we are already one step back; one more step leaves the invitation
    if (viaBack.current) history.back()
  }

  const today = istDay(Date.now())
  const at = choice === 'custom' ? customTravelDate(customDay, customTime) : rsvpReminderDate(choice)
  const valid = !!at && at.getTime() > Date.now()
  const item = valid ? rsvpReminderItem(at!, lang) : null
  const ics = item ? `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs([item], calendarName(lang)))}` : ''

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="exit-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.target === e.currentTarget && dismiss()}
        >
          <m.div
            className="exit-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <button type="button" className="exit-close" onClick={dismiss} aria-label={p.close}>
              <IconClose width={20} height={20} />
            </button>
            <div className="friend-seal pair" aria-hidden="true">
              N<span>&amp;</span>D
            </div>
            <h2 id="exit-title" className="exit-title">
              {p.title}
            </h2>
            <p className="exit-body">{p.body}</p>

            <div className="exit-actions">
              <button ref={yesRef} type="button" className="btn gold" onClick={goRsvp}>
                <IconHeart width={18} height={18} />
                {p.yes}
              </button>
              <button type="button" className="btn ghost" aria-expanded={remind} onClick={() => setRemind((v) => !v)}>
                {p.later}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {remind && (
                <m.div
                  className="exit-remind"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="exit-remind-title">{p.remindTitle}</p>
                  <div className="lead-chips exit-chips" role="radiogroup" aria-label={p.remindTitle}>
                    {REMIND_IN.map((d) => (
                      <button key={d} type="button" role="radio" aria-checked={choice === d} onClick={() => setChoice(d)}>
                        {p.when[d]}
                      </button>
                    ))}
                    <button type="button" role="radio" aria-checked={choice === 'custom'} onClick={() => setChoice('custom')}>
                      {p.custom}
                    </button>
                  </div>
                  <AnimatePresence initial={false}>
                    {choice === 'custom' && (
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
                      </m.div>
                    )}
                  </AnimatePresence>
                  {item ? (
                    <>
                      <p className="remind-on">{p.remindOn(fmtDate(at!.toISOString(), { year: false }), fmtTime(at!.toISOString()))}</p>
                      <CalButtons ics={ics} google={googleUrl(item)} platform={platform} download="rsvp-reminder.ics" />
                    </>
                  ) : (
                    <p className="remind-on">{p.pickFuture}</p>
                  )}
                </m.div>
              )}
            </AnimatePresence>

            <button type="button" className="exit-leave" onClick={leave}>
              {p.no}
            </button>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
