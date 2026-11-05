/**
 * Hand-drawn scenery for the royal maroon theme: hanging bougainvillea, temple bells,
 * carved pillars, the elephant-and-chhatri emblem, brass urli, kalash and a lit diya.
 * Everything is inline SVG (no image downloads) and every movement is a CSS animation
 * on transform/opacity only, switched off for reduced-motion users (see global.css).
 */
import { memo, type CSSProperties, type SVGProps } from 'react'

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
/** A caparisoned elephant facing right, trunk raised in greeting (viewBox units 132 × 100). */
function Elephant({ flip }: { flip?: boolean }) {
  return (
    <g transform={flip ? 'translate(340 8) scale(-1 1)' : 'translate(0 8)'}>
      <g className="elephant-bob">
        <path d="M71 62 H84 V90 C84 92.5 82.5 94 80 94 H75 C72.5 94 71 92.5 71 90Z" fill="#5a1220"/>
        <path d="M38 64 H51 V90 C51 92.5 49.5 94 47 94 H42 C39.5 94 38 92.5 38 90Z" fill="#5a1220"/>
        <path d="M15 42 C11 48 10 56 11 63" stroke="#7a1e2c" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M11 62 l-2 5 l2.5 -1.5 l1 3 l1 -3.5Z" fill="#7a1e2c"/>
        <path fill="#7a1e2c" d="M15 40 C17 24 32 15 52 14 C62 13.5 70 15.5 76 19 C80 12 92 9 102 11 C110 13.5 114.5 22 113.5 32 C113 37 113.5 42 116 46 C119.5 50.5 126.5 49.5 128.5 42 C130.5 35 129.5 26.5 126.5 21.5 C125 18.5 121.8 17.8 120.6 20.2 C119.8 22 121.2 23.2 122 24.2 C123.2 29 122.8 35 120.2 39.6 C118 43.5 114.5 46.5 110.5 48.8 C107.5 50.6 105.5 51.5 104 53 C101 56.5 98.5 59 96 61 V90 C96 92.5 94.5 94 92 94 H85 C82.5 94 81 92.5 81 90 V66 C70 70 52 70 41 66 V90 C41 92.5 39.5 94 37 94 H30 C27.5 94 26 92.5 26 90 V61 C19 57 15 50 15 40Z"/>
        <path d="M79 23 C70 26 67 38 69 50 C71 59 80 62 87 57 C91 52 91.5 40 89.5 31 C88 26 84 22.5 79 23Z" fill="#5f1422" stroke="#c9a24f" strokeWidth="0.9"/>
        <path d="M80 28 C75 33 74.5 43 76.5 50" stroke="#c9a24f" strokeWidth="0.6" opacity="0.6" fill="none"/>
        <path d="M27 21 C37 15 56 13 70 16 L70 50 q-3.5 4.5 -7 0 q-3.5 4.5 -7 0 q-3.5 4.5 -7 0 q-3.5 4.5 -7 0 q-3.5 4.5 -7 0 q-3.5 4.5 -8 0Z" fill="#c9a24f"/>
        <path d="M30.5 23 C39 18.5 55 17 66.5 19.5 L66.5 46.5 H30.5Z" fill="#a8263a"/>
        <path d="M33 26 C41 22 54 21 64 23 L64 44 H33Z" fill="none" stroke="#e6c77d" strokeWidth="0.6" strokeDasharray="1.6 1.6"/>
        <g fill="#e6c77d">
        <path d="M48.5 27 l4 6.5 l-4 6.5 l-4 -6.5Z"/>
        <circle cx="38.5" cy="33.5" r="1.6"/><circle cx="58.5" cy="33.5" r="1.6"/>
        </g>
        <g fill="#c9a24f">
        <path d="M66.5 52 v2.4" stroke="#c9a24f" strokeWidth="0.7"/><circle cx="66.5" cy="55.6" r="1.25"/><path d="M59.5 52 v2.4" stroke="#c9a24f" strokeWidth="0.7"/><circle cx="59.5" cy="55.6" r="1.25"/><path d="M52.5 52 v2.4" stroke="#c9a24f" strokeWidth="0.7"/><circle cx="52.5" cy="55.6" r="1.25"/><path d="M45.5 52 v2.4" stroke="#c9a24f" strokeWidth="0.7"/><circle cx="45.5" cy="55.6" r="1.25"/><path d="M38.5 52 v2.4" stroke="#c9a24f" strokeWidth="0.7"/><circle cx="38.5" cy="55.6" r="1.25"/><path d="M31 52 v2.4" stroke="#c9a24f" strokeWidth="0.7"/><circle cx="31" cy="55.6" r="1.25"/>
        </g>
        <path d="M88 14 C95 9 105 10 110.5 16 L105 30 C100 26.5 93.5 21 88 14Z" fill="#c9a24f"/>
        <path d="M92 15.2 C97 12.4 104 13 107.4 16.6 L104 25.4 C100.4 23 95.6 19.4 92 15.2Z" fill="#a8263a"/>
        <path d="M105 30 v3" stroke="#c9a24f" strokeWidth="0.8"/><circle cx="105" cy="34" r="1.5" fill="#c9a24f"/>
        <circle cx="99" cy="29.5" r="1.4" fill="#fbf1e2"/>
        <path d="M96.5 27.5 C98 26.5 100 26.5 101.5 27.5" stroke="#3c0a14" strokeWidth="0.6" fill="none"/>
        <path d="M106.5 50.5 C109.5 56.5 115.5 57.5 119 53.8" stroke="#fbf1e2" strokeWidth="2.6" strokeLinecap="round" fill="none"/>
        <path d="M117.5 44.5 l3.4 -2.6 M120.5 38 l4 -1 M122 31.5 l4.2 0 M122.3 25.5 l3.8 0.8" stroke="#5a1220" strokeWidth="0.6"/>
        <g stroke="#c9a24f" strokeWidth="1.6"><path d="M81 86 H96 M26 86 H41"/></g>
        <g fill="#fbf1e2" opacity="0.85"><circle cx="84.5" cy="93" r="1"/><circle cx="88.5" cy="93.3" r="1"/><circle cx="92.5" cy="93" r="1"/><circle cx="29.5" cy="93" r="1"/><circle cx="33.5" cy="93.3" r="1"/><circle cx="37.5" cy="93" r="1"/></g>
      </g>
    </g>
  )
}

