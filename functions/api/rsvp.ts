import { ensureStayColumn, json, sha256, type Env } from '../_lib'

const MAX_BODY = 4_000
const RATE_WINDOW_MIN = 10
const RATE_MAX = 40

interface Payload {
  deviceId?: unknown
  name?: unknown
  attending?: unknown
  guests?: unknown
  needsStay?: unknown
  message?: unknown
  lang?: unknown
  website?: unknown
}

const clean = (s: string) =>
  s
    .normalize('NFC')
    // strip control characters but keep newlines in messages
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
    .trim()

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const ct = request.headers.get('Content-Type') ?? ''
  if (!ct.includes('application/json')) return json({ ok: false, error: 'bad_request' }, 415)

  const raw = await request.text()
  if (raw.length > MAX_BODY) return json({ ok: false, error: 'too_large' }, 413)

  let body: Payload
  try {
    body = JSON.parse(raw) as Payload
  } catch {
    return json({ ok: false, error: 'bad_json' }, 400)
  }

  // Honeypot: pretend success so bots don't retry
  if (typeof body.website === 'string' && body.website.trim() !== '') return json({ ok: true })

  const errors: Record<string, string> = {}
  const deviceId = typeof body.deviceId === 'string' ? body.deviceId.trim() : ''
  if (!/^[A-Za-z0-9-]{8,64}$/.test(deviceId)) errors.deviceId = 'invalid'

  const name = typeof body.name === 'string' ? clean(body.name).replace(/\s+/g, ' ') : ''
  if (name.length < 2 || name.length > 80) errors.name = 'invalid'

  const attending = body.attending === 'yes' ? 1 : body.attending === 'no' ? 0 : null
  if (attending === null) errors.attending = 'invalid'

  let guests = Number(body.guests)
  if (attending === 1) {
    if (!Number.isInteger(guests) || guests < 1 || guests > 10) errors.guests = 'invalid'
  } else guests = 0

  // only meaningful for guests who are coming
  const needsStay = attending === 1 && body.needsStay === true ? 1 : 0

  const message = typeof body.message === 'string' ? clean(body.message) : ''
  if (message.length > 500) errors.message = 'invalid'

  const lang = body.lang === 'hi' ? 'hi' : 'en'

  if (Object.keys(errors).length) return json({ ok: false, error: 'validation', fields: errors }, 422)

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  const ipHash = (await sha256(`${env.IP_SALT ?? 'nwd'}:${ip}`)).slice(0, 32)
  const ua = (request.headers.get('User-Agent') ?? '').slice(0, 200)
  const now = new Date().toISOString()

  try {
    // light rate limit per IP (shared office Wi-Fi friendly)
    const since = new Date(Date.now() - RATE_WINDOW_MIN * 60_000).toISOString()
    const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM rsvps WHERE ip_hash = ? AND updated_at > ?')
      .bind(ipHash, since)
      .first<{ n: number }>()
    if ((recent?.n ?? 0) >= RATE_MAX) return json({ ok: false, error: 'rate_limited' }, 429, { 'Retry-After': '60' })

    await ensureStayColumn(env.DB)

    // Upsert keyed by device: repeat taps / resubmits update the same response instead of duplicating it
    await env.DB.prepare(
      `INSERT INTO rsvps (device_id, name, attending, guests, message, lang, ip_hash, user_agent, revision, created_at, updated_at, needs_stay)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 1, ?9, ?9, ?10)
       ON CONFLICT(device_id) DO UPDATE SET
         name = excluded.name,
         attending = excluded.attending,
         guests = excluded.guests,
         needs_stay = excluded.needs_stay,
         message = CASE WHEN excluded.message <> '' THEN excluded.message ELSE rsvps.message END,
         lang = excluded.lang,
         ip_hash = excluded.ip_hash,
         user_agent = excluded.user_agent,
         revision = rsvps.revision + 1,
         updated_at = excluded.updated_at`,
    )
      .bind(deviceId, name, attending, guests, message, lang, ipHash, ua, now, needsStay)
      .run()

    return json({ ok: true, response: { name, attending: attending === 1 ? 'yes' : 'no', guests, needsStay: needsStay === 1 } })
  } catch (err) {
    console.error('rsvp insert failed', err)
    return json({ ok: false, error: 'server' }, 500)
  }
}

export const onRequest: PagesFunction<Env> = async () => json({ ok: false, error: 'method_not_allowed' }, 405, { Allow: 'POST' })
