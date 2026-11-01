import { m } from 'framer-motion'
import { contacts, couple } from '../content/wedding'
import { useLang } from '../i18n/LanguageContext'
import { FLOURISH_PATHS, IconPhone } from './Ornaments'
import { Reveal } from './Reveal'

export function Closing() {
  const { t, l } = useLang()
  return (
    <section className="section closing" aria-label={t.closing.line}>
      <div className="narrow">
        <svg className="closing-mark" viewBox="0 0 220 60" fill="none" aria-hidden="true">
          {FLOURISH_PATHS.map((d, i) => (
            <m.path
              key={i}
              d={d}
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.25 }}
            />
          ))}
          <m.circle
            cx="110"
            cy="36"
            r="2.4"
            fill="currentColor"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.6, duration: 0.5 }}
          />
        </svg>
        <Reveal>
          <p className="closing-line">{t.closing.line}</p>
          <div className="with-love">{t.closing.withLove}</div>
          <div className="closing-names">
            {l(couple.groom)}
            <span className="amp">&amp;</span>
            {l(couple.bride)}
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="help-line">{t.closing.help}</p>
          <div className="phones">
            {contacts.map((c) => (
              <a key={c.phone} className="btn ghost small" href={`tel:${c.phone}`}>
                <IconPhone width={16} height={16} />
                {c.display}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