/** Two elephants greeting each other under a royal chhatri. */
export function ElephantEmblem(props: P) {
  return (
    <svg viewBox="0 0 340 112" fill="none" aria-hidden="true" {...props}>
      <Elephant />
      <Elephant flip />
      <g className="chhatri">
        <path d="M170 6 V104" stroke="#8e6a2e" strokeWidth="2.2" />
        <circle cx="170" cy="5" r="3.4" fill="#c9a24f" />
        <path d="M138 34 C142 14 198 14 202 34Z" fill="#a8263a" stroke="#8e6a2e" strokeWidth="1.2" />
        <path d="M146 29 C152 19 188 19 194 29" stroke="#c9a24f" strokeWidth="1.2" />
        <path d="M170 15 V34" stroke="#c9a24f" strokeWidth="0.8" opacity="0.7" />
        <g className="chhatri-fringe">
          <path d="M138 34 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0" stroke="#c9a24f" strokeWidth="1.4" fill="#c9a24f" fillOpacity="0.3" />
          {[142, 158, 182, 198].map((x) => (
            <g key={x}>
              <path d={`M${x} 38 v5`} stroke="#c9a24f" strokeWidth="0.8" />
              <circle cx={x} cy={44.5} r="1.7" fill="#c9a24f" />
            </g>
          ))}
        </g>
        <path d="M160 104 H180 L175.5 97 H164.5Z" fill="#c9a24f" />
      </g>
      <path d="M6 107 H334" stroke="#c9a24f" strokeWidth="1" opacity="0.7" />
    </svg>
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

/** Kalash with mango leaves and coconut. */
export function Kalash(props: P) {
  const leaves = [-62, -36, -12, 12, 36, 62]
  return (
    <svg viewBox="0 0 100 130" fill="none" aria-hidden="true" overflow="visible" {...props}>
      <defs>{BRASS}</defs>
      {leaves.map((a, i) => (
        <g key={a} transform={`translate(50 46) rotate(${a})`}>
          <g className="flutter" style={{ animationDelay: `${-i * 0.6}s` }}>
            <path d={leafD(34, 9)} fill={i % 2 ? '#5c7a36' : '#6f8f45'} />
          </g>
        </g>
      ))}
      <ellipse cx="50" cy="30" rx="13" ry="16" fill="#8a5a2b" />
      <path d="M41 22 C45 18 55 18 59 22" stroke="#5e3c1a" strokeWidth="1" />
      <path d="M36 44 H64 L62 52 H38Z" fill="url(#brass)" />
      <path d="M38 52 C14 60 14 112 34 122 H66 C86 112 86 60 62 52Z" fill="url(#brass)" />
      <path d="M24 82 C40 90 60 90 76 82" stroke="#a8263a" strokeWidth="3" />
      <path d="M24 82 C40 90 60 90 76 82" stroke="#f0c75e" strokeWidth="0.8" strokeDasharray="2 3" />
      <path d="M34 122 H66 L64 128 H36Z" fill="#7d5a1f" />
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

/* ---------- falling petals and leaves (whole page) ---------- */
const FALLERS = Array.from({ length: 16 }, (_, i) => ({
  left: `${f(3 + r01(i + 1) * 94)}%`,
  delay: `${f(-r01(i + 7) * 22)}s`,
  dur: `${f(15 + r01(i + 13) * 12)}s`,
  sway: `${f(2.6 + r01(i + 19) * 2.4)}s`,
  drift: `${Math.round(20 + r01(i + 23) * 40)}px`,
  size: Math.round(11 + r01(i + 29) * 9),
  kind: i % 4 === 3 ? 'leaf' : 'petal',
  tone: i % 3,
}))

export const FallingPetals = memo(function FallingPetals() {
  return (
    <div className="fallers" aria-hidden="true">
      {FALLERS.map((p, i) => (
        <span key={i} className="faller" style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur }}>
          <svg
            className="faller-sway"
            viewBox="-8 -16 16 18"
            width={p.size}
            height={p.size}
            style={{ animationDuration: p.sway, ['--drift' as string]: p.drift } as CSSProperties}
          >
            {p.kind === 'leaf' ? (
              <path d={leafD(15, 5.5)} fill={['#6f8f45', '#5c7a36', '#8aa65a'][p.tone]} />
            ) : (
              <path d={BRACT} fill={BLOOM[p.tone][0]} opacity="0.9" />
            )}
          </svg>
        </span>
      ))}
    </div>
  )
})

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
