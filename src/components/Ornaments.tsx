import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

/* ---------- geometry helpers (run once at module load) ---------- */
type Pt = [number, number]
const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ]
}
const leafPath = (l: number, w: number) =>
  `M0 0 C${w} ${-l * 0.25} ${w * 1.1} ${-l * 0.7} 0 ${-l} C${-w * 1.1} ${-l * 0.7} ${-w} ${-l * 0.25} 0 0Z`

function buildSprig() {
  const P0: Pt = [6, 194], P1: Pt = [40, 150], P2: Pt = [78, 96], P3: Pt = [168, 30]
  const stem = `M${P0} C${P1} ${P2} ${P3}`
  const leaves: { x: number; y: number; a: number; l: number }[] = []
  const N = 9
  for (let i = 1; i <= N; i++) {
    const t = i / (N + 1)
    const [x, y] = bez(P0, P1, P2, P3, t)
    const [x2, y2] = bez(P0, P1, P2, P3, Math.min(1, t + 0.01))
    const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI + 90
    const side = i % 2 ? -1 : 1
    leaves.push({ x, y, a: ang + side * 52, l: 22 - i * 1.1 })
  }
  // a small side branch
  const B0 = bez(P0, P1, P2, P3, 0.42)
  const branch = `M${B0} C${B0[0] + 6} ${B0[1] - 26} ${B0[0] - 4} ${B0[1] - 44} ${B0[0] - 18} ${B0[1] - 58}`
  const bl: { x: number; y: number; a: number; l: number }[] = [
    { x: B0[0] + 2, y: B0[1] - 22, a: 40, l: 13 },
    { x: B0[0] - 2, y: B0[1] - 36, a: -60, l: 12 },
    { x: B0[0] - 12, y: B0[1] - 50, a: 10, l: 11 },
  ]
  return { stem, leaves: [...leaves, ...bl], branch, tip: P3, bud: [B0[0] - 18, B0[1] - 60] as Pt }
}
const SPRIG = buildSprig()

/** Delicate botanical sprig — sage leaves with gold buds */
export function Sprig(props: P) {
  return (
    <svg viewBox="0 0 180 200" fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        <path d={SPRIG.stem} />
        <path d={SPRIG.branch} />
        {SPRIG.leaves.map((lf, i) => (
          <path
            key={i}
            d={leafPath(lf.l, lf.l * 0.32)}
            transform={`translate(${lf.x.toFixed(1)} ${lf.y.toFixed(1)}) rotate(${lf.a.toFixed(1)})`}
            fill="currentColor"
            fillOpacity="0.16"
          />
        ))}
      </g>
      <g fill="#b02447">
        <circle cx={SPRIG.tip[0] + 3} cy={SPRIG.tip[1] - 3} r="3.2" />
        <circle cx={SPRIG.tip[0] - 6} cy={SPRIG.tip[1] - 9} r="1.8" />
        <circle cx={SPRIG.bud[0]} cy={SPRIG.bud[1]} r="2.6" />
        <circle cx={SPRIG.bud[0] + 7} cy={SPRIG.bud[1] - 4} r="1.4" />
      </g>
    </svg>
  )
}

const ARCH_OUT = 'M8 432 V172 C8 96 70 56 120 41 C139 35 147 23 150 8 C153 23 161 35 180 41 C230 56 292 96 292 172 V432'
const ARCH_IN = 'M20 432 V174 C20 106 78 70 124 55 C141 49 148 40 150 29 C152 40 159 49 176 55 C222 70 280 106 280 174 V432'

/** Indian architectural arch (jharokha) outline */
export function Arch(props: P) {
  return (
    <svg viewBox="0 0 300 440" fill="none" preserveAspectRatio="none" aria-hidden="true" {...props} className={`arch ${props.className ?? ''}`}>
      <path d={ARCH_OUT} stroke="currentColor" strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
      <path d={ARCH_IN} stroke="currentColor" strokeWidth="0.7" opacity="0.7" vectorEffect="non-scaling-stroke" />
      <path d="M8 432 H292" stroke="currentColor" strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** The small finial that sits on top of the arch (kept separate so it never stretches) */
export function Finial(props: P) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeWidth="1.1">
        <path d="M20 4 C24 12 30 15 30 21 C30 27 25 30 20 31 C15 30 10 27 10 21 C10 15 16 12 20 4Z" fill="currentColor" fillOpacity="0.12" />
        <path d="M20 12 V28" opacity="0.6" />
      </g>
      <circle cx="20" cy="36" r="1.8" fill="currentColor" />
    </svg>
  )
}

