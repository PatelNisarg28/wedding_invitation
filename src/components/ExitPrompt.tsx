import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { buildIcs, calendarName, googleUrl, rsvpReminderDate, rsvpReminderItem } from '../lib/calendar'
import { IconClose, IconHeart } from './Ornaments'
import { CalButtons, detectPlatform } from './TravelReminder'

const SAVED_KEY = 'nwd-rsvp'
const EASE = [0.22, 1, 0.36, 1] as const
const REMIND_IN = [1, 3, 7] as const
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
 * - Phones: the back button. Once the invitation is open we add one history entry on top of
 *   the page; pressing back lands on the entry underneath, and instead of leaving we show the card.
 * - Computers: the pointer leaving through the top of the window (towards the tabs / close).
 *
 * Shown at most once per visit and never after an RSVP has been sent from this device.
 */
export function ExitPrompt({ armed }: { armed: boolean }) {
  const { t, lang, fmtDate, fmtTime } = useLang()
  const p = t.exitPrompt
  const [open, setOpen] = useState(false)
  const [remind, setRemind] = useState(false)
  const [days, setDays] = useState<(typeof REMIND_IN)[number]>(1)
  const shown = useRef(false)
  const replied = useRef(false)
  const viaBack = useRef(false)
  const yesRef = useRef<HTMLButtonElement>(null)
  const platform = useMemo(detectPlatform, [])

  useEffect(() => {
    const onSent = () => (replied.current = true)
    window.addEventListener('nwd:rsvp-sent', onSent)
    return () => window.removeEventListener('nwd:rsvp-sent', onSent)
  }, [])

  useEffect(() => {
    if (!armed) return
    const eligible = () => !shown.current && !replied.current && !hasReplied()
    const show = (back: boolean) => {
      shown.current = true
      viaBack.current = back
      setRemind(false)
      setOpen(true)
    }

    // phones and the browser back button: a guard entry on top of the page
    history.replaceState({ ...(history.state ?? {}), nwd: 'base' }, '')
    history.pushState({ nwd: 'guard' }, '')
    const onPop = (e: PopStateEvent) => {
      if ((e.state as { nwd?: string } | null)?.nwd !== 'base') return
      if (eligible()) show(true)
      // already replied (or already asked): the guest meant to leave, so carry on with no extra press
      else if (replied.current || hasReplied()) history.back()
    }
    window.addEventListener('popstate', onPop)

    // computers: the pointer heads for the tab bar
    const since = Date.now()
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget && Date.now() - since > EXIT_INTENT_AFTER_MS && eligible()) show(false)
    }
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('popstate', onPop)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [armed])

  useEffect(() => {
    if (!open) return
    document.body.classList.add('locked')
    yesRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('locked')
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const goRsvp = () => {
    setOpen(false)
    window.setTimeout(() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' }), 250)
  }
  const leave = () => {
    setOpen(false)
    // from the back button we are already one step back; one more step leaves the invitation
    if (viaBack.current) history.back()
  }

  const at = rsvpReminderDate(days)
  const item = rsvpReminderItem(at, lang)
  const ics = `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs([item], calendarName(lang)))}`

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="exit-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
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
            <button type="button" className="exit-close" onClick={() => setOpen(false)} aria-label={p.close}>
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
                      <button key={d} type="button" role="radio" aria-checked={days === d} onClick={() => setDays(d)}>
                        {p.when[d]}
                      </button>
                    ))}
                  </div>
                  <p className="remind-on">{p.remindOn(fmtDate(at.toISOString(), { year: false }), fmtTime(at.toISOString()))}</p>
                  <CalButtons ics={ics} google={googleUrl(item)} platform={platform} download="rsvp-reminder.ics" />
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
