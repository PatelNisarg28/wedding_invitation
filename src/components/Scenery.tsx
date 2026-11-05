/**
 * Hand-drawn scenery for the royal maroon theme: hanging bougainvillea, temple bells,
 * carved pillars, the elephant-and-chhatri emblem, brass urlis and lit diyas.
 * Everything is inline SVG (no image downloads) and every movement is a CSS animation
 * on transform/opacity only, switched off for reduced-motion users (see global.css).
 */
import { memo, useEffect, useState, type CSSProperties, type SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
type Pt = [number, number]

/* ---------- tiny deterministic helpers (run once at module load) ---------- */
const rnd = (seed: number) => (Math.sin(seed * 127.1 + 311.7) * 43758.5453) % 1
const r01 = (seed: number) => Math.abs(rnd(seed))
const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ]
}
const f = (n: number) => n.toFixed(1)

/** A leaf with its base at 0,0 pointing up (-y). */
const leafD = (l: number, w: number) =>
  `M0 0 C${f(w)} ${f(-l * 0.25)} ${f(w * 1.1)} ${f(-l * 0.7)} 0 ${f(-l)} C${f(-w * 1.1)} ${f(-l * 0.7)} ${f(-w)} ${f(-l * 0.25)} 0 0Z`
/** One papery bougainvillea bract, base at 0,0. */
const BRACT = 'M0 0 C5 -2 8 -8 4.5 -12.5 C2.5 -15 -2.5 -15 -4.5 -12.5 C-8 -8 -5 -2 0 0Z'

/* ---------- bougainvillea ---------- */
type Vine = { d: string; leaves: { x: number; y: number; a: number; l: number; flutter: boolean }[]; flowers: { x: number; y: number; s: number; r: number; tone: number }[] }

function buildVines(): Vine[] {
  const defs: [Pt, Pt, Pt, Pt][] = [
    [[0, 10], [70, -4], [140, 18], [236, 64]],
    [[0, 22], [64, 34], [104, 82], [122, 170]],
    [[0, 18], [26, 64], [34, 128], [22, 214]],
  ]
  return defs.map(([p0, p1, p2, p3], vi) => {
    const leaves: Vine['leaves'] = []
    const flowers: Vine['flowers'] = []
    const N = 15
    for (let i = 1; i <= N; i++) {
      const t = i / (N + 0.6)
      const [x, y] = bez(p0, p1, p2, p3, t)
      const [x2, y2] = bez(p0, p1, p2, p3, Math.min(1, t + 0.01))
      const along = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI + 90
      const side = i % 2 ? -1 : 1
      const s = vi * 50 + i
      leaves.push({ x, y, a: along + side * (48 + r01(s) * 26), l: 18 + r01(s + 3) * 10 - t * 4, flutter: r01(s + 9) > 0.45 })
      // flower clusters bunch toward the hanging ends
      if (i > 2 && (i % 3 === 0 || (t > 0.72 && i % 2 === 0))) {
        const k = 1 + Math.round(r01(s + 5) * 1.5 + t * 1.5)
        for (let j = 0; j < k; j++) {
          const q = s * 7 + j
          flowers.push({
            x: x + (r01(q) - 0.5) * 26,
            y: y + (r01(q + 1) - 0.3) * 22,
            s: 0.7 + r01(q + 2) * 0.55,
            r: r01(q + 3) * 120,
            tone: Math.floor(r01(q + 4) * 3),
          })
        }
      }
    }
    const d = `M${p0} C${p1} ${p2} ${p3}`
    return { d, leaves, flowers }
  })
}
const VINES = buildVines()
const BLOOM = [
  ['#c7365f', '#8e1533'],
  ['#d9527a', '#a61d45'],
  ['#b02447', '#7a1029'],
]

