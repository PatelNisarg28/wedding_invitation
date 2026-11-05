import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { matchFriend } from '../lib/friends'
import { IconAlert, IconHeart, IconLeaf } from './Ornaments'
import { SectionHead } from './Reveal'
import { LeafShadow } from './Scenery'

type Attending = 'yes' | 'no'
interface Saved {
  name: string
  attending: Attending
  guests: number
  needsStay?: boolean
}
type ErrKey = 'nameRequired' | 'nameShort' | 'attendingRequired' | 'guestsRange' | 'messageLong' | 'reasonRequired'
type FormErrKey = 'network' | 'server' | 'rate'

const MAX_GUESTS = 10
const IS_PREVIEW = import.meta.env.VITE_PREVIEW === '1'
const SAVED_KEY = 'nwd-rsvp'
const DEVICE_KEY = 'nwd-device'
const EASE = [0.22, 1, 0.36, 1] as const

function storage(): Storage | null {
  try {
    const s = window.localStorage
    s.setItem('__t', '1')
    s.removeItem('__t')
    return s
  } catch {
    return null
  }
}

function deviceId(): string {
  const s = storage()
  const existing = s?.getItem(DEVICE_KEY)
  if (existing) return existing
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  s?.setItem(DEVICE_KEY, id)
  return id
}

function loadSaved(): Saved | null {
  try {
    const raw = storage()?.getItem(SAVED_KEY)
    return raw ? (JSON.parse(raw) as Saved) : null
  } catch {
    return null
  }
}

