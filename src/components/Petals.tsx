import { memo } from 'react'

const PETALS = Array.from({ length: 9 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 91.7 + n * 13.3) + 1) / 2) // deterministic pseudo-random
  return {
    left: `${6 + r(1) * 88}%`,
    delay: `${(r(2) * 14).toFixed(1)}s`,
    duration: `${(14 + r(3) * 10).toFixed(1)}s`,
    drift: `${Math.round(-60 + r(4) * 120)}px`,
    spin: `${Math.round(160 + r(5) * 260)}deg`,
    scale: 0.6 + r(6) * 0.6,
    tone: i % 3,
  }
})
const TONES = [
  ['#f3e3cf', '#e2c6a4'],
  ['#efe6d2', '#cdbb93'],
  ['#e6e9dc', '#b9bfa8'],
]

/** A few slow, soft petals. Hidden entirely for reduced-motion users (see CSS). */
export const Petals = memo(function Petals() {
  return (
    <div className="petals" aria-hidden="true">
      {PETALS.map((p, i) => (
        <svg
          key={i}
          className="petal"
          viewBox="0 0 14 18"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            ['--drift' as string]: p.drift,
            ['--spin' as string]: p.spin,
            scale: String(p.scale),
          }}
        >
          <defs>
            <linearGradient id={`pg${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={TONES[p.tone][0]} />
              <stop offset="1" stopColor={TONES[p.tone][1]} />
            </linearGradient>
          </defs>
          <path d="M7 0 C12 4 13 12 7 18 C1 12 2 4 7 0Z" fill={`url(#pg${i})`} />
        </svg>
      ))}
    </div>
  )
})