/** Bougainvillea hanging from a top-left corner (mirror it with CSS for the right side). */
export const Bougainvillea = memo(function Bougainvillea(props: P) {
  return (
    <svg viewBox="0 0 250 240" fill="none" aria-hidden="true" overflow="visible" {...props}>
      <defs>
        <linearGradient id="bv-leaf" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#4d6a2f" />
          <stop offset="1" stopColor="#7f9e4f" />
        </linearGradient>
        {BLOOM.map(([a, b], i) => (
          <radialGradient key={i} id={`bv-b${i}`} cx="0.5" cy="0.9" r="1">
            <stop offset="0" stopColor={b} />
            <stop offset="0.75" stopColor={a} />
          </radialGradient>
        ))}
      </defs>
      {VINES.map((v, vi) => (
        <g key={vi} className={`vine vine-${vi}`}>
          <path d={v.d} stroke="#6b4a2c" strokeWidth={2.2 - vi * 0.4} strokeLinecap="round" />
          {v.leaves.map((lf, i) => (
            <g key={i} transform={`translate(${f(lf.x)} ${f(lf.y)}) rotate(${f(lf.a)})`}>
              <g className={lf.flutter ? 'flutter' : undefined} style={lf.flutter ? ({ animationDelay: `${-(i % 5) * 0.7}s` } as CSSProperties) : undefined}>
                <path d={leafD(lf.l, lf.l * 0.36)} fill="url(#bv-leaf)" />
                <path d={`M0 0 L0 ${f(-lf.l * 0.85)}`} stroke="#3f5726" strokeWidth="0.5" opacity="0.6" />
              </g>
            </g>
          ))}
          {v.flowers.map((fl, i) => (
            <g key={i} transform={`translate(${f(fl.x)} ${f(fl.y)}) rotate(${f(fl.r)}) scale(${fl.s.toFixed(2)})`}>
              {[0, 120, 240].map((a) => (
                <path key={a} d={BRACT} transform={`rotate(${a})`} fill={`url(#bv-b${fl.tone})`} stroke="#6e0f26" strokeWidth="0.35" strokeOpacity="0.5" />
              ))}
              <circle r="1.3" fill="#f6ead2" />
            </g>
          ))}
        </g>
      ))}
    </svg>
  )
})

/* ---------- temple bell on a chain ---------- */
export function Bell(props: P) {
  const links = Array.from({ length: 11 }, (_, i) => 6 + i * 8.4)
  return (
    <svg viewBox="0 0 40 150" fill="none" aria-hidden="true" overflow="visible" {...props}>
      <defs>
        <linearGradient id="bell-g" x1="0" x2="1">
          <stop offset="0" stopColor="#7d5a1f" />
          <stop offset="0.35" stopColor="#e3c27a" />
          <stop offset="0.6" stopColor="#c09245" />
          <stop offset="1" stopColor="#6f4f1a" />
        </linearGradient>
      </defs>
      <g className="bell-swing">
        {links.map((y, i) => (
          <ellipse key={i} cx="20" cy={y} rx={i % 2 ? 1.6 : 2.6} ry="4" stroke="#a8823f" strokeWidth="1.3" />
        ))}
        <circle cx="20" cy="100" r="3" fill="url(#bell-g)" />
        <path d="M20 101 C12.5 101 11 108 11 117 C11 128 8.5 133 5 137 H35 C31.5 133 29 128 29 117 C29 108 27.5 101 20 101Z" fill="url(#bell-g)" />
        <path d="M5 137 H35 C35 140 30 141.5 20 141.5 C10 141.5 5 140 5 137Z" fill="#8a6524" />
        <path d="M13 113 H27 M12 124 H28" stroke="#7a5a1e" strokeWidth="0.8" opacity="0.6" />
        <circle cx="20" cy="145" r="3.2" fill="url(#bell-g)" />
      </g>
    </svg>
  )
}

