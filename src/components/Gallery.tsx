import { AnimatePresence, m } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { gallery } from '../content/wedding'
import { useLang } from '../i18n/LanguageContext'
import { IconChevron, IconClose, Sprig } from './Ornaments'
import { Reveal, SectionHead } from './Reveal'

function Lightbox({ index, onClose, onStep }: { index: number; onClose: () => void; onStep: (d: number) => void }) {
  const { t } = useLang()
  const closeRef = useRef<HTMLButtonElement>(null)
  const startX = useRef<number | null>(null)
  const photo = gallery[index]

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    document.body.classList.add('locked')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('locked')
      prev?.focus()
    }
  }, [onClose, onStep])

  return (
    <m.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (startX.current === null) return
        const dx = e.changedTouches[0].clientX - startX.current
        if (Math.abs(dx) > 50) onStep(dx < 0 ? 1 : -1)
        startX.current = null
      }}
    >
      <AnimatePresence mode="wait">
        <m.img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        />
      </AnimatePresence>
      <button ref={closeRef} type="button" className="lb-btn lb-close" onClick={onClose} aria-label={t.gallery.close}>
        <IconClose />
      </button>
      {gallery.length > 1 && (
        <>
          <button type="button" className="lb-btn lb-prev" onClick={() => onStep(-1)} aria-label={t.gallery.prev}>
            <IconChevron dir="left" />
          </button>
          <button type="button" className="lb-btn lb-next" onClick={() => onStep(1)} aria-label={t.gallery.next}>
            <IconChevron />
          </button>
        </>
      )}
      <div className="lb-count">
        {index + 1} / {gallery.length}
      </div>
    </m.div>
  )
}

export function Gallery() {
  const { t } = useLang()
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + gallery.length) % gallery.length)), [])

  return (
    <section className="section" id="gallery" aria-labelledby="gallery-title">
      <div className="container">
        <SectionHead id="gallery-title" eyebrow={t.gallery.eyebrow} title={t.gallery.title} />
        {gallery.length === 0 ? (
          <Reveal>
            <div className="gallery-empty" aria-hidden="true">
              <div className="frame">
                <Sprig style={{ transform: 'rotate(-20deg)' }} />
              </div>
              <div className="frame tall">
                <Sprig style={{ transform: 'rotate(-35deg) scale(1.1)' }} />
              </div>
              <div className="frame">
                <Sprig style={{ transform: 'rotate(160deg) scaleX(-1)' }} />
              </div>
            </div>
            <p className="gallery-note">{t.gallery.empty}</p>
          </Reveal>
        ) : (
          <div className="gallery-grid">
            {gallery.map((g, i) => (
              <Reveal key={g.src} delay={(i % 3) * 0.08}>
                <button type="button" className="gallery-item" style={{ aspectRatio: g.ratio ?? '4/5' }} onClick={() => setOpen(i)} aria-label={t.gallery.open(i + 1)}>
                  <img src={g.src} alt={g.alt} loading="lazy" decoding="async" />
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>
      <AnimatePresence>{open !== null && <Lightbox index={open} onClose={close} onStep={step} />}</AnimatePresence>
    </section>
  )
}
