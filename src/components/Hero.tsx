import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { couple, city, WEDDING_START } from '../content/wedding'
import { useLang } from '../i18n/LanguageContext'
import { Arch, Divider, Finial, Mandala, Sprig } from './Ornaments'
import { Petals } from './Petals'

const EASE = [0.22, 1, 0.36, 1] as const

export function Hero({ ready }: { ready: boolean }) {
  const { t, l, fmtDate } = useLang()
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const mandalaY = useTransform(scrollY, [0, 800], [0, reduce ? 0 : 160])
  const archY = useTransform(scrollY, [0, 800], [0, reduce ? 0 : -60])
  const fade = useTransform(scrollY, [0, 500], [1, reduce ? 1 : 0.2])

  const item = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1, ease: EASE, delay: 0.15 + i * 0.12 },
  })

  return (
    <section className="hero" id="top" aria-labelledby="hero-names">
      <m.div className="hero-mandala" style={{ y: mandalaY }}>
        <Mandala />
      </m.div>
      <Petals />
      <Sprig className="hero-sprig" style={{ left: -24, bottom: 40, transform: 'scaleX(1)' }} />
      <Sprig className="hero-sprig" style={{ right: -24, top: 70, transform: 'rotate(180deg)' }} />

      <m.div className="hero-arch" style={{ y: archY, opacity: fade }}>
        <m.div
          style={{ position: 'absolute', inset: 0 }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={ready ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.2, ease: EASE }}
        >
          <Arch />
          <Finial style={{ position: 'absolute', width: 34, left: '50%', top: -26, translate: '-50% 0', color: 'var(--gold)' }} />
        </m.div>

        <m.div className="kicker" {...item(0)}>
          {t.hero.kicker}
        </m.div>
        <m.h1 className="hero-names" id="hero-names" {...item(1)}>
          {l(couple.groom)}
          <span className="amp">&amp;</span>
          {l(couple.bride)}
        </m.h1>
        <m.div {...item(2)}>
          <Divider />
        </m.div>
        <m.div className="hero-date" {...item(3)}>
          26 · 01 · 2027
        </m.div>
        <m.div className="hero-sub" {...item(4)}>
          {fmtDate(WEDDING_START, { year: false }).split(',')[0]} · {l(city)}
        </m.div>
      </m.div>

      <a href="#invitation" className="scroll-cue" aria-label={t.hero.scroll}>
        <span aria-hidden="true">{t.hero.scroll}</span>
        <i />
      </a>
    </section>
  )
}