/* ---------- carved pillar ---------- */
export function Pillar(props: P) {
  return (
    <svg viewBox="0 0 130 700" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMax meet" {...props}>
      <defs>
        <linearGradient id="pil-g" x1="0" x2="1">
          <stop offset="0" stopColor="#e6d4b5" />
          <stop offset="0.45" stopColor="#f8efdf" />
          <stop offset="1" stopColor="#dcc7a3" />
        </linearGradient>
      </defs>
      <g stroke="#b39466" strokeWidth="1" fill="url(#pil-g)">
        {/* capital and scroll bracket reaching inward */}
        <path d="M0 0 H130 V18 H0Z" />
        <path d="M8 18 H122 V30 H8Z" />
        <path d="M18 30 H112 L104 48 H26Z" />
        <path d="M112 30 C140 34 158 58 150 84 C146 96 132 98 128 88 C124 78 134 72 140 78" fill="none" strokeWidth="1.4" />
        <path d="M30 48 H100 V58 H30Z" />
        {/* shaft */}
        <path d="M36 58 H94 V600 H36Z" />
        <path d="M30 140 H100 V156 H30Z M30 420 H100 V436 H30Z" />
        <path d="M30 156 C40 172 90 172 100 156 M30 420 C40 404 90 404 100 420" fill="none" opacity="0.8" />
        {/* base */}
        <path d="M28 600 H102 V616 H28Z" />
        <path d="M20 616 H110 V640 H20Z" />
        <path d="M10 640 H120 V700 H10Z" />
      </g>
      <g stroke="#b39466" strokeWidth="0.7" opacity="0.55">
        <path d="M48 70 V136 M58 70 V136 M72 70 V136 M82 70 V136" />
        <path d="M48 176 V412 M58 176 V412 M72 176 V412 M82 176 V412" />
        <path d="M48 444 V594 M58 444 V594 M72 444 V594 M82 444 V594" />
      </g>
      <g fill="#b39466" opacity="0.6">
        {[148, 428].map((y) => [44, 58, 72, 86].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" />))}
        {[24, 64, 106].map((x) => <path key={x} d={`M${x} 660 l6 10 l-6 10 l-6 -10Z`} />)}
      </g>
    </svg>
  )
}

/* ---------- elephants under a royal chhatri ---------- */
const ELEPHANT_SRC = `${import.meta.env.BASE_URL}elephant.webp`

/** The family's painted elephant, twice, greeting each other under a royal chhatri. */
export function ElephantEmblem() {
  return (
    <div className="hero-emblem" aria-hidden="true">
      <img className="emblem-elephant" src={ELEPHANT_SRC} alt="" width={480} height={337} decoding="async" />
      <svg className="emblem-chhatri" viewBox="0 0 70 104" fill="none">
        <g className="chhatri">
          <path d="M35 6 V102" stroke="#8e6a2e" strokeWidth="2.2" />
          <circle cx="35" cy="5" r="3.4" fill="#c9a24f" />
          <path d="M3 34 C7 14 63 14 67 34Z" fill="#a8263a" stroke="#8e6a2e" strokeWidth="1.2" />
          <path d="M11 29 C17 19 53 19 59 29" stroke="#c9a24f" strokeWidth="1.2" />
          <g className="chhatri-fringe">
            <path d="M3 34 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0" stroke="#c9a24f" strokeWidth="1.4" fill="#c9a24f" fillOpacity="0.3" />
            {[7, 23, 47, 63].map((x) => (
              <g key={x}>
                <path d={`M${x} 38 v5`} stroke="#c9a24f" strokeWidth="0.8" />
                <circle cx={x} cy={44.5} r="1.7" fill="#c9a24f" />
              </g>
            ))}
          </g>
          <path d="M25 102 H45 L40.5 95 H29.5Z" fill="#c9a24f" />
        </g>
      </svg>
      <img className="emblem-elephant flip" src={ELEPHANT_SRC} alt="" width={480} height={337} decoding="async" />
    </div>
  )
}

/* ---------- brass pieces on the floor ---------- */
const BRASS = (
  <linearGradient id="brass" x1="0" x2="1">
    <stop offset="0" stopColor="#7d5a1f" />
    <stop offset="0.3" stopColor="#e8c983" />
    <stop offset="0.55" stopColor="#c4964a" />
    <stop offset="1" stopColor="#6a4c18" />
  </linearGradient>
)

/** Tall deepstambh lamp with a flickering flame. */
export function Diya(props: P) {
  return (
    <svg viewBox="0 0 70 210" fill="none" aria-hidden="true" overflow="visible" {...props}>
      <defs>
        {BRASS}
        <radialGradient id="glow">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="flame-g" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#e2541e" />
          <stop offset="0.45" stopColor="#ffb43d" />
          <stop offset="1" stopColor="#fff2b8" />
        </linearGradient>
      </defs>
      <circle className="diya-glow" cx="35" cy="22" r="30" fill="url(#glow)" />
      <path className="flame" d="M35 4 C40 12 42 18 39 24 C37 27 33 27 31 24 C28 18 30 12 35 4Z" fill="url(#flame-g)" />
      <g fill="url(#brass)">
        <path d="M14 26 C20 34 50 34 56 26 C52 24 18 24 14 26Z" />
        <path d="M31 33 H39 L38 50 H32Z" />
        <ellipse cx="35" cy="54" rx="9" ry="5" />
        <path d="M32 58 H38 L37 120 H33Z" />
        <ellipse cx="35" cy="96" rx="7" ry="4" />
        <ellipse cx="35" cy="124" rx="10" ry="5" />
        <path d="M31 128 H39 L40 160 H30Z" />
        <path d="M30 160 C14 166 8 186 10 200 H60 C62 186 56 166 40 160Z" />
        <path d="M6 200 H64 V206 H6Z" />
      </g>
    </svg>
  )
}

/** Brass urli bowl with floating flowers. */
export function Urli(props: P) {
  return (
    <svg viewBox="0 0 170 80" fill="none" aria-hidden="true" {...props}>
      <defs>{BRASS}</defs>
      <path d="M8 30 C14 62 50 74 85 74 C120 74 156 62 162 30Z" fill="url(#brass)" />
      <ellipse cx="85" cy="30" rx="77" ry="9" fill="#e8d3a6" stroke="#a37a34" strokeWidth="1.5" />
      <path d="M30 48 C60 56 110 56 140 48" stroke="#7a5a1e" strokeWidth="0.8" opacity="0.5" />
      {[
        [48, 27, '#c7365f'],
        [70, 31, '#e0a33a'],
        [92, 26, '#b02447'],
        [114, 31, '#d9527a'],
        [132, 27, '#e0a33a'],
      ].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <g className="float-flower" style={{ animationDelay: `${-i * 0.9}s` }}>
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse key={a} cx="0" cy="-4" rx="2.6" ry="4.2" transform={`rotate(${a})`} fill={c as string} />
            ))}
            <circle r="2" fill="#f4d27a" />
          </g>
        </g>
      ))}
    </svg>
  )
}

