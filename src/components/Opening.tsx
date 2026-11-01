import { m, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { couple } from '../content/wedding'
import { useLang } from '../i18n/LanguageContext'
import { LanguageSwitch } from './LanguageSwitch'
import { Sprig } from './Ornaments'

const EASE = [0.22, 1, 0.36, 1] as const

/** Cinematic but quick envelope opening (~1.3s). */
export function Opening({ onOpen }: { onOpen: () => void }) {
  const { t, l } = useLang()
  const reduce = useReducedMotion()
  const [stage, setStage] = useState<'idle' | 'opening'>('idle')
  const [flapBehind, setFlapBehind] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    btnRef.current?.focus({ preventScroll: true })
  }, [])

  const open = () => {
    if (stage !== 'idle') return
    if (reduce) return onOpen()
    setStage('opening')
    window.setTimeout(() => setFlapBehind(true), 300)
    window.setTimeout(onOpen, 1150)
  }

  const opening = stage === 'opening'

  return (
    <m.div
      className="opening"
      role="dialog"
      aria-modal="true"
      aria-labelledby="opening-names"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: reduce ? 0.2 : 0.6, ease: EASE } }}
    >
      <Sprig className="opening-sprig" style={{ left: -30, top: -20, transform: 'rotate(90deg) scaleX(-1)' }} />
      <Sprig className="opening-sprig" style={{ right: -30, bottom: -30, transform: 'rotate(-90deg) scaleX(-1)' }} />
      <div className="opening-lang">
        <LanguageSwitch />
      </div>

      <m.div
        className="opening-inner"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <div className="together">{t.opening.together}</div>
        <h1 className="names" id="opening-names">
          {l(couple.groom)}
          <span className="amp">&amp;</span>
          {l(couple.bride)}
        </h1>
        <p className="msg">{t.opening.message}</p>

        <div className="envelope" onClick={open} aria-hidden="true">
          <div className="env-back" />
          <m.div
            className="env-card"
            style={{ zIndex: 2 }}
            animate={opening ? { y: '-40%' } : { y: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.38 }}
          >
            <div>
              <small>{l(couple.groom)} &amp; {l(couple.bride)}</small>
              26 · 01 · 2027
            </div>
          </m.div>
          <div className="env-front" style={{ zIndex: 3 }} />
          <m.div
            className="env-flap"
            style={{ zIndex: flapBehind ? 1 : 4 }}
            animate={opening ? { rotateX: 180 } : { rotateX: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          />
          <m.div
            className="seal"
            style={{ zIndex: 5 }}
            animate={opening ? { opacity: 0, scale: 0.6 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            N<span>&amp;</span>D
          </m.div>
        </div>

        <button ref={btnRef} type="button" className="btn gold" onClick={open} disabled={opening}>
          {t.opening.open}
        </button>
      </m.div>
    </m.div>
  )
}
