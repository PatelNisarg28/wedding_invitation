import { m, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { TitleOrnament } from './Scenery'

type Props = HTMLMotionProps<'div'> & { delay?: number; y?: number; children: ReactNode }

/** Fades content up gently the first time it scrolls into view. */
export function Reveal({ delay = 0, y = 18, children, ...rest }: Props) {
  return (
    <m.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
      {...rest}
    >
      {children}
    </m.div>
  )
}

export function SectionHead({ eyebrow, title, lede, id }: { eyebrow: string; title: string; lede?: string; id?: string }) {
  return (
    <Reveal className="section-head">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="h2" id={id}>
        <TitleOrnament className="title-orn" />
        <span>{title}</span>
        <TitleOrnament className="title-orn flip" />
      </h2>
      {lede && <p className="lede">{lede}</p>}
    </Reveal>
  )
}
