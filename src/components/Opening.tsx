import { m, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { couple } from '../content/wedding'
import { useLang } from '../i18n/LanguageContext'
import { LanguageSwitch } from './LanguageSwitch'
import { Sprig } from './Ornaments'

/** Soft in-out curve: nothing starts or stops abruptly. */
const SOFT = [0.65, 0, 0.35, 1] as const
const OUT = [0.22, 1, 0.36, 1] as const

/**
 * Timeline after "Open Invitation" (seconds):
 *  0.00  seal and button fade, heading drifts away
 *  0.25  flap folds open (1.0s)
 *  0.95  card rises out of the envelope (0.9s)
 *  1.85  the scene fades to plain ivory (0.6s)
 *  2.25  hand over to the page; the ivory veil dissolves over the hero
 */
const T = { flap: 0.25, card: 0.95, fade: 1.85, done: 2250 }

/** Wait for the display fonts so the names never jump while fading in (capped at 1.2s). */
function useFontsReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let alive = true
    const done = () => alive && setReady(true)
    const timer = window.setTimeout(done, 1200)
    document.fonts?.ready.then(done, done) ?? done()
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [])
  return ready
}

export function Opening({ onOpen }: { onOpen: () => void }) {
  const { t, l } = useLang()
  const reduce = useReducedMotion()
  const fontsReady = useFontsReady()
  const [opening, setOpening] = useState(false)
  const [flapBehind, setFlapBehind] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (fontsReady) btnRef.current?.focus({ preventScroll: true })
  }, [fontsReady])

  const open = () => {
    if (opening) return
    if (reduce) return onOpen()
    setOpening(true)
    window.setTimeout(onOpen, T.done)
  }

  // entrance: each line settles in turn once the fonts are ready
  const enter = (i: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: fontsReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
    transition: { duration: 1.1, ease: OUT, delay: 0.1 + i * 0.14 },
  })

  return (
    <m.div
      className="opening"
      role="dialog"
      aria-modal="true"
      aria-labelledby="opening-names"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: reduce ? 0.2 : 0.9, ease: SOFT } }}
    >
      <m.div
        className="opening-scene"
        animate={opening ? { opacity: 0, scale: 1.03 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: SOFT, delay: opening ? T.fade : 0 }}
      >
        <Sprig className="opening-sprig" style={{ left: -30, top: -20, transform: 'rotate(90deg) scaleX(-1)' }} />
        <Sprig className="opening-sprig" style={{ right: -30, bottom: -30, transform: 'rotate(-90deg) scaleX(-1)' }} />
        <m.div className="opening-lang" {...enter(0)}>
          <LanguageSwitch />
        </m.div>

        <div className="opening-inner">
          <m.div
            className="opening-head"
            animate={opening ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: SOFT }}
          >
            <m.div className="together" {...enter(0)}>
              {t.opening.together}
            </m.div>
            <m.h1 className="names" id="opening-names" {...enter(1)}>
              {l(couple.groom)}
              <span className="amp">&amp;</span>
              {l(couple.bride)}
            </m.h1>
            <m.p className="msg" {...enter(2)}>
              {t.opening.message}
            </m.p>
          </m.div>

          <m.div {...enter(3)}>
            <div className="envelope" onClick={open} aria-hidden="true">
              <div className="env-back" />
              <m.div
                className="env-card"
                style={{ zIndex: 2 }}
                animate={opening ? { y: '-46%' } : { y: 0 }}
                transition={{ duration: 0.9, ease: SOFT, delay: T.card }}
              >
                <div>
                  <small>
                    {l(couple.groom)} &amp; {l(couple.bride)}
                  </small>
                  26 · 01 · 2027
                </div>
              </m.div>
              <div className="env-front" style={{ zIndex: 3 }} />
              <m.div
                className="env-flap"
                style={{ zIndex: flapBehind ? 1 : 4 }}
                animate={opening ? { rotateX: 180 } : { rotateX: 0 }}
                transition={{ duration: 1, ease: SOFT, delay: T.flap }}
                // tuck the flap behind the card the moment it passes upright
                onUpdate={(v) => {
                  if (!flapBehind && Number(v.rotateX) > 90) setFlapBehind(true)
                }}
              />
              <m.div
                className="seal"
                style={{ zIndex: 5 }}
                animate={opening ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: SOFT }}
              >
                N<span>&amp;</span>D
              </m.div>
            </div>
          </m.div>

          <m.div {...enter(4)}>
            {/* a wrapper fades the button, so its own CSS hover transition never fights the animation */}
            <m.div animate={opening ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: SOFT }}>
              <button ref={btnRef} type="button" className="btn gold" onClick={open} disabled={opening}>
                {t.opening.open}
              </button>
            </m.div>
          </m.div>
        </div>
      </m.div>
    </m.div>
  )
}