/** A scatter of rose petals for the floor line. */
export function FloorPetals(props: P) {
  const pts = Array.from({ length: 14 }, (_, i) => ({ x: 6 + r01(i + 40) * 188, y: 8 + r01(i + 80) * 12, a: r01(i + 120) * 180, c: i % 3 }))
  return (
    <svg viewBox="0 0 200 30" fill="none" aria-hidden="true" {...props}>
      {pts.map((p, i) => (
        <path key={i} d={BRACT} transform={`translate(${f(p.x)} ${f(p.y)}) rotate(${f(p.a)}) scale(0.5)`} fill={['#a8263a', '#c7365f', '#7a1e2c'][p.c]} />
      ))}
    </svg>
  )
}

/* ---------- title ornament (→ ✦) ---------- */
export function TitleOrnament(props: P) {
  return (
    <svg viewBox="0 0 48 14" fill="none" aria-hidden="true" {...props}>
      <path d="M2 7 H30" stroke="currentColor" strokeWidth="1" />
      <path d="M30 7 C26 3 22 3 20 4 M30 7 C26 11 22 11 20 10" stroke="currentColor" strokeWidth="1" />
      <path d="M38 2 L43 7 L38 12 L33 7Z" fill="currentColor" />
      <circle cx="47" cy="7" r="1" fill="currentColor" />
    </svg>
  )
}

/* ---------- falling petals and leaves ---------- */
type Faller = {
  id: number
  x: number
  y: number
  fall: number
  delay: number
  dur: number
  sway: number
  drift: number
  size: number
  leaf: boolean
  tone: number
}

let nextId = 0
const rand = (a: number, b: number) => a + Math.random() * (b - a)

/** One shower across the screen: every petal starts within 1.5s and is gone by ~5s. */
function shower(): Faller[] {
  const w = window.innerWidth
  const h = window.innerHeight
  const n = w < 600 ? 12 : 18
  return Array.from({ length: n }, (_, i) => ({
    id: nextId++,
    x: rand(0.03, 0.97) * w,
    y: -30,
    fall: h + 60,
    delay: rand(0, 1.5),
    dur: rand(3.2, 3.6),
    sway: rand(1.8, 2.8),
    drift: rand(18, 45),
    size: Math.round(rand(11, 19)),
    leaf: i % 4 === 3,
    tone: i % 3,
  }))
}

const MAX_FALLERS = 40

/** Showers come in waves: about 5 seconds of falling petals, then about 10 seconds of calm. */
const CYCLE_MS = 15000

/**
 * Petals and leaves: a shower starts when the invitation opens and then returns
 * every 15 seconds (paused while the tab is hidden).
 */