export function Rsvp() {
  const { t, lang } = useLang()
  const [saved, setSaved] = useState<Saved | null>(loadSaved)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(saved?.name ?? '')
  const [attending, setAttending] = useState<Attending | null>(saved?.attending ?? null)
  const [guests, setGuests] = useState(saved?.guests && saved.guests > 0 ? saved.guests : 1)
  const [needsStay, setNeedsStay] = useState(saved?.needsStay ?? false)
  const [message, setMessage] = useState('')
  const [hp, setHp] = useState('')
  const [reasonOk, setReasonOk] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<'name' | 'attending' | 'guests' | 'message' | 'reason', ErrKey>>>({})
  const [formError, setFormError] = useState<FormErrKey | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inFlight = useRef(false)
  const deviceRef = useRef<string>('')
  const successRef = useRef<HTMLHeadingElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const attendRef = useRef<HTMLInputElement>(null)
  const reasonRef = useRef<HTMLInputElement>(null)

  // a close friend Nisarg has asked to be there (fuzzy match on the typed name)
  const friend = useMemo(() => matchFriend(name), [name])
  const needsReason = !!friend && attending === 'no'
  const quick = [...t.rsvp.quick.common.slice(0, 1), attending === 'no' ? t.rsvp.quick.no : t.rsvp.quick.yes, ...t.rsvp.quick.common.slice(1)]

  /** Change the answer; a picked "see you there" note follows it (decline swaps it for the "from afar" one). */
  const answer = (next: Attending) => {
    const { yes, no } = t.rsvp.quick
    setAttending(next)
    setMessage((cur) => (next === 'no' && cur === yes ? no : next === 'yes' && cur === no ? yes : cur))
    if (next === 'yes') setReasonOk(false)
    setErrors((x) => ({ ...x, attending: undefined, reason: undefined, ...(next === 'no' ? { guests: undefined } : {}) }))
  }

  useEffect(() => {
    deviceRef.current = deviceId()
  }, [])

  const showSuccess = saved && !editing

  const justSubmitted = useRef(false)
  useEffect(() => {
    if (showSuccess && justSubmitted.current) {
      justSubmitted.current = false
      // wait for the form → confirmation cross-fade, then bring the message into view
      window.setTimeout(() => {
        successRef.current?.focus({ preventScroll: true })
        document.querySelector('#rsvp .rsvp-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 450)
    }
  }, [showSuccess])

  const validate = () => {
    const e: typeof errors = {}
    const n = name.trim()
    if (!n) e.name = 'nameRequired'
    else if (n.length < 2) e.name = 'nameShort'
    if (!attending) e.attending = 'attendingRequired'
    if (attending === 'yes' && (guests < 1 || guests > MAX_GUESTS)) e.guests = 'guestsRange'
    if (message.length > 500) e.message = 'messageLong'
    if (needsReason && !reasonOk) e.reason = 'reasonRequired'
    return e
  }

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (inFlight.current) return // prevents double-taps
    setFormError(null)
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      if (e.name) nameRef.current?.focus()
      else if (e.attending) attendRef.current?.focus()
      else if (e.reason) reasonRef.current?.focus()
      return
    }
    inFlight.current = true
    setSubmitting(true)
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), 15000)
    try {
      if (IS_PREVIEW) {
        // Hosted design preview has no backend: show the flow, but say clearly that nothing was saved.
        await new Promise((r) => window.setTimeout(r, 700))
        const s: Saved = { name: name.trim(), attending: attending!, guests: attending === 'yes' ? guests : 0, needsStay: attending === 'yes' && needsStay }
        justSubmitted.current = true
        setSaved(s)
        setEditing(false)
        return
      }
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: deviceRef.current || deviceId(),
          name: name.trim(),
          attending,
          guests: attending === 'yes' ? guests : 0,
          needsStay: attending === 'yes' && needsStay,
          message: message.trim(),
          lang,
          website: hp,
        }),
        signal: ctrl.signal,
      })
      if (res.status === 429) throw new Error('rate')
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null
      if (!res.ok || !data?.ok) throw new Error(res.status >= 500 ? 'server' : 'server')
      const s: Saved = { name: name.trim(), attending: attending!, guests: attending === 'yes' ? guests : 0, needsStay: attending === 'yes' && needsStay }
      try {
        if (!IS_PREVIEW) storage()?.setItem(SAVED_KEY, JSON.stringify(s))
      } catch {
        /* ignore */
      }
      justSubmitted.current = true
      setSaved(s)
      setEditing(false)
      setMessage('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setFormError(msg === 'rate' ? 'rate' : msg === 'server' ? 'server' : 'network')
    } finally {
      window.clearTimeout(timer)
      inFlight.current = false
      setSubmitting(false)
    }
  }

  const firstName = (saved?.name ?? '').split(/\s+/)[0]

  return (
    <section className="section rsvp-bg" id="rsvp" aria-labelledby="rsvp-title">
      <LeafShadow className="right" />
      <div className="narrow" style={{ maxWidth: 560 }}>
        <SectionHead id="rsvp-title" eyebrow={t.rsvp.eyebrow} title={t.rsvp.title} />
        <div className="rsvp-card">
          <AnimatePresence mode="wait" initial={false}>
            {showSuccess ? (
              <m.div
                key="done"
                className="rsvp-success"
                role="status"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <svg className="mark" viewBox="0 0 84 84" fill="none" aria-hidden="true">
                  <m.circle cx="42" cy="42" r="38" stroke="currentColor" strokeWidth="1.2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: EASE }} />
                  <m.path
                    d={saved.attending === 'yes' ? 'M27 43 L37 53 L58 31' : 'M42 58 C42 58 26 48 26 37 A8 8 0 0 1 42 33 A8 8 0 0 1 58 37 C58 48 42 58 42 58Z'}
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
                  />
                </svg>
                <h3 ref={successRef} tabIndex={-1}>
                  {saved.attending === 'yes' ? t.rsvp.successAcceptTitle(firstName) : t.rsvp.successDeclineTitle(firstName)}
                </h3>
                <p>{saved.attending === 'yes' ? t.rsvp.successAccept : t.rsvp.successDecline}</p>
                {saved.attending === 'yes' && (
                  <div className="summary">
                    {t.rsvp.guestsCount(saved.guests)}
                    {saved.needsStay && ` · ${t.rsvp.staySummary}`}
                  </div>
                )}
                {IS_PREVIEW && <p className="preview-note">Design preview · this response was not saved</p>}
                <div>
                  <button type="button" className="btn ghost small" onClick={() => setEditing(true)}>
                    {t.rsvp.change}
                  </button>
                </div>
              </m.div>
            ) : (
              <m.form
                key="form"
                noValidate
                onSubmit={submit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                aria-busy={submitting}
              >
                <div className="field">
                  <label className="field-label" htmlFor="rsvp-name">
                    {t.rsvp.name}
                  </label>
                  <input
                    ref={nameRef}
                    id="rsvp-name"
                    className="input"
                    name="name"
                    autoComplete="name"
                    autoCapitalize="words"
                    enterKeyHint="next"
                    maxLength={80}
                    placeholder={t.rsvp.namePlaceholder}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name) setErrors((x) => ({ ...x, name: undefined }))
                    }}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'err-name' : undefined}
                    required
                  />
                  {errors.name && (
                    <p className="error" id="err-name">
                      <IconAlert /> {t.rsvp.errors[errors.name]}
                    </p>
                  )}
                </div>

                <div className="field">
                  <fieldset className="choices" aria-invalid={!!errors.attending} aria-describedby={errors.attending ? 'err-att' : undefined}>
                    <legend className="field-label" style={{ gridColumn: '1 / -1', padding: 0 }}>
                      {t.rsvp.attending}
                    </legend>
                    <div className="choice">
                      <input
                        ref={attendRef}
                        type="radio"
                        id="att-yes"
                        name="attending"
                        value="yes"
                        checked={attending === 'yes'}
                        onChange={() => answer('yes')}
                      />
                      <label htmlFor="att-yes">
                        <IconHeart />
                        {t.rsvp.accept}
                      </label>
                    </div>
                    <div className="choice">
                      <input
                        type="radio"
                        id="att-no"
                        name="attending"
                        value="no"
                        checked={attending === 'no'}
                        onChange={() => answer('no')}
                      />
                      <label htmlFor="att-no">
                        <IconLeaf />
                        {t.rsvp.decline}
                      </label>
                    </div>
                  </fieldset>
                  {errors.attending && (
                    <p className="error" id="err-att">
                      <IconAlert /> {t.rsvp.errors[errors.attending]}
                    </p>
                  )}
                </div>

                {/*
                  One note per answer. Everyone gets the couple's note; a must-come friend who
                  declines gets a gentle note from Nisarg asking them to reconsider instead.
                */}
                <AnimatePresence mode="wait" initial={false}>
                  {attending && (
                    <m.div
                      key={needsReason ? 'reconsider' : `note-${attending}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      style={{ overflow: 'hidden' }}
                    >
                      {needsReason ? (
                        <div className="friend-note couple-note reconsider" role="note" aria-live="polite">
                          <div className="friend-seal" aria-hidden="true">
                            N
                          </div>
                          <div className="friend-from">{t.rsvp.friend.from}</div>
                          {t.rsvp.friend.body.map((para) => (
                            <p key={para} className="friend-body">
                              {para}
                            </p>
                          ))}
                          <div className="note-sign">
                            <span>{t.rsvp.note.withLove}</span>
                            {t.rsvp.friend.sign}
                          </div>
                          <button type="button" className="btn small friend-come" onClick={() => answer('yes')}>
                            <IconHeart width={18} height={18} />
                            {t.rsvp.friend.comeInstead}
                          </button>
                          <label className="friend-confirm">
                            <input
                              ref={reasonRef}
                              type="checkbox"
                              checked={reasonOk}
                              onChange={(e) => {
                                setReasonOk(e.target.checked)
                                setErrors((x) => ({ ...x, reason: undefined }))
                              }}
                              aria-invalid={!!errors.reason}
                            />
                            <span>{t.rsvp.friend.confirm}</span>
                          </label>
                          {errors.reason && (
                            <p className="error">
                              <IconAlert /> {t.rsvp.errors[errors.reason]}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="friend-note couple-note" role="note">
                          <div className={`friend-seal ${attending === 'no' ? 'pair' : ''}`} aria-hidden="true">
                            {attending === 'yes' ? (
                              'N'
                            ) : (
                              <>
                                N<span>&amp;</span>D
                              </>
                            )}
                          </div>
                          <div className="friend-from">{attending === 'yes' ? t.rsvp.note.acceptFrom : t.rsvp.note.declineFrom}</div>
                          {(attending === 'yes' ? t.rsvp.note.acceptBody : t.rsvp.note.declineBody).map((para) => (
                            <p key={para} className="friend-body">
                              {para}
                            </p>
                          ))}
                          <div className="note-sign">
                            <span>{t.rsvp.note.withLove}</span>
                            {t.rsvp.note.names}
                          </div>
                        </div>
                      )}
                    </m.div>
                  )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                  {attending === 'yes' && (
                    <m.div
                      key="guests"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="field" style={{ marginTop: 26 }}>
                        <span className="field-label" id="guests-label">
                          {t.rsvp.guests}
                        </span>
                        <p className="field-help" id="guests-help">
                          {t.rsvp.guestsHelp}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                          <div className="stepper" role="group" aria-labelledby="guests-label" aria-describedby="guests-help">
                            <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} aria-label={t.rsvp.fewer}>
                              −
                            </button>
                            <output aria-live="polite">{guests}</output>
                            <button type="button" onClick={() => setGuests((g) => Math.min(MAX_GUESTS, g + 1))} disabled={guests >= MAX_GUESTS} aria-label={t.rsvp.more}>
                              +
                            </button>
                          </div>
                        </div>
                        {errors.guests && (
                          <p className="error">
                            <IconAlert /> {t.rsvp.errors[errors.guests]}
                          </p>
                        )}
                      </div>
                      <div className="field" style={{ marginTop: 26 }}>
                        <span className="field-label">{t.rsvp.stayTitle}</span>
                        <label className="stay-check">
                          <input type="checkbox" checked={needsStay} onChange={(e) => setNeedsStay(e.target.checked)} />
                          <span>
                            <b>{t.rsvp.stay}</b>
                            <small>{t.rsvp.stayHelp}</small>
                          </span>
                        </label>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>

                <div className="field" style={{ marginTop: 26 }}>
                  <label className="field-label" htmlFor="rsvp-msg">
                    {t.rsvp.message}
                    <span className="opt">({t.rsvp.optional})</span>
                  </label>
                  <p className="field-help">{t.rsvp.messageHelp}</p>
                  <div className="quick-notes" role="group" aria-label={t.rsvp.quickTitle}>
                    <span className="quick-title">{t.rsvp.quickTitle}</span>
                    <div className="quick-row">
                      {quick.map((q) => (
                        <button key={q} type="button" className="quick-note" aria-pressed={message === q} onClick={() => setMessage(q)}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    id="rsvp-msg"
                    className="textarea"
                    name="message"
                    maxLength={500}
                    rows={3}
                    placeholder={t.rsvp.messagePlaceholder}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && (
                    <p className="error">
                      <IconAlert /> {t.rsvp.errors[errors.message]}
                    </p>
                  )}
                </div>

                {/* Honeypot: invisible to people, tempting to bots */}
                <div className="hp" aria-hidden="true">
                  <label htmlFor="rsvp-website">Website</label>
                  <input id="rsvp-website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
                </div>

                {formError && (
                  <p className="form-error" role="alert">
                    {t.rsvp.errors[formError]}
                  </p>
                )}

                <button type="submit" className="btn gold rsvp-submit" disabled={submitting}>
                  {submitting && <span className="spinner" aria-hidden="true" />}
                  {submitting ? t.rsvp.submitting : t.rsvp.submit}
                </button>
              </m.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
