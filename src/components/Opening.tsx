import { m, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { city, couple } from '../content/wedding'
import { useLang } from '../i18n/LanguageContext'
import { LanguageSwitch } from './LanguageSwitch'
import { Bougainvillea } from './Scenery'

/** Soft in-out curve: nothing starts or stops abruptly. */
const SOFT = [0.65, 0, 0.35, 1] as const
const OUT = [0.22, 1, 0.36, 1] as const

/**
 * Timeline after "Open Invitation" (seconds) — played like a short film:
 *  0.0  seal, heading and button fade away
 *  0.3  the flap folds open (1.0s)
 *  1.1  the card rises out of the envelope (1.0s)
 *  2.3  the envelope sinks away while the card glides to the centre and grows (1.1s)
 *  3.4  the card holds so it can be read; a soft gold shine sweeps across it (1.0s)
 *  4.4  the card's words fade and the plain card zooms towards the viewer, filling the screen (1.2s)…
 *  4.9  …while the page takes over: the cream veil dissolves into the hero (no double image)
 */
const T = { flap: 0.3, rise: 1.1, risen: 2.1, glide: 2.3, centred: 3.4, zoom: 4.4, end: 5.6, done: 4900 }
const span = T.end - T.rise
const at = (sec: number) => (sec - T.rise) / span

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
  const [cardOnTop, setCardOnTop] = useState(false)
  // where the card travels: measured when the guest taps, so it lands centre-screen on any device
  const [path, setPath] = useState({ rise: 0, dy: 0, scale: 1.5 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const envRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (fontsReady) btnRef.current?.focus({ preventScroll: true })
  }, [fontsReady])

  const open = () => {
    if (opening) return
    if (reduce) return onOpen()
    const env = envRef.current?.getBoundingClientRect()
    const card = cardRef.current
    if (env && card) {
      const w = card.offsetWidth
      const h = card.offsetHeight
      setPath({
        rise: -0.55 * h,
        dy: window.innerHeight / 2 - (env.top + env.height / 2),
        scale: Math.min(1.75, (window.innerWidth * 0.86) / w, (window.innerHeight * 0.5) / h),
      })
    }
    setOpening(true)
    window.setTimeout(() => setCardOnTop(true), T.glide * 1000)
    window.setTimeout(onOpen, T.done)
  }

  // the envelope's own pieces sink and fade once the card is out
  const sink = {
    animate: opening ? { opacity: 0, y: 36 } : { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease: SOFT, delay: opening ? T.glide : 0 },
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
      exit={{ opacity: 0, transition: { duration: reduce ? 0.2 : 1, ease: SOFT } }}
    >
      <div className="opening-scene">
        <Bougainvillea className="opening-bloom left" />
        <Bougainvillea className="opening-bloom right" />
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
            <div className="envelope" ref={envRef} onClick={open} aria-hidden="true">
              <m.div className="env-back" {...sink} />
              <m.div
                ref={cardRef}
                className={`env-card ${opening ? 'is-out' : ''}`}
                style={{ zIndex: cardOnTop ? 6 : 2 }}
                animate={
                  opening
                    ? {
                        y: [0, path.rise, path.rise, path.dy, path.dy, path.dy],
                        scale: [1, 1, 1, path.scale, path.scale, path.scale * 5],
                        opacity: [1, 1, 1, 1, 1, 0],
                      }
                    : { y: 0, scale: 1, opacity: 1 }
                }
                transition={{
                  duration: span,
                  delay: T.rise,
                  times: [0, at(T.risen), at(T.glide), at(T.centred), at(T.zoom), 1],
                  // rise softly, pause, glide, hold, then accelerate into the zoom
                  ease: [SOFT, 'linear', SOFT, 'linear', [0.55, 0, 0.9, 0.4]],
                }}
              >
                <m.div
                  className="card-face"
                  animate={opening ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.4, ease: SOFT, delay: opening ? T.zoom : 0 }}
                >
                  <span className="card-mono">
                    N<i>&amp;</i>D
                  </span>
                  <span className="card-names">
                    {l(couple.groom)} <i>&amp;</i> {l(couple.bride)}
                  </span>
                  <span className="card-rule" />
                  <span className="card-date">26 · 01 · 2027</span>
                  <span className="card-place">{l(city)}</span>
                </m.div>
                <span className="card-shine" />
              </m.div>
              <m.div className="env-front" style={{ zIndex: 3 }} {...sink} />
              <m.div
                className="env-flap"
                style={{ zIndex: flapBehind ? 1 : 4 }}
                animate={opening ? { rotateX: 180, opacity: [1, 1, 0], y: [0, 0, 36] } : { rotateX: 0, opacity: 1, y: 0 }}
                transition={{
                  rotateX: { duration: 1, ease: SOFT, delay: T.flap },
                  opacity: { duration: T.glide + 0.9 - T.flap, times: [0, (T.glide - T.flap) / (T.glide + 0.9 - T.flap), 1], ease: SOFT, delay: T.flap },
                  y: { duration: T.glide + 0.9 - T.flap, times: [0, (T.glide - T.flap) / (T.glide + 0.9 - T.flap), 1], ease: SOFT, delay: T.flap },
                }}
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
      </div>
    </m.div>
  )
}