export function FallingPetals() {
  const [items, setItems] = useState<Faller[]>([])

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const timers = new Set<number>()
    const add = (batch: Faller[]) => {
      setItems((cur) => [...cur, ...batch].slice(-MAX_FALLERS))
      const life = Math.max(...batch.map((p) => p.delay + p.dur)) * 1000 + 200
      const ids = new Set(batch.map((p) => p.id))
      const t = window.setTimeout(() => {
        timers.delete(t)
        setItems((cur) => cur.filter((p) => !ids.has(p.id)))
      }, life)
      timers.add(t)
    }
    add(shower())
    const cycle = window.setInterval(() => {
      if (document.visibilityState === 'visible') add(shower())
    }, CYCLE_MS)
    return () => {
      window.clearInterval(cycle)
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  return (
    <div className="fallers" aria-hidden="true">
      {items.map((p) => (
        <span
          key={p.id}
          className="faller"
          style={{ left: p.x, top: p.y, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, ['--fall' as string]: `${p.fall}px` } as CSSProperties}
        >
          <svg
            className="faller-sway"
            viewBox="-8 -16 16 18"
            width={p.size}
            height={p.size}
            style={{ animationDuration: `${p.sway}s`, ['--drift' as string]: `${p.drift}px` } as CSSProperties}
          >
            {p.leaf ? <path d={leafD(15, 5.5)} fill={['#6f8f45', '#5c7a36', '#8aa65a'][p.tone]} /> : <path d={BRACT} fill={BLOOM[p.tone][0]} opacity="0.9" />}
          </svg>
        </span>
      ))}
    </div>
  )
}

/** Soft, blurred shadow of a leafy branch drifting in the breeze (decorative backdrop). */
export function LeafShadow({ style, className = '' }: { style?: CSSProperties; className?: string }) {
  const v = VINES[1]
  return (
    <svg className={`leaf-shadow ${className}`} style={style} viewBox="0 0 250 240" fill="none" aria-hidden="true">
      <g className="shadow-sway">
        <path d={v.d} stroke="#5b4630" strokeWidth="3" />
        {[...v.leaves, ...VINES[2].leaves].map((lf, i) => (
          <path key={i} d={leafD(lf.l * 1.3, lf.l * 0.5)} transform={`translate(${f(lf.x)} ${f(lf.y)}) rotate(${f(lf.a)})`} fill="#5b4630" />
        ))}
      </g>
    </svg>
  )
}

/* ---------- palace skyline (gold line-art for the countdown band) ---------- */
type Branch = { d: string; leaves: { x: number; y: number; a: number; l: number }[] }

/** A line-art tree with leafy branches, rooted at (x, ground). */
function buildTree(x: number, ground: number, h: number, seed: number): Branch[] {
  const trunkTop: Pt = [x + 4, ground - h * 0.62]
  const branches: Branch[] = []
  const trunk = `M${x} ${ground} C${x - 3} ${ground - h * 0.25} ${x + 7} ${ground - h * 0.42} ${trunkTop[0]} ${trunkTop[1]}`
  branches.push({ d: trunk, leaves: [] })
  const arms: [number, number][] = [
    [-0.9, 0.55],
    [-0.45, 0.85],
    [0.1, 1],
    [0.55, 0.85],
    [0.95, 0.55],
  ]
  arms.forEach(([dx, dy], i) => {
    const p0: Pt = [trunkTop[0], trunkTop[1] + (i % 2) * 6]
    const p3: Pt = [trunkTop[0] + dx * h * 0.42, trunkTop[1] - dy * h * 0.36]
    const p1: Pt = [p0[0] + dx * h * 0.1, p0[1] - h * 0.12]
    const p2: Pt = [p3[0] - dx * h * 0.12, p3[1] + h * 0.06]
    const leaves: Branch['leaves'] = []
    for (let k = 1; k <= 6; k++) {
      const t = k / 6.4
      const [lx, ly] = bez(p0, p1, p2, p3, t)
      const [nx, ny] = bez(p0, p1, p2, p3, Math.min(1, t + 0.02))
      const along = (Math.atan2(ny - ly, nx - lx) * 180) / Math.PI + 90
      leaves.push({ x: lx, y: ly, a: along + (k % 2 ? -55 : 55) + (r01(seed + i * 7 + k) - 0.5) * 20, l: 9 + r01(seed + k) * 5 })
    }
    leaves.push({ x: p3[0], y: p3[1], a: (Math.atan2(p3[1] - p2[1], p3[0] - p2[0]) * 180) / Math.PI + 90, l: 11 })
    branches.push({ d: `M${p0} C${p1} ${p2} ${p3}`, leaves })
  })
  return branches
}

const GROUND = 192
const TREES = [
  { x: 92, h: 150, s: 11 },
  { x: 228, h: 104, s: 23 },
  { x: 348, h: 70, s: 37 },
  { x: 1108, h: 150, s: 41 },
  { x: 972, h: 104, s: 53 },
  { x: 852, h: 70, s: 67 },
].map((t) => buildTree(t.x, GROUND, t.h, t.s))

/** A palace pavilion between trees, drawn in fine gold lines, sitting on the band's lower edge. */
export const PalaceSkyline = memo(function PalaceSkyline(props: P) {
  const pillars = [560, 584, 610, 634]
  return (
    <svg viewBox="0 0 1200 200" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMax slice" {...props}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* distant hills */}
        <path d="M0 176 Q150 132 310 166 T640 154 T930 162 T1200 142" strokeWidth="1" opacity="0.35" />
        {/* ground */}
        <path d={`M0 ${GROUND} H1200`} strokeWidth="1.2" />
        {/* side walls with small arched niches */}
        <g strokeWidth="1" opacity="0.8">
          <path d="M430 192 V160 H544 M656 160 H770 V192" />
          {[446, 474, 502, 676, 704, 732].map((x) => (
            <path key={x} d={`M${x} 192 V176 Q${x + 9} 164 ${x + 18} 176 V192`} />
          ))}
          <path d="M424 160 H430 M770 160 H776" />
        </g>
        {/* steps and plinth */}
        <g strokeWidth="1.2">
          <path d="M520 192 V182 H680 V192" />
          <path d="M532 182 V172 H668 V182" />
          <path d="M544 172 V164 H656 V172" />
        </g>
        {/* pillars and arches */}
        <g strokeWidth="1.2">
          {pillars.map((x) => (
            <g key={x}>
              <path d={`M${x} 164 V108 M${x + 6} 164 V108`} />
              <path d={`M${x - 2} 108 H${x + 8} M${x - 2} 164 H${x + 8}`} />
            </g>
          ))}
          {pillars.slice(0, -1).map((x, i) => (
            <path key={x} d={`M${x + 6} 134 C${x + 8} 120 ${pillars[i + 1] - 2} 120 ${pillars[i + 1]} 134`} />
          ))}
        </g>
        {/* eaves (chhajja), railing and corner kiosks */}
        <g strokeWidth="1.2">
          <path d="M538 108 H662 L654 98 H546 Z" />
          <path d="M552 98 V88 H648 V98" />
          {[560, 572, 584, 596, 608, 620, 632, 644].map((x) => (
            <path key={x} d={`M${x} 98 V90`} strokeWidth="0.8" />
          ))}
          <path d="M540 98 C540 86 548 80 550 76 C552 80 560 86 560 98" />
          <path d="M640 98 C640 86 648 80 650 76 C652 80 660 86 660 98" />
          <path d="M550 76 V70 M650 76 V70" />
        </g>
        {/* dome with lotus base and finial */}
        <g strokeWidth="1.3">
          <path d="M568 88 C568 60 590 46 600 40 C610 46 632 60 632 88" />
          <path d="M572 88 Q586 80 600 88 Q614 80 628 88" strokeWidth="1" />
          <path d="M600 40 V26" />
          <circle cx="600" cy="24" r="2.4" />
          <circle cx="600" cy="32" r="1.6" />
        </g>
        {/* trees and shrubs */}
        <g strokeWidth="1.1">
          {TREES.map((tree, ti) =>
            tree.map((br, bi) => (
              <g key={`${ti}-${bi}`}>
                <path d={br.d} strokeWidth={bi === 0 ? 1.6 : 1} />
                {br.leaves.map((lf, li) => (
                  <path key={li} d={leafD(lf.l, lf.l * 0.36)} transform={`translate(${f(lf.x)} ${f(lf.y)}) rotate(${f(lf.a)})`} strokeWidth="0.9" />
                ))}
              </g>
            )),
          )}
        </g>
        {/* grass tufts */}
        <g strokeWidth="0.9" opacity="0.8">
          {[30, 170, 300, 410, 470, 730, 790, 900, 1030, 1170].map((x) => (
            <path key={x} d={`M${x} 192 q-2 -7 -6 -10 M${x} 192 q0 -8 1 -12 M${x} 192 q3 -6 7 -9`} />
          ))}
        </g>
      </g>
    </svg>
  )
})
