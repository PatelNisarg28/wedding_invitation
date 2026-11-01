export interface Env {
  DB: D1Database
  /** Long random secret used to view RSVPs at /admin. Set with `wrangler pages secret put ADMIN_TOKEN`. */
  ADMIN_TOKEN?: string
  /** Optional salt for hashing IP addresses (privacy-preserving rate limiting). */
  IP_SALT?: string
}

export const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
      ...extra,
    },
  })

export async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Constant-time comparison of two strings via their hashes. */
export async function safeEqual(a: string, b: string) {
  const [ha, hb] = await Promise.all([sha256(a), sha256(b)])
  let diff = 0
  for (let i = 0; i < ha.length; i++) diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i)
  return diff === 0 && a.length === b.length
}

export async function isAdmin(request: Request, env: Env) {
  const token = env.ADMIN_TOKEN
  if (!token || token.length < 8) return false
  const header = request.headers.get('Authorization') ?? ''
  const given = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!given) return false
  return safeEqual(given, token)
}

export interface RsvpRow {
  id: number
  name: string
  attending: number
  guests: number
  message: string | null
  lang: string
  revision: number
  created_at: string
  updated_at: string
}