export function Divider(props: P) {
  return (
    <svg viewBox="0 0 160 14" fill="none" aria-hidden="true" {...props} className={`divider ${props.className ?? ''}`}>
      <g stroke="currentColor" strokeWidth="1">
        <path d="M4 7 H62" opacity="0.7" />
        <path d="M98 7 H156" opacity="0.7" />
        <path d="M80 1 L86 7 L80 13 L74 7Z" fill="currentColor" fillOpacity="0.25" />
      </g>
      <g fill="currentColor">
        <circle cx="68" cy="7" r="1.8" />
        <circle cx="92" cy="7" r="1.8" />
        <circle cx="4" cy="7" r="1.2" />
        <circle cx="156" cy="7" r="1.2" />
      </g>
    </svg>
  )
}

function buildMandala() {
  const rings: { r: number; n: number; L: number }[] = [
    { r: 30, n: 12, L: 22 },
    { r: 64, n: 18, L: 30 },
    { r: 104, n: 24, L: 34 },
    { r: 146, n: 36, L: 26 },
    { r: 180, n: 60, L: 12 },
  ]
  const out: string[] = []
  for (const { r, n, L } of rings) {
    for (let i = 0; i < n; i++) {
      out.push(
        `<path transform="rotate(${((360 * i) / n).toFixed(2)})" d="M0,-${r} C${L * 0.42},-${r + L * 0.4} ${L * 0.2},-${r + L * 0.9} 0,-${r + L} C-${L * 0.2},-${r + L * 0.9} -${L * 0.42},-${r + L * 0.4} 0,-${r}Z"/>`,
      )
    }
    out.push(`<circle r="${r}"/>`)
  }
  return out.join('')
}
const MANDALA = buildMandala()

export function Mandala(props: P) {
  return (
    <svg viewBox="-200 -200 400 400" fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeWidth="0.7" dangerouslySetInnerHTML={{ __html: MANDALA }} />
    </svg>
  )
}

/** Animated closing flourish — paths draw themselves */
export const FLOURISH_PATHS = [
  'M10 40 C40 40 60 22 90 22 C104 22 110 30 110 36 C110 44 100 46 96 40 C92 34 100 28 106 32',
  'M210 40 C180 40 160 22 130 22 C116 22 110 30 110 36',
  'M60 40 C80 52 100 52 110 46 C120 52 140 52 160 40',
]

/* ---------- small UI icons ---------- */
const ui = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
export const IconClock = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><g {...ui}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></g></svg>
)
export const IconPin = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><g {...ui}><path d="M12 21s-7-6.3-7-11.5A7 7 0 0 1 19 9.5C19 14.7 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></g></svg>
)
export const IconArrow = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><g {...ui}><path d="M5 12h14M13 6l6 6-6 6" /></g></svg>
)
export const IconNavigate = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><g {...ui}><path d="M3 11l18-8-8 18-2-8-8-2z" /></g></svg>
)
export const IconPhone = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><g {...ui}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></g></svg>
)
export const IconClose = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><g {...ui}><path d="M6 6l12 12M18 6 6 18" /></g></svg>
)
export const IconHeart = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><g {...ui}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></g></svg>
)
export const IconLeaf = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><g {...ui}><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" /><path d="M5 19 13 11" /></g></svg>
)
export const IconAlert = (p: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}><g {...ui}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" /></g></svg>
)
export const IconChevron = ({ dir = 'right', ...p }: P & { dir?: 'left' | 'right' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><g {...ui}><path d={dir === 'right' ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} /></g></svg>
)
